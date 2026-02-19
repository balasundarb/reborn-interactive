// app/[locale]/(main)/page.tsx
"use client";

import Careers from "@/components/landingpage/Careers";
import HeroSection from "@/components/landingpage/HeroSection";


const HomePage = () => {

  return (
    <>
      <main className="overflow-x-hidden">
        <HeroSection />
        <Careers />
      </main>
    </>
  );
};

export default HomePage;