// app/[locale]/(adminpanel)/adminpanel/page.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import type { VisitorStats } from "@/types/visitor";

async function getStats(): Promise<VisitorStats | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/analytics/stats`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function AdminPanelPage() {
  const [session, initialStats] = await Promise.all([
    auth.api.getSession({ headers: await headers() }), // ← better-auth way
    getStats(),
  ]);

  return (
    <AnalyticsDashboard
      user={session!.user}
      initialStats={initialStats}
    />
  );
}