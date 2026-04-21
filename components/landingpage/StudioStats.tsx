"use client";

import React from "react";
import { motion } from "framer-motion";

const stats = [
  { label: "Worlds Created", value: "12+", prefix: "" },
  { label: "Active Players", value: "2.5M", prefix: "" },
  { label: "Awards Won", value: "08", prefix: "" },
  { label: "Neural Links", value: "100", valueSuffix: "%" },
];

const StudioStats = () => {
  return (
    <section className="py-20 bg-[#020202] border-y border-white/5 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #d63031 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }} />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center md:items-start space-y-2 group"
            >
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl md:text-6xl font-black text-white tracking-tighter transition-all duration-300 group-hover:text-[#d63031]">
                  {stat.value}
                </span>
                {stat.valueSuffix && (
                  <span className="text-xl md:text-2xl font-bold text-[#d63031]">{stat.valueSuffix}</span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-px w-6 bg-[#d63031]/50 group-hover:w-12 transition-all duration-500" />
                <span className="text-[10px] md:text-xs font-mono tracking-[0.3em] uppercase text-white/40 group-hover:text-white/60 transition-colors">
                  {stat.label}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Decorative Scanline */}
      <div className="absolute left-0 top-0 w-full h-px bg-linear-to-r from-transparent via-[#d63031]/20 to-transparent animate-scan" />
      
      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        .animate-scan {
          animation: scan 10s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default StudioStats;
