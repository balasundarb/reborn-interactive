import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/mongodb"; // your existing db module
import {
  getClientIP,
  getGeoInfo,
  parseDevice,
  parseBrowser,
  parseOS,
  isValidUUID,
  sanitizePathname,
} from "@/lib/tracker-utils";
import type { TrackPayload, VisitorSession, PageView } from "@/types/visitor";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body: TrackPayload = await req.json();
    const { sessionId, pathname, title, referrer, pageViewId, duration } = body;

    // ── Validate ────────────────────────────────────────────────────────────
    if (!sessionId || !isValidUUID(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }

    const db = await getDB();
    const visitsCol = db.collection<VisitorSession>("site_visits");
    const pvCol = db.collection<PageView>("page_views");

    // ── Duration update only ────────────────────────────────────────────────
    // When the user is leaving a page we receive a pageViewId + duration
    if (pageViewId && duration !== undefined) {
      if (!isValidUUID(pageViewId)) {
        return NextResponse.json({ error: "Invalid pageViewId" }, { status: 400 });
      }
      await pvCol.updateOne(
        { _id: pageViewId as any },
        { $set: { duration: Math.min(Math.round(duration), 86400) } }
      );
      return NextResponse.json({ ok: true });
    }

    // ── Full track ──────────────────────────────────────────────────────────
    const ip = getClientIP(req.headers);
    const ua = req.headers.get("user-agent") || "unknown";
    const cleanPath = sanitizePathname(pathname || "/");

    // Check if session already exists to avoid redundant geo lookups
    const existingSession = await visitsCol.findOne(
      { sessionId },
      { projection: { country: 1, lat: 1, lon: 1 } }
    );

    let geo = null;
    if (!existingSession?.country) {
      // Try to reuse geo from same IP first (cheaper)
      const sameIPSession = await visitsCol.findOne(
        { ipAddress: ip, country: { $ne: null } },
        { projection: { country: 1, countryCode: 1, region: 1, city: 1, lat: 1, lon: 1 } }
      );

      if (sameIPSession?.country) {
        geo = {
          country: sameIPSession.country,
          countryCode: sameIPSession.countryCode,
          regionName: sameIPSession.region,
          city: sameIPSession.city,
          lat: sameIPSession.lat,
          lon: sameIPSession.lon,
        };
      } else {
        geo = await getGeoInfo(ip);
      }
    }

    // Upsert session
    const now = new Date();
    const sessionUpdate: Partial<VisitorSession> = {
      lastActive: now,
      ipAddress: ip,
      userAgent: ua,
      pathname: cleanPath,
    };

    if (geo) {
      sessionUpdate.country = geo.country ?? null;
      sessionUpdate.countryCode = (geo as any).countryCode ?? null;
      sessionUpdate.region = (geo as any).regionName ?? null;
      sessionUpdate.city = (geo as any).city ?? null;
      sessionUpdate.lat = geo.lat ?? null;
      sessionUpdate.lon = geo.lon ?? null;
    }

    await visitsCol.updateOne(
      { sessionId },
      {
        $set: sessionUpdate,
        $setOnInsert: {
          sessionId,
          device: parseDevice(ua),
          browser: parseBrowser(ua),
          os: parseOS(ua),
          referrer: referrer ?? null,
          createdAt: now,
        },
      },
      { upsert: true }
    );

    // Insert page view
    const pvDoc: PageView = {
      sessionId,
      pathname: cleanPath,
      title: title?.slice(0, 255) ?? null,
      referrer: referrer?.slice(0, 500) ?? null,
      timestamp: now,
      duration: null,
    };
    const pvResult = await pvCol.insertOne(pvDoc as any);

    return NextResponse.json({
      ok: true,
      pageViewId: pvResult.insertedId.toString(),
    });
  } catch (err) {
    console.error("[track] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}