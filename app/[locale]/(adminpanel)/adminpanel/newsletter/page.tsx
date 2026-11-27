// app/[locale]/(adminpanel)/adminpanel/newsletter/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { NewsletterDashboard } from "@/components/adminpanel/newsletter/NewsletterDashboard";

async function getSubscribers() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/admin/newsletter/subscribers`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.subscribers ?? [];
  } catch {
    return [];
  }
}

export default async function NewsletterPage() {
  const reqHeaders = await headers();

  let session;
  try {
    session = await auth.api.getSession({ headers: reqHeaders });
  } catch {
    redirect("/login");
  }

  if (!session?.user) redirect("/login");

  const initialSubscribers = await getSubscribers();

  return <NewsletterDashboard initialSubscribers={initialSubscribers} />;
}
