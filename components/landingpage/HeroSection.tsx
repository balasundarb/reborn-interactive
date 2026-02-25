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

// ─── HUD Corner Component ─────────────────────────────────────────────────────
const HUDCorner = React.memo(({ position, delay, children, loaded }: {
  position: string;
  delay: number;
  children?: React.ReactNode;
  loaded: boolean;
}) => (
  <div
    className={`absolute ${position} transition-all duration-1000 ease-out`}
    style={{
      opacity: loaded ? 1 : 0,
      transform: loaded ? 'translate3d(0,0,0)' : 'translate3d(0,20px,0)',
      transitionDelay: `${delay}s`
    }}
  >
    {children}
  </div>
));
HUDCorner.displayName = 'HUDCorner';

// ─── Main Component ───────────────────────────────────────────────────────────
const HeroSection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const parallaxHudRef = useRef<HTMLDivElement>(null);
  const parallaxTitleRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);

  const [loaded, setLoaded] = useState(false);
  const [time, setTime] = useState("00:00:00");
  const [videoError, setVideoError] = useState(false);

  const sprites = useMemo(() => [1.1, 1.6, 2.1].map(bakeGlowSprite), []);

  // Clock logic
  useEffect(() => {
    const tick = setInterval(() => {
      const n = new Date();
      setTime([n.getHours(), n.getMinutes(), n.getSeconds()]
        .map(v => String(v).padStart(2, "0")).join(":"));
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const handleVideoReady = useCallback(() => {
    setLoaded(true);
  }, []);

  const handleVideoError = useCallback(() => {
    setVideoError(true);
    setLoaded(true);
  }, []);

  // Mouse parallax logic
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
      cur.hx += (mouse.x * 12 - cur.hx) * 0.05;
      cur.hy += (mouse.y * 8 - cur.hy) * 0.05;
      cur.tx += (mouse.x * 24 - cur.tx) * 0.035;
      cur.ty += (mouse.y * 14 - cur.ty) * 0.035;

      if (parallaxHudRef.current) {
        parallaxHudRef.current.style.transform = `translate3d(${cur.hx.toFixed(2)}px,${cur.hy.toFixed(2)}px,0)`;
      }
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

  // Particle System logic
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
    return () => cancelAnimationFrame(anim);
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
          mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
        }
      `}</style>

      {/* ── Video Layer ── */}
      {!videoError && (
        <video
          ref={videoRef}
          autoPlay loop muted playsInline
          onCanPlay={handleVideoReady}
          onError={handleVideoError}
          className={`absolute z-10 inset-0 w-full h-full object-cover transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        >
          <source src="/video/Intro.webm" type="video/webm" />
        </video>
      )}

      {/* ── Background Overlays ── */}
      {/* <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.8)_60%)]" />
      <canvas ref={canvasRef} className="absolute inset-0 z-20 pointer-events-none opacity-40" /> */}

      {/* ── HUD Elements ── */}
      <div ref={parallaxHudRef} className="absolute inset-0 z-30 pointer-events-none">
        <HUDCorner position="top-10 left-10" delay={0.4} loaded={loaded}>
          <div className="text-[#d63031] text-[10px] tracking-[0.4em] uppercase font-bold">System_Live // {time}</div>
          <div className="w-32 h-[1px] bg-[#d63031]/40 mt-2 shadow-[0_0_8px_rgba(214,48,49,0.5)]" />
        </HUDCorner>

        <HUDCorner position="bottom-12 right-10" delay={0.6} loaded={loaded}>
          <div className="text-white/20 text-[8px] tracking-[0.5em] text-right uppercase">Reborn_Interactive_Auth: OK</div>
          <div className="text-white/10 text-[7px] tracking-[0.2em] text-right mt-1">31.2304° N / 121.4737° E</div>
        </HUDCorner>
      </div>

      {/* ── Main Content (Headline) ── */}

      <div ref={parallaxTitleRef} className="relative z-40 flex flex-col items-center pointer-events-none">
        <div
          className={`transition-all duration-1000 ease-out transform ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
          style={{ filter: loaded ? 'blur(0px)' : 'blur(10px)' }}
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


      {/* ── Bottom Smoothing Transition ── */}
      <div className="absolute bottom-0 left-0 w-full h-40 z-50 bg-gradient-to-t from-[#020202] via-[#020202]/80 to-transparent pointer-events-none" />
    </section>
  );
};

export default React.memo(HeroSection);