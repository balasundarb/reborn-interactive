"use client";

import React, { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

export interface ScrollChapter {
  id: string;
  code: string;
  label: string;
}

const CHAPTERS: ScrollChapter[] = [
  { id: "hero", code: "01", label: "Genesis" },
  { id: "projects", code: "02", label: "Showcase" },
  { id: "mission", code: "03", label: "Manifesto" },
  { id: "careers", code: "04", label: "Careers" },
];

export default function ScrollChapterHUD() {
  const [activeId, setActiveId] = useState<string>("hero");
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  useEffect(() => {
    const elements = CHAPTERS.map((c) => document.getElementById(c.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-25% 0px -35% 0px",
        threshold: [0.1, 0.35, 0.6],
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const lenis = (
      window as unknown as {
        lenis?: { scrollTo: (target: HTMLElement | number, opts?: { offset?: number }) => void };
      }
    ).lenis;

    if (lenis) {
      lenis.scrollTo(el, { offset: 0 });
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <aside
      aria-label="Page sections"
      className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-4 pointer-events-auto"
    >
      <div className="relative flex flex-col items-end gap-4 py-3 px-2.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
        {/* Progress Spine */}
        <div
          aria-hidden="true"
          className="absolute right-[15px] top-4 bottom-4 w-[2px] rounded-full bg-white/10 overflow-hidden"
        >
          <motion.div
            style={{ scaleY }}
            className="w-full h-full origin-top bg-gradient-to-b from-[#d63031] via-[#ff4757] to-white shadow-[0_0_8px_#d63031]"
          />
        </div>

        {CHAPTERS.map((chapter) => {
          const isActive = activeId === chapter.id;
          return (
            <button
              key={chapter.id}
              type="button"
              onClick={() => scrollToSection(chapter.id)}
              aria-label={`Jump to ${chapter.label}`}
              className="group relative flex items-center gap-3 pr-1 py-0.5 cursor-pointer focus:outline-none"
            >
              {/* Hover / Active Label */}
              <span
                className={`font-mono text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${
                  isActive
                    ? "opacity-100 translate-x-0 text-white"
                    : "opacity-0 translate-x-2 text-zinc-400 group-hover:opacity-100 group-hover:translate-x-0"
                }`}
              >
                <span className="text-[#d63031] mr-1">{chapter.code}</span>
                {chapter.label}
              </span>

              {/* Node Dot */}
              <span
                className={`relative z-10 flex items-center justify-center w-3 h-3 rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-[#d63031] scale-110 shadow-[0_0_12px_rgba(214,48,49,0.9)] ring-2 ring-[#d63031]/30"
                    : "bg-zinc-800 border border-white/25 group-hover:border-[#d63031] group-hover:bg-[#d63031]/50"
                }`}
              />
            </button>
          );
        })}
      </div>
    </aside>
  );
}
