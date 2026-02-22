import type { GeoInfo } from "@/types/visitor";

// ─── User Agent Parsing ───────────────────────────────────────────────────────

export function parseDevice(ua: string): "Mobile" | "Tablet" | "Desktop" {
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "Tablet";
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua))
    return "Mobile";
  return "Desktop";
}

export function parseBrowser(ua: string): string {
  if (/Edg\//i.test(ua)) return "Edge";
  if (/OPR\/|Opera\//i.test(ua)) return "Opera";
  if (/SamsungBrowser/i.test(ua)) return "Samsung";
  if (/Chrome\/[0-9]/i.test(ua) && !/Chromium/i.test(ua)) return "Chrome";
  if (/Firefox\/[0-9]/i.test(ua)) return "Firefox";
  if (/Safari\/[0-9]/i.test(ua) && !/Chrome/i.test(ua)) return "Safari";
  if (/MSIE|Trident/i.test(ua)) return "Internet Explorer";
  return "Other";
}

export function parseOS(ua: string): string {
  if (/Windows NT 10/i.test(ua)) return "Windows 10/11";
  if (/Windows NT/i.test(ua)) return "Windows";
  if (/Mac OS X/i.test(ua)) return "macOS";
  if (/iPhone|iPad/i.test(ua)) return "iOS";
  if (/Android/i.test(ua)) return "Android";
  if (/Linux/i.test(ua)) return "Linux";
  if (/CrOS/i.test(ua)) return "ChromeOS";
  return "Other";
}

// ─── IP Extraction ────────────────────────────────────────────────────────────

export function getClientIP(headers: Headers): string {
  return (
    headers.get("cf-connecting-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}

// ─── Geo Lookup ───────────────────────────────────────────────────────────────

// In-memory cache to avoid hammering ip-api.com
const geoCache = new Map<string, { data: GeoInfo | null; ts: number }>();
const GEO_CACHE_TTL = 1000 * 60 * 60; // 1 hour

export async function getGeoInfo(ip: string): Promise<GeoInfo | null> {
  // Skip lookup for private/local IPs
  if (
    ip === "unknown" ||
    /^(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|::1|localhost)/.test(ip)
  ) {
    return {
      country: "Local",
      countryCode: "LC",
      regionName: "Localhost",
      city: "Local",
      lat: 0,
      lon: 0,
    };
  }

  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.ts < GEO_CACHE_TTL) {
    return cached.data;
  }

  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,lat,lon`,
      { signal: AbortSignal.timeout(2500) }
    );
    const data = await res.json();

    if (data.status !== "success") {
      geoCache.set(ip, { data: null, ts: Date.now() });
      return null;
    }

    const geo: GeoInfo = {
      country: data.country,
      countryCode: data.countryCode,
      regionName: data.regionName,
      city: data.city,
      lat: data.lat,
      lon: data.lon,
    };

    geoCache.set(ip, { data: geo, ts: Date.now() });
    return geo;
  } catch {
    geoCache.set(ip, { data: null, ts: Date.now() });
    return null;
  }
}

// ─── Validation ───────────────────────────────────────────────────────────────

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}

export function sanitizePathname(pathname: string): string {
  // Remove query strings for privacy, keep only path
  try {
    const url = new URL(pathname, "https://example.com");
    return url.pathname.slice(0, 255);
  } catch {
    return pathname.slice(0, 255);
  }
}