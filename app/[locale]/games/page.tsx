// app/[locale]/games/page.tsx
"use client";
import { useTranslations } from "next-intl";

export default function GamesPage() {
  const t = useTranslations('GamesPage');
  
  return (
    <div className="relative z-10 min-h-screen pt-20 px-4">
      <h1 className="text-4xl font-bold">Games</h1>
      {/* Your games content */}
    </div>
  );
}