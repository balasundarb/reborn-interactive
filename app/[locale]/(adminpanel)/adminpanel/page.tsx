// app/[locale]/(adminpanel)/adminpanel/page.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AnalyticsDashboard } from "@/components/adminpanel/analytics/AnalyticsDashboard";
import type { VisitorStats } from "@/types/visitor";

async function getStats(cookieHeader: string): Promise<VisitorStats | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/analytics/stats`, {
      cache: "no-store",
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function AdminPanelPage() {
  const reqHeaders = await headers();
  const [session, initialStats] = await Promise.all([
    auth.api.getSession({ headers: reqHeaders }), // ← better-auth way
    getStats(reqHeaders.get("cookie") ?? ""),
  ]);

  return (
    <AnalyticsDashboard
      user={session!.user}
      initialStats={initialStats}
    />
  );
}