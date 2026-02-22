import { NextRequest, NextResponse } from "next/server";

// ─── Bot Detection ────────────────────────────────────────────────────────────

const BOT_PATTERNS = [
  /bot|crawler|spider|scraper|fetch|curl|wget|python|axios|node-fetch/i,
  /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot/i,
  /facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot/i,
  /semrush|ahrefs|majestic|moz|screaming frog/i,
  /headlesschrome|phantomjs|selenium|puppeteer|playwright/i,
];

export function isBot(userAgent: string): boolean {
  if (!userAgent) return true; // No UA = likely a bot
  return BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
}

// ─── Middleware ───────────────────────────────────────────────────────────────
// Add this to your existing middleware.ts or create a new one.
// This protects the /api/analytics/track endpoint from bots.

export function config() {
  return {
    matcher: "/api/analytics/:path*",
  };
}

export function middleware(req: NextRequest) {
  const ua = req.headers.get("user-agent") || "";

  // Block bot requests to analytics endpoints
  if (req.nextUrl.pathname.startsWith("/api/analytics/track") && isBot(ua)) {
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.next();
}