"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";

const StudioMission = () => {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const scrollYProgressSpring = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Parallax layers
  const gridY1 = useTransform(scrollYProgressSpring, [0, 1], ["0%", "20%"]);
  const gridY2 = useTransform(scrollYProgressSpring, [0, 1], ["0%", "40%"]);
  const contentOpacity = useTransform(scrollYProgressSpring, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const contentScale = useTransform(scrollYProgressSpring, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.9]);

  // Text reveal animation helper
  const textVariant = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 * i,
        duration: 0.8,
        ease: [0.215, 0.61, 0.355, 1] as const,
      },
    }),
  };

  const isInView = useInView(containerRef, { once: false, amount: 0.3 });

  return (
    <section
      ref={containerRef}
      className="relative h-screen flex items-center justify-center overflow-hidden bg-[#020202] text-white"
    >
      {/* 1. Background Layers */}
      <div className="absolute inset-0 z-0">
        {/* Deep Grid */}
        <motion.div 
          style={{ y: gridY2 }}
          className="absolute inset-0 opacity-[0.07]"
        >
          <div className="absolute inset-0" 
               style={{ 
                 backgroundImage: `linear-gradient(to right, #444 1px, transparent 1px), 
                                   linear-gradient(to bottom, #444 1px, transparent 1px)`,
                 backgroundSize: '100px 100px' 
               }} 
          />
        </motion.div>

        {/* Closer Grid */}
        <motion.div 
          style={{ y: gridY1 }}
          className="absolute inset-0 opacity-[0.15]"
        >
          <div className="absolute inset-0" 
               style={{ 
                 backgroundImage: `linear-gradient(to right, #d63031 1px, transparent 1px), 
                                   linear-gradient(to bottom, #d63031 1px, transparent 1px)`,
                 backgroundSize: '40px 40px' 
               }} 
          />
        </motion.div>

        {/* Atmospheric Glows */}
        <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-[#d63031]/5 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-[#d63031]/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Floating Tech Symbols */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              opacity: 0 
            }}
            animate={{ 
              y: [null, "-=100", "+=50"],
              opacity: [0, 0.15, 0],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 15 + Math.random() * 10, 
              repeat: Infinity, 
              ease: "linear",
              delay: i * 2
            }}
            className="absolute text-[#d63031] font-mono text-[10px] pointer-events-none select-none"
          >
            {["< />", "01", "RX-9", "∑", "∫", "∆"][i % 6]}
          </motion.div>
        ))}
      </div>

      {/* 2. Scanline & Noise Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_2px,3px_100%]" />

      {/* 3. Main Content Container */}
      <motion.div 
        style={{ opacity: contentOpacity, scale: contentScale }}
        className="relative z-20 max-w-6xl mx-auto px-6 w-full"
      >
        <div className="flex flex-col items-center">
          
          {/* Subtitle with Tech Marker */}
          <motion.div 
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            custom={0}
            variants={textVariant}
            className="flex items-center space-x-6 mb-12"
          >
            <div className="h-px w-12 bg-linear-to-r from-transparent to-[#d63031]" />
            <span className="text-[#d63031] font-mono text-[10px] tracking-[0.8em] uppercase flex items-center">
              <span className="inline-block w-2 h-2 bg-[#d63031] rounded-full mr-3 animate-pulse" />
              Manifesto.v2
            </span>
            <div className="h-px w-12 bg-linear-to-l from-transparent to-[#d63031]" />
          </motion.div>

          {/* Heading with Splitting Animation */}
          <div className="text-center mb-16 relative">
            <motion.h2 
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="text-6xl md:text-[11rem] font-black leading-[0.75] tracking-tighter uppercase font-cinzel overflow-hidden"
            >
              <motion.span custom={1} variants={textVariant} className="block">We are</motion.span>
              <motion.span 
                custom={2} 
                variants={textVariant} 
                className="block text-transparent bg-clip-text bg-linear-to-b from-white via-white to-white/10 italic"
              >
                The Reborn
              </motion.span>
            </motion.h2 >
            
            {/* Background Text Shadow */}
            <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] font-black text-white/2 -z-10 select-none pointer-events-none uppercase font-cinzel">
              REBORN
            </h2>
          </div>

          {/* Mission Text with Advanced Glassmorphism */}
          <motion.div 
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            custom={3}
            variants={textVariant}
            className="relative group max-w-3xl w-full"
          >
            {/* Glass Box */}
            <div className="relative p-10 md:p-16 overflow-hidden">
              {/* Corner Brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#d63031]/50" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#d63031]/50" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#d63031]/50" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#d63031]/50" />

              {/* Backdrop */}
              <div className="absolute inset-0 bg-white/3 backdrop-blur-xl border border-white/10 rounded-sm -z-10 transition-colors duration-700 group-hover:bg-white/5" />
              
              {/* Scanning Light Effect */}
              <motion.div 
                animate={{ 
                  top: ["-100%", "200%"],
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                className="absolute left-0 right-0 h-20 bg-linear-to-b from-transparent via-[#d63031]/5 to-transparent pointer-events-none z-0"
              />

              <p className="relative z-10 text-xl md:text-3xl font-light leading-relaxed text-white/80 text-center px-4 font-sans">
                "Directing the digital evolution. We forge experiences that 
                <span className="text-white font-medium italic mx-2 underline decoration-[#d63031]/50 underline-offset-8"> transcend the screen</span>, 
                blending raw creativity with surgical precision."
              </p>

              {/* Status Indicators */}
              <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center opacity-40">
                <span className="text-[8px] font-mono tracking-[0.2em] uppercase">Core Status: Optimal</span>
                <span className="text-[8px] font-mono tracking-[0.2em] uppercase">Sync: 98.4%</span>
              </div>
            </div>
          </motion.div>
        </div >
      </motion.div>

      {/* 4. Technical Sidebars */}
      <aside className="absolute left-8 bottom-20 hidden xl:flex flex-col items-center space-y-6 mix-blend-difference z-30">
        <div className="flex flex-col space-y-2">
          {[1, 2, 3].map(i => (
            <motion.div 
              key={i}
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
              className="w-1 h-8 bg-[#d63031]" 
            />
          ))}
        </div>
        <span className="[writing-mode:vertical-lr] text-[9px] tracking-[0.8em] text-white/40 uppercase font-mono">
          Precision Grade Development
        </span>
      </aside>

      <aside className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center space-y-12 mix-blend-difference z-30">
        <span className="[writing-mode:vertical-lr] text-[9px] tracking-[1em] text-white/30 uppercase font-mono rotate-180">
          Reborn Interactive // 2026
        </span>
        <div className="h-48 w-px bg-linear-to-b from-transparent via-[#d63031] to-transparent" />
      </aside>

      {/* Bottom transition gradient */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-linear-to-t from-[#020202] to-transparent z-30 pointer-events-none" />
    </section>
  );
};

export default StudioMission;