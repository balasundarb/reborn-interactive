"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";

// Roman numeral converter for the data readout
function toRoman(num: number): string {
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
  const syms = ["M","CM","D","CD","C","XC","L","XL","X","IX","V","IV","I"];
  let result = "";
  for (let i = 0; i < vals.length; i++) {
    while (num >= vals[i]) { result += syms[i]; num -= vals[i]; }
  }
  return result || "O";
}

function createParticleCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = `
    position:fixed;inset:0;pointer-events:none;
    z-index:99998;width:100%;height:100%;
  `;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  return canvas;
}

type Particle = {
  x: number; y: number;
  vx: number; vy: number;
  life: number; size: number;
  type: "ember" | "dust" | "ink";
  rotation: number; rotSpeed: number;
};

export default function HistoryCursor() {
  const containerRef    = useRef<HTMLDivElement>(null);
  const pointerRef      = useRef<HTMLDivElement>(null);
  const compassRef      = useRef<HTMLDivElement>(null);
  const outerRingRef    = useRef<HTMLDivElement>(null);
  const innerRingRef    = useRef<HTMLDivElement>(null);
  const reticleRef      = useRef<HTMLDivElement>(null);
  const dataReadoutRef  = useRef<HTMLDivElement>(null);
  const epochRef        = useRef<HTMLDivElement>(null);

  const mousePos   = useRef({ x: -300, y: -300 });
  const prevPos    = useRef({ x: -300, y: -300 });
  const velocity   = useRef({ x: 0, y: 0 });
  const particles  = useRef<Particle[]>([]);
  const canvasRef  = useRef<HTMLCanvasElement | null>(null);
  const rafRef     = useRef<number>(0);

  const EMBER = "rgba(210, 140, 50, ";
  const INK   = "rgba(60, 35, 15, ";
  const DUST  = "rgba(190, 165, 110, ";

  const spawnParticles = useCallback((x: number, y: number, vx: number, vy: number) => {
    const speed = Math.sqrt(vx * vx + vy * vy);
    if (speed < 0.5) return;
    const count = Math.min(Math.floor(speed * 0.5), 5);
    for (let i = 0; i < count; i++) {
      const angle = Math.atan2(vy, vx) + Math.PI + (Math.random() - 0.5) * 1.2;
      const mag   = Math.random() * speed * 0.25 + 0.3;
      const type: Particle["type"] = i % 3 === 0 ? "ember" : i % 3 === 1 ? "dust" : "ink";
      particles.current.push({
        x, y,
        vx: Math.cos(angle) * mag,
        vy: Math.sin(angle) * mag - 0.3,
        life: 1,
        size: type === "dust" ? Math.random() * 3 + 1 : Math.random() * 2 + 0.5,
        type,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 4,
      });
    }
    if (particles.current.length > 100) particles.current.splice(0, 30);
  }, []);

  const renderLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.current.length - 1; i >= 0; i--) {
      const p = particles.current[i];
      p.x += p.vx; p.y += p.vy;
      p.vx *= 0.94; p.vy *= 0.88;
      p.vy += 0.04;
      p.life -= 0.03;
      p.rotation += p.rotSpeed;
      if (p.life <= 0) { particles.current.splice(i, 1); continue; }

      const alpha = p.life * p.life;
      ctx.save();
      ctx.globalAlpha = alpha * 0.9;

      if (p.type === "ember") {
        ctx.shadowColor = `rgba(220, 130, 40, 0.8)`;
        ctx.shadowBlur = 6;
        ctx.fillStyle = `${EMBER}${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === "dust") {
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = `${DUST}${alpha * 0.6})`;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else {
        ctx.translate(p.x, p.y);
        ctx.rotate(Math.atan2(p.vy, p.vx));
        ctx.fillStyle = `${INK}${alpha * 0.7})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 1.5, p.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Sepia ink velocity streak
    const speed = Math.sqrt(velocity.current.x ** 2 + velocity.current.y ** 2);
    if (speed > 3) {
      const len = Math.min(speed * 3.5, 55);
      const { x, y } = mousePos.current;
      const nx = velocity.current.x / speed;
      const ny = velocity.current.y / speed;
      const grad = ctx.createLinearGradient(x, y, x - nx * len, y - ny * len);
      grad.addColorStop(0, `rgba(180, 110, 40, 0.5)`);
      grad.addColorStop(0.5, `rgba(140, 80, 20, 0.25)`);
      grad.addColorStop(1, `rgba(100, 60, 10, 0)`);
      ctx.beginPath();
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.moveTo(x, y);
      ctx.lineTo(x - nx * len, y - ny * len);
      ctx.stroke();
    }

    rafRef.current = requestAnimationFrame(renderLoop);
  }, [EMBER, DUST, INK]);

  useEffect(() => {
    document.documentElement.style.cursor = "none";

    const canvas = createParticleCanvas();
    document.body.appendChild(canvas);
    canvasRef.current = canvas;

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    rafRef.current = requestAnimationFrame(renderLoop);

    // Slow compass spin
    gsap.to(compassRef.current, {
      rotation: 360, duration: 20, repeat: -1, ease: "none",
    });
    // Outer ring counter-spin
    gsap.to(outerRingRef.current, {
      rotation: -360, duration: 35, repeat: -1, ease: "none",
    });

    const moveCursor = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;
      prevPos.current = { ...mousePos.current };
      mousePos.current = { x, y };
      velocity.current = { x: x - prevPos.current.x, y: y - prevPos.current.y };
      const speed = Math.sqrt(velocity.current.x ** 2 + velocity.current.y ** 2);

      spawnParticles(x, y, velocity.current.x, velocity.current.y);

      gsap.to(pointerRef.current, { x, y, duration: 0.08, ease: "power4.out" });

      gsap.to(compassRef.current, { x, y, duration: 0.4, ease: "expo.out" });

      gsap.to(innerRingRef.current, {
        x, y, scale: 1 + Math.min(speed * 0.02, 0.3),
        duration: 0.25, ease: "power3.out",
      });

      gsap.to(outerRingRef.current, {
        x, y, scale: 1 + Math.min(speed * 0.03, 0.5),
        duration: 0.55, ease: "expo.out",
      });

      gsap.to(reticleRef.current, { x, y, duration: 0.2, ease: "power3.out" });

      gsap.to(epochRef.current, {
        x: x + 20, y: y - 34, duration: 0.18, ease: "power3.out",
      });

      gsap.to(dataReadoutRef.current, {
        x: x + 20, y: y + 16, duration: 0.18, ease: "power3.out",
      });

      if (dataReadoutRef.current) {
        const rx = toRoman(Math.round(x));
        const ry = toRoman(Math.round(y));
        dataReadoutRef.current.innerHTML =
          `<span style="color:#c8a05a">${rx}</span>` +
          `<span style="color:#6b4e2a"> · </span>` +
          `<span style="color:#9c6030">${ry}</span>`;
      }
    };

    const handleMouseDown = () => {
      gsap.to(pointerRef.current, { scale: 0.5, duration: 0.08, ease: "power4.in" });
      gsap.to(pointerRef.current, { scale: 1, duration: 0.6, delay: 0.08, ease: "elastic.out(1.2, 0.4)" });

      gsap.to(compassRef.current, { rotation: "+=120", duration: 0.25, ease: "power3.out" });

      gsap.to(outerRingRef.current, { scale: 1.8, opacity: 0.4, duration: 0.12, ease: "power3.out" });
      gsap.to(outerRingRef.current, { scale: 1, opacity: 1, duration: 0.7, delay: 0.12, ease: "elastic.out(1, 0.4)" });

      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const mag = 2 + Math.random() * 4;
        particles.current.push({
          x: mousePos.current.x, y: mousePos.current.y,
          vx: Math.cos(angle) * mag, vy: Math.sin(angle) * mag,
          life: 1, size: 1.5 + Math.random() * 2.5,
          type: i % 2 === 0 ? "ember" : "ink",
          rotation: Math.random() * 360, rotSpeed: (Math.random() - 0.5) * 6,
        });
      }
    };

    const handleMouseUp = () => {
      gsap.to(pointerRef.current, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.4)" });
    };

    const handleHoverIn = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.matches("a, button, [role=button], input, textarea, select")) {
        gsap.to(innerRingRef.current, { scale: 1.4, borderColor: "rgba(180,50,30,0.9)", duration: 0.25 });
        gsap.to(outerRingRef.current, { scale: 1.3, duration: 0.3 });
        if (epochRef.current) epochRef.current.textContent = "EXAMINE";
      }
    };
    const handleHoverOut = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.matches("a, button, [role=button], input, textarea, select")) {
        gsap.to(innerRingRef.current, { scale: 1, borderColor: "rgba(180,130,60,0.5)", duration: 0.25 });
        gsap.to(outerRingRef.current, { scale: 1, duration: 0.3 });
      if (epochRef.current) epochRef.current.textContent = "READY";
      }
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseover", handleHoverIn);
    document.addEventListener("mouseout", handleHoverOut);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseover", handleHoverIn);
      document.removeEventListener("mouseout", handleHoverOut);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafRef.current);
      canvas.remove();
      document.documentElement.style.cursor = "auto";
    };
  }, [renderLoop, spawnParticles]);

  return (
    <div ref={containerRef} style={containerStyle}>

      {/* Outer dashed ring — aged map border, counter-spins */}
      <div ref={outerRingRef} style={{ ...cursorBase, ...outerRingStyle }} />

      {/* Inner parchment ring */}
      <div ref={innerRingRef} style={{ ...cursorBase, ...innerRingStyle }} />

      {/* Compass rose — slow spin */}
      <div ref={compassRef} style={{ ...cursorBase, ...compassWrapStyle }}>
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
          {/* Cardinal spikes */}
          <path d="M28 4L31 22H25L28 4Z"   fill="rgba(190,50,30,0.85)" />
          <path d="M28 52L25 34H31L28 52Z" fill="rgba(160,120,60,0.7)" />
          <path d="M4 28L22 25V31L4 28Z"   fill="rgba(160,120,60,0.7)" />
          <path d="M52 28L34 31V25L52 28Z"  fill="rgba(160,120,60,0.7)" />
          {/* Intercardinal lines */}
          <path d="M28 28L19 19" stroke="rgba(180,140,70,0.35)" strokeWidth="0.8" />
          <path d="M28 28L37 19" stroke="rgba(180,140,70,0.35)" strokeWidth="0.8" />
          <path d="M28 28L19 37" stroke="rgba(180,140,70,0.35)" strokeWidth="0.8" />
          <path d="M28 28L37 37" stroke="rgba(180,140,70,0.35)" strokeWidth="0.8" />
          {/* Outer circle */}
          <circle cx="28" cy="28" r="24" stroke="rgba(180,140,60,0.3)" strokeWidth="0.8" />
          {/* Tick marks — 12 positions */}
          {Array.from({ length: 12 }).map((_, i) => {
            const a  = (i / 12) * Math.PI * 2 - Math.PI / 2;
            const r1 = 22;
            const r2 = i % 3 === 0 ? 19 : 20.5;
            return (
              <line key={i}
                x1={28 + Math.cos(a) * r1} y1={28 + Math.sin(a) * r1}
                x2={28 + Math.cos(a) * r2} y2={28 + Math.sin(a) * r2}
                stroke={i % 3 === 0 ? "rgba(200,150,60,0.7)" : "rgba(160,120,50,0.4)"}
                strokeWidth={i % 3 === 0 ? "1.2" : "0.7"}
              />
            );
          })}
          {/* Wax seal center */}
          <circle cx="28" cy="28" r="4"   fill="rgba(160,40,20,0.85)" />
          <circle cx="28" cy="28" r="1.8" fill="rgba(220,180,80,0.95)" />
        </svg>
      </div>

      {/* Reticle crosshair */}
      <div ref={reticleRef} style={{ ...cursorBase, ...reticleWrapStyle }}>
        <div style={tickTop} /><div style={tickBottom} />
        <div style={tickLeft} /><div style={tickRight} />
      </div>

      {/* Epoch label */}
      <div ref={epochRef} style={epochStyle}>REBORN</div>

      {/* Roman numeral coordinates */}
      <div ref={dataReadoutRef} style={dataReadoutStyle} />

      {/* Central pointer — quill / spear tip */}
      <div ref={pointerRef} style={{ ...cursorBase, transformOrigin: "center" }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path
            d="M11 1L14 10H11.8V19H10.2V10H8L11 1Z"
            fill="rgba(200,155,55,0.95)"
            style={{ filter: "drop-shadow(0 0 4px rgba(210,150,40,0.9))" }}
          />
          {/* Quill barbs */}
          <path d="M8 10L5 13"  stroke="rgba(180,130,50,0.55)" strokeWidth="1" strokeLinecap="round" />
          <path d="M14 10L17 13" stroke="rgba(180,130,50,0.55)" strokeWidth="1" strokeLinecap="round" />
          {/* Core */}
          <circle cx="11" cy="11" r="1.5" fill="rgba(230,190,80,1)" />
          <circle cx="11" cy="11" r="0.6" fill="rgba(160,40,20,1)" />
        </svg>
      </div>

    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
  position: "fixed", inset: 0,
  pointerEvents: "none", zIndex: 99999,
};

const cursorBase: React.CSSProperties = {
  position: "fixed", top: 0, left: 0,
  transform: "translate(-50%, -50%)",
  willChange: "transform",
};

const compassWrapStyle: React.CSSProperties = {
  width: "56px", height: "56px",
};

const outerRingStyle: React.CSSProperties = {
  width: "84px", height: "84px",
  borderRadius: "50%",
  border: "1px dashed rgba(180,140,55,0.4)",
  boxShadow: "0 0 12px rgba(180,130,40,0.08), inset 0 0 8px rgba(160,110,30,0.06)",
};

const innerRingStyle: React.CSSProperties = {
  width: "50px", height: "50px",
  borderRadius: "50%",
  border: "1px solid rgba(180,130,60,0.5)",
  boxShadow: "0 0 6px rgba(170,120,40,0.15)",
};

const reticleWrapStyle: React.CSSProperties = {
  width: "28px", height: "28px",
};

const tickBase: React.CSSProperties = {
  position: "absolute",
  background: "rgba(210,170,80,0.45)",
};
const tickTop: React.CSSProperties    = { ...tickBase, width:"1px", height:"6px", top:0,    left:"50%", transform:"translateX(-50%)" };
const tickBottom: React.CSSProperties = { ...tickBase, width:"1px", height:"6px", bottom:0, left:"50%", transform:"translateX(-50%)" };
const tickLeft: React.CSSProperties   = { ...tickBase, height:"1px", width:"6px", left:0,   top:"50%",  transform:"translateY(-50%)" };
const tickRight: React.CSSProperties  = { ...tickBase, height:"1px", width:"6px", right:0,  top:"50%",  transform:"translateY(-50%)" };

const epochStyle: React.CSSProperties = {
  position: "fixed", top: 0, left: 0,
  fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
  fontSize: "8px",
  letterSpacing: "0.18em",
  color: "rgba(190,150,60,0.7)",
  pointerEvents: "none",
  willChange: "transform",
  textShadow: "0 0 8px rgba(200,150,50,0.4)",
  whiteSpace: "nowrap",
  textTransform: "uppercase",
};

const dataReadoutStyle: React.CSSProperties = {
  position: "fixed", top: 0, left: 0,
  fontFamily: "'Courier New', monospace",
  fontSize: "9px",
  letterSpacing: "0.06em",
  lineHeight: 1.4,
  pointerEvents: "none",
  willChange: "transform",
  whiteSpace: "nowrap",
  textShadow: "0 0 6px rgba(180,130,40,0.5)",
};