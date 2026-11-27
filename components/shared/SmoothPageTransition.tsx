"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function SmoothPageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // Smoothly reset scroll on route change unless navigating to a hash
    if (typeof window !== "undefined" && !window.location.hash) {
      const lenis = (
        window as unknown as {
          lenis?: { scrollTo: (t: number, opts?: { immediate?: boolean }) => void };
        }
      ).lenis;
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      }
    }
  }, [pathname]);

  return (
    <>
      {/* Top route-transition progress bar */}
      {!prefersReducedMotion && (
        <motion.div
          key={`bar-${pathname}`}
          aria-hidden="true"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: [0, 0.82, 1], opacity: [1, 1, 0] }}
          transition={{
            duration: 0.65,
            times: [0, 0.65, 1],
            ease: EASE_OUT_EXPO,
          }}
          className="fixed top-0 left-0 right-0 z-[9999] h-[2px] origin-left bg-gradient-to-r from-[#d63031] via-[#ff4757] to-white shadow-[0_0_12px_rgba(214,48,49,0.85)] pointer-events-none"
        />
      )}

      {/* GPU-composited page entrance without overflow-hidden so sticky elements keep working */}
      <motion.div
        key={pathname}
        initial={
          prefersReducedMotion ? false : { opacity: 0, y: 14, scale: 0.994 }
        }
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.48,
          ease: EASE_OUT_EXPO,
        }}
        className="will-change-[opacity,transform]"
      >
        {children}
      </motion.div>
    </>
  );
}
