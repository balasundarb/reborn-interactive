// app/[locale]/(adminpanel)/layout.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface AdminPanelLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function AdminPanelLayout({
  children,
  params,
}: AdminPanelLayoutProps) {
  const session = await auth.api.getSession({
    headers: await headers(), // better-auth needs the request headers
  });

  if (!session?.user) {
    redirect(`/${params.locale}/login`);
  }

  return <>{children}</>;
}