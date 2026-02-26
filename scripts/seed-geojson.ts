/**
 * scripts/seed-geojson.ts
 *
 * Run once to fetch the Natural Earth countries GeoJSON and store it in MongoDB.
 *
 * Usage:
 *   npx tsx scripts/seed-geojson.ts
 *   -- or --
 *   ts-node scripts/seed-geojson.ts
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const GEOJSON_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";

// ── Schema ─────────────────────────────────────────────────────────────────────
// We store each GeoJSON feature as its own document so queries stay fast,
// but for the globe we just need one "blob" document with all features.
// We use a single-document approach with a fixed key for simplicity.

const geoDataSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true }, // e.g. "ne_110m_countries"
    type: String,
    features: { type: mongoose.Schema.Types.Mixed, required: true },
    fetchedAt: { type: Date, default: Date.now },
  },
  { collection: "geo_data" },
);

const GeoData =
  mongoose.models.GeoData ?? mongoose.model("GeoData", geoDataSchema);

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌  MONGODB_URI not found in .env");
    process.exit(1);
  }

  console.log("🔌  Connecting to MongoDB…");
await mongoose.connect(process.env.MONGODB_URI!, { 
  dbName: process.env.DB_NAME 
});
  console.log("✅  Connected");

  console.log("🌍  Fetching GeoJSON from Natural Earth…");
  const res = await fetch(GEOJSON_URL);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  const geojson = await res.json();
  console.log(`✅  Got ${geojson.features.length} country features`);

  console.log("💾  Upserting into MongoDB (collection: geo_data)…");
  await GeoData.findOneAndUpdate(
    { key: "ne_110m_countries" },
    {
      key: "ne_110m_countries",
      type: geojson.type,
      features: geojson.features,
      fetchedAt: new Date(),
    },
    { upsert: true, new: true },
  );

  console.log("✅  GeoJSON saved to MongoDB");
  await mongoose.disconnect();
  console.log("👋  Done");
}

main().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
//npx tsx scripts/seed-geojson.ts --> run this command to seed database with geojson data