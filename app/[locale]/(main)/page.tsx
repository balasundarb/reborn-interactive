// app/[locale]/(main)/page.tsx
"use client";
import { useTranslations } from "next-intl";
import Component from "@/components/ui/retro-grid";
import Team from "@/components/homepage/team";
import { ParticleTextEffect } from "@/components/ui/particle-text-effect";

const HomePage = () => {
  const t = useTranslations('HomePage');

  return (
    <>
      {/* Retro Grid Background */}
      <Component
        gridColor="#d63031"
        showScanlines={true}
        glowEffect={true}
        className="fixed inset-0 w-full h-full"
      />

      {/* Hero Section */}
      <div id="home" className="relative z-10 flex items-center justify-center h-screen">
        <div className="flex justify-center">
          {/* Your hero content */}
           <ParticleTextEffect />
        </div>
      </div>

      {/* Team Section */}
      <div id="team">
        <Team />
      </div>
    </>
  );
};

export default HomePage;