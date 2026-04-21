"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

const StudioMission = () => {
  const containerRef = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 0.3]);

  return (
    <section ref={containerRef} className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background Image with Parallax */}
      <motion.div 
        style={{ y }} 
        className="absolute inset-0 z-100 opacity-40 grayscale"
      >
        <Image
          src="/assets/about.avif"
          alt="Studio Mission Background"
          fill
          className="object-cover"
          priority
        />
      </motion.div>

      {/* Overlays */}
      <div className="absolute inset-0 z-10 bg-linear-to-t from-[#020202] via-transparent to-[#020202]" />
      <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-[2px]" />

      <div className="relative z-20 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          style={{ opacity }}
          className="space-y-12"
        >
          <div className="space-y-4">
            <span className="text-[#d63031] font-mono text-xs tracking-[1em] uppercase">Core Philosophy</span>
            <h2 className="text-4xl md:text-8xl font-black text-white leading-none tracking-tighter font-cinzel">
              WE ARE <span className="italic">THE REBORN</span>
            </h2>
          </div>

          <div className="h-px w-24 bg-[#d63031] mx-auto" />

          <p className="text-xl md:text-3xl text-white/80 font-light leading-relaxed max-w-3xl mx-auto px-4">
            "Directing the digital evolution. We forge experiences that transcend the screen, 
            blending raw creativity with surgical precision to redefine what is possible."
          </p>

          <div className="pt-8">
            <button className="group relative px-12 py-4 bg-transparent border border-white/20 text-white text-xs font-bold uppercase tracking-[0.3em] overflow-hidden transition-all duration-300 hover:border-[#d63031]">
              <span className="relative z-10">Our DNA</span>
              <div className="absolute inset-0 bg-[#d63031] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/2 left-10 -translate-y-1/2 hidden lg:flex flex-col space-y-12 opacity-20">
        <div className="h-32 w-px bg-white" />
        <span className="rotate-90 origin-left text-[10px] tracking-[1em] text-white uppercase whitespace-nowrap">EST. MMXXIV</span>
      </div>
      
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center space-x-4 opacity-30">
        <div className="w-12 h-px bg-white" />
        <span className="text-[8px] uppercase tracking-widest text-white">Initialization Complete</span>
        <div className="w-12 h-px bg-white" />
      </div>
    </section>
  );
};

export default StudioMission;
