// app/[locale]/news/page.tsx
"use client";
import { useTranslations } from "next-intl";
import KineticTeamList from "@/components/ui/kinetic-team-hybrid";
export default function NewsPage() {
  const t = useTranslations('NewsPage');
  
  return  <KineticTeamList />;
}