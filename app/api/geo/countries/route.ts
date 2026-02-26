/**
 * app/api/geo/countries/route.ts
 *
 * GET /api/geo/countries
 *
 * Returns the Natural Earth 110m countries GeoJSON stored in MongoDB.
 * Response is cached for 24 hours — the data never changes.
 */

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import GeoData from "@/models/GeoData";

// ── DB connection helper ───────────────────────────────────────────────────────
// Re-uses existing connection if available (important for Next.js serverless)

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not defined");
await mongoose.connect(uri, { 
  dbName: process.env.DB_NAME 
});
  isConnected = true;
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    await connectDB();

    const doc = await GeoData.findOne(
      { key: "ne_110m_countries" },
      { type: 1, features: 1, _id: 0 }, // only return what the globe needs
    ).lean();

    if (!doc) {
      return NextResponse.json(
        { error: "GeoJSON not found. Run: npx tsx scripts/seed-geojson.ts" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { type: doc.type, features: doc.features },
      {
        status: 200,
        headers: {
          // Cache in browser for 1 hour, in CDN for 24 hours
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
        },
      },
    );
  } catch (err) {
    console.error("[GET /api/geo/countries]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}