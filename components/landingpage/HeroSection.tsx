"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";

const HeroSection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);


  const [loaded, setLoaded] = useState(false);
  const [chargeWidth, setChargeWidth] = useState(0);

  // ── Charge bar animation after load
  useEffect(() => {
    if (!loaded) return;
    let start: number | null = null;
    const duration = 3200;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      // ease-out-expo
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setChargeWidth(eased * 100);
      if (p < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [loaded]);


  // ── Canvas particle system — red drifting dots
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    interface Particle {
      x: number; y: number; vy: number; vx: number;
      r: number; alpha: number; alphaDir: number;
    }

    const count = 45;
    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vy: -(0.3 + Math.random() * 0.7),
      vx: (Math.random() - 0.5) * 0.3,
      r: 1 + Math.random() * 1.5,
      alpha: Math.random() * 0.5 + 0.1,
      alphaDir: Math.random() > 0.5 ? 1 : -1,
    }));

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.y += p.vy;
        p.x += p.vx;
        p.alpha += p.alphaDir * 0.003;
        if (p.alpha >= 0.6) p.alphaDir = -1;
        if (p.alpha <= 0.05) p.alphaDir = 1;
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(214,48,49,${p.alpha})`;
        // soft glow
        ctx.shadowColor = "#d63031";
        ctx.shadowBlur = 6;
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const handleVideoReady = useCallback(() => {
    setLoaded(true);
  }, []);

  // Fallback: if video doesn't fire onCanPlay within 800ms, show anyway
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      id="home"
      aria-label="Game intro hero"
      role="banner"
      className="relative flex items-center justify-center h-screen overflow-hidden bg-[#020202]"
      style={{ fontFamily: "'Share Tech Mono', monospace" }}
    >
      {/* ── Font imports ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Barlow+Condensed:ital,wght@1,900&display=swap');

        :root {
          --z-bg: 0;
          --z-effects: 2;
          --z-particles: 5;
          --z-overlay: 8;
          --z-content: 10;
          --z-hud: 20;
          --z-ticker: 25;
        }


        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        /* Glitch only fires occasionally — not a constant loop */
        @keyframes glitch-flicker {
          0%, 90%, 100%  { opacity: 0; }
          91%, 93%, 95%, 97% { opacity: 1; }
        }





        .scanline-move {
          animation: scanline 4s linear infinite;
          will-change: transform;
        }
        .blink { animation: blink 1s step-end infinite; }
        .ticker-inner {
          animation: ticker 12s linear infinite;
          will-change: transform;
        }
        .ticker-inner:hover { animation-play-state: paused; cursor: default; }
        /* CRT phosphor glow for text */
        .crt-glow {
          text-shadow:
            0 0 6px rgba(214,48,49,0.9),
            0 0 16px rgba(214,48,49,0.4),
            0 0 32px rgba(214,48,49,0.15);
        }
        .crt-glow-white {
          text-shadow:
            0 0 6px rgba(255,255,255,0.5),
            0 0 16px rgba(255,255,255,0.15);
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* ── Video bg ── */}
      <video
        ref={videoRef}
        aria-hidden="true"
        src="/hero/intro.webm"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/hero/intro-poster.jpg"
        onCanPlay={handleVideoReady}
        onLoadedData={handleVideoReady}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: "var(--z-bg)" as any }}
      >
        <source src="/hero/intro.mp4" type="video/mp4" />
      </video>

      {/* ── Canvas particles ── */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: "var(--z-particles)" as any }}
      />

      {/* ── Base vignette ── */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at center, transparent 30%, rgba(2,2,2,0.88) 100%)",
        zIndex: "var(--z-effects)" as any,
      }} />

      {/* ── Edge darkening ── */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{
        background: "linear-gradient(to bottom, rgba(2,2,2,0.55) 0%, transparent 18%, transparent 52%, rgba(2,2,2,0.82) 72%, rgba(2,2,2,0.98) 100%)",
        zIndex: "var(--z-effects)" as any,
      }} />

      {/* ── Scanlines static ── */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.09) 2px, rgba(0,0,0,0.09) 4px)",
        zIndex: "var(--z-effects)" as any,
      }} />

      {/* ── Scanline sweep ── */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-32 pointer-events-none scanline-move" style={{
        background: "linear-gradient(to bottom, transparent, rgba(214,48,49,0.04) 50%, transparent)",
        zIndex: "var(--z-overlay)" as any,
      }} />

      {/* ── Noise grain ── */}
      <div aria-hidden="true" className="absolute inset-0 opacity-[0.045] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "128px 128px",
        zIndex: "var(--z-overlay)" as any,
      }} />

      {/* ══════════════════════
          LEFT VERTICAL CHARGE BAR
      ══════════════════════ */}
      <div
        aria-hidden="true"
        className="absolute left-0 top-0 bottom-0 w-[2px] pointer-events-none"
        style={{ zIndex: "var(--z-hud)" as any, background: "rgba(214,48,49,0.08)" }}
      >
        <div
          className="absolute bottom-0 left-0 w-full transition-none"
          style={{
            height: `${chargeWidth}%`,
            background: "linear-gradient(to top, #d63031, rgba(214,48,49,0.4))",
            boxShadow: "0 0 10px #d63031, 0 0 24px rgba(214,48,49,0.3)",
            transition: "height 0.05s linear",
          }}
        />
      </div>

      {/* ══════════════════════
          CENTER CROSSHAIR
      ══════════════════════ */}
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: "var(--z-content)" as any }}
      >
        <div style={{ opacity: loaded ? 0.12 : 0, transition: "opacity 1s ease 1s" }}>
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <line x1="30" y1="0" x2="30" y2="24" stroke="#d63031" strokeWidth="1" />
            <line x1="30" y1="36" x2="30" y2="60" stroke="#d63031" strokeWidth="1" />
            <line x1="0" y1="30" x2="24" y2="30" stroke="#d63031" strokeWidth="1" />
            <line x1="36" y1="30" x2="60" y2="30" stroke="#d63031" strokeWidth="1" />
            <rect x="27" y="27" width="6" height="6" stroke="#d63031" strokeWidth="1" fill="none" />
          </svg>
        </div>
      </div>

      {/* ══════════════════════
          HERO HEADLINE — bottom-left anchor
      ══════════════════════ */}
      <div
        className="absolute bottom-0 left-0 pointer-events-none select-none"
        style={{
          zIndex: "var(--z-content)" as any,
          paddingBottom: "clamp(48px, 7vh, 88px)",
          paddingLeft: "clamp(24px, 4vw, 64px)",
        }}
      >
        {/* Eyebrow label */}
        <div
          className="text-[9px] tracking-[0.5em] text-[#d63031]/70 uppercase mb-2 crt-glow"
          style={{
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.6s ease 0.9s",
            fontFamily: "'Share Tech Mono', monospace",
          }}
        >
          REBORN INTERACTIVE · EST. 2024
        </div>

        {/* Subtitle row */}
        <div
          className="flex items-center gap-4 mt-3"
          style={{
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.6s ease 1.4s",
          }}
        >
          {/* Red accent line */}
          <div
            className="h-[1px] bg-[#d63031]"
            style={{
              width: loaded ? "clamp(32px, 4vw, 56px)" : "0px",
              transition: "width 0.8s cubic-bezier(0.16,1,0.3,1) 1.5s",
              boxShadow: "0 0 8px #d63031",
            }}
          />
          <span
            className="text-[10px] tracking-[0.35em] text-white/35 uppercase"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            PLAYER ONE<span className="blink text-[#d63031]/80 ml-1">_</span>
          </span>
        </div>
      </div>

      {/* ══════════════════════
          BOTTOM STATUS BAR
      ══════════════════════ */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          zIndex: "var(--z-ticker)" as any,
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.8s ease 1.2s",
        }}
      >
        <div className="overflow-hidden border-t border-[#d63031]/10 bg-[#020202]/80 py-1.5">
          <div className="ticker-inner flex gap-0 whitespace-nowrap" style={{ width: "200%" }}>
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-8 px-4" style={{ width: "50%" }}>
                {[
                  "SYSTEM INITIALIZED",
                  "PLAYER ONE READY",
                  "SERVER CONNECTED",
                  "REBORN INTERACTIVE",
                  "THREAT LEVEL: EXTREME",
                  "MISSION: ACTIVE",
                  "COORDINATES: 31.24° N / 121.46° E",
                  "REBORN ENGINE v2.0.1",
                  "ENCRYPTED CHANNEL OPEN",
                ].map((item, j) => (
                  <span key={j} className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-[#d63031]/40 rounded-full" />
                    <span
                      style={{ fontFamily: "'Share Tech Mono', monospace" }}
                      className="text-[8px] text-white/20 tracking-widest uppercase"
                    >
                      {item}
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Red bottom glow ── */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[220px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(214,48,49,0.14) 0%, transparent 70%)",
          zIndex: 6,
        }}
      />
    </section>
  );
};

export default HeroSection;