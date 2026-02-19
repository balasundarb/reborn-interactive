"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";

// ─── Particle type ────────────────────────────────────────────────────────────
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  spriteIdx: number;
  alpha: number; alphaDir: number;
}

// ─── Pre-bake glow dot into an offscreen canvas (called once per size) ────────
// This eliminates per-frame shadowBlur — the #1 Canvas2D perf killer.
function bakeGlowSprite(radius: number): HTMLCanvasElement {
  const size = Math.ceil(radius * 8);
  const oc = document.createElement("canvas");
  oc.width = oc.height = size;
  const c = oc.getContext("2d")!;
  const cx = size / 2;
  // Soft halo
  const halo = c.createRadialGradient(cx, cx, 0, cx, cx, size / 2);
  halo.addColorStop(0,   "rgba(214,48,49,0.55)");
  halo.addColorStop(0.45,"rgba(214,48,49,0.15)");
  halo.addColorStop(1,   "rgba(214,48,49,0)");
  c.fillStyle = halo;
  c.fillRect(0, 0, size, size);
  // Bright core
  const core = c.createRadialGradient(cx, cx, 0, cx, cx, radius * 1.1);
  core.addColorStop(0, "rgba(255,140,140,1)");
  core.addColorStop(1, "rgba(214,48,49,0)");
  c.fillStyle = core;
  c.beginPath();
  c.arc(cx, cx, radius * 1.1, 0, Math.PI * 2);
  c.fill();
  return oc;
}

// ─── Debounce — prevents resize thrashing ─────────────────────────────────────
function debounce<T extends (...a: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...a) => { clearTimeout(timer); timer = setTimeout(() => fn(...a), ms); }) as T;
}

// ─── Ease-out-expo ────────────────────────────────────────────────────────────
const easeOutExpo = (p: number) => p >= 1 ? 1 : 1 - Math.pow(2, -10 * p);

const HeroSection: React.FC = () => {
  const videoRef         = useRef<HTMLVideoElement>(null);
  const canvasRef        = useRef<HTMLCanvasElement>(null);
  const chargeBarRef     = useRef<HTMLDivElement>(null);   // CSS-var charge, no setState
  const parallaxHudRef   = useRef<HTMLDivElement>(null);
  const parallaxTitleRef = useRef<HTMLDivElement>(null);

  const loadedFiredRef = useRef(false);                    // guard double-fire
  const [loaded, setLoaded] = useState(false);
  const [time, setTime]     = useState("00:00:00");

  // ── Clock (1s interval, negligible cost) ──────────────────────────────────
  useEffect(() => {
    const tick = setInterval(() => {
      const n = new Date();
      setTime([n.getHours(), n.getMinutes(), n.getSeconds()]
        .map(v => String(v).padStart(2,"0")).join(":"));
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  // ── Video ready guard ─────────────────────────────────────────────────────
  const handleVideoReady = useCallback(() => {
    if (loadedFiredRef.current) return;
    loadedFiredRef.current = true;
    setLoaded(true);
  }, []);

  // Fallback: show UI even if video never fires (dev / missing file)
  useEffect(() => {
    const t = setTimeout(handleVideoReady, 900);
    return () => clearTimeout(t);
  }, [handleVideoReady]);

  // ── Charge bar via CSS custom property — ZERO React re-renders ───────────
  useEffect(() => {
    if (!loaded) return;
    const el = chargeBarRef.current;
    if (!el) return;
    let raf: number;
    let start: number | null = null;
    const DURATION = 3400;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / DURATION, 1);
      // Direct DOM property write — bypasses React scheduler & layout recalc
      el.style.setProperty("--charge", `${easeOutExpo(progress) * 100}%`);
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [loaded]);

  // ── Mouse parallax — single rAF loop, GPU-only transforms ────────────────
  useEffect(() => {
    const mouse = { x: 0, y: 0 };
    const cur   = { hx: 0, hy: 0, tx: 0, ty: 0 };
    let raf: number;

    const onMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    // passive: true — never blocks scroll
    window.addEventListener("mousemove", onMove, { passive: true });

    const loop = () => {
      // Lerp at different rates per layer for depth feel
      cur.hx += (mouse.x * 11 - cur.hx) * 0.052;
      cur.hy += (mouse.y * 6.5 - cur.hy) * 0.052;
      cur.tx += (mouse.x * 22 - cur.tx) * 0.036;
      cur.ty += (mouse.y * 13 - cur.ty) * 0.036;

      // translate3d → GPU composited, no layout, no paint
      if (parallaxHudRef.current)
        parallaxHudRef.current.style.transform =
          `translate3d(${cur.hx.toFixed(2)}px,${cur.hy.toFixed(2)}px,0)`;
      if (parallaxTitleRef.current)
        parallaxTitleRef.current.style.transform =
          `translate3d(${cur.tx.toFixed(2)}px,${cur.ty.toFixed(2)}px,0)`;

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  // ── Canvas particles — sprite-stamped, no shadowBlur per frame ───────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true })!;

    // Bake 3 sprite sizes once at mount
    const sprites = [1.1, 1.6, 2.1].map(bakeGlowSprite);

    let W = window.innerWidth, H = window.innerHeight;
    const applySize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W; canvas.height = H;
    };
    applySize();
    const onResize = debounce(applySize as (...a: unknown[]) => void, 130);
    window.addEventListener("resize", onResize);

    // Spawn particles spread across full viewport from the start
    const COUNT = 38;
    const particles: Particle[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.22,
      vy: -(0.22 + Math.random() * 0.52),
      spriteIdx: Math.floor(Math.random() * sprites.length),
      alpha: 0.08 + Math.random() * 0.42,
      alphaDir: Math.random() > 0.5 ? 1 : -1,
    }));

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.alphaDir * 0.0022;
        if (p.alpha > 0.52) { p.alpha = 0.52; p.alphaDir = -1; }
        if (p.alpha < 0.04) { p.alpha = 0.04; p.alphaDir =  1; }
        if (p.y < -24) { p.y = H + 12; p.x = Math.random() * W; }

        // Stamp pre-baked sprite — zero GPU stall, no per-call shadowBlur
        const sp = sprites[p.spriteIdx];
        ctx.globalAlpha = p.alpha;
        ctx.drawImage(sp, p.x - sp.width / 2, p.y - sp.height / 2);
      }
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section
      id="home"
      aria-label="Game intro hero"
      role="banner"
      className="relative flex items-center justify-center h-screen overflow-hidden bg-[#020202]"
      style={{ fontFamily: "'Share Tech Mono', monospace" }}
    >
      {/* ─────────────────────────────────────────────
          STYLES
      ───────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Cinzel+Decorative:wght@900&display=swap');

        :root {
          --z-bg:      0;
          --z-fx:      2;
          --z-ptcl:    5;
          --z-ovl:     8;
          --z-ui:     10;
          --z-hud:    20;
          --z-tick:   25;
          /* charge bar driven by JS via setProperty — no React re-render */
          --charge:    0%;
        }

        /* ── Keyframes ── */
        @keyframes scanline {
          from { transform: translate3d(0,-100%,0); }
          to   { transform: translate3d(0,100vh,0); }
        }
        @keyframes blink {
          0%,49%   { opacity: 1; }
          50%,100% { opacity: 0; }
        }
        @keyframes ticker {
          from { transform: translate3d(0,0,0); }
          to   { transform: translate3d(-50%,0,0); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: .75; }
          100% { transform: scale(2.6); opacity: 0;   }
        }
        @keyframes hud-draw {
          from { stroke-dashoffset: 300; opacity: 0; }
          to   { stroke-dashoffset: 0;   opacity: 1; }
        }
        @keyframes title-in {
          from { opacity: 0; transform: translate3d(0,28px,0); }
          to   { opacity: 1; transform: translate3d(0,0,0); }
        }


        /* Glitch: pseudo-elements, CSS-only, idles 90% of time */
        @keyframes glitch-gate {
          0%,88%,100% { opacity: 0; }
          89%,91%,93%,95%,97% { opacity: 1; }
        }
        @keyframes glitch-a {
          0%   { clip-path: inset(40% 0 50% 0); transform: translate3d(-5px,0,0); }
          25%  { clip-path: inset(8%  0 82% 0); transform: translate3d( 5px,0,0); }
          50%  { clip-path: inset(65% 0 8%  0); transform: translate3d(-3px,0,0); }
          75%  { clip-path: inset(24% 0 56% 0); transform: translate3d( 4px,0,0); }
          100% { clip-path: inset(40% 0 50% 0); transform: translate3d(-5px,0,0); }
        }
        @keyframes glitch-b {
          0%   { clip-path: inset(60% 0 22% 0); transform: translate3d(4px,0,0);  color: rgba(0,255,255,.9); }
          33%  { clip-path: inset(5%  0 77% 0); transform: translate3d(-5px,0,0); color: rgba(255,0,255,.9); }
          66%  { clip-path: inset(78% 0 5%  0); transform: translate3d(3px,0,0);  color: rgba(0,255,255,.9); }
          100% { clip-path: inset(60% 0 22% 0); transform: translate3d(4px,0,0);  color: rgba(0,255,255,.9); }
        }

        /* ── GPU promotion helpers ── */
        .gpu        { will-change: transform;  transform: translateZ(0); }
        .gpu-fade   { will-change: opacity; }

        /* ── Charge bar — height driven by CSS var, not React state ── */
        .charge-fill {
          height: var(--charge);
          background: linear-gradient(to top, #d63031 0%, rgba(214,48,49,.3) 100%);
          box-shadow: 0 0 8px #d63031, 0 0 22px rgba(214,48,49,.22);
          will-change: height;
        }

        /* ── Glitch headline ── */
        .glitch { position: relative; display: inline-block; }
        .glitch::before,
        .glitch::after {
          content: attr(data-text);
          position: absolute; inset: 0;
          font: inherit; letter-spacing: inherit; color: inherit;
          pointer-events: none;
        }
        .glitch::before {
          animation:
            glitch-gate 9s step-end infinite,
            glitch-a    0.17s steps(1) infinite;
          will-change: transform, clip-path, opacity;
        }
        .glitch::after {
          animation:
            glitch-gate 9s step-end infinite .07s,
            glitch-b    0.17s steps(1) infinite;
          will-change: transform, clip-path, opacity;
        }

        /* ── Utility animations ── */
        .anim-scanline {
          animation: scanline 4.5s linear infinite;
          will-change: transform;
        }
        .anim-blink  { animation: blink 1s step-end infinite; }
        .anim-ticker {
          animation: ticker 14s linear infinite;
          will-change: transform;
        }
        .anim-ticker:hover { animation-play-state: paused; cursor: default; }
        .anim-pulse-ring {
          animation: pulse-ring 2.2s ease-out infinite;
          will-change: transform, opacity;
        }

        /* ── CRT phosphor glow ── */
        .glow-r { text-shadow: 0 0 6px rgba(214,48,49,.85), 0 0 18px rgba(214,48,49,.3); }
        .glow-w { text-shadow: 0 0 5px rgba(255,255,255,.4), 0 0 14px rgba(255,255,255,.1); }

        /* ── Signal strength bars ── */
        .sig      { display: inline-block; background: #d63031; }
        .sig.on   { box-shadow: 0 0 4px #d63031; }
        .sig.off  { opacity: .14; }

        /* ── Respect reduce-motion ── */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>

      {/* ─────────────────────────────────────────────
          VIDEO BACKGROUND
      ───────────────────────────────────────────── */}
      <video
        ref={videoRef}
        aria-hidden="true"
        src="/assets/hero/intro.webm"
        poster="/assets/hero/intro-poster.jpg"
        autoPlay loop muted playsInline preload="auto"
        onCanPlay={handleVideoReady}
        onLoadedData={handleVideoReady}
        className="absolute inset-0 w-full h-full object-cover gpu"
        style={{ zIndex: "var(--z-bg)" as any }}
      >
        <source src="/assets/hero/intro.mp4" type="video/mp4" />
      </video>

      {/* ─────────────────────────────────────────────
          PARTICLES CANVAS
      ───────────────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none gpu"
        style={{ zIndex: "var(--z-ptcl)" as any }}
      />

      {/* ─────────────────────────────────────────────
          OVERLAY STACK  (pure CSS, no JS, no animation)
      ───────────────────────────────────────────── */}
      {/* Vignette */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at center, transparent 28%, rgba(2,2,2,.9) 100%)",
        zIndex: "var(--z-fx)" as any,
      }} />
      {/* Top/bottom gradient */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{
        background: "linear-gradient(to bottom, rgba(2,2,2,.5) 0%, transparent 20%, transparent 55%, rgba(2,2,2,.96) 100%)",
        zIndex: "var(--z-fx)" as any,
      }} />
      {/* Static scanlines — single repeating-gradient, zero JS */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.07) 2px, rgba(0,0,0,.07) 4px)",
        zIndex: "var(--z-fx)" as any,
      }} />
      {/* Animated scanline sweep */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-28 pointer-events-none anim-scanline" style={{
        background: "linear-gradient(to bottom, transparent, rgba(214,48,49,.04) 50%, transparent)",
        zIndex: "var(--z-ovl)" as any,
      }} />
      {/* Noise grain — smaller tile = lighter paint */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{
        opacity: .04,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.78' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "200px 200px",
        zIndex: "var(--z-ovl)" as any,
      }} />

 

      {/* ─────────────────────────────────────────────
          HUD CORNERS  (single parallax group, GPU layer)
      ───────────────────────────────────────────── */}
      <div
        ref={parallaxHudRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none gpu"
        style={{ zIndex: "var(--z-hud)" as any }}
      >
        {/* ── TOP-LEFT ── */}
        <div className="absolute top-0 left-0"
          style={{ opacity: loaded?1:0, transition:"opacity .5s ease .3s" }}>
          <svg width="180" height="140" viewBox="0 0 180 140" fill="none">
            <path d="M0 70 L0 8 Q0 0 8 0 L90 0" stroke="#d63031" strokeWidth="1.5"
              strokeDasharray="300" strokeDashoffset="300"
              style={{ animation: loaded?"hud-draw 1s ease-out .4s both":"none" }}/>
            <path d="M0 70 L0 8" stroke="#d63031" strokeWidth="3" strokeOpacity=".18"/>
            <line x1="0" y1="84" x2="38" y2="84" stroke="#d63031" strokeWidth=".5" strokeOpacity=".28"/>
            <line x1="0" y1="96" x2="22" y2="96" stroke="#d63031" strokeWidth=".5" strokeOpacity=".15"/>
            <rect x="2" y="2" width="6" height="6" fill="#d63031" fillOpacity=".9"/>
            <circle cx="90" cy="0" r="2" fill="#d63031" fillOpacity=".5"/>
          </svg>
   
          <div className="absolute top-8 left-2 text-[8px] text-white/25 tracking-wider glow-w">{time}</div>
          <div className="absolute top-[50px] left-2 text-[7px] text-[#d63031]/35 tracking-widest uppercase">STATUS:ONLINE</div>
        </div>

        {/* ── TOP-RIGHT ── */}
        <div className="absolute top-0 right-0"
          style={{ opacity: loaded?1:0, transition:"opacity .5s ease .4s" }}>
          <svg width="160" height="120" viewBox="0 0 160 120" fill="none">
            <path d="M160 60 L160 8 Q160 0 152 0 L80 0" stroke="#d63031" strokeWidth="1.5"
              strokeDasharray="300" strokeDashoffset="300"
              style={{ animation: loaded?"hud-draw 1s ease-out .5s both":"none" }}/>
            <rect x="152" y="2" width="6" height="6" fill="#d63031" fillOpacity=".9"/>
            <line x1="160" y1="70" x2="130" y2="70" stroke="#d63031" strokeWidth=".5" strokeOpacity=".28"/>
            <circle cx="80" cy="0" r="2" fill="#d63031" fillOpacity=".5"/>
          </svg>
          <div className="absolute top-[10px] right-10 text-[9px] text-[#d63031]/58 tracking-widest uppercase glow-r text-right">
            REBORN INTERACTIVE
          </div>
          <div className="absolute top-8 right-4 flex items-center gap-1.5">
            {/* CSS-only pulse ring — no JS */}
            <div className="relative w-2 h-2">
              <div className="absolute inset-0 rounded-full border border-[#d63031] anim-pulse-ring"/>
              <div className="absolute inset-[2px] rounded-full bg-[#d63031]"
                style={{boxShadow:"0 0 5px #d63031"}}/>
            </div>
            <span className="text-[8px] text-white/25 tracking-wider">LIVE</span>
          </div>
        </div>

        {/* ── BOTTOM-LEFT ── */}
        <div className="absolute bottom-0 left-0"
          style={{ opacity: loaded?1:0, transition:"opacity .5s ease .5s" }}>
          <svg width="160" height="100" viewBox="0 0 160 100" fill="none">
            <path d="M0 40 L0 92 Q0 100 8 100 L80 100" stroke="#d63031" strokeWidth="1.5"
              strokeDasharray="300" strokeDashoffset="300"
              style={{ animation: loaded?"hud-draw 1s ease-out .6s both":"none" }}/>
            <rect x="2" y="92" width="6" height="6" fill="#d63031" fillOpacity=".9"/>
            <line x1="0" y1="30" x2="28" y2="30" stroke="#d63031" strokeWidth=".5" strokeOpacity=".28"/>
            <circle cx="80" cy="100" r="2" fill="#d63031" fillOpacity=".5"/>
          </svg>
        </div>

        {/* ── BOTTOM-RIGHT — coordinates ── */}
        <div className="absolute bottom-0 right-0"
          style={{ opacity: loaded?1:0, transition:"opacity .5s ease .55s" }}>
          <svg width="160" height="100" viewBox="0 0 160 100" fill="none">
            <path d="M160 40 L160 92 Q160 100 152 100 L80 100" stroke="#d63031" strokeWidth="1.5"
              strokeDasharray="300" strokeDashoffset="300"
              style={{ animation: loaded?"hud-draw 1s ease-out .65s both":"none" }}/>
            <rect x="152" y="92" width="6" height="6" fill="#d63031" fillOpacity=".9"/>
            <line x1="160" y1="30" x2="132" y2="30" stroke="#d63031" strokeWidth=".5" strokeOpacity=".28"/>
            <circle cx="80" cy="100" r="2" fill="#d63031" fillOpacity=".5"/>
          </svg>
          <div className="absolute bottom-10 right-3 text-right">
            <div className="text-[7px] text-[#d63031]/40 tracking-widest uppercase mb-0.5">COORDS</div>
            <div className="text-[8px] text-white/20 tracking-wider">31.2304° N</div>
            <div className="text-[8px] text-white/20 tracking-wider">121.4737° E</div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          CENTER CROSSHAIR
      ───────────────────────────────────────────── */}
      <div aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: "var(--z-ui)" as any }}>
        <div style={{ opacity: loaded?.1:0, transition:"opacity 1.2s ease 1s" }}>
          <svg width="54" height="54" viewBox="0 0 54 54" fill="none">
            <line x1="27" y1="0"  x2="27" y2="21" stroke="#d63031" strokeWidth=".8"/>
            <line x1="27" y1="33" x2="27" y2="54" stroke="#d63031" strokeWidth=".8"/>
            <line x1="0"  y1="27" x2="21" y2="27" stroke="#d63031" strokeWidth=".8"/>
            <line x1="33" y1="27" x2="54" y2="27" stroke="#d63031" strokeWidth=".8"/>
            <rect x="24" y="24" width="6" height="6" stroke="#d63031" strokeWidth=".8" fill="none"/>
          </svg>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          HERO HEADLINE  (own parallax group, GPU layer)
      ───────────────────────────────────────────── */}
      <div
        ref={parallaxTitleRef}
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none gpu"
        style={{ zIndex: "var(--z-ui)" as any }}
      >
        {/* Ornamental border frame — visible BEFORE video loads, fades out once playing */}
        <div
          className="relative flex flex-col items-center"
          style={{
            opacity: loaded ? 0 : 1,
            transition: loaded ? "opacity 1.2s cubic-bezier(.4,0,.2,1)" : "none",
            pointerEvents: "none",
          }}
        >
          {/* Top ornamental rule */}
          <div className="flex items-center gap-3 mb-3" style={{ opacity: .7 }}>
            <div className="h-px w-12 bg-[#d63031]" style={{ boxShadow:"0 0 6px #d63031" }}/>
            <svg width="24" height="14" viewBox="0 0 24 14" fill="none">
              <path d="M12 1 C8 1 4 4 4 7 C4 10 8 13 12 13 C16 13 20 10 20 7 C20 4 16 1 12 1 Z" stroke="#d63031" strokeWidth=".8" fill="none"/>
              <path d="M1 7 L4 7 M20 7 L23 7" stroke="#d63031" strokeWidth=".8"/>
              <circle cx="12" cy="7" r="1.5" fill="#d63031" fillOpacity=".8"/>
            </svg>
            <div className="h-px w-12 bg-[#d63031]" style={{ boxShadow:"0 0 6px #d63031" }}/>
          </div>

          {/* Corner-bracketed container */}
          <div className="relative px-6 py-2">
            {/* Corner brackets */}
            {[["top-0 left-0","M0 10 L0 0 L10 0"],["top-0 right-0","M0 0 L10 0 L10 10"],
              ["bottom-0 left-0","M0 0 L0 10 L10 10"],["bottom-0 right-0","M10 0 L10 10 L0 10"]
            ].map(([pos, d], i) => (
              <svg key={i} className={`absolute ${pos}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d={d} stroke="#d63031" strokeWidth="1.2" strokeOpacity=".75"/>
              </svg>
            ))}

            {/* Glitch headline — Cinzel Decorative retro floral font */}
            <h1
              data-text="REBORN INTERACTIVE"
              className="glitch text-white uppercase"
              style={{
                fontFamily: "'Cinzel Decorative', serif",
                fontSize: "clamp(22px,5.2vw,76px)",
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: ".08em",
                opacity: 1,
                textShadow: "0 0 80px rgba(214,48,49,.2), 0 0 2px rgba(214,48,49,.4), 0 2px 0 rgba(0,0,0,.9)",
              }}
            >
              REBORN INTERACTIVE
            </h1>
          </div>

          {/* Bottom ornamental rule */}
          <div className="flex items-center gap-3 mt-3" style={{ opacity: .7 }}>
            <div className="h-px w-8 bg-[#d63031]" style={{ boxShadow:"0 0 6px #d63031" }}/>
            <svg width="32" height="10" viewBox="0 0 32 10" fill="none">
              <path d="M1 5 L5 2 L9 5 L5 8 Z" stroke="#d63031" strokeWidth=".7" fill="none"/>
              <line x1="9" y1="5" x2="23" y2="5" stroke="#d63031" strokeWidth=".7" strokeDasharray="2 2"/>
              <path d="M23 5 L27 2 L31 5 L27 8 Z" stroke="#d63031" strokeWidth=".7" fill="none"/>
            </svg>
            <div className="h-px w-8 bg-[#d63031]" style={{ boxShadow:"0 0 6px #d63031" }}/>
          </div>
        </div>

        {/* Subtitle + animated accent line — also hides when video plays */}
        <div className="flex items-center gap-4 mt-4"
          style={{
            opacity: loaded ? 0 : 1,
            transition: loaded ? "opacity 1.2s cubic-bezier(.4,0,.2,1)" : "none",
          }}>
          <div className="h-px bg-[#d63031]" style={{
            width: loaded?"clamp(26px,3.5vw,50px)":"0px",
            transition: "width .9s cubic-bezier(.16,1,.3,1) 1.5s",
            boxShadow: "0 0 7px #d63031",
          }}/>
          <span className="text-[10px] tracking-[.34em] text-white/30 uppercase"
            style={{ fontFamily:"'Share Tech Mono', monospace" }}>
            PLAYER ONE<span className="anim-blink text-[#d63031]/72 ml-1">_</span>
          </span>
        </div>
      </div>


      {/* ── Bottom red ambient glow — static CSS, zero JS ── */}
      <div aria-hidden="true"
        className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width:700, height:210,
          background:"radial-gradient(ellipse,rgba(214,48,49,.12) 0%,transparent 68%)",
          zIndex:6,
        }}
      />
    </section>
  );
};

export default HeroSection;