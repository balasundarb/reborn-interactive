// app/[locale]/page.tsx (or your home page file)
"use client";
import { useTranslations } from "next-intl";
import Component from "@/components/ui/retro-grid";
import Team from "@/components/homepage/team";

const HomePage = () => {
  const t = useTranslations('HomePage');

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden">
      {/* Retro Grid Background */}
      <Component
        gridColor="#d63031"
        showScanlines={true}
        glowEffect={true}
        className="fixed inset-0 w-full h-full"
      />

      {/* Hero Section */}
      <div className="relative z-10 flex items-center justify-center h-screen">
        <div className="flex justify-center">
          <img 
            src="/favicon-384x384.png" 
            alt="Re-born Interactive" 
            className="h-auto w-auto" 
          />
        </div>
      </div>

      {/* Testimonials Section */}
      <Team />
    </div>
  );
};

export default HomePage;