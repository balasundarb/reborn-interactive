import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDB } from "@/lib/mongodb";
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

// Supported locales — keep in sync with useVisitTracker.ts
const LOCALE_RE = /^\/(en|ta|fr|de|es|ja|ko|zh|ar|pt|ru|hi)(?=\/|$)/;

function stripLocale(path: string): string {
  return path.replace(LOCALE_RE, "") || "/";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as TrackPayload & { type?: string };
    const { sessionId, pageViewId, duration, pathname, title, referrer } = body;
    const type = body.type ?? "pageview"; // default to pageview for legacy payloads

    // ── Basic validation ──────────────────────────────────────────────────
    if (!sessionId || !isValidUUID(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }

    const db        = await getDB();
    const visitsCol = db.collection<VisitorSession>("site_visits");
    const pvCol     = db.collection<PageView>("page_views");

    // ── PING — only update lastActive, nothing else ───────────────────────
    if (type === "ping") {
      await visitsCol.updateOne(
        { sessionId },
        { $set: { lastActive: new Date() } }
      );
      return NextResponse.json({ ok: true });
    }

    // ── DURATION — update existing page view duration only ────────────────
    if (type === "duration" || (pageViewId && duration !== undefined)) {
      if (!pageViewId || !ObjectId.isValid(pageViewId)) {
        return NextResponse.json({ error: "Invalid pageViewId" }, { status: 400 });
      }
      await (pvCol as any).updateOne(
        { _id: new ObjectId(pageViewId) },          // ← proper ObjectId cast
        { $set: { duration: Math.min(Math.round(duration ?? 0), 86_400) } }
      );
      // Also keep session alive
      await visitsCol.updateOne(
        { sessionId },
        { $set: { lastActive: new Date() } }
      );
      return NextResponse.json({ ok: true });
    }

    // ── PAGEVIEW — upsert session + insert page view ───────────────────────
    const ip        = getClientIP(req.headers);
    const ua        = req.headers.get("user-agent") || "unknown";
    // Strip locale both from what the hook sends AND as a safety net
    const cleanPath = stripLocale(sanitizePathname(pathname || "/"));
    const now       = new Date();

    // Resolve geo — reuse existing session data or same-IP cache first
    const existingSession = await visitsCol.findOne(
      { sessionId },
      { projection: { country: 1, countryCode: 1, region: 1, city: 1, lat: 1, lon: 1 } }
    );

    let geo: Awaited<ReturnType<typeof getGeoInfo>> = null;

    if (!existingSession?.country) {
      const sameIP = await visitsCol.findOne(
        { ipAddress: ip, country: { $nin: [null, "Local"] } },
        { projection: { country: 1, countryCode: 1, region: 1, city: 1, lat: 1, lon: 1 } }
      );

      if (sameIP?.country) {
        geo = {
          country:     sameIP.country,
          countryCode: sameIP.countryCode,
          regionName:  sameIP.region,
          city:        sameIP.city,
          lat:         sameIP.lat,
          lon:         sameIP.lon,
        } as any;
      } else {
        geo = await getGeoInfo(ip);
      }
    }

    // Build session update
    const sessionUpdate: Partial<VisitorSession> = {
      lastActive: now,
      ipAddress:  ip,
      userAgent:  ua,
      pathname:   cleanPath,
    };

    if (geo) {
      sessionUpdate.country     = (geo as any).country     ?? null;
      sessionUpdate.countryCode = (geo as any).countryCode ?? null;
      sessionUpdate.region      = (geo as any).regionName  ?? null;
      sessionUpdate.city        = (geo as any).city        ?? null;
      sessionUpdate.lat         = (geo as any).lat         ?? null;
      sessionUpdate.lon         = (geo as any).lon         ?? null;
    }

    await visitsCol.updateOne(
      { sessionId },
      {
        $set: sessionUpdate,
        $setOnInsert: {
          sessionId,
          device:    parseDevice(ua),
          browser:   parseBrowser(ua),
          os:        parseOS(ua),
          referrer:  referrer ?? null,
          createdAt: now,
        },
      },
      { upsert: true }
    );

    // ── Dedup guard — block duplicate page views within 5 seconds ───────────
    // Catches: React StrictMode double-fire, browser refresh, fast back/forward
    const fiveSecondsAgo  = new Date(Date.now() - 5_000);
    const recentDuplicate = await pvCol.findOne(
      {
        sessionId,
        pathname:  cleanPath,
        timestamp: { $gte: fiveSecondsAgo },
      },
      { projection: { _id: 1 } }
    );

    if (recentDuplicate) {
      // Already recorded this page for this session in the last 5s — skip insert
      return NextResponse.json({
        ok: true,
        pageViewId: recentDuplicate._id.toString(),
      });
    }

    // Insert page view
    const pvDoc: PageView = {
      sessionId,
      pathname:  cleanPath,
      title:     title?.slice(0, 255) ?? null,
      referrer:  referrer?.slice(0, 500) ?? null,
      timestamp: now,
      duration:  null,
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