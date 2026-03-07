"use client";

import React, {
  useState,
  useRef,
  useEffect,
  FC,
  KeyboardEvent,
  MouseEvent,
} from "react";
import Image from "next/image";
import { AsciiArt } from "@/components/ui/ascii-art";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Creator {
  id: string;
  image: string;
  name: string;
  designation: string;
  description: string;
}

interface StatItem {
  value: string;
  label: string;
}

interface CreatorModalProps {
  creator: Creator;
  onClose: () => void;
}

interface CreatorCardProps {
  creator: Creator;
  index: number;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const CARD_DATA: Creator[] = [
  {
    id: "1",
    image: "/assets/team/ajay_rahul.webp",
    name: "Ajay Rahul R",
    designation: "Founder | Game Designer | Creative Director",
    description:
      "Ajay Rahul is the visionary Founder of Reborn Interactive, a creative force driven by innovation, storytelling, and immersive gameplay experiences. As a Game Designer and Director, he specializes in building worlds inspired by ancient history, mythology, and cinematic narratives — transforming powerful concepts into interactive digital experiences.\n\nWith a deep passion for game mechanics, narrative architecture, and player psychology, Ajay leads projects from concept to execution — shaping every detail from world-building and character design to gameplay systems and creative direction.\n\nHis mission is simple: To create unforgettable gaming experiences that blend history, emotion, and cutting-edge technology.\n\nAt Reborn Interactive, he focuses on:\n• Ancient & Historical Game Development\n• Narrative-Driven Game Design\n• World Building & Lore Creation\n• Creative Direction & Visual Identity\n• Publishing & Strategic Game Development\n\nAjay believes games are not just entertainment — they are interactive stories that shape imagination and culture.",
  },
  {
    id: "2",
    image: "/assets/team/snega.webp",
    name: "Snegha R",
    designation: "Co-Founder | Human Resources & Talent Strategist",
    description:
      "Behind every great studio is a strong foundation of people, culture, and vision. Snegha R, Co-Founder of Reborn Interactive, leads the human resources and organizational development that powers the studio's creative excellence.\n\nShe is responsible for building and nurturing the team that drives innovation across game design, development, and digital production. From talent acquisition and team development to company culture and operational structure, Snegha ensures that Reborn Interactive grows with purpose and unity.\n\nHer leadership focuses on creating an environment where creativity thrives, collaboration is seamless, and every team member is empowered to perform at their highest potential.\n\nWhat She Leads:\n• Talent Acquisition & Team Building\n• Organizational Development\n• Company Culture & Employee Growth\n• Strategic Leadership\n\nLeadership Philosophy: Snegha believes that a studio's greatest asset is its people. Her mission is to cultivate a culture of innovation, discipline, and collaboration — ensuring that Reborn Interactive continues to build powerful gaming experiences driven by passionate creators.",
  },
  {
    id: "3",
    image: "/assets/team/balasundar.webp",
    name: "Balasunder B",
    designation: "Visual Designer | UI Architect | Web & Game Developer",
    description:
      "Balasunder is the creative engine behind the visual identity and digital experiences at Reborn Interactive. Specializing in visual asset creation, UI/UX architecture, website design, and game development, he transforms ideas into immersive and visually compelling digital worlds.\n\nWith a strong eye for detail and design precision, Balasunder crafts high-quality visual assets that define atmosphere, enhance storytelling, and elevate player engagement. From intuitive game interfaces to modern website experiences, his work bridges creativity and functionality.\n\nHe focuses on creating seamless user experiences that not only look powerful but feel effortless.\n\nCore Expertise:\n• Visual Asset Creation & Game Art Integration\n• UI/UX Design for Games & Interactive Platforms\n• Website Design & Development\n• Front-End & Gameplay System Development\n• Digital Branding & Visual Identity\n\nBalasunder believes that great design is not just seen — it is experienced. His mission is to build digital environments that are immersive, intuitive, and unforgettable.",
  },
  {
    id: "4",
    image: "/assets/team/shekinah.webp",
    name: "Shekinah Florance M",
    designation:
      "Backend Engineer | Systems Architect | Game Infrastructure Developer",
    description:
      "Shekinah Florance M is the backbone of technology at Reborn Interactive, specializing in backend services, APIs, database architecture, and game dashboards. She builds the systems that power seamless gameplay, secure data management, and scalable digital platforms.\n\nWith a strong foundation in system design and performance optimization, Shekinah ensures that every game and platform operates with stability, speed, and reliability. From designing secure APIs to structuring complex databases and analytics dashboards, she transforms technical challenges into efficient solutions.\n\nHer work enables real-time data flow, player management systems, and scalable game infrastructure — forming the foundation behind every immersive experience.\n\nCore Expertise:\n• Backend Services & Server Architecture\n• API Development & System Integration\n• Database Design & Optimization\n• Game Dashboards & Admin Panels\n• Security, Scalability & Performance Engineering\n\nShekinah believes that great digital experiences rely on powerful unseen systems. Her mission is to build robust infrastructure that supports creativity, innovation, and long-term growth.",
  },
  {
    id: "5",
    image: "/assets/team/jegan.webp",
    name: "Jegan",
    designation: "3D Artist | VFX Specialist | Roto Artist | Game Developer",
    description:
      "At Reborn Interactive, visual depth and cinematic intensity come to life through powerful design and technical artistry. Jegan plays a key role in shaping immersive environments, dynamic effects, and high-quality visual assets for games and interactive experiences.\n\nSpecializing in 3D modeling, VFX creation, roto artistry, and game development, he blends creativity with technical precision to craft visually compelling digital worlds. From detailed character models and realistic environments to explosive visual effects and refined compositing, his work enhances storytelling and gameplay immersion.\n\nJegan transforms concepts into visually stunning realities — ensuring every frame, movement, and effect elevates the player experience.\n\nWhat He Creates:\n• 3D Modeling & Asset Development\n• Visual Effects (VFX)\n• Roto & Compositing\n• Game Development Support\n\nCreative Vision: Jegan believes that visuals are more than design — they are emotion in motion. His mission is to push visual boundaries and create immersive, cinematic experiences that captivate players and bring digital worlds to life.",
  },
  {
    id: "6",
    image: "/assets/team/vishnu.webp",
    name: "Vishnu",
    designation: "3D Modeler | Animator | Storytelling Artist",
    description:
      "At Reborn Interactive, immersive worlds begin with powerful visuals and meaningful stories. Vishnu plays a vital role in shaping the artistic and emotional depth of every game through 3D modeling, animation, and narrative-driven design.\n\nSpecializing in character modeling, environment creation, and dynamic animation, he brings digital worlds to life with realism, movement, and personality. His work goes beyond visuals — integrating storytelling elements that enhance gameplay and create deeper player connections.\n\nFrom concept sketches to fully animated game-ready assets, Vishnu ensures that every model and motion contributes to a compelling and immersive experience.\n\nWhat He Creates:\n• 3D Modeling\n• Animation\n• Storytelling Through Design\n\nCreative Philosophy: Vishnu believes that great games are built at the intersection of art and emotion. His mission is to create visually captivating and story-driven experiences that resonate with players long after the game ends.",
  },
];

/** Keyword → accent colour. First match wins. */
const ROLE_COLOR_MAP: Record<string, string> = {
  Founder: "#e63946",
  "Co-Founder": "#e63946",
  Designer: "#f4a261",
  Engineer: "#4cc9f0",
  Artist: "#a8dadc",
  Developer: "#90e0ef",
};

const FALLBACK_COLOR = "#e63946";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRoleColor(designation: string): string {
  for (const [keyword, color] of Object.entries(ROLE_COLOR_MAP)) {
    if (designation.includes(keyword)) return color;
  }
  return FALLBACK_COLOR;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getRoles(designation: string): string[] {
  return designation.split("|").map((s) => s.trim());
}

// ─── Arrow Icon ───────────────────────────────────────────────────────────────

const ArrowIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    className={className}
  >
    <path
      d="M2 7h10M8 3l4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ─── Creator Modal ────────────────────────────────────────────────────────────

const CreatorModal: FC<CreatorModalProps> = ({ creator, onClose }) => {
  const accentColor = getRoleColor(creator.designation);
  const roles = getRoles(creator.designation);
  const lines = creator.description.split("\n").filter(Boolean);

  useEffect(() => {
    const handleKey = (e: globalThis.KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const stopPropagation = (e: MouseEvent<HTMLDivElement>): void =>
    e.stopPropagation();

  return (
    <div
      role="dialog"
      aria-modal
      aria-label={`${creator.name} profile`}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(20px)",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={stopPropagation}
        className="relative w-full max-h-[85vh] overflow-y-auto rounded-sm"
        style={{
          maxWidth: "760px",
          background: "#0e0e0e",
          border: "1px solid rgba(255,255,255,0.08)",
          borderTop: `3px solid ${accentColor}`,
          animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Sticky header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-7 py-5"
          style={{
            background: "#0e0e0e",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center gap-3.5">
            {/* Avatar */}
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[15px] font-extrabold tracking-tight"
              style={{
                background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}11)`,
                border: `1.5px solid ${accentColor}66`,
                color: accentColor,
              }}
            >
              {getInitials(creator.name)}
            </div>

            <div>
              <p className="m-0 text-[17px] font-bold tracking-tight text-white">
                {creator.name}
              </p>
              <p
                className="m-0 mt-0.5 font-mono text-[10px] uppercase tracking-widest"
                style={{ color: accentColor }}
              >
                {roles[0]}
              </p>
            </div>
          </div>
        </div>

        {/* Role pills */}
        <div className="flex flex-wrap gap-2 px-7 pt-5">
          {roles.map((role, i) => (
            <span
              key={role}
              className="rounded-sm px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-widest"
              style={{
                background:
                  i === 0 ? `${accentColor}20` : "rgba(255,255,255,0.05)",
                color: i === 0 ? accentColor : "rgba(255,255,255,0.5)",
                border: `1px solid ${i === 0 ? `${accentColor}40` : "rgba(255,255,255,0.08)"}`,
              }}
            >
              {role}
            </span>
          ))}
        </div>

        {/* Description */}
        <div className="px-7 pb-8 pt-6">
          {lines.map((line, i) => {
            const isBullet = line.startsWith("•");
            const isHeading = line.endsWith(":") && !isBullet;
            return (
              <p
                key={i}
                className={[
                  "leading-7",
                  isHeading
                    ? "font-mono text-[11px] font-bold uppercase tracking-[0.12em]"
                    : "text-[14.5px] font-normal",
                  isBullet ? "pl-2" : "",
                ].join(" ")}
                style={{
                  color: isHeading
                    ? accentColor
                    : isBullet
                      ? "rgba(255,255,255,0.6)"
                      : "rgba(255,255,255,0.75)",
                  marginBottom: isHeading ? "8px" : "6px",
                }}
              >
                {isBullet ? `› ${line.slice(1).trim()}` : line}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Creator Card ─────────────────────────────────────────────────────────────

const CreatorCard: FC<CreatorCardProps> = ({ creator, index }) => {
  const [hovered, setHovered] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const accentColor = getRoleColor(creator.designation);
  const roles = getRoles(creator.designation);
  const shortBio = creator.description.split("\n")[0] ?? "";
  const paddedIndex = String(index + 1).padStart(2, "0");

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 },
    );
    const el = cardRef.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {showModal && (
        <CreatorModal creator={creator} onClose={() => setShowModal(false)} />
      )}

      <div
        ref={cardRef}
        role="button"
        tabIndex={0}
        aria-label={`View ${creator.name}'s profile`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setShowModal(true)}
        onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
          if (e.key === "Enter" || e.key === " ") setShowModal(true);
        }}
        className="group relative flex cursor-pointer flex-col overflow-hidden rounded-sm outline-none"
        style={{
          background: hovered ? "#141414" : "#0c0c0c",
          border: `1px solid ${hovered ? `${accentColor}40` : "rgba(255,255,255,0.06)"}`,
          boxShadow: hovered
            ? `0 0 40px ${accentColor}15, 0 20px 60px rgba(0,0,0,0.5)`
            : "0 4px 20px rgba(0,0,0,0.3)",
          transform: visible ? "translateY(0)" : "translateY(32px)",
          opacity: visible ? 1 : 0,
          transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          transitionDelay: `${index * 80}ms`,
        }}
      >
        {/* Top accent line */}
        <div
          aria-hidden
          className="absolute left-0 right-0 top-0 h-0.5 transition-opacity duration-[400ms]"
          style={{
            background: `linear-gradient(90deg, ${accentColor}, transparent)`,
            opacity: hovered ? 1 : 0.3,
          }}
        />

        {/* Index badge */}
        <div
          aria-hidden
          className="absolute right-5 top-5 z-10 select-none font-mono text-[11px] font-medium tracking-[0.05em] transition-colors duration-300"
          style={{ color: hovered ? accentColor : "rgba(255,255,255,0.15)" }}
        >
          {paddedIndex}
        </div>

        {/* ── Image ── */}
        <div className="relative aspect-[3/2]">
          {/* Fallback bg */}
          {/* <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#111]">
            <span
              aria-hidden
              className="select-none font-sans text-[52px] font-black tracking-[-0.05em]"
              style={{ color: `${accentColor}20` }}
            >
              {getInitials(creator.name)}
            </span>
          </div> */}

          {/*
            object-top — anchors the image to the top of the frame so
            faces / upper bodies are always visible regardless of crop.
          */}
          <Image
            src={creator.image}
            alt={creator.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`object-cover object-top transition-all duration-700 ${
              hovered ? "opacity-100 visible " : "opacity-0 invisible"
            }`}
            style={{
              filter: hovered
                ? "grayscale(0%) brightness(0.9)"
                : "grayscale(60%) brightness(0.7)", 
              transition:
                "filter 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
            }}
          />
          <AsciiArt
            src={creator.image}
            resolution={100}
            color="var(--color-neutral-500)"
            animationStyle="fade"
            animationDuration={1.5}
            animateOnView={false}
            className={`mx-auto aspect-square w-full max-w-lg bg-neutral-950 ${
              hovered ? "opacity-0 invisible" : "opacity-100 visible"
            }`}
          />

          {/* Bottom fade */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent to-transparent"
          />

          {/* Hover bracket — top-left */}
          <div
            aria-hidden
            className="absolute left-[18px] top-[14px] h-[18px] w-[18px] border-l-2 border-t-2 transition-all duration-[400ms]"
            style={{
              borderColor: accentColor,
              opacity: hovered ? 1 : 0,
              transform: hovered ? "translate(0,0)" : "translate(4px,-4px)",
              transitionDelay: "50ms",
            }}
          />

          {/* Hover bracket — bottom-left */}
          <div
            aria-hidden
            className="absolute bottom-[14px] left-[18px] h-[18px] w-[18px] border-b-2 border-l-2 transition-all duration-[400ms]"
            style={{
              borderColor: accentColor,
              opacity: hovered ? 1 : 0,
              transform: hovered ? "translate(0,0)" : "translate(4px,4px)",
              transitionDelay: "100ms",
            }}
          />
        </div>

        {/* ── Card body ── */}
        <div className="flex flex-grow flex-col p-[22px]">
          <h3
            className="mb-2.5 text-[19px] font-bold leading-[1.1] tracking-[-0.04em] transition-colors duration-300"
            style={{ color: hovered ? "#fff" : "#e0e0e0" }}
          >
            {creator.name}
          </h3>

          {/* Role pills */}
          <div className="mb-4 flex flex-wrap gap-[5px]">
            {roles.slice(0, 2).map((role, i) => (
              <span
                key={role}
                className="whitespace-nowrap rounded-sm px-[9px] py-[3px] font-mono text-[9.5px] uppercase tracking-[0.08em]"
                style={{
                  background:
                    i === 0 ? `${accentColor}18` : "rgba(255,255,255,0.04)",
                  color: i === 0 ? accentColor : "rgba(255,255,255,0.4)",
                  border: `1px solid ${i === 0 ? `${accentColor}35` : "rgba(255,255,255,0.07)"}`,
                }}
              >
                {role}
              </span>
            ))}
            {roles.length > 2 && (
              <span
                className="rounded-sm px-[9px] py-[3px] font-mono text-[9.5px] uppercase tracking-[0.08em]"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.3)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                +{roles.length - 2}
              </span>
            )}
          </div>

          {/* Bio snippet */}
          <p className="mb-5 line-clamp-2 text-[13px] leading-[1.65] text-white/45">
            {shortBio}
          </p>

          {/* CTA */}
          <div
            className="mt-auto flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.12em] transition-colors duration-300"
            style={{ color: hovered ? accentColor : "rgba(255,255,255,0.25)" }}
          >
            <span>View Profile</span>
            <ArrowIcon className="transition-transform duration-300" />
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const CreatorsPage: FC = () => {
  const [headerVisible, setHeaderVisible] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => setHeaderVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800;900&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        @keyframes fadeIn  { from { opacity: 0 }               to { opacity: 1 }               }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.98) }
                             to   { opacity: 1; transform: translateY(0)    scale(1)    }       }

        ::-webkit-scrollbar       { width: 4px; }
        ::-webkit-scrollbar-track { background: #080808; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
        ::selection               { background: rgba(230,57,70,0.25); color: #fff; }
      `}</style>

      <div className="min-h-screen overflow-x-hidden bg-[#080808] text-white">
        {/* Noise texture */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0 opacity-40"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Ambient glows */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        >
          <div className="absolute -left-[10%] -top-[20%] h-[50%] w-[50%] rounded-full bg-[radial-gradient(circle,rgba(230,57,70,0.06)_0%,transparent_70%)]" />
          <div className="absolute -right-[5%] bottom-[10%] h-[35%] w-[35%] rounded-full bg-[radial-gradient(circle,rgba(76,201,240,0.04)_0%,transparent_70%)]" />
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-[1280px] px-10 pb-28 pt-20">
          {/* ── Header ── */}
          <header
            className="mb-24 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              opacity: headerVisible ? 1 : 0,
              transform: headerVisible ? "translateY(0)" : "translateY(24px)",
            }}
          >
            {/* Eyebrow */}
            <div className="mb-5 flex items-center gap-3.5">
              <div aria-hidden className="flex gap-1">
                {[1, 0.6, 0.3].map((o) => (
                  <div
                    key={o}
                    className="h-1 w-1 rounded-full bg-[#e63946]"
                    style={{ opacity: o }}
                  />
                ))}
              </div>
              <span className="font-mono text-[11px] font-medium uppercase tracking-[0.25em] text-[#e63946]">
                Reborn Interactive · Studio
              </span>
            </div>

            {/* Title block */}
            <h1
              className="m-0 mb-1 font-sans font-black uppercase leading-[0.9] tracking-[-0.06em] text-white"
              style={{ fontSize: "clamp(52px, 8vw, 100px)" }}
            >
              The
            </h1>
            <h1
              className="relative m-0 inline-block font-sans font-black uppercase leading-[0.9] tracking-[-0.06em]"
              style={{
                fontSize: "clamp(52px, 8vw, 100px)",
                WebkitTextStroke: "1.5px rgba(255,255,255,0.2)",
                color: "transparent",
              }}
            >
              Creators
            </h1>

            {/* Sub-row */}
            <div className="mt-10 flex flex-wrap items-end gap-8">
              <p className="m-0 max-w-[480px] text-base leading-[1.65] text-white/45">
                The collective of visionaries, engineers, and digital architects
                crafting the next era of historical storytelling at{" "}
                <span className="font-medium text-white/75">
                  Reborn Interactive.
                </span>
              </p>
            </div>

            {/* Divider */}
            <div
              aria-hidden
              className="mt-12 h-px"
              style={{
                background:
                  "linear-gradient(90deg, rgba(230,57,70,0.3) 0%, rgba(255,255,255,0.08) 40%, transparent 100%)",
              }}
            />
          </header>

          {/* ── Grid ── */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {CARD_DATA.map((creator, index) => (
              <CreatorCard key={creator.id} creator={creator} index={index} />
            ))}
          </div>

          {/* ── CTA ── */}
          <div
            className="mt-28 flex flex-col gap-8 border-t pt-14"
            style={{ borderColor: "rgba(255,255,255,0.05)" }}
          >
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#e63946]">
                  — We&apos;re Hiring
                </p>
                <h2
                  className="m-0 font-sans font-black uppercase leading-none tracking-[-0.05em]"
                  style={{ fontSize: "clamp(32px, 4vw, 52px)" }}
                >
                  Join the{" "}
                  <span
                    style={{
                      WebkitTextStroke: "1.5px #e63946",
                      color: "transparent",
                    }}
                  >
                    Lore.
                  </span>
                </h2>
                <p className="mt-2.5 font-sans text-[15px] italic text-white/35">
                  Every legend needs a chronicler.
                </p>
              </div>

              <a
                href="#careers"
                className="group/cta inline-flex items-center gap-3 rounded-sm px-8 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-white no-underline transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(230,57,70,0.3)]"
                style={{
                  background: "transparent",
                  border: "1.5px solid rgba(255,255,255,0.15)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#e63946";
                  e.currentTarget.style.borderColor = "#e63946";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                }}
              >
                View Careers
                <ArrowIcon className="transition-transform duration-300 group-hover/cta:translate-x-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreatorsPage;
