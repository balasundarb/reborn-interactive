"use client";

import Careers from "@/components/landingpage/Careers";
import HeroSection from "@/components/landingpage/HeroSection";
// import ScrollVideo from "@/components/ui/scrollvideo";
import ProjectShowcase from "@/components/landingpage/ProjectShowcase";
import StudioMission from "@/components/landingpage/StudioMission";
import { motion, useScroll, useTransform } from "framer-motion";
// import { useRef } from "react";

const HomePage = () => {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  return (
    <>
      <main className="overflow-x-hidden bg-[#020202]">
        {/* Hero Section */}
        <motion.div style={{ opacity: heroOpacity }} className="relative z-10">
          <HeroSection />
        </motion.div>

    

        {/* Projects Showcase Section */}
        <section className="relative z-30">
          <ProjectShowcase />
        </section>

        {/* Studio Mission Section */}
        <section className="relative z-40">
          <StudioMission />
        </section>

        {/* Scroll Video Section - Disabled for now */}
        {/* <section className="relative z-50 bg-[#020202]">
          <ScrollVideo />
        </section> */}

        {/* Careers Section */}
        <section className="relative z-60 bg-[#020202]">
          <Careers />
        </section>
      </main>
    </>
  );
};


export default HomePage;