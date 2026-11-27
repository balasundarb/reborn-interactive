"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/**
 * Provides global Lenis smooth scrolling across main pages.
 * Skips `/about` because that page manages its own Lenis + GSAP ScrollTrigger loop.
 */
export default function SmoothScrollProvider() {
  const pathname = usePathname();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isAboutPage = pathname.endsWith("/about");

    if (prefersReducedMotion || isAboutPage) {
      return;
    }

    const lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 0.95,
    });

    (window as unknown as { lenis?: Lenis | null }).lenis = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      const win = window as unknown as { lenis?: Lenis | null };
      if (win.lenis === lenis) {
        win.lenis = null;
      }
    };
  }, [pathname]);

  return null;
}
