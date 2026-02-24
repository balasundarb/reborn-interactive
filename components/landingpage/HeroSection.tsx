"use client";

import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";

// ─── Particle type ────────────────────────────────────────────────────────────
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  spriteIdx: number;
  alpha: number; alphaDir: number;
}

// ─── Pre-bake glow dot into an offscreen canvas ──────────────────────────────
const bakeGlowSprite = (() => {
  const cache = new Map<number, HTMLCanvasElement>();

  return (radius: number): HTMLCanvasElement => {
    if (cache.has(radius)) return cache.get(radius)!;

    const size = Math.ceil(radius * 8);
    const oc = document.createElement("canvas")!;
    oc.width = oc.height = size;
    const c = oc.getContext("2d")!;
    const cx = size / 2;

    // Soft halo
    const halo = c.createRadialGradient(cx, cx, 0, cx, cx, size / 2);
    halo.addColorStop(0, "rgba(214,48,49,0.55)");
    halo.addColorStop(0.45, "rgba(214,48,49,0.15)");
    halo.addColorStop(1, "rgba(214,48,49,0)");
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

    cache.set(radius, oc);
    return oc;
  };
})();

// ─── Debounce — prevents resize thrashing ─────────────────────────────────────
function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

// ─── Ease functions ───────────────────────────────────────────────────────────
const easeOutExpo = (p: number) => p >= 1 ? 1 : 1 - Math.pow(2, -10 * p);
const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

// ─── Memoized HUD Components ──────────────────────────────────────────────────
const HUDCorner = React.memo(({ position, delay, children, loaded }: {
  position: string;
  delay: number;
  children?: React.ReactNode;
  loaded: boolean;
}) => (
  <div
    className={`absolute ${position} transition-opacity duration-500`}
    style={{
      opacity: loaded ? 1 : 0,
      transitionDelay: `${delay}s`
    }}
  >
    {children}
  </div>
));

HUDCorner.displayName = 'HUDCorner';

const HeroSection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chargeBarRef = useRef<HTMLDivElement>(null);
  const parallaxHudRef = useRef<HTMLDivElement>(null);
  const parallaxTitleRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);

  const loadedFiredRef = useRef(false);
  const [loaded, setLoaded] = useState(false);
  const [time, setTime] = useState("00:00:00");
  const [videoError, setVideoError] = useState(false);

  // Pre-bake sprites once at top level
  const sprites = useMemo(() => [1.1, 1.6, 2.1].map(bakeGlowSprite), []);

  // ── Clock (1s interval, negligible cost) ──────────────────────────────────
  useEffect(() => {
    const tick = setInterval(() => {
      const n = new Date();
      setTime([n.getHours(), n.getMinutes(), n.getSeconds()]
        .map(v => String(v).padStart(2, "0")).join(":"));
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  // ── Video ready guard ─────────────────────────────────────────────────────
  const handleVideoReady = useCallback(() => {
    if (loadedFiredRef.current) return;
    loadedFiredRef.current = true;

    // Add smooth delay for transition
    setTimeout(() => {
      setLoaded(true);
    }, 200);
  }, []);

  const handleVideoError = useCallback(() => {
    setVideoError(true);
    handleVideoReady(); // Still show content even if video fails
  }, [handleVideoReady]);

  // Fallback timeout
  useEffect(() => {
    const t = setTimeout(handleVideoReady, 2500);
    return () => clearTimeout(t);
  }, [handleVideoReady]);

  // ── Charge bar animation ───────────────────────────────────────────
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
      el.style.setProperty("--charge", `${easeOutExpo(progress) * 100}%`);
      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [loaded]);

  // ── Mouse parallax with smooth lerp ───────────────────────────────────────
  useEffect(() => {
    const mouse = { x: 0, y: 0 };
    const cur = { hx: 0, hy: 0, tx: 0, ty: 0 };
    let raf: number;

    const onMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener("mousemove", onMove, { passive: true });

    const loop = () => {
      // Smooth interpolation for parallax
      cur.hx += (mouse.x * 12 - cur.hx) * 0.05;
      cur.hy += (mouse.y * 8 - cur.hy) * 0.05;
      cur.tx += (mouse.x * 24 - cur.tx) * 0.035;
      cur.ty += (mouse.y * 14 - cur.ty) * 0.035;

      // Apply transforms with GPU acceleration
      if (parallaxHudRef.current) {
        parallaxHudRef.current.style.transform =
          `translate3d(${cur.hx.toFixed(2)}px,${cur.hy.toFixed(2)}px,0)`;
      }
      if (parallaxTitleRef.current) {
        parallaxTitleRef.current.style.transform =
          `translate3d(${cur.tx.toFixed(2)}px,${cur.ty.toFixed(2)}px,0)`;
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  // ── Optimized particle system ─────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true
    })!;

    let W = window.innerWidth;
    let H = window.innerHeight;

    const setCanvasSize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };

    setCanvasSize();

    const onResize = debounce(setCanvasSize, 130);
    window.addEventListener("resize", onResize);

    // Dynamic particle count based on screen size
    const PARTICLE_COUNT = Math.min(32, Math.floor((W * H) / 35000));

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -(0.15 + Math.random() * 0.35),
      spriteIdx: Math.floor(Math.random() * sprites.length),
      alpha: 0.1 + Math.random() * 0.4,
      alphaDir: Math.random() > 0.5 ? 1 : -1,
    }));

    let animId: number;
    let lastTime = 0;
    const FPS = 60;
    const frameInterval = 1000 / FPS;

    const draw = (currentTime: number) => {
      animId = requestAnimationFrame(draw);

      // Throttle frame rate
      if (currentTime - lastTime < frameInterval) return;
      lastTime = currentTime;

      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.alphaDir * 0.002;

        if (p.alpha > 0.5) {
          p.alpha = 0.5;
          p.alphaDir = -1;
        }
        if (p.alpha < 0.05) {
          p.alpha = 0.05;
          p.alphaDir = 1;
        }

        // Wrap around screen
        if (p.y < -30) {
          p.y = H + 30;
          p.x = Math.random() * W;
        }
        if (p.y > H + 30) {
          p.y = -30;
          p.x = Math.random() * W;
        }
        if (p.x < -30) p.x = W + 30;
        if (p.x > W + 30) p.x = -30;

        const sp = sprites[p.spriteIdx];
        ctx.globalAlpha = p.alpha;
        ctx.drawImage(sp, p.x - sp.width / 2, p.y - sp.height / 2);
      }
      ctx.globalAlpha = 1;
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, [sprites]);

  // ── Intersection Observer for lazy loading ─────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && videoRef.current && !videoError) {
            videoRef.current.play().catch(() => {
              setVideoError(true);
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [videoError]);

  return (
    <section
      ref={containerRef}
      id="home"
      aria-label="Game intro hero"
      role="banner"
      className="relative flex items-center justify-center h-screen overflow-hidden bg-[#020202]"
      style={{ fontFamily: "'Share Tech Mono', monospace" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Cinzel+Decorative:wght@900&display=swap');

        :root {
          --z-bg: 0;
          --z-fx: 2;
          --z-ptcl: 5;
          --z-ovl: 8;
          --z-ui: 10;
          --z-hud: 20;
          --charge: 0%;
        }

        @keyframes scanline {
          0% { transform: translate3d(0,-100%,0); }
          100% { transform: translate3d(0,100vh,0); }
        }
        
        @keyframes blink {
          0%,49% { opacity: 1; }
          50%,100% { opacity: 0; }
        }
        
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.75; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        
        @keyframes hud-draw {
          0% { stroke-dashoffset: 300; opacity: 0; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }
        
        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          10% { transform: translate(-2px, 1px); }
          20% { transform: translate(2px, -1px); }
          30% { transform: translate(-1px, 2px); }
          40% { transform: translate(1px, -2px); }
          50% { transform: translate(-2px, 1px); }
          60% { transform: translate(2px, -1px); }
          70% { transform: translate(-1px, 2px); }
          80% { transform: translate(1px, -2px); }
        }

        @keyframes fadeUp {
          from { 
            opacity: 0; 
            transform: translate3d(0, 30px, 0);
            filter: blur(10px);
          }
          to { 
            opacity: 1; 
            transform: translate3d(0, 0, 0);
            filter: blur(0px);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .gpu { 
          will-change: transform; 
          transform: translateZ(0); 
          backface-visibility: hidden;
        }
        
        .gpu-fade { 
          will-change: opacity; 
        }

        .charge-fill {
          height: var(--charge);
          background: linear-gradient(to top, #d63031 0%, rgba(214,48,49,.3) 100%);
          box-shadow: 0 0 8px #d63031, 0 0 22px rgba(214,48,49,.22);
          will-change: height;
          transition: height 0.1ms linear;
        }

        .glitch {
          position: relative;
          display: inline-block;
          animation: glitch 3s infinite;
        }
        
        .glitch::before,
        .glitch::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.8;
        }
        
        .glitch::before {
          color: #ff00ff;
          z-index: -1;
          transform: translate(-2px, 0);
          animation: glitch 0.3s infinite reverse;
        }
        
        .glitch::after {
          color: #00ffff;
          z-index: -2;
          transform: translate(2px, 0);
          animation: glitch 0.3s infinite;
        }

        .anim-scanline {
          animation: scanline 8s linear infinite;
          will-change: transform;
        }
        
        .anim-blink {
          animation: blink 1.5s step-end infinite;
        }
        
        .anim-pulse-ring {
          animation: pulse-ring 2.2s ease-out infinite;
          will-change: transform, opacity;
        }

        .glow-r { 
          text-shadow: 0 0 10px rgba(214,48,49,.9), 0 0 30px rgba(214,48,49,.4); 
        }
        
        .glow-w { 
          text-shadow: 0 0 8px rgba(255,255,255,.5), 0 0 20px rgba(255,255,255,.2); 
        }

        .video-overlay {
          transition: opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .title-fade {
          transition: opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hud-element {
          animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* Video Background */}
      {!videoError && (
        <video
          ref={videoRef}
          aria-hidden="true"
          poster="/assets/hero/intro.png"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          onCanPlay={handleVideoReady}
          onLoadedData={handleVideoReady}
          onError={handleVideoError}
          className={`absolute inset-0 w-full h-full object-cover gpu video-overlay ${loaded ? 'opacity-100' : 'opacity-0'
            }`}
          style={{
            zIndex: "var(--z-bg)",
          }}
        >
          <source src="video/Intro.webm" type="video/webm" />
        </video>
      )}

      {/* Fallback gradient if video fails */}
      {videoError && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#020202]"
          style={{ zIndex: "var(--z-bg)" }}
        />
      )}

      {/* Particles Canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none gpu"
        style={{ zIndex: "var(--z-ptcl)" }}
      />

      {/* Overlay Stack */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 28%, rgba(2,2,2,.9) 100%)",
          zIndex: "var(--z-fx)"
        }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, rgba(2,2,2,.5) 0%, transparent 20%, transparent 55%, rgba(2,2,2,.96) 100%)",
          zIndex: "var(--z-fx)"
        }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.07) 2px, rgba(0,0,0,.07) 4px)",
          zIndex: "var(--z-fx)"
        }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-28 pointer-events-none anim-scanline gpu"
        style={{
          background: "linear-gradient(to bottom, transparent, rgba(214,48,49,.04) 50%, transparent)",
          zIndex: "var(--z-ovl)"
        }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: .04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.78' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
          zIndex: "var(--z-ovl)"
        }}
      />

      {/* HUD Corners */}
      <div
        ref={parallaxHudRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none gpu"
        style={{ zIndex: "var(--z-hud)" }}
      >
        <HUDCorner position="top-0 left-0" delay={0.3} loaded={loaded}>
          <svg width="180" height="140" viewBox="0 0 180 140" fill="none">
            <path d="M0 70 L0 8 Q0 0 8 0 L90 0" stroke="#d63031" strokeWidth="1.5"
              strokeDasharray="300" strokeDashoffset="300"
              style={{ animation: loaded ? "hud-draw 1s ease-out 0.4s both" : "none" }} />
            <path d="M0 70 L0 8" stroke="#d63031" strokeWidth="3" strokeOpacity=".18" />
            <line x1="0" y1="84" x2="38" y2="84" stroke="#d63031" strokeWidth=".5" strokeOpacity=".28" />
            <line x1="0" y1="96" x2="22" y2="96" stroke="#d63031" strokeWidth=".5" strokeOpacity=".15" />
            <rect x="2" y="2" width="6" height="6" fill="#d63031" fillOpacity=".9" />
            <circle cx="90" cy="0" r="2" fill="#d63031" fillOpacity=".5" />
          </svg>
          <div className="absolute top-8 left-2 text-[8px] text-white/25 tracking-wider glow-w">{time}</div>
          <div className="absolute top-12 left-2 text-[7px] text-[#d63031]/35 tracking-widest uppercase">STATUS:ONLINE</div>
        </HUDCorner>

        <HUDCorner position="top-0 right-0" delay={0.4} loaded={loaded}>
          <svg width="160" height="120" viewBox="0 0 160 120" fill="none">
            <path d="M160 60 L160 8 Q160 0 152 0 L80 0" stroke="#d63031" strokeWidth="1.5"
              strokeDasharray="300" strokeDashoffset="300"
              style={{ animation: loaded ? "hud-draw 1s ease-out 0.5s both" : "none" }} />
            <rect x="152" y="2" width="6" height="6" fill="#d63031" fillOpacity=".9" />
            <line x1="160" y1="70" x2="130" y2="70" stroke="#d63031" strokeWidth=".5" strokeOpacity=".28" />
            <circle cx="80" cy="0" r="2" fill="#d63031" fillOpacity=".5" />
          </svg>
          <div className="absolute top-2.5 right-10 text-[9px] text-[#d63031]/58 tracking-widest uppercase glow-r text-right">
            REBORN INTERACTIVE
          </div>
          <div className="absolute top-8 right-4 flex items-center gap-1.5">
            <div className="relative w-2 h-2">
              <div className="absolute inset-0 rounded-full border border-[#d63031] anim-pulse-ring" />
              <div className="absolute inset-0.5 rounded-full bg-[#d63031]"
                style={{ boxShadow: "0 0 5px #d63031" }} />
            </div>
            <span className="text-[8px] text-white/25 tracking-wider">LIVE</span>
          </div>
        </HUDCorner>

        <HUDCorner position="bottom-0 left-0" delay={0.5} loaded={loaded}>
          <svg width="160" height="100" viewBox="0 0 160 100" fill="none">
            <path d="M0 40 L0 92 Q0 100 8 100 L80 100" stroke="#d63031" strokeWidth="1.5"
              strokeDasharray="300" strokeDashoffset="300"
              style={{ animation: loaded ? "hud-draw 1s ease-out 0.6s both" : "none" }} />
            <rect x="2" y="92" width="6" height="6" fill="#d63031" fillOpacity=".9" />
            <line x1="0" y1="30" x2="28" y2="30" stroke="#d63031" strokeWidth=".5" strokeOpacity=".28" />
            <circle cx="80" cy="100" r="2" fill="#d63031" fillOpacity=".5" />
          </svg>
        </HUDCorner>

        <HUDCorner position="bottom-0 right-0" delay={0.55} loaded={loaded}>
          <svg width="160" height="100" viewBox="0 0 160 100" fill="none">
            <path d="M160 40 L160 92 Q160 100 152 100 L80 100" stroke="#d63031" strokeWidth="1.5"
              strokeDasharray="300" strokeDashoffset="300"
              style={{ animation: loaded ? "hud-draw 1s ease-out 0.65s both" : "none" }} />
            <rect x="152" y="92" width="6" height="6" fill="#d63031" fillOpacity=".9" />
            <line x1="160" y1="30" x2="132" y2="30" stroke="#d63031" strokeWidth=".5" strokeOpacity=".28" />
            <circle cx="80" cy="100" r="2" fill="#d63031" fillOpacity=".5" />
          </svg>
          <div className="absolute bottom-10 right-3 text-right">
            <div className="text-[7px] text-[#d63031]/40 tracking-widest uppercase mb-0.5">COORDS</div>
            <div className="text-[8px] text-white/20 tracking-wider">31.2304° N</div>
            <div className="text-[8px] text-white/20 tracking-wider">121.4737° E</div>
          </div>
        </HUDCorner>
      </div>

      {/* Center Crosshair */}
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-1000"
        style={{
          zIndex: "var(--z-ui)",
          opacity: loaded ? 0.1 : 0,
          transitionDelay: "1s"
        }}
      >
        <svg width="54" height="54" viewBox="0 0 54 54" fill="none">
          <line x1="27" y1="0" x2="27" y2="21" stroke="#d63031" strokeWidth=".8" />
          <line x1="27" y1="33" x2="27" y2="54" stroke="#d63031" strokeWidth=".8" />
          <line x1="0" y1="27" x2="21" y2="27" stroke="#d63031" strokeWidth=".8" />
          <line x1="33" y1="27" x2="54" y2="27" stroke="#d63031" strokeWidth=".8" />
          <rect x="24" y="24" width="6" height="6" stroke="#d63031" strokeWidth=".8" fill="none" />
        </svg>
      </div>

      {/* Hero Headline */}
      <div
        ref={parallaxTitleRef}
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none gpu"
        style={{ zIndex: "var(--z-ui)" }}
      >
        <div
          className={`relative flex flex-col items-center transition-all duration-1000 transform ${loaded ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          style={{
            transition: "opacity 1.2s cubic-bezier(.4,0,.2,1), transform 1.2s cubic-bezier(.4,0,.2,1)"
          }}
        >
          {/* Top ornamental rule */}
          <div className="flex items-center gap-3 mb-3" style={{ opacity: .7 }}>
            <div className="h-px w-12 bg-[#d63031]" style={{ boxShadow: "0 0 6px #d63031" }} />
            <svg width="24" height="14" viewBox="0 0 24 14" fill="none">
              <path d="M12 1 C8 1 4 4 4 7 C4 10 8 13 12 13 C16 13 20 10 20 7 C20 4 16 1 12 1 Z" stroke="#d63031" strokeWidth=".8" fill="none" />
              <path d="M1 7 L4 7 M20 7 L23 7" stroke="#d63031" strokeWidth=".8" />
              <circle cx="12" cy="7" r="1.5" fill="#d63031" fillOpacity=".8" />
            </svg>
            <div className="h-px w-12 bg-[#d63031]" style={{ boxShadow: "0 0 6px #d63031" }} />
          </div>

          {/* Corner-bracketed container */}
          <div className="relative px-6 py-2">
            {[
              ["top-0 left-0", "M0 10 L0 0 L10 0"],
              ["top-0 right-0", "M0 0 L10 0 L10 10"],
              ["bottom-0 left-0", "M0 0 L0 10 L10 10"],
              ["bottom-0 right-0", "M10 0 L10 10 L0 10"]
            ].map(([pos, d], i) => (
              <svg key={i} className={`absolute ${pos}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d={d} stroke="#d63031" strokeWidth="1.2" strokeOpacity=".75" />
              </svg>
            ))}

            <h1
              data-text="REBORN INTERACTIVE"
              className="glitch text-white uppercase"
              style={{
                fontFamily: "'Cinzel Decorative', serif",
                fontSize: "clamp(22px,5.2vw,76px)",
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: ".08em",
                textShadow: "0 0 80px rgba(214,48,49,.2), 0 0 2px rgba(214,48,49,.4), 0 2px 0 rgba(0,0,0,.9)",
              }}
            >
              REBORN INTERACTIVE
            </h1>
          </div>

          {/* Bottom ornamental rule */}
          <div className="flex items-center gap-3 mt-3" style={{ opacity: .7 }}>
            <div className="h-px w-8 bg-[#d63031]" style={{ boxShadow: "0 0 6px #d63031" }} />
            <svg width="32" height="10" viewBox="0 0 32 10" fill="none">
              <path d="M1 5 L5 2 L9 5 L5 8 Z" stroke="#d63031" strokeWidth=".7" fill="none" />
              <line x1="9" y1="5" x2="23" y2="5" stroke="#d63031" strokeWidth=".7" strokeDasharray="2 2" />
              <path d="M23 5 L27 2 L31 5 L27 8 Z" stroke="#d63031" strokeWidth=".7" fill="none" />
            </svg>
            <div className="h-px w-8 bg-[#d63031]" style={{ boxShadow: "0 0 6px #d63031" }} />
          </div>
        </div>

        {/* Subtitle */}
        <div
          className="flex items-center gap-4 mt-4 transition-all duration-1000"
          style={{
            opacity: loaded ? 0 : 1,
            transition: "opacity 1.2s cubic-bezier(.4,0,.2,1)"
          }}
        >
          <div
            className="h-px bg-[#d63031] transition-all duration-1000"
            style={{
              width: loaded ? "clamp(26px,3.5vw,50px)" : "0px",
              transition: "width 0.9s cubic-bezier(.16,1,.3,1) 1.5s",
              boxShadow: "0 0 7px #d63031",
            }}
          />
          <span
            className="text-[10px] tracking-[.34em] text-white/30 uppercase"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            PLAYER ONE<span className="anim-blink text-[#d63031]/72 ml-1">_</span>
          </span>
        </div>
      </div>

      {/* Bottom red ambient glow */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none transition-opacity duration-1000"
        style={{
          width: 700,
          height: 210,
          background: "radial-gradient(ellipse,rgba(214,48,49,.12) 0%,transparent 68%)",
          zIndex: 6,
          opacity: loaded ? 0.8 : 0.4,
        }}
      />
    </section>
  );
};

export default React.memo(HeroSection);