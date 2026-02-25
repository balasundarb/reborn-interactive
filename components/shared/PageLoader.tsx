"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const PageLoader = () => {
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader) return;

    // Ensure loader is visible and reset any leftover transforms
    gsap.set(loader, {
      y: 0,
      yPercent: 0,
      opacity: 1,
      visibility: "visible",
      display: "flex",
      clearProps: "transform",
    });

    // Lock body scroll during loader animation
    gsap.set("body", { overflow: "hidden" });

    // Create the slide‑up animation
    const tl = gsap.timeline({
      onComplete: () => {
        // Hide loader completely after animation
        gsap.set(loader, { display: "none" });
        // Restore body scroll
        gsap.set("body", { overflow: "auto" });
      },
    });

    tl.to(loader, {
      yPercent: -100,
      duration: 1.5,
      ease: "power4.inOut",
      clearProps: "transform",
    });

    // Cleanup on unmount
    return () => {
      tl.kill();
      gsap.set("body", { overflow: "auto" }); // Ensure body scroll is restored
      gsap.set(loader, { clearProps: "all" }); // Reset for next mount
    };
  }, []);

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 bg-[#080808] z-[10001] flex items-center justify-center"
      style={{ transition: "none" }} // Prevent CSS transition conflicts
    >
      <div className="relative">
        <div className="w-24 h-24 border-2 border-[#c0392b]/20 rounded-full animate-ping absolute inset-0" />
        <div className="w-24 h-24 border-t-2 border-[#c0392b] rounded-full animate-spin" />
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#c0392b] font-mono text-xs tracking-widest">
          REBORN
        </span>
      </div>
    </div>
  );
};

export default PageLoader;