"use client";

import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useVelocity,
  useTransform,
  useSpring,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";

const ITEMS = [
  "REBORN INTERACTIVE",
  "NEXT-GEN WORLDS",
  "CINEMATIC STORYTELLING",
  "REAL-TIME 3D",
  "DIGITAL EMOTIONS",
];

export default function VelocityMarquee() {
  const prefersReducedMotion = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 350,
  });

  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 4], {
    clamp: false,
  });

  const directionFactor = useRef<number>(1);

  useAnimationFrame((_, delta) => {
    if (prefersReducedMotion) return;

    let moveBy = directionFactor.current * -1.8 * (delta / 1000);
    const vel = velocityFactor.get();

    if (vel < 0) {
      directionFactor.current = -1;
    } else if (vel > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * Math.min(Math.abs(vel), 4);
    let next = baseX.get() + moveBy;

    if (next <= -50) next += 50;
    if (next > 0) next -= 50;

    baseX.set(next);
  });

  const x = useTransform(baseX, (v) => `${v}%`);

  return (
    <div
      aria-hidden="true"
      className="relative z-20 w-full overflow-hidden border-y border-white/10 bg-[#050507]/90 py-4 select-none"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#020202] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#020202] to-transparent z-10" />

      <motion.div
        style={{ x: prefersReducedMotion ? 0 : x }}
        className="flex w-max items-center gap-10 whitespace-nowrap will-change-transform"
      >
        {[...ITEMS, ...ITEMS, ...ITEMS, ...ITEMS].map((text, idx) => (
          <div key={idx} className="flex items-center gap-10">
            <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-[0.35em] text-zinc-300">
              {text}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#d63031] shadow-[0_0_8px_#d63031]" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
