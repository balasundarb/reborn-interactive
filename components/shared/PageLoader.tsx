"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const PageLoader = () => {
  const loaderRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const loader = loaderRef.current;
    const curtain = curtainRef.current;
    const content = contentRef.current;
    const bar = barRef.current;
    if (!loader || !curtain || !content || !bar) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      gsap.set([loader, curtain], { display: "none" });
      return;
    }

    document.body.style.overflow = "hidden";

    const counter = { val: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = "";
        setDone(true);
      },
    });

    tl.fromTo(
      content,
      { opacity: 0, y: 16, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "power3.out" }
    )
      .to(
        counter,
        {
          val: 100,
          duration: 0.75,
          ease: "power2.inOut",
          onUpdate: () => {
            const pct = Math.round(counter.val);
            setProgress(pct);
            gsap.set(bar, { scaleX: counter.val / 100 });
          },
        },
        "-=0.25"
      )
      .to(content, {
        opacity: 0,
        y: -18,
        scale: 0.98,
        duration: 0.35,
        ease: "power3.in",
      })
      .to(
        loader,
        {
          yPercent: -100,
          duration: 0.85,
          ease: "power4.inOut",
        },
        "-=0.12"
      )
      .to(
        curtain,
        {
          yPercent: -100,
          duration: 0.75,
          ease: "power4.inOut",
        },
        "-=0.7"
      );

    return () => {
      tl.kill();
      document.body.style.overflow = "";
    };
  }, []);

  if (done) return null;

  return (
    <>
      {/* Secondary crimson accent curtain that trails behind the main veil */}
      <div
        ref={curtainRef}
        aria-hidden="true"
        className="fixed inset-0 z-[10000] bg-gradient-to-b from-[#d63031] via-[#991b1b] to-[#050507] will-change-transform pointer-events-none"
      />

      {/* Primary obsidian preloader */}
      <div
        ref={loaderRef}
        aria-label="Loading"
        className="fixed inset-0 z-[10001] flex flex-col items-center justify-center bg-[#050507] will-change-transform overflow-hidden"
      >
        {/* Ambient crimson radial glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute h-[420px] w-[420px] rounded-full bg-[#d63031]/15 blur-[120px]"
        />

        {/* Subtle grid backdrop */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_55%,transparent_100%)]"
        />

        <div
          ref={contentRef}
          className="relative z-10 flex flex-col items-center gap-6 px-6 text-center"
        >
          {/* Orbiting emblem */}
          <div className="relative flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-[#d63031]/25 animate-[spin_6s_linear_infinite]" />
            <div className="absolute inset-1.5 rounded-full border-t-2 border-r-2 border-[#d63031] animate-[spin_1.4s_cubic-bezier(0.65,0,0.35,1)_infinite]" />
            <div className="h-3 w-3 rounded-full bg-[#d63031] shadow-[0_0_20px_#d63031]" />
          </div>

          {/* Brand wordmark */}
          <div className="space-y-1.5">
            <p className="text-2xl sm:text-3xl font-black tracking-[0.28em] text-white uppercase italic">
              REBORN
              <span className="text-[#d63031] drop-shadow-[0_0_12px_rgba(214,48,49,0.8)]">
                .
              </span>
            </p>
            <p className="text-[11px] font-mono uppercase tracking-[0.35em] text-zinc-400">
              Interactive Studio
            </p>
          </div>

          {/* Sleek progress track */}
          <div className="w-52 sm:w-64 space-y-2">
            <div className="h-[2px] w-full overflow-hidden rounded-full bg-white/10">
              <div
                ref={barRef}
                className="h-full w-full origin-left scale-x-0 bg-gradient-to-r from-[#d63031] via-[#ff4757] to-white shadow-[0_0_12px_rgba(214,48,49,0.8)]"
              />
            </div>
            <div className="flex items-center justify-between font-mono text-[10px] tracking-widest text-zinc-500">
              <span>INITIALIZING</span>
              <span className="text-zinc-300 tabular-nums">
                {String(progress).padStart(2, "0")}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PageLoader;
