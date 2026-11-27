import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Gamepad2,
  Mail,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface GameDetail {
  slug: string;
  title: string;
  category: string;
  tagline: string;
  description: string;
  overview: string;
  status: string;
  engine: string;
  platforms: string[];
  image: string;
  video?: string;
  features: string[];
}

const GAME_CATALOG: Record<string, GameDetail> = {
  "through-her-eyes": {
    slug: "through-her-eyes",
    title: "Through Her Eyes",
    category: "Narrative Adventure",
    tagline: "Every memory leaves a fracture.",
    description:
      "A psychological narrative adventure exploring perception, fragmented memory, and emotional resilience inside a hyper-detailed atmospheric world.",
    overview:
      "Step into shifting perspectives where every remembered detail alters the environment around you. Built with real-time lighting, expressive performance capture, and an adaptive spatial score, Through Her Eyes invites players to piece together truth from fractured recollections.",
    status: "In Development",
    engine: "Unreal Engine 5",
    platforms: ["PC", "PlayStation 5", "Xbox Series X|S"],
    image: "/assets/game/through her eyes.png",
    video: "/video/Character.webm",
    features: [
      "Dual-perspective environmental storytelling and memory reconstruction",
      "Dynamic lighting and atmosphere that react to emotional state",
      "Full motion-captured character performances and spatial audio",
      "Branching narrative choices with meaningful story consequences",
    ],
  },
  "project-neo": {
    slug: "project-neo",
    title: "Project Neo",
    category: "Cyberpunk RPG",
    tagline: "Rewrite the neural skyline.",
    description:
      "A stylized cyberpunk action-RPG with reactive combat, branching syndicate alliances, and vertical neon-drenched districts.",
    overview:
      "Navigate a fractured megacity controlled by competing neural syndicates. Customize your cybernetic loadout, forge fragile alliances, and master high-mobility combat across towering vertical districts.",
    status: "Pre-Production",
    engine: "Unreal Engine 5",
    platforms: ["PC", "Next-Gen Consoles"],
    image: "/assets/game/1.jpg",
    features: [
      "Fluid melee and ranged cybernetic combat system",
      "Vertical open-district exploration and traversal",
      "Reputation-driven faction quests and multiple endings",
      "Original synthwave & industrial electronic soundtrack",
    ],
  },
  "zero-gravity": {
    slug: "zero-gravity",
    title: "Zero Gravity",
    category: "Action Shooter",
    tagline: "Momentum is your only weapon.",
    description:
      "High-velocity orbital combat built around fluid zero-G traversal, destructible arenas, and tactical squad coordination.",
    overview:
      "Take the fight into zero-gravity orbital stations where every shot generates recoil and every surface is a potential launchpad. Designed for tight competitive gunplay and 360-degree spatial awareness.",
    status: "Prototype",
    engine: "Unreal Engine 5",
    platforms: ["PC"],
    image: "/assets/game/2.jpg",
    features: [
      "True 6-DOF zero-gravity movement and grapple mechanics",
      "Tactical squad abilities and destructible micro-cover",
      "Low-latency competitive arena netcode",
      "Dynamic decompression and environmental hazards",
    ],
  },
  "protocol-crimson": {
    slug: "protocol-crimson",
    title: "Protocol Crimson",
    category: "Tactical Stealth",
    tagline: "Silence the signal before dawn.",
    description:
      "A dark-ops tactical stealth experience combining dynamic lighting, adaptive enemy AI, and precision close-quarters mechanics.",
    overview:
      "Infiltrate high-security black sites under cover of darkness. Manipulate power grids, outsmart coordinated AI patrols, and execute silent objectives with surgical precision.",
    status: "Concept",
    engine: "Unreal Engine 5",
    platforms: ["PC", "PlayStation 5"],
    image: "/assets/game/3.jpg",
    features: [
      "Real-time shadow & sound propagation stealth systems",
      "Adaptive squad AI that responds to missing patrols",
      "Multiple infiltration routes and gadget loadouts",
      "High-stakes non-lethal or tactical completion paths",
    ],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const game = GAME_CATALOG[slug];
  if (!game) {
    return { title: "Game Not Found" };
  }
  return {
    title: game.title,
    description: game.description,
    alternates: {
      canonical: `/${locale}/games/${slug}`,
    },
    openGraph: {
      title: `${game.title} | Re-born Interactive`,
      description: game.description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${game.title} | Re-born Interactive`,
      description: game.description,
    },
  };
}

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const game = GAME_CATALOG[slug];

  if (!game) {
    notFound();
  }

  return (
    <div className="relative min-h-screen bg-[#050507] text-zinc-200 pt-36 sm:pt-40 pb-24 overflow-x-clip">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[480px] w-[860px] rounded-full bg-[#d63031]/12 blur-[150px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_75%_45%_at_50%_0%,#000_60%,transparent_100%)]"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 space-y-12">
        <Link
          href={`/${locale}/games`}
          className="relative z-20 inline-flex items-center gap-2 px-3 py-1.5 -ml-3 rounded-lg text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 hover:text-white hover:bg-white/5 transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#d63031] transition-transform group-hover:-translate-x-1" />
          Back to Games
        </Link>

        {/* Hero Card */}
        <div className="rounded-3xl overflow-hidden border border-white/10 bg-zinc-950/80 backdrop-blur-md">
          <div className="relative aspect-[16/9] sm:aspect-[21/9] bg-black overflow-hidden">
            {game.video ? (
              <video
                src={game.video}
                autoPlay
                loop
                muted
                playsInline
                poster={game.image}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <Image
                src={game.image}
                alt={game.title}
                fill
                sizes="(max-width: 1200px) 100vw, 1152px"
                priority
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/35 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d63031]/20 border border-[#d63031]/45 backdrop-blur-md font-mono text-[10px] uppercase tracking-widest text-white">
                  <Sparkles className="w-3 h-3 text-[#d63031]" />
                  {game.status}
                </span>
                <span className="px-3 py-1 rounded-full bg-black/70 border border-white/15 backdrop-blur-md font-mono text-[10px] uppercase tracking-widest text-zinc-300">
                  {game.category}
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white uppercase italic tracking-tight">
                {game.title}
                <span className="text-[#d63031]">.</span>
              </h1>
              <p className="font-mono text-xs sm:text-sm uppercase tracking-[0.22em] text-[#d63031]">
                {game.tagline}
              </p>
            </div>
          </div>

          <div className="p-8 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Overview
                </h2>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                  {game.overview}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Key Highlights
                </h2>
                <ul className="space-y-2.5">
                  {game.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm text-zinc-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#d63031] shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <aside className="lg:col-span-4 space-y-5">
              <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.22em] text-zinc-400">
                  <Gamepad2 className="w-4 h-4 text-[#d63031]" />
                  <span>Title Specs</span>
                </div>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4 border-b border-white/10 pb-2">
                    <dt className="text-zinc-500">Genre</dt>
                    <dd className="font-medium text-white text-right">
                      {game.category}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-white/10 pb-2">
                    <dt className="text-zinc-500">Status</dt>
                    <dd className="font-medium text-[#d63031] text-right">
                      {game.status}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-white/10 pb-2">
                    <dt className="text-zinc-500">Engine</dt>
                    <dd className="font-medium text-white text-right">
                      {game.engine}
                    </dd>
                  </div>
                  <div className="space-y-2 pt-1">
                    <dt className="text-zinc-500">Platforms</dt>
                    <dd className="flex flex-wrap gap-1.5">
                      {game.platforms.map((platform) => (
                        <span
                          key={platform}
                          className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono text-[11px] text-zinc-300"
                        >
                          {platform}
                        </span>
                      ))}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="flex flex-col gap-3">
                <a
                  href={`mailto:info@reborninteractive.com?subject=${encodeURIComponent(
                    `Inquiry: ${game.title}`
                  )}`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#d63031] hover:bg-[#b92a2a] text-white text-sm font-bold transition-all shadow-lg shadow-[#d63031]/25"
                >
                  <Mail className="w-4 h-4" />
                  <span>Press &amp; Partner Inquiry</span>
                </a>
                <Link
                  href={`/${locale}/games`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 text-sm font-semibold transition-colors"
                >
                  <span>All Studio Titles</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
