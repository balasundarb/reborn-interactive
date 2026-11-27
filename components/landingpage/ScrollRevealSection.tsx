"use client";

import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";

interface ScrollRevealSectionProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  showDivider?: boolean;
}

export default function ScrollRevealSection({
  id,
  children,
  className = "",
  showDivider = true,
}: ScrollRevealSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.35"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 22,
  });

  const y = useTransform(smoothProgress, [0, 1], [36, 0]);
  const scale = useTransform(smoothProgress, [0, 1], [0.975, 1]);
  const opacity = useTransform(smoothProgress, [0, 1], [0.35, 1]);
  const dividerScaleX = useTransform(smoothProgress, [0, 1], [0.15, 1]);

  return (
    <section id={id} ref={ref} className={`relative ${className}`}>
      {showDivider && (
        <div
          aria-hidden="true"
          className="max-w-7xl mx-auto px-6 pt-4 pb-2 pointer-events-none"
        >
          <motion.div
            style={
              prefersReducedMotion
                ? undefined
                : { scaleX: dividerScaleX, opacity }
            }
            className="h-px w-full origin-center bg-gradient-to-r from-transparent via-[#d63031]/60 to-transparent"
          />
        </div>
      )}

      <motion.div
        style={prefersReducedMotion ? undefined : { y, scale, opacity }}
        className="will-change-[transform,opacity]"
      >
        {children}
      </motion.div>
    </section>
  );
}
