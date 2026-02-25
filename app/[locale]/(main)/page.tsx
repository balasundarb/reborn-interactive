"use client";

import Careers from "@/components/landingpage/Careers";
import HeroSection from "@/components/landingpage/HeroSection";
import ScrollVideo from "@/components/ui/scrollvideo";


const HomePage = () => {

  return (
    <>
      <main className="overflow-x-hidden">
        <HeroSection />
        <ScrollVideo /> 
        <Careers />
      </main>
    </>
  );
};

export default HomePage;