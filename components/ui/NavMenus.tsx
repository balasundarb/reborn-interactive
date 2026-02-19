"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NavMenusProps {
  isOpen: boolean;
  onClose: () => void;
  navItems?: Array<{ name: string; link: string }>;
}

const transition = { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const };

export const NavMenus = ({ isOpen, onClose, navItems = [] }: NavMenusProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={transition}
            className="relative h-full w-full md:w-[650px] bg-[#050505] flex flex-col justify-center border-l border-red-600/20 shadow-2xl"
          >
            {/* Background Ghost Number */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={hoveredIndex}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0.07, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                  className="text-[30rem] font-black italic text-white select-none"
                >
                  {hoveredIndex !== null ? hoveredIndex + 1 : ""}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-10 right-10 w-12 h-12 flex items-center justify-center border border-white/10 hover:border-red-600 transition-colors group"
            >
              <div className="relative w-6 h-6">
                <span className="absolute top-1/2 left-0 w-full h-[2px] bg-white -rotate-45 group-hover:bg-red-600 transition-colors" />
                <span className="absolute top-1/2 left-0 w-full h-[2px] bg-white rotate-45 group-hover:bg-red-600 transition-colors" />
              </div>
            </button>

            {/* Navigation Items */}
            <nav className="relative z-10 px-12 space-y-4">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.name}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05, ...transition }}
                >
                  <a 
                    href={item.link} 
                    className="group flex items-end gap-4 py-2 outline-none"
                  >
                    <span className="text-xl font-mono text-red-600 mb-4">0{i + 1}</span>
                    <span className="text-6xl md:text-8xl font-black uppercase tracking-tighter transition-all duration-300 group-hover:italic group-hover:translate-x-6 group-hover:text-red-600">
                      {item.name}
                    </span>
                  </a>
                </motion.div>
              ))}
            </nav>

            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};