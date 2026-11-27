"use client";

import Careers from "@/components/landingpage/Careers";
import HeroSection from "@/components/landingpage/HeroSection";
import ProjectShowcase from "@/components/landingpage/ProjectShowcase";
import StudioMission from "@/components/landingpage/StudioMission";
import ScrollChapterHUD from "@/components/landingpage/ScrollChapterHUD";
import ScrollRevealSection from "@/components/landingpage/ScrollRevealSection";
import VelocityMarquee from "@/components/landingpage/VelocityMarquee";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";

const HomePage = () => {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 26,
  });

  const heroOpacity = useTransform(smoothScroll, [0, 0.22], [1, 0.15]);
  const heroScale = useTransform(smoothScroll, [0, 0.22], [1, 0.96]);
  const heroY = useTransform(smoothScroll, [0, 0.22], [0, -36]);

  return (
    <main className="overflow-x-clip bg-[#020202]">
      <ScrollChapterHUD />

      {/* Hero Section with smooth depth retreat on scroll */}
      <section id="hero" className="relative z-10">
        <motion.div
          style={
            prefersReducedMotion
              ? undefined
              : { opacity: heroOpacity, scale: heroScale, y: heroY }
          }
          className="will-change-[transform,opacity]"
        >
          <HeroSection />
        </motion.div>
      </section>

      {/* Scroll-velocity reactive studio ticker */}
      <VelocityMarquee />

      {/* Projects Showcase Section */}
      <ScrollRevealSection id="projects" className="z-30" showDivider={false}>
        <ProjectShowcase />
      </ScrollRevealSection>

      {/* Studio Mission Section */}
      <ScrollRevealSection id="mission" className="z-40">
        <StudioMission />
      </ScrollRevealSection>

      {/* Careers Section */}
      <ScrollRevealSection id="careers" className="z-50 bg-[#020202]">
        <Careers />
      </ScrollRevealSection>
    </main>
  );
};

export default HomePage;
