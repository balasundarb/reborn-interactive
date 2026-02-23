import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/mongodb";
import type { VisitorStats } from "@/types/visitor";

export const runtime = "nodejs";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(): Date {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ─── Shared filters — applied everywhere to exclude localhost/dev traffic ─────

/** Filter for site_visits collection */
const REAL_VISIT = {
  ipAddress: { $nin: ["::1", "127.0.0.1", "::ffff:127.0.0.1"] },
  country:   { $nin: [null, "Local"] },
};

/** Filter for page_views collection — exclude sessions from localhost visits.
 *  We do this via a $lookup-free approach: filter by referrer not being localhost
 *  AND rely on the fact that sessions created from ::1 have country "Local".
 *  The simplest approach: keep a set of real sessionIds is expensive, so instead
 *  we exclude page views whose referrer is localhost (covers most cases). */
const REAL_PV = {
  referrer: { $not: { $regex: "^http://(localhost|127\\.0\\.0\\.1)" } },
};

// ─── Route ────────────────────────────────────────────────────────────────────

export async function GET(_req: NextRequest) {
  try {
    const db     = await getDB();
    const visits = db.collection("site_visits");
    const pvCol  = db.collection("page_views");

    const thirtySecondsAgo = new Date(Date.now() - 30_000);

    const [
      activeNow,
      today,
      week,
      month,
      totalVisitors,
      totalPageViews,
      hourlyTrend,
      dailyGrowth,
      devices,
      browsers,
      operatingSystems,
      topCountries,
      topPages,
      topRegions,
      locations,
      peakHours,
      referrers,
      durationStats,
    ] = await Promise.all([

      // ── Active now (last 30s, real visitors only) ──────────────────────────
      visits.countDocuments({
        ...REAL_VISIT,
        lastActive: { $gte: thirtySecondsAgo },
      }),

      // ── Today ─────────────────────────────────────────────────────────────
      visits.countDocuments({
        ...REAL_VISIT,
        createdAt: { $gte: startOfToday() },
      }),

      // ── This week ─────────────────────────────────────────────────────────
      visits.countDocuments({
        ...REAL_VISIT,
        createdAt: { $gte: startOfWeek() },
      }),

      // ── This month ────────────────────────────────────────────────────────
      visits.countDocuments({
        ...REAL_VISIT,
        createdAt: { $gte: startOfMonth() },
      }),

      // ── Total visitors ────────────────────────────────────────────────────
      visits.countDocuments(REAL_VISIT),

      // ── Total page views ──────────────────────────────────────────────────
      pvCol.countDocuments(REAL_PV),

      // ── Hourly trend (last 24h) ────────────────────────────────────────────
      pvCol
        .aggregate([
          {
            $match: {
              ...REAL_PV,
              timestamp: { $gte: new Date(Date.now() - 86_400_000) },
            },
          },
          { $group: { _id: { $hour: "$timestamp" }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
          {
            $project: {
              _id: 0,
              hour: { $concat: [{ $toString: "$_id" }, ":00"] },
              count: 1,
            },
          },
        ])
        .toArray()
        .then((rows) =>
          rows.map((r) => ({
            hour:  r.hour  as string,
            count: r.count as number,
          }))
        ),

      // ── Daily growth (last 30 days) ────────────────────────────────────────
      pvCol
        .aggregate([
          {
            $match: {
              ...REAL_PV,
              timestamp: { $gte: daysAgo(30) },
            },
          },
          {
            $group: {
              _id:      { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
              pageViews: { $sum: 1 },
              visitors:  { $addToSet: "$sessionId" },
            },
          },
          { $sort: { _id: 1 } },
          {
            $project: {
              _id: 0,
              date:      "$_id",
              pageViews: 1,
              visitors:  { $size: "$visitors" },
            },
          },
        ])
        .toArray()
        .then((rows) =>
          rows.map((r) => ({
            date:      r.date      as string,
            pageViews: r.pageViews as number,
            visitors:  r.visitors  as number,
          }))
        ),

      // ── Device distribution (last 7 days) ─────────────────────────────────
      visits
        .aggregate([
          {
            $match: {
              ...REAL_VISIT,
              createdAt: { $gte: daysAgo(7) },
            },
          },
          { $group: { _id: "$device", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray()
        .then((rows) => {
          const total = rows.reduce((s, r) => s + (r.count as number), 0) || 1;
          return rows.map((r) => ({
            device:     (r._id as string) || "Unknown",
            count:      r.count as number,
            percentage: parseFloat((((r.count as number) / total) * 100).toFixed(1)),
          }));
        }),

      // ── Browser distribution (last 7 days) ────────────────────────────────
      visits
        .aggregate([
          {
            $match: {
              ...REAL_VISIT,
              createdAt: { $gte: daysAgo(7) },
            },
          },
          { $group: { _id: "$browser", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray()
        .then((rows) => {
          const total = rows.reduce((s, r) => s + (r.count as number), 0) || 1;
          return rows.map((r) => ({
            browser:    (r._id as string) || "Unknown",
            count:      r.count as number,
            percentage: parseFloat((((r.count as number) / total) * 100).toFixed(1)),
          }));
        }),

      // ── OS distribution (last 7 days) ─────────────────────────────────────
      visits
        .aggregate([
          {
            $match: {
              ...REAL_VISIT,
              createdAt: { $gte: daysAgo(7) },
            },
          },
          { $group: { _id: "$os", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray()
        .then((rows) => {
          const total = rows.reduce((s, r) => s + (r.count as number), 0) || 1;
          return rows.map((r) => ({
            os:         (r._id as string) || "Unknown",
            count:      r.count as number,
            percentage: parseFloat((((r.count as number) / total) * 100).toFixed(1)),
          }));
        }),

      // ── Top countries (last 30 days) ───────────────────────────────────────
      visits
        .aggregate([
          {
            $match: {
              ...REAL_VISIT,
              createdAt: { $gte: daysAgo(30) },
            },
          },
          {
            $group: {
              _id:         "$country",
              countryCode: { $first: "$countryCode" },
              visitors:    { $sum: 1 },
            },
          },
          { $sort: { visitors: -1 } },
          { $limit: 10 },
        ])
        .toArray()
        .then((rows) => {
          const total = rows.reduce((s, r) => s + (r.visitors as number), 0) || 1;
          return rows.map((r) => ({
            country:     r._id         as string,
            countryCode: (r.countryCode as string) ?? null,
            visitors:    r.visitors    as number,
            percentage:  parseFloat((((r.visitors as number) / total) * 100).toFixed(1)),
          }));
        }),

      // ── Top pages (last 30 days) ───────────────────────────────────────────
      pvCol
        .aggregate([
          {
            $match: {
              ...REAL_PV,
              timestamp: { $gte: daysAgo(30) },
            },
          },
          {
            $group: {
              _id:         "$pathname",
              views:       { $sum: 1 },
              avgDuration: { $avg: "$duration" },
            },
          },
          { $sort: { views: -1 } },
          { $limit: 10 },
          {
            $project: {
              _id: 0,
              pathname:    "$_id",
              views:       1,
              avgDuration: { $round: [{ $ifNull: ["$avgDuration", 0] }, 0] },
            },
          },
        ])
        .toArray()
        .then((rows) =>
          rows.map((r) => ({
            pathname:    r.pathname    as string,
            views:       r.views      as number,
            avgDuration: r.avgDuration as number,
          }))
        ),

      // ── Top regions (last 30 days) ─────────────────────────────────────────
      visits
        .aggregate([
          {
            $match: {
              ...REAL_VISIT,
              createdAt: { $gte: daysAgo(30) },
              region:    { $nin: [null, "Localhost"] },
            },
          },
          { $group: { _id: "$region", visitors: { $sum: 1 } } },
          { $sort: { visitors: -1 } },
          { $limit: 10 },
        ])
        .toArray()
        .then((rows) => {
          const total = rows.reduce((s, r) => s + (r.visitors as number), 0) || 1;
          return rows.map((r) => ({
            region:     r._id      as string,
            visitors:   r.visitors as number,
            percentage: parseFloat((((r.visitors as number) / total) * 100).toFixed(1)),
          }));
        }),

      // ── Visitor locations for map (last 30 days) ───────────────────────────
      visits
        .find(
          {
            ...REAL_VISIT,
            createdAt: { $gte: daysAgo(30) },
            lat: { $nin: [null, 0] },
            lon: { $nin: [null, 0] },
          },
          { projection: { sessionId: 1, country: 1, region: 1, lat: 1, lon: 1 } }
        )
        .toArray()
        .then((rows) =>
          rows.map((r) => ({
            sessionId: r.sessionId as string,
            country:   (r.country  as string) ?? "",
            region:    (r.region   as string) ?? null,
            lat:       r.lat       as number,
            lon:       r.lon       as number,
          }))
        ),

      // ── Peak hours (last 7 days) ───────────────────────────────────────────
      pvCol
        .aggregate([
          {
            $match: {
              ...REAL_PV,
              timestamp: { $gte: daysAgo(7) },
            },
          },
          { $group: { _id: { $hour: "$timestamp" }, count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
          { $project: { _id: 0, hour: "$_id", count: 1 } },
        ])
        .toArray()
        .then((rows) =>
          rows.map((r) => ({
            hour:  r.hour  as number,
            count: r.count as number,
          }))
        ),

      // ── Top referrers (last 30 days) ───────────────────────────────────────
      pvCol
        .aggregate([
          {
            $match: {
              ...REAL_PV,
              timestamp: { $gte: daysAgo(30) },
              referrer:  { $not: { $in: [null, ""] } },
            },
          },
          { $group: { _id: "$referrer", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
          { $project: { _id: 0, referrer: "$_id", count: 1 } },
        ])
        .toArray()
        .then((rows) =>
          rows.map((r) => ({
            referrer: r.referrer as string,
            count:    r.count    as number,
          }))
        ),

      // ── Avg session duration & bounce rate (last 30 days) ─────────────────
      pvCol
        .aggregate([
          {
            $match: {
              ...REAL_PV,
              timestamp: { $gte: daysAgo(30) },
            },
          },
          {
            $group: {
              _id:           "$sessionId",
              pageCount:     { $sum: 1 },
              totalDuration: { $sum: { $ifNull: ["$duration", 0] } },
            },
          },
          {
            $group: {
              _id:             null,
              avgDuration:     { $avg: "$totalDuration" },
              bouncedSessions: {
                $sum: { $cond: [{ $eq: ["$pageCount", 1] }, 1, 0] },
              },
              totalSessions: { $sum: 1 },
            },
          },
        ])
        .toArray(),
    ]);

    const durationRow = durationStats[0] ?? {
      avgDuration:     0,
      bouncedSessions: 0,
      totalSessions:   0,
    };

    const result: VisitorStats = {
      activeNow,
      today,
      week,
      month,
      totalVisitors,
      totalPageViews,
      avgSessionDuration: Math.round((durationRow.avgDuration as number) ?? 0),
      bounceRate:
        (durationRow.totalSessions as number) > 0
          ? parseFloat(
              (
                ((durationRow.bouncedSessions as number) /
                  (durationRow.totalSessions  as number)) *
                100
              ).toFixed(1)
            )
          : 0,
      hourlyTrend,
      dailyGrowth,
      devices,
      browsers,
      operatingSystems,
      topCountries,
      topPages,
      topRegions,
      locations,
      peakHours,
      referrers,
    };

    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[stats] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}