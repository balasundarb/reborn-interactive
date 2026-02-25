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
    const oc = document!.createElement("canvas")!;
    oc.width = oc.height = size;
    const c = oc.getContext("2d")!;
    const cx = size / 2;

    const halo = c.createRadialGradient(cx, cx, 0, cx, cx, size / 2);
    halo.addColorStop(0, "rgba(214,48,49,0.55)");
    halo.addColorStop(0.45, "rgba(214,48,49,0.15)");
    halo.addColorStop(1, "rgba(214,48,49,0)");
    c.fillStyle = halo;
    c.fillRect(0, 0, size, size);

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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

// ─── Main Component ───────────────────────────────────────────────────────────
const HeroSection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const parallaxTitleRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);

  const [videoReady, setVideoReady] = useState(false);
  const [titleVisible, setTitleVisible] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [time, setTime] = useState("00:00:00"); // kept for future use

  const sprites = useMemo(() => [1.1, 1.6, 2.1].map(bakeGlowSprite), []);

  // Clock logic (unused but kept)
  useEffect(() => {
    const tick = setInterval(() => {
      const n = new Date();
      setTime([n.getHours(), n.getMinutes(), n.getSeconds()]
        .map(v => String(v).padStart(2, "0")).join(":"));
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  // Title auto‑hide after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setTitleVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleVideoReady = useCallback(() => setVideoReady(true), []);
  const handleVideoError = useCallback(() => {
    setVideoError(true);
    setVideoReady(true); // still mark ready to hide title
  }, []);

  // Mouse parallax for title
  useEffect(() => {
    const mouse = { x: 0, y: 0 };
    const cur = { tx: 0, ty: 0 };
    let raf: number;

    const onMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const loop = () => {
      cur.tx += (mouse.x * 24 - cur.tx) * 0.035;
      cur.ty += (mouse.y * 14 - cur.ty) * 0.035;
      if (parallaxTitleRef.current) {
        parallaxTitleRef.current.style.transform = `translate3d(${cur.tx.toFixed(2)}px,${cur.ty.toFixed(2)}px,0)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Particle System
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    let W = window.innerWidth, H = window.innerHeight;

    const setSize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    setSize();
    window.addEventListener("resize", debounce(setSize, 150));

    const particles: Particle[] = Array.from({ length: 35 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.2, vy: -(0.1 + Math.random() * 0.4),
      spriteIdx: Math.floor(Math.random() * sprites.length),
      alpha: Math.random() * 0.5, alphaDir: Math.random() > 0.5 ? 1 : -1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.y += p.vy; p.x += p.vx;
        if (p.y < -30) p.y = H + 30;
        if (p.x < -30) p.x = W + 30;
        if (p.x > W + 30) p.x = -30;

        const s = sprites[p.spriteIdx];
        ctx.globalAlpha = 0.2 + Math.abs(Math.sin(Date.now() * 0.001)) * 0.3;
        ctx.drawImage(s, p.x - s.width / 2, p.y - s.height / 2);
      });
      requestAnimationFrame(draw);
    };
    const anim = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(anim);
      window.removeEventListener("resize", setSize);
    };
  }, [sprites]);

  return (
    <section
      ref={containerRef}
      className="relative flex items-center justify-center h-screen overflow-hidden bg-[#020202]"
      style={{ fontFamily: "'Share Tech Mono', monospace" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Cinzel+Decorative:wght@900&display=swap');
        
        .glitch { position: relative; animation: glitch 5s infinite; }
        .glitch::before, .glitch::after {
          content: attr(data-text); position: absolute; top: 0; left: 0; width: 100%; opacity: 0.8;
        }
        .glitch::before { color: #ff00ff; z-index: -1; transform: translate(-2px, 0); animation: glitch 0.3s infinite reverse; }
        .glitch::after { color: #00ffff; z-index: -2; transform: translate(2px, 0); animation: glitch 0.3s infinite; }
        
        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          10% { transform: translate(-1px, 1px); }
          20% { transform: translate(1px, -1px); }
        }
        
        .mask-video {
          mask-image: linear-gradient(to bottom, black 90%, transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom, black 90%, transparent 100%);
        }
      `}</style>

      {/* Video layer with bottom fade */}
      {!videoError && (
        <video
          ref={videoRef}
          autoPlay loop muted playsInline
          preload="auto"
          onCanPlay={handleVideoReady}
          onError={handleVideoError}
          className={`absolute z-20 inset-0 w-full h-full object-cover transition-opacity duration-1000 mask-video ${!titleVisible && videoReady ? 'opacity-100' : 'opacity-0'
            }`}
        >
          <source src="/video/Intro.webm" type="video/webm" />
        </video>
      )}

      {/* Background overlays */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.8)_60%)]" />
      <canvas ref={canvasRef} className="absolute inset-0 z-10 pointer-events-none opacity-40" />

      {/* Main Content (Headline) */}
      <div ref={parallaxTitleRef} className="relative z-40 flex flex-col items-center pointer-events-none">
        <div
          className={`transition-all duration-1000 ease-out transform ${titleVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
            }`}
          style={{ filter: titleVisible ? 'blur(0px)' : 'blur(10px)' }}
        >
          <h1
            data-text="REBORN INTERACTIVE"
            className="glitch text-white text-center leading-none"
            style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: "clamp(2.5rem, 8vw, 6rem)",
              letterSpacing: "0.15em",
              textShadow: "0 0 20px rgba(214,48,49,0.3)"
            }}
          >
            REBORN INTERACTIVE
          </h1>

          <div className="flex items-center gap-6 mt-6 justify-center">
            <div className="h-[1px] w-16 bg-[#d63031] shadow-[0_0_10px_#d63031]" />
            <span className="text-white/40 text-[10px] tracking-[0.8em] uppercase">Initialize Sequence</span>
            <div className="h-[1px] w-16 bg-[#d63031] shadow-[0_0_10px_#d63031]" />
          </div>
        </div>
      </div>

      {/* Bottom smoothing transition */}
      <div className="fixed bottom-0 left-0 w-full h-40 z-50 bg-gradient-to-t from-[#020202] via-[#020202]/80 to-transparent pointer-events-none" />
    </section>
  );
};

export default React.memo(HeroSection);