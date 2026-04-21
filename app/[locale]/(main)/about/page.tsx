"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Image from "next/image";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ── Types ── */
interface CraftItem {
  num: string;
  title: string;
  desc: string;
}

/* ── Data (memoized) ── */
const CRAFT_ITEMS: CraftItem[] = [
  { num: "01", title: "Historical Cinematic Video Games", desc: "AAA quality period pieces built with obsessive historical fidelity and film-grade production values." },
  { num: "02", title: "Story-Driven Gameplay Experiences", desc: "Branching narratives where every choice echoes through history. Consequences feel real." },
  { num: "03", title: "Realistic Environment & Character Design", desc: "Photorealistic world-building and character work that transports players to another era entirely." },
  { num: "04", title: "Film-Quality Visual Production", desc: "Motion capture, real-time cinematics, and film-grade lighting that push hardware to its limits." },
  { num: "05", title: "Immersive Audio & Narrative Design", desc: "Period-accurate soundscapes, original orchestral scores, and dynamic dialogue systems." },
  { num: "06", title: "Cultural Consulting", desc: "Every detail vetted by historians, linguists, and cultural advisors. Authenticity is non-negotiable." },
];

const PHILOSOPHY_WORDS = ["Authenticity", "Emotion", "Immersion"] as const;
const TICKER_ITEMS = ["Historical Cinematic Gaming", "Authenticity", "Cinematic Storytelling", "Emotion", "Immersive World-Building", "Immersion", "AAA Production", "History Reborn"];
const HERO_LINES = ["Bringing", "History", "Back to Life"] as const;

/* ── Constants ── */
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
const RED_ACCENT = "#c0392b";

/* ── Scramble helper (optimized with requestAnimationFrame) ── */
function scrambleText(el: HTMLElement, finalText: string, duration = 900): void {
  let startTime: number | null = null;
  const animate = (currentTime: number) => {
    if (!startTime) startTime = currentTime;
    const progress = (currentTime - startTime) / duration;
    if (progress >= 1) {
      el.textContent = finalText;
      return;
    }
    el.textContent = finalText
      .split("")
      .map((ch, i) => {
        if (ch === " ") return " ";
        if (progress > i / finalText.length) return ch;
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      })
      .join("");
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}

/* ── Optimized Magnetic Effect Hook ── */
const useMagneticEffect = (refs: React.MutableRefObject<(HTMLDivElement | null)[]>) => {
  useEffect(() => {
    const cleanups: (() => void)[] = [];
    refs.current.forEach((el) => {
      if (!el) return;
      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.15;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.15;
        gsap.to(el, {
          x: dx,
          y: dy,
          duration: 0.5,
          ease: "power2.out",
          boxShadow: "0 20px 30px -10px rgba(192,57,43,0.2)",
          overwrite: "auto"
        });
      };
      const onLeave = () => {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: "elastic.out(1, 0.3)",
          boxShadow: "none",
          overwrite: "auto"
        });
      };
      el.addEventListener("mousemove", onMove, { passive: true });
      el.addEventListener("mouseleave", onLeave, { passive: true });
      cleanups.push(() => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      });
    });
    return () => cleanups.forEach(fn => fn());
  }, [refs]);
};

/* ── Component ── */
export default function AboutPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  // Refs
  const mainRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLElement>(null);
  const craftRef = useRef<HTMLElement>(null);
  const visionRef = useRef<HTMLElement>(null);
  const philosophyRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const counterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const scrambleRefs = useRef<(HTMLElement | null)[]>([]);
  const magnetRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tickerRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  useMagneticEffect(magnetRefs);

  const setCounterRef = useCallback((index: number) => (el: HTMLSpanElement | null) => {
    counterRefs.current[index] = el;
  }, []);

  const setScrambleRef = useCallback((index: number) => (el: HTMLElement | null) => {
    scrambleRefs.current[index] = el;
  }, []);

  const setMagnetRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    magnetRefs.current[index] = el;
  }, []);

  // Main animation effect (runs on every mount)
  useEffect(() => {
    let ctx: gsap.Context | null = null;
    let rafId: number;
    let tickerCleanups: (() => void)[] = [];

    // Force loader to be visible and reset any leftover transforms
    if (loaderRef.current) {
      gsap.set(loaderRef.current, {
        y: 0,
        yPercent: 0,
        opacity: 1,
        visibility: "visible",
        display: "flex",
        clearProps: "transform" // Remove any previous transforms
      });
    }

    // Small delay to ensure DOM is ready and loader is painted
    const timer = setTimeout(() => {
      // Re-check loader ref inside timeout to be safe
      const loader = loaderRef.current;
      if (!loader) {
        // Fallback: if loader not found, just set loading false
        setIsLoading(false);
        setIsVisible(true);
        return;
      }

      // Initialize Lenis
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 2,
        wheelMultiplier: 0.8,
      });
      lenisRef.current = lenis;
      (window as any).lenis = lenis;

      function raf(time: number) {
        if (!document.body.classList.contains('is-transitioning')) {
          lenis.raf(time);
          ScrollTrigger.update();
        }
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);

      // Page Load Animation
      const pageLoadTl = gsap.timeline({
        onComplete: () => {
          setIsLoading(false);
          setIsVisible(true);
          // Hide loader completely after animation
          if (loader) {
            gsap.set(loader, { display: "none" });
          }
        }
      });

      pageLoadTl
        .set("body", { overflow: "hidden" })
        .to(loader, {
          yPercent: -100,
          duration: 1.5,
          ease: "power4.inOut",
          clearProps: "transform" // Clean up after animation
        })
        .set("body", { overflow: "auto" }, "-=0.5");

      // Scroll progress bar
      ScrollTrigger.create({
        trigger: mainRef.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          if (progressRef.current) {
            gsap.set(progressRef.current, { scaleX: self.progress });
          }
        },
      });

      // GSAP context for all ScrollTriggers and animations
      ctx = gsap.context(() => {
        /* ── HERO ENTRANCE ANIMATIONS ── */
        const heroTl = gsap.timeline({ delay: 0.8 });
        heroTl
          .fromTo(bgRef.current,
            { scale: 1.3, filter: "brightness(0) blur(10px)" },
            { scale: 1.05, filter: "brightness(1) blur(0px)", duration: 2.2, ease: "power3.out", force3D: true }
          )
          .fromTo(".hero-eyebrow",
            { y: 50, opacity: 0, rotateX: -15 },
            { y: 0, opacity: 1, rotateX: 0, duration: 1, ease: "power3.out", force3D: true },
            "-=1.5"
          )
          .fromTo(".hero-line",
            { y: 200, opacity: 0, skewX: -8, rotationX: -25 },
            { y: 0, opacity: 1, skewX: 0, rotationX: 0, duration: 1.2, stagger: 0.12, ease: "power4.out", force3D: true },
            "-=0.8"
          )
          .fromTo(".hero-body",
            { opacity: 0, y: 40, filter: "blur(10px)" },
            { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.2, ease: "power3.out", force3D: true },
            "-=0.6"
          )
          .fromTo(".hero-scroll",
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 1, ease: "back.out(1.2)", force3D: true },
            "-=0.4"
          );

        /* ── HERO PARALLAX ── */
        gsap.to(bgRef.current, {
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1.2,
            invalidateOnRefresh: true
          },
          yPercent: 25,
          scale: 1.15,
          ease: "none",
          force3D: true
        });

        gsap.to(".hero-content", {
          scrollTrigger: {
            trigger: heroRef.current,
            start: "20% top",
            end: "bottom top",
            scrub: 1,
            invalidateOnRefresh: true
          },
          opacity: 0.5,
          y: -120,
          ease: "none",
          force3D: true
        });

        /* ── TICKER ANIMATION ── */
        if (tickerRef.current) {
          const ticker = tickerRef.current;
          const clone = ticker.cloneNode(true) as HTMLElement;
          ticker.parentElement?.appendChild(clone);

          const tickerTl = gsap.timeline({ repeat: -1, ease: "none" });
          tickerTl.to([ticker, clone], {
            xPercent: -100,
            duration: 30,
            modifiers: {
              xPercent: gsap.utils.unitize((v: string) => parseFloat(v) % 100)
            }
          });

          let hoverTimeout: NodeJS.Timeout;
          [ticker, clone].forEach(el => {
            const onEnter = () => {
              clearTimeout(hoverTimeout);
              gsap.to([ticker, clone], {
                timeScale: 0.3,
                duration: 0.4,
                ease: "power2.out",
                overwrite: true
              });
            };
            const onLeave = () => {
              hoverTimeout = setTimeout(() => {
                gsap.to([ticker, clone], {
                  timeScale: 1,
                  duration: 0.6,
                  ease: "power2.out",
                  overwrite: true
                });
              }, 100);
            };
            el.addEventListener("mouseenter", onEnter, { passive: true });
            el.addEventListener("mouseleave", onLeave, { passive: true });
            tickerCleanups.push(() => {
              el.removeEventListener("mouseenter", onEnter);
              el.removeEventListener("mouseleave", onLeave);
            });
          });
        }

        /* ── MISSION SECTION ── */
        document.querySelectorAll<HTMLElement>(".split-word").forEach((wordEl) => {
          const text = wordEl.textContent || "";
          wordEl.innerHTML = text
            .split("")
            .map((c) => `<span class="split-char" style="display:inline-block; opacity:0; transform:translateY(40px) rotateX(45deg)">${c === " " ? "&nbsp;" : c}</span>`)
            .join("");
        });

        gsap.to(".split-char", {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.8,
          stagger: 0.02,
          ease: "back.out(1.2)",
          force3D: true,
          scrollTrigger: {
            trigger: missionRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
            invalidateOnRefresh: true
          },
        });

        gsap.fromTo(".mission-line",
          { scaleX: 0, transformOrigin: "left center" },
          {
            scaleX: 1,
            duration: 1.2,
            ease: "power3.inOut",
            force3D: true,
            scrollTrigger: {
              trigger: missionRef.current,
              start: "top 75%",
              invalidateOnRefresh: true
            }
          }
        );

        gsap.fromTo(".mission-text-block",
          { opacity: 0, x: -50, filter: "blur(10px)" },
          {
            opacity: 1,
            x: 0,
            filter: "blur(0px)",
            duration: 1,
            stagger: 0.15,
            ease: "power3.out",
            force3D: true,
            scrollTrigger: {
              trigger: missionRef.current,
              start: "top 70%",
              invalidateOnRefresh: true
            }
          }
        );

        gsap.fromTo(".quote-card",
          { clipPath: "inset(100% 0 0 0)", opacity: 0, y: 100 },
          {
            clipPath: "inset(0% 0 0 0)",
            opacity: 1,
            y: 0,
            duration: 1.5,
            ease: "power4.out",
            force3D: true,
            scrollTrigger: {
              trigger: ".quote-card",
              start: "top 80%",
              invalidateOnRefresh: true
            }
          }
        );

        /* ── CRAFT SECTION ── */
        gsap.fromTo(".craft-card",
          { opacity: 0, y: 100, rotateX: 25, transformPerspective: 1200, filter: "blur(10px)" },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            filter: "blur(0px)",
            duration: 1.2,
            stagger: { amount: 0.8, from: "start" },
            ease: "power4.out",
            clearProps: "rotateX,transformPerspective",
            force3D: true,
            scrollTrigger: {
              trigger: craftRef.current,
              start: "top 75%",
              invalidateOnRefresh: true
            },
          }
        );

        ScrollTrigger.create({
          trigger: craftRef.current,
          start: "top 75%",
          once: true,
          onEnter: () => {
            counterRefs.current.forEach((el, i) => {
              if (!el) return;
              setTimeout(() => scrambleText(el, el.dataset.final || "01", 1000), i * 100);
            });
          },
        });

        gsap.to(".craft-section-title", {
          scrollTrigger: {
            trigger: craftRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
            invalidateOnRefresh: true
          },
          x: -80,
          opacity: 0.5,
          ease: "none",
          force3D: true
        });

        /* ── VISION SECTION ── */
        const visionText = document.querySelector(".vision-text");
        if (visionText && !visionText.hasAttribute('data-processed')) {
          const words = visionText.textContent?.split(" ") || [];
          visionText.innerHTML = words
            .map((word, i) => {
              if (word === "reborn") {
                return `<span class="vision-word inline-block mr-[0.25em] relative">
                  <span class="vision-word-char relative z-10 text-[${RED_ACCENT}] font-bold italic">${word}</span>
                </span>`;
              }
              return `<span class="vision-word inline-block mr-[0.25em] relative">
                ${word.split("").map(char =>
                `<span class="vision-word-char inline-block" style="opacity:0.15; transition:opacity 0.3s ease">${char}</span>`
              ).join("")}
              </span>`;
            })
            .join("");
          visionText.setAttribute('data-processed', 'true');
        }

        gsap.to(".vision-word-char", {
          opacity: 1,
          stagger: 0.01,
          ease: "none",
          scrollTrigger: {
            trigger: visionRef.current,
            start: "top 85%",
            end: "center 25%",
            scrub: 1.5,
            invalidateOnRefresh: true
          },
        });

        gsap.fromTo(".vision-bg-text",
          { xPercent: -15, opacity: 0 },
          {
            xPercent: 15,
            opacity: 0.08,
            ease: "none",
            scrollTrigger: {
              trigger: visionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 2,
              invalidateOnRefresh: true
            }
          }
        );

        /* ── PHILOSOPHY SECTION ── */
        gsap.fromTo(".philo-word",
          { opacity: 0, scale: 0.5, filter: "blur(20px)", rotateY: 45 },
          {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            rotateY: 0,
            duration: 1.4,
            stagger: 0.25,
            ease: "expo.out",
            force3D: true,
            scrollTrigger: {
              trigger: philosophyRef.current,
              start: "top 75%",
              invalidateOnRefresh: true
            },
          }
        );

        gsap.fromTo(".philo-divider-left",
          { scaleX: 0, transformOrigin: "left center" },
          {
            scaleX: 1,
            duration: 1.5,
            ease: "power3.inOut",
            force3D: true,
            scrollTrigger: {
              trigger: philosophyRef.current,
              start: "top 80%",
              invalidateOnRefresh: true
            }
          }
        );

        gsap.fromTo(".philo-divider-right",
          { scaleX: 0, transformOrigin: "right center" },
          {
            scaleX: 1,
            duration: 1.5,
            ease: "power3.inOut",
            force3D: true,
            scrollTrigger: {
              trigger: philosophyRef.current,
              start: "top 80%",
              invalidateOnRefresh: true
            }
          }
        );

        ScrollTrigger.create({
          trigger: philosophyRef.current,
          start: "top 75%",
          once: true,
          onEnter: () => {
            scrambleRefs.current.forEach((el, i) => {
              if (!el) return;
              const final = el.dataset.final || "";
              setTimeout(() => scrambleText(el, final, 1200), i * 300);
            });
          },
        });

        gsap.fromTo(".philosophy-footer",
          { opacity: 0, y: 40, filter: "blur(10px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.2,
            ease: "power3.out",
            force3D: true,
            scrollTrigger: {
              trigger: philosophyRef.current,
              start: "bottom 90%",
              invalidateOnRefresh: true
            }
          }
        );

      }, mainRef);
    }, 100); // Small delay ensures DOM ready

    return () => {
      clearTimeout(timer);
      if (ctx) ctx.revert();
      if (rafId) cancelAnimationFrame(rafId);
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
        (window as any).lenis = null;
      }
      tickerCleanups.forEach(fn => fn());
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      gsap.globalTimeline.clear();
      
      // Reset loader styles for next mount
      if (loaderRef.current) {
        gsap.set(loaderRef.current, { clearProps: "all" });
      }
    };
  }, []);

  // Memoized styles
  const heroLineStyles = useMemo(() => [
    { fontSize: "clamp(4rem,12vw,10rem)" },
    {
      fontSize: "clamp(4rem,12vw,10rem)",
      WebkitTextStroke: "1.5px rgba(255,255,255,0.62)",
      color: "transparent"
    },
    {
      fontSize: "clamp(4rem,12vw,10rem)",
      color: RED_ACCENT,
      fontStyle: "italic"
    }
  ], []);

  return (
    <>
      {/* Page Loader - no CSS transition to avoid conflict */}
      <div
        ref={loaderRef}
        className="page-loader fixed inset-0 bg-[#080808] z-10001 flex items-center justify-center"
        style={{ transition: "none" }} // Disable any CSS transitions
      >
        <div className="relative">
          <div className="w-24 h-24 border-2 border-[#c0392b]/20 rounded-full animate-ping absolute inset-0" />
          <div className="w-24 h-24 border-t-2 border-[#c0392b] rounded-full animate-spin" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#c0392b] font-mono text-xs tracking-widest">
            REBORN
          </span>
        </div>
      </div>

      <main
        ref={mainRef}
        className="relative bg-[#080808] text-neutral-100 min-h-screen overflow-x-hidden"
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300&family=Barlow+Condensed:ital,wght@0,700;0,900;1,700&family=DM+Mono:wght@300&display=swap');

          ::selection { background: ${RED_ACCENT}; color: #fff; }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-track { background: #1a1a1a; }
          ::-webkit-scrollbar-thumb { background: ${RED_ACCENT}; border-radius: 2px; }

          .font-display { font-family: 'Barlow Condensed', sans-serif; }
          .font-serif { font-family: 'Cormorant Garamond', serif; }
          .font-mono { font-family: 'DM Mono', monospace; }

          .text-stroke-white { -webkit-text-stroke: 1.5px rgba(255,255,255,0.62); color: transparent; }
          .text-stroke-red { -webkit-text-stroke: 1px ${RED_ACCENT}; color: transparent; }

          .craft-bar { 
            transform-origin: left; 
            transform: scaleX(0); 
            transition: transform 0.55s cubic-bezier(0.76, 0, 0.24, 1); 
          }
          .craft-card:hover .craft-bar { transform: scaleX(1); }
          .craft-card:hover .craft-num { color: ${RED_ACCENT} !important; }
          .craft-card:hover .craft-title { color: ${RED_ACCENT}; }
          .craft-arrow { 
            opacity: 0; 
            transform: translate(0,0); 
            transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease; 
          }
          .craft-card:hover .craft-arrow { 
            opacity: 1; 
            transform: translate(8px, -8px); 
          }

          .ticker-wrap { 
            overflow: hidden; 
            white-space: nowrap; 
            display: flex;
            mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          }
          .ticker-track { 
            display: inline-flex; 
            flex-shrink: 0; 
            will-change: transform;
          }

          .scroll-progress {
            position: fixed; 
            top: 0; 
            left: 0; 
            right: 0; 
            height: 3px; 
            z-index: 10000;
            background: linear-gradient(90deg, ${RED_ACCENT}, #e74c3c, ${RED_ACCENT});
            transform-origin: left; 
            transform: scaleX(0); 
            will-change: transform;
            box-shadow: 0 0 10px rgba(192,57,43,0.5);
          }

          .noise-overlay {
            position: fixed; 
            inset: 0; 
            z-index: 9999; 
            pointer-events: none;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.2'/%3E%3C/svg%3E");
            opacity: 0.03;
            mix-blend-mode: overlay;
          }

          @keyframes float {
            0%,100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }

          .floating {
            animation: float 4s ease-in-out infinite;
          }

          .gradient-text {
            background: linear-gradient(135deg, #fff 0%, ${RED_ACCENT} 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          /* Performance optimizations */
          .will-change-transform {
            will-change: transform;
          }
          
          .gpu-accelerated {
            transform: translateZ(0);
            backface-visibility: hidden;
            perspective: 1000px;
          }
        `}</style>

        {/* Scroll progress bar */}
        <div ref={progressRef} className="scroll-progress" />

        {/* Noise overlay */}
        <div className="noise-overlay" aria-hidden="true" />

        {/* Hero Section */}
        <section ref={heroRef} className="relative h-screen flex items-end justify-start pb-20 px-8 md:px-16 overflow-hidden">
          <div
            ref={bgRef}
            className="absolute inset-0 bg-cover bg-center will-change-transform gpu-accelerated"
            style={{
              backgroundImage: "url(https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2400&auto=format&fit=crop)",
              backgroundPosition: "center 30%"
            }}
          />
          <div className="absolute inset-0 bg-linear-to-r from-[#080808] via-[#080808]/80 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-t from-[#080808] via-transparent to-[#080808]/30" />

          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-[#c0392b]/10 rounded-full blur-[120px] opacity-50" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#c0392b]/5 rounded-full blur-[100px] opacity-30" />

          <div className="hero-content relative z-10 max-w-5xl">
            <div className="overflow-hidden mb-4">
              <span className="hero-eyebrow font-mono text-[#c0392b] text-xs tracking-[0.5em] uppercase block">
                Reborn Interactive — Est. Since The Beginning
              </span>
            </div>
            <h1 className="font-display font-black uppercase leading-[0.88] mb-8">
              {HERO_LINES.map((line, i) => (
                <div key={i} className="overflow-hidden">
                  <span
                    className="hero-line block will-change-transform"
                    style={heroLineStyles[i]}
                  >
                    {line}
                  </span>
                </div>
              ))}
            </h1>
            <p className="hero-body font-serif text-lg md:text-2xl text-neutral-400 max-w-lg font-light leading-relaxed">
              We don't just create games —{" "}
              <em className="text-white not-italic border-b border-[#c0392b] pb-px">we recreate moments in time.</em>
            </p>
            <div className="hero-scroll mt-12 flex items-center gap-4">
              <div className="w-px h-16 bg-linear-to-b from-transparent via-[#c0392b] to-transparent" />
              <span className="font-mono text-[10px] tracking-[0.4em] text-neutral-400 uppercase">Scroll to Explore</span>
            </div>
          </div>

          <div className="absolute top-8 right-8 z-10 floating" aria-hidden="true">
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
              <path d="M52 0 L52 52 L0 52" stroke="#c0392b" strokeWidth="1.5" strokeOpacity="0.4" />
            </svg>
          </div>
        </section>

        {/* Ticker */}
        <div className="relative z-10 border-y border-neutral-800/50 py-4 overflow-hidden bg-[#080808]">
          <div className="ticker-wrap">
            <div ref={tickerRef} className="ticker-track will-change-transform">
              {TICKER_ITEMS.map((text, j) => (
                <span key={j} className="inline-flex items-center gap-5 px-6 font-display font-bold uppercase text-sm tracking-widest">
                  <span className="text-neutral-500 hover:text-[#c0392b] transition-colors duration-300">{text}</span>
                  <span className="text-[#c0392b] opacity-50">✦</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <section ref={missionRef} className="relative pt-20 pb-20 px-8 md:px-16 overflow-hidden">
          <div className="absolute -top-32 right-0 w-[520px] h-[520px] bg-[#c0392b]/5 rounded-full blur-[140px] opacity-30" />

          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-5 mb-14">
              <div className="mission-line h-px max-w-[100px] flex-1 bg-[#c0392b]" />
              <span className="font-mono text-black bg-[#c0392b] text-[10px] tracking-[0.5em] uppercase font-bold px-3 py-1 rounded-full">
                Our Mission
              </span>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 md:gap-20 items-start">
              <div>
                <h2 className="mission-heading font-display font-black uppercase leading-[0.9] mb-8" style={{ fontSize: "clamp(2.8rem,6.5vw,5.5rem)" }}>
                  <span className="split-word block text-white">We Create</span>
                  <span className="split-word block text-stroke-white">Worlds</span>
                  <span className="split-word block italic text-[#c0392b]">Players Live.</span>
                </h2>

                <div className="space-y-5 text-neutral-400 text-lg font-light leading-relaxed max-w-lg">
                  <p className="mission-text-block">
                    Reborn Interactive is a visionary studio dedicated to bringing history back to life through{" "}
                    <span className="text-white font-serif italic">immersive, cinematic storytelling.</span>
                  </p>
                  <p className="mission-text-block">
                    We specialize in historically inspired games that blend authenticity with cutting-edge visuals,
                    powerful narratives, and emotionally driven gameplay.
                  </p>
                  <p className="mission-text-block">
                    We believe history is more than dates and facts — it is drama, heroism, conflict, culture,
                    and <span className="text-white">human emotion.</span>
                  </p>
                </div>
              </div>

              <div className="quote-card relative mt-4 lg:mt-14">
                <div className="absolute -inset-px bg-linear-to-br from-[#c0392b]/20 to-transparent rounded-lg" />
                <div className="relative p-10 md:p-12 border border-neutral-800/60 bg-neutral-900/20 backdrop-blur-sm rounded-lg">
                  <div
                    className="font-serif absolute -top-5 -left-1 pointer-events-none select-none text-[6.5rem] leading-none text-[#c0392b] opacity-10"
                    aria-hidden="true"
                  >"</div>
                  <p className="font-serif italic text-neutral-200 text-xl md:text-2xl leading-snug relative z-10">
                    Every project we develop is built with meticulous research, high-quality production design,
                    and storytelling techniques inspired by film-making.
                  </p>
                  <div className="mt-8 flex items-center gap-4">
                    <div className="h-px w-8 bg-[#c0392b]" />
                    <span className="font-mono text-[10px] tracking-[0.4em] text-neutral-400 uppercase">The Studio Philosophy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Craft Section */}
        <section ref={craftRef} className="relative pt-20 pb-20 px-8 md:px-16 bg-[#050505]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 pt-14 border-t border-neutral-800/40">
              <div>
                <h2 className="craft-section-title font-display font-black uppercase leading-[0.88]" style={{ fontSize: "clamp(3.5rem,9vw,8rem)" }}>
                  The <span className="text-stroke-red">Craft</span>
                </h2>
              </div>
              <p className="font-mono text-neutral-400 text-xs tracking-widest uppercase max-w-xs leading-loose md:mb-2">
                Merging technical excellence with historical preservation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-x divide-y divide-neutral-800/50 border border-neutral-800/50 rounded-lg overflow-hidden">
              {CRAFT_ITEMS.map((item, index) => (
                <div
                  key={item.num}
                  ref={setMagnetRef(index)}
                  className="craft-card group relative p-9 md:p-11 bg-transparent hover:bg-neutral-900/30 transition-all duration-700 overflow-hidden cursor-default will-change-transform"
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                    style={{ background: "radial-gradient(circle at 30% 30%, rgba(192,57,43,0.12) 0%, transparent 70%)" }}
                  />
                  <div className="craft-bar absolute top-0 left-0 right-0 h-[2px] bg-[#c0392b]" />

                  <span
                    ref={setCounterRef(index)}
                    data-final={item.num}
                    className="craft-num font-mono text-xs text-neutral-700 transition-colors duration-500 block mb-5"
                  >
                    {item.num}
                  </span>

                  <h3 className="craft-title font-display font-bold uppercase text-xl leading-tight text-white mb-3 tracking-tight transition-colors duration-400">
                    {item.title}
                  </h3>
                  <p className="text-sm text-neutral-500 leading-relaxed font-light">{item.desc}</p>

                  <div className="craft-arrow absolute bottom-7 right-7 text-[#c0392b]">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M4 16L16 4M16 4H8M16 4V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section ref={visionRef} className="relative pt-20 pb-20 px-8 md:px-16 overflow-hidden bg-[#080808]">
          <div
            className="vision-bg-text absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
            aria-hidden="true"
          >
            <span className="font-display font-black uppercase whitespace-nowrap text-white text-[clamp(8rem,24vw,21rem)] opacity-0">
              REBORN
            </span>
          </div>

          <div className="max-w-5xl mx-auto relative z-10">
            <div className="flex items-center gap-5 mb-12">
              <div className="h-px max-w-[100px] flex-1 bg-[#c0392b]" />
              <span className="font-mono text-black bg-[#c0392b] text-[10px] tracking-[0.5em] uppercase font-bold px-3 py-1 rounded-full">
                Our Vision
              </span>
            </div>

            <p className="vision-text font-serif font-light leading-[1.38] text-[clamp(1.55rem,3.2vw,3rem)]">
              To become a globally recognized studio that sets a new benchmark in cinematic historical gaming — where education meets entertainment, and history is reborn through interactive storytelling.
            </p>
          </div>
        </section>

        {/* Philosophy Section */}
        <section ref={philosophyRef} className="relative pt-16 pb-24 px-8 md:px-16 bg-[#050505] overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[700px] h-[260px] bg-[#c0392b]/10 rounded-full blur-[110px] opacity-30" />
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex items-center gap-5 mb-16">
              <div className="philo-divider-left h-px flex-1 origin-left bg-linear-to-r from-[#c0392b] to-transparent" />
              <span className="font-mono text-[#c0392b] text-[12px] tracking-[0.5em] uppercase">Our Philosophy</span>
              <div className="philo-divider-right h-px flex-1 origin-right bg-linear-to-l from-[#c0392b] to-transparent" />
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-6 md:gap-12 lg:gap-20">
              {PHILOSOPHY_WORDS.map((word, i) => (
                <div key={word} className="philo-word group cursor-default text-center">
                  <span
                    ref={setScrambleRef(i)}
                    data-final={word.toUpperCase()}
                    className="font-display font-black uppercase italic block transition-all duration-700 group-hover:scale-110 group-hover:text-[#c0392b] will-change-transform"
                    style={{
                      fontSize: "clamp(3rem,8vw,8rem)",
                      color: i === 1 ? "#c0392b" : "transparent",
                      WebkitTextStroke: i === 1 ? "0px" : "3px rgba(255,255,255,0.30)",
                      lineHeight: 0.9,
                      textShadow: i === 1 ? "0 0 30px rgba(192,57,43,0.5)" : "none"
                    }}
                  >
                    {word.toUpperCase()}
                  </span>
                  <div className="mt-2 mx-auto h-px w-0 group-hover:w-full transition-all duration-500 bg-[#c0392b]" />
                </div>
              ))}
            </div>

            <p className="philosophy-footer font-serif italic text-neutral-400 text-xl md:text-2xl text-center mt-14 max-w-xl mx-auto leading-relaxed">
              We create worlds that players don't just play —{" "}
              <span className="text-neutral-300 border-b border-[#c0392b] pb-1">they live.</span>
            </p>
          </div>
        </section>
      </main>
    </>
  );
}