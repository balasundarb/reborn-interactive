// app/[locale]/(adminpanel)/layout.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface AdminPanelLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AdminPanelLayout({
  children,
  params,
}: AdminPanelLayoutProps) {
  const { locale } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  return <>{children}</>;
}