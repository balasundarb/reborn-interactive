"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Gamepad2,
  Sparkles,
  ArrowUpRight,
  Monitor,
  Cpu,
  Volume2,
  Layers,
  Mail,
} from "lucide-react";

type GameCategory = "All" | "Narrative" | "RPG" | "Action";

interface GameTitle {
  id: string;
  title: string;
  category: Exclude<GameCategory, "All">;
  tagline: string;
  description: string;
  status: string;
  platforms: string[];
  image: string;
  accent: string;
  featured?: boolean;
}

const GAMES: GameTitle[] = [
  {
    id: "through-her-eyes",
    title: "Through Her Eyes",
    category: "Narrative",
    tagline: "Every memory leaves a fracture.",
    description:
      "A psychological narrative adventure exploring perception, fragmented memory, and emotional resilience inside a hyper-detailed atmospheric world.",
    status: "In Development",
    platforms: ["PC", "PlayStation 5", "Xbox Series X|S"],
    image: "/assets/game/through her eyes.png",
    accent: "#d63031",
    featured: true,
  },
  {
    id: "project-neo",
    title: "Project Neo",
    category: "RPG",
    tagline: "Rewrite the neural skyline.",
    description:
      "A stylized cyberpunk action-RPG with reactive combat, branching syndicate alliances, and vertical neon-drenched districts.",
    status: "Pre-Production",
    platforms: ["PC", "Next-Gen Consoles"],
    image: "/assets/game/1.jpg",
    accent: "#06b6d4",
  },
  {
    id: "zero-gravity",
    title: "Zero Gravity",
    category: "Action",
    tagline: "Momentum is your only weapon.",
    description:
      "High-velocity orbital combat built around fluid zero-G traversal, destructible arenas, and tactical squad coordination.",
    status: "Prototype",
    platforms: ["PC"],
    image: "/assets/game/2.jpg",
    accent: "#a855f7",
  },
  {
    id: "protocol-crimson",
    title: "Protocol Crimson",
    category: "Action",
    tagline: "Silence the signal before dawn.",
    description:
      "A dark-ops tactical stealth experience combining dynamic lighting, adaptive enemy AI, and precision close-quarters mechanics.",
    status: "Concept",
    platforms: ["PC", "PlayStation 5"],
    image: "/assets/game/3.jpg",
    accent: "#d63031",
  },
];

const CATEGORIES: GameCategory[] = ["All", "Narrative", "RPG", "Action"];

export default function GamesPage() {
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale || "en";
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>("All");

  const featuredGame = GAMES.find((g) => g.featured) ?? GAMES[0];
  const filteredGames =
    selectedCategory === "All"
      ? GAMES
      : GAMES.filter((g) => g.category === selectedCategory);

  return (
    <div className="relative min-h-screen bg-[#050507] text-zinc-200 pt-36 sm:pt-40 pb-24 overflow-x-clip">
      {/* Ambient background glow & grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[480px] w-[860px] rounded-full bg-[#d63031]/12 blur-[150px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_75%_45%_at_50%_0%,#000_60%,transparent_100%)]"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 space-y-16">
        {/* Page Header */}
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-5"
        >
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-[#d63031]/10 border border-[#d63031]/30 text-[#d63031] font-mono text-[11px] uppercase tracking-[0.25em]">
            <Gamepad2 className="w-3.5 h-3.5" />
            Interactive Catalog
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase italic">
            OUR GAMES<span className="text-[#d63031]">.</span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
            Worlds engineered with atmospheric storytelling, responsive combat,
            and bespoke real-time rendering.
          </p>
        </motion.header>

        {/* Flagship Spotlight */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-3xl overflow-hidden border border-white/10 bg-zinc-950/80 backdrop-blur-md grid grid-cols-1 lg:grid-cols-12"
        >
          <div className="lg:col-span-7 relative min-h-[300px] sm:min-h-[380px] overflow-hidden bg-black">
            <video
              src="/video/Character.webm"
              autoPlay
              loop
              muted
              playsInline
              poster={featuredGame.image}
              className="absolute inset-0 w-full h-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#050507] via-[#050507]/30 to-transparent" />
            <div className="absolute top-5 left-5 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 border border-[#d63031]/50 backdrop-blur-md font-mono text-[10px] uppercase tracking-[0.25em] text-white">
              <Sparkles className="w-3 h-3 text-[#d63031]" />
              Flagship Title
            </div>
          </div>

          <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-[#d63031]/15 border border-[#d63031]/30 font-mono text-[10px] uppercase tracking-widest text-[#d63031]">
                  {featuredGame.status}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                  {featuredGame.category}
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white uppercase italic tracking-tight">
                {featuredGame.title}
              </h2>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#d63031]">
                {featuredGame.tagline}
              </p>
              <p className="text-sm sm:text-[15px] text-zinc-300 leading-relaxed">
                {featuredGame.description}
              </p>
            </div>

            <div className="space-y-5 pt-4 border-t border-white/10">
              <div className="flex flex-wrap gap-2">
                {featuredGame.platforms.map((platform) => (
                  <span
                    key={platform}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 font-mono text-[11px] text-zinc-300"
                  >
                    {platform}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/${locale}/store`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d63031] hover:bg-[#b92a2a] text-white text-sm font-bold transition-all shadow-lg shadow-[#d63031]/25 hover:shadow-[#d63031]/40 active:scale-95"
                >
                  <span>Explore Editions</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <a
                  href="mailto:info@reborninteractive.com?subject=Press%20%2F%20Through%20Her%20Eyes"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 text-sm font-semibold transition-colors"
                >
                  <Mail className="w-4 h-4 text-[#d63031]" />
                  <span>Press Inquiry</span>
                </a>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Filter Bar + Games Grid */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Studio Lineup
            </h2>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => {
                const active = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-1.5 rounded-full font-mono text-xs uppercase tracking-widest transition-all cursor-pointer ${
                      active
                        ? "bg-[#d63031] text-white shadow-[0_0_16px_rgba(214,48,49,0.45)]"
                        : "bg-white/5 text-zinc-400 border border-white/10 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredGames.map((game, idx) => (
              <motion.article
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: idx * 0.06 }}
                className="group relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-950/75 backdrop-blur-md hover:border-[#d63031]/40 transition-all duration-300"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-black">
                  <Image
                    src={game.image}
                    alt={game.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-black/75 border border-white/10 backdrop-blur-md font-mono text-[10px] uppercase tracking-widest text-zinc-200">
                      {game.category}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-[#d63031]/20 border border-[#d63031]/40 backdrop-blur-md font-mono text-[10px] uppercase tracking-widest text-white">
                      {game.status}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tight group-hover:text-[#d63031] transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {game.description}
                  </p>
                  <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      {game.platforms.map((platform) => (
                        <span
                          key={platform}
                          className="px-2 py-0.5 rounded bg-white/5 font-mono text-[10px] text-zinc-400"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/${locale}/games/${game.id}`}
                      className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-zinc-300 hover:text-[#d63031] transition-colors"
                    >
                      <span>View Title</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* Studio Tech Pillars */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Monitor, label: "Unreal Engine 5", sub: "Next-Gen Pipeline" },
            { icon: Cpu, label: "Real-Time Physics", sub: "60+ FPS Target" },
            { icon: Volume2, label: "Spatial Audio", sub: "3D Soundscapes" },
            { icon: Layers, label: "Custom Mocap", sub: "Expressive Rigging" },
          ].map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.label}
                className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 flex items-center gap-4"
              >
                <div className="h-10 w-10 rounded-xl bg-[#d63031]/15 border border-[#d63031]/30 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#d63031]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{pillar.label}</p>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                    {pillar.sub}
                  </p>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
