/**
 * models/GeoData.ts
 *
 * Mongoose model for storing GeoJSON feature collections.
 */

import mongoose, { Document, Model } from "mongoose";

export interface IGeoData extends Document {
  key: string;
  type: string;
  features: any[];
  fetchedAt: Date;
}

const geoDataSchema = new mongoose.Schema<IGeoData>(
  {
    key:       { type: String, required: true, unique: true },
    type:      { type: String, default: "FeatureCollection" },
    features:  { type: mongoose.Schema.Types.Mixed, required: true },
    fetchedAt: { type: Date, default: Date.now },
  },
  {
    collection: "geo_data",
    // Disable auto-index in production for performance
    autoIndex: process.env.NODE_ENV !== "production",
  },
);

// Prevent model recompilation in Next.js hot-reload
const GeoData: Model<IGeoData> =
  mongoose.models.GeoData ?? mongoose.model<IGeoData>("GeoData", geoDataSchema);

export default GeoData; 