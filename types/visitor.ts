// ─── Visitor Tracking Types ──────────────────────────────────────────────────

export interface VisitorSession {
  _id?: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  country: string | null;
  countryCode: string | null;
  region: string | null;
  city: string | null;
  lat: number | null;
  lon: number | null;
  device: "Mobile" | "Tablet" | "Desktop";
  browser: string;
  os: string;
  referrer: string | null;
  pathname: string;
  createdAt: Date;
  lastActive: Date;
}

export interface PageView {
  _id?: string;
  sessionId: string;
  pathname: string;
  title: string | null;
  referrer: string | null;
  timestamp: Date;
  duration: number | null; // seconds spent on page
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface TrackPayload {
  sessionId: string;
  pathname: string;
  title?: string;
  referrer?: string;
  pageViewId?: string; // for duration update
  duration?: number;
}

export interface VisitorStats {
  activeNow: number;
  today: number;
  week: number;
  month: number;
  totalVisitors: number;
  totalPageViews: number;
  avgSessionDuration: number; // seconds
  bounceRate: number; // percentage
  hourlyTrend: Array<{ hour: string; count: number }>;
  dailyGrowth: Array<{ date: string; visitors: number; pageViews: number }>;
  devices: Array<{ device: string; count: number; percentage: number }>;
  browsers: Array<{ browser: string; count: number; percentage: number }>;
  operatingSystems: Array<{ os: string; count: number; percentage: number }>;
  topCountries: Array<{ country: string; countryCode: string | null; visitors: number; percentage: number }>;
  topPages: Array<{ pathname: string; views: number; avgDuration: number }>;
  topRegions: Array<{ region: string; visitors: number; percentage: number }>;
  locations: Array<{
    sessionId: string;
    country: string;
    region: string | null;
    lat: number;
    lon: number;
  }>;
  peakHours: Array<{ hour: number; count: number }>;
  referrers: Array<{ referrer: string; count: number }>;
}

export interface GeoInfo {
  country: string;
  countryCode: string;
  regionName: string;
  city: string;
  lat: number;
  lon: number;
}