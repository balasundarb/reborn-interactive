"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";

interface NavItem {
  name: string;
  link: string;
  description?: string;
}

interface NavMenusProps {
  isOpen: boolean;
  onClose: () => void;
  navItems?: NavItem[];
}

// ─── Easing curves ────────────────────────────────────────────────────────────
const EASE_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_BACK: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

// ─── Framer variants ──────────────────────────────────────────────────────────
const itemVariants = {
  hidden: { x: 120, opacity: 0, skewX: -8 },
  visible: (i: number) => ({
    x: 0,
    opacity: 1,
    skewX: 0,
    transition: { delay: 0.12 + i * 0.07, duration: 0.9, ease: EASE_EXPO },
  }),
  exit: (i: number) => ({
    x: 80,
    opacity: 0,
    skewX: 4,
    transition: { delay: i * 0.04, duration: 0.5, ease: [0.4, 0, 0.6, 1] as const },
  }),
};

const lineVariants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: (i: number) => ({
    scaleX: 1,
    transition: { delay: 0.1 + i * 0.07, duration: 0.6, ease: EASE_EXPO },
  }),
  exit: { scaleX: 0, originX: 1, transition: { duration: 0.3 } },
};

const stripVariants = {
  hidden: { scaleY: 1 },
  visible: (i: number) => ({
    scaleY: 0,
    transition: { delay: i * 0.06, duration: 0.65, ease: EASE_EXPO },
  }),
  exit: (i: number) => ({
    scaleY: 1,
    transition: { delay: i * 0.04, duration: 0.5, ease: [0.4, 0, 0.6, 1] as const },
  }),
};

// ─── Panel wipe strips ────────────────────────────────────────────────────────
function PanelReveal({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="absolute inset-0 z-[150] pointer-events-none flex">
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          custom={i}
          variants={stripVariants}
          initial="hidden"
          animate={isOpen ? "visible" : "hidden"}
          exit="exit"
          className="flex-1 origin-top"
          style={{ background: "#060606" }}
        />
      ))}
    </div>
  );
}

// ─── Magnetic cursor blob ─────────────────────────────────────────────────────
function MagneticCursor({ hoveredIndex }: { hoveredIndex: number | null }) {
  const x = useMotionValue(-999);
  const y = useMotionValue(-999);
  const sx = useSpring(x, { stiffness: 120, damping: 18 });
  const sy = useSpring(y, { stiffness: 120, damping: 18 });

  useEffect(() => {
    const move = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <motion.div
      style={{ left: sx, top: sy, translateX: "-50%", translateY: "-50%" }}
      className="fixed pointer-events-none z-[200] mix-blend-difference"
      animate={{ scale: hoveredIndex !== null ? 5 : 1, opacity: hoveredIndex !== null ? 0.18 : 0.07 }}
      transition={{ duration: 0.5, ease: EASE_EXPO }}
    >
      <div className="w-5 h-5 rounded-full bg-red-400" />
    </motion.div>
  );
}

// ─── Particle burst on hover enter ───────────────────────────────────────────
function ParticleBurst({ active }: { active: boolean }) {
  const count = 14;
  return (
    <AnimatePresence>
      {active &&
        Array.from({ length: count }).map((_, i) => {
          const angle = (i / count) * 360;
          const rad = (angle * Math.PI) / 180;
          const dist = 55 + Math.random() * 35;
          return (
            <motion.span
              key={i}
              className="absolute left-1/2 top-1/2 rounded-full bg-red-500"
              style={{ width: 3, height: 3, translateX: "-50%", translateY: "-50%" }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: Math.cos(rad) * dist, y: Math.sin(rad) * dist, opacity: 0, scale: 0 }}
              transition={{ duration: 0.65, ease: EASE_EXPO }}
            />
          );
        })}
    </AnimatePresence>
  );
}

// ─── Split text with dual-row slide ──────────────────────────────────────────
function DualSplitText({ text, hovered }: { text: string; hovered: boolean }) {
  const chars = text.split("");
  return (
    <span className="relative inline-flex">
      {/* Row 1 – slides up on hover */}
      <span className="inline-flex">
        {chars.map((ch, i) => (
          <motion.span
            key={`a-${i}`}
            animate={hovered ? { y: "-110%", opacity: 0 } : { y: 0, opacity: 1 }}
            transition={{ delay: i * 0.016, duration: 0.32, ease: EASE_BACK }}
            className="inline-block"
            style={{ minWidth: ch === " " ? "0.28em" : undefined }}
          >
            {ch}
          </motion.span>
        ))}
      </span>

      {/* Row 2 – slides in from below */}
      <span className="absolute inset-0 inline-flex text-red-500">
        {chars.map((ch, i) => (
          <motion.span
            key={`b-${i}`}
            animate={hovered ? { y: 0, opacity: 1 } : { y: "110%", opacity: 0 }}
            transition={{ delay: i * 0.016, duration: 0.32, ease: EASE_BACK }}
            className="inline-block italic"
            style={{ minWidth: ch === " " ? "0.28em" : undefined }}
          >
            {ch}
          </motion.span>
        ))}
      </span>
    </span>
  );
}

// ─── Animated number ticker ───────────────────────────────────────────────────
function Ticker({ value }: { value: number }) {
  return (
    <div className="overflow-hidden h-5 w-8 flex justify-end">
      <AnimatePresence mode="wait">
        <motion.span
          key={value}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.28, ease: EASE_EXPO }}
          className="block text-xs font-mono text-white/25 tabular-nums"
        >
          {String(value + 1).padStart(2, "0")}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export const NavMenus = ({ isOpen, onClose, navItems = [] }: NavMenusProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [burstIndex, setBurstIndex] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const burstTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  // Clear burst timer on unmount
  useEffect(() => {
    return () => {
      if (burstTimerRef.current) clearTimeout(burstTimerRef.current);
    };
  }, []);

  const handleEnter = useCallback((i: number) => {
    setHoveredIndex(i);
    setBurstIndex(i);
    if (burstTimerRef.current) clearTimeout(burstTimerRef.current);
    burstTimerRef.current = setTimeout(() => setBurstIndex(null), 800);
  }, []);

  const handleLeave = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  // 3-D tilt parallax on panel
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-1, 1], [2.5, -2.5]), { stiffness: 60, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [-1, 1], [-2.5, 2.5]), { stiffness: 60, damping: 20 });

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = panelRef.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    my.set(((e.clientY - r.top) / r.height - 0.5) * 2);
  }, [mx, my]);

  const onMouseLeave = useCallback(() => {
    mx.set(0);
    my.set(0);
  }, [mx, my]);

  return (
    <>
      {/* Scanline keyframe only — glitch removed */}
      <style>{`
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .scan { animation: scanline 5s linear infinite; }
      `}</style>

      <MagneticCursor hoveredIndex={hoveredIndex} />

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden" style={{ perspective: 1400 }}>
            {/* ── Panel ────────────────────────────────────────────────────── */}
            <motion.div
              ref={panelRef}
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              initial={{ x: "100%", skewX: "-5deg" }}
              animate={{ x: 0, skewX: "0deg" }}
              exit={{ x: "110%", skewX: "8deg" }}
              transition={{ duration: 0.9, ease: EASE_EXPO }}
              onMouseMove={onMouseMove}
              onMouseLeave={onMouseLeave}
              className="relative h-full w-full md:w-[620px] flex flex-col justify-center overflow-hidden"
            >
              <PanelReveal isOpen={isOpen} />

              {/* BG */}
              <div className="absolute inset-0 bg-[#050505]" />

              {/* Dynamic red gradient that follows hover */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={
                  hoveredIndex !== null
                    ? { background: `radial-gradient(ellipse 60% 55% at 85% ${15 + hoveredIndex * 14}%, rgba(220,38,38,0.14) 0%, transparent 70%)` }
                    : { background: "radial-gradient(ellipse 50% 40% at 85% 50%, rgba(220,38,38,0.05) 0%, transparent 70%)" }
                }
                transition={{ duration: 0.55 }}
              />

              {/* Scanline sweep */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="scan absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-500/25 to-transparent" />
              </div>

              {/* CRT raster lines */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.06]"
                style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.35) 2px,rgba(0,0,0,0.35) 4px)" }}
              />

              {/* Left accent bar */}
              <motion.div
                className="absolute left-0 top-0 bottom-0 w-[2px]"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                exit={{ scaleY: 0 }}
                transition={{ delay: 0.25, duration: 0.7, ease: EASE_EXPO }}
                style={{
                  background: "linear-gradient(to bottom, transparent 0%, #dc2626 20%, #dc2626 80%, transparent 100%)",
                  boxShadow: "0 0 24px rgba(220,38,38,0.45)",
                }}
              />

              {/* Ghost number */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
                <AnimatePresence mode="wait">
                  {hoveredIndex !== null && (
                    <motion.span
                      key={hoveredIndex}
                      initial={{ opacity: 0, scale: 0.55, rotate: -20 }}
                      animate={{ opacity: 0.045, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 1.35, rotate: 12 }}
                      transition={{ duration: 0.55, ease: EASE_EXPO }}
                      className="text-[28rem] font-black italic text-white leading-none"
                    >
                      {hoveredIndex + 1}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Menu label */}
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: 0.45, duration: 0.5 }}
                className="absolute top-10 left-10 md:left-16 flex items-center gap-3"
              >
                <motion.div
                  animate={{ rotate: [0, 90, 180, 270, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="w-2 h-2 bg-red-600"
                />
                <span className="text-[10px] font-mono text-white/20 tracking-[0.35em] uppercase">Navigation</span>
              </motion.div>

              {/* Close button */}
              <motion.button
                onClick={onClose}
                initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.7 }}
                transition={{ delay: 0.5, duration: 0.5, ease: EASE_BACK }}
                whileHover={{ scale: 1.12, rotate: 90 }}
                whileTap={{ scale: 0.88 }}
                className="absolute top-8 right-8 md:top-10 md:right-10 w-12 h-12 flex items-center justify-center border border-white/10 hover:border-red-600/60 transition-colors group cursor-pointer"
                aria-label="Close menu"
              >
                <div className="relative w-5 h-5">
                  <span className="absolute top-1/2 left-0 w-full h-[1.5px] bg-white/50 -rotate-45 group-hover:bg-red-500 transition-colors" />
                  <span className="absolute top-1/2 left-0 w-full h-[1.5px] bg-white/50 rotate-45 group-hover:bg-red-500 transition-colors" />
                </div>
              </motion.button>

              {/* ── Nav items ─────────────────────────────────────────── */}
              <nav className="relative z-10 px-10 md:px-16">
                {navItems.map((item, i) => (
                  <div key={item.name}>
                    <motion.div
                      custom={i}
                      variants={lineVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="h-px bg-white/[0.06]"
                    />

                    <motion.div
                      custom={i}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="relative"
                      onMouseEnter={() => handleEnter(i)}
                      onMouseLeave={handleLeave}
                    >
                      {/* Particle origin */}
                      <div className="absolute left-4 top-1/2 pointer-events-none -translate-y-1/2">
                        <ParticleBurst active={burstIndex === i} />
                      </div>

                      <Link href={item.link} onClick={onClose} className="group flex items-center gap-6 py-5 md:py-6 outline-none cursor-pointer">
                        {/* Index */}
                        <div className="flex-shrink-0 flex flex-col items-end w-8">
                          <Ticker value={i} />
                          <motion.div
                            className="h-px bg-red-600 w-full mt-1"
                            animate={{ scaleX: hoveredIndex === i ? 1 : 0.25, opacity: hoveredIndex === i ? 1 : 0.3 }}
                            style={{ originX: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>

                        {/* Label */}
                        <div className="relative flex-1 overflow-hidden">
                          <span className="relative block text-5xl md:text-[4.5rem] font-black uppercase tracking-tighter leading-none">
                            <DualSplitText text={item.name} hovered={hoveredIndex === i} />
                          </span>
                          {item.description && (
                            <motion.span
                              animate={{ opacity: hoveredIndex === i ? 1 : 0, y: hoveredIndex === i ? 0 : 6 }}
                              transition={{ duration: 0.28 }}
                              className="block text-[10px] font-mono text-white/25 mt-1.5 tracking-[0.25em] uppercase"
                            >
                              {item.description}
                            </motion.span>
                          )}
                        </div>

                        {/* Arrow */}
                        <motion.span
                          animate={{ x: hoveredIndex === i ? 0 : -10, opacity: hoveredIndex === i ? 1 : 0 }}
                          transition={{ duration: 0.3, ease: EASE_EXPO }}
                          className="flex-shrink-0 text-red-500"
                        >
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </motion.span>
                      </Link>

                      {/* Hover sweep bg */}
                      <motion.div
                        className="absolute inset-0 pointer-events-none"
                        animate={{ opacity: hoveredIndex === i ? 1 : 0, x: hoveredIndex === i ? 0 : -16 }}
                        transition={{ duration: 0.3 }}
                        style={{ background: "linear-gradient(90deg, rgba(220,38,38,0.07) 0%, transparent 65%)" }}
                      />
                    </motion.div>
                  </div>
                ))}

                {/* Final line */}
                <motion.div
                  custom={navItems.length}
                  variants={lineVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="h-px bg-white/[0.06]"
                />
              </nav>

              {/* ── Footer ────────────────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.65, duration: 0.5 }}
                className="absolute bottom-10 left-10 md:left-16 right-10 md:right-16 flex items-center justify-between"
              >
                <span className="text-[10px] font-mono text-white/12 tracking-[0.2em] uppercase">
                  {navItems.length} Items
                </span>
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ opacity: [1, 0.15, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-red-600"
                    style={{ boxShadow: "0 0 6px rgba(220,38,38,0.8)" }}
                  />
                  <span className="text-[10px] font-mono text-white/12 tracking-[0.2em] uppercase">Live</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavMenus;