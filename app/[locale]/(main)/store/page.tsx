"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ShoppingBag, Sparkles, ArrowRight, Mail } from "lucide-react";

export default function StorePage() {
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale || "en";

  return (
    <div className="relative min-h-screen bg-[#050507] text-zinc-200 pt-36 sm:pt-40 pb-24 overflow-x-clip flex items-center">
      {/* Ambient background glow & grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[480px] w-[820px] rounded-full bg-[#d63031]/12 blur-[150px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_75%_55%_at_50%_40%,#000_60%,transparent_100%)]"
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border border-white/10 bg-zinc-950/80 backdrop-blur-md p-8 sm:p-14 text-center space-y-8 relative overflow-hidden"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-52 w-52 rounded-full bg-[#d63031]/20 blur-[90px]"
          />

          <div className="relative z-10 flex flex-col items-center gap-5">
            <div className="h-16 w-16 rounded-2xl bg-[#d63031]/15 border border-[#d63031]/35 flex items-center justify-center shadow-[0_0_24px_rgba(214,48,49,0.25)]">
              <ShoppingBag className="w-7 h-7 text-[#d63031]" />
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#d63031]/10 border border-[#d63031]/30 text-[#d63031] font-mono text-[11px] uppercase tracking-[0.25em]">
              <Sparkles className="w-3.5 h-3.5" />
              Dropping Soon
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase italic">
              REBORN STORE<span className="text-[#d63031]">.</span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed">
              Our official studio armory is currently being curated. Digital
              editions, limited apparel drops, and collectibles will launch here
              soon.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href={`/${locale}/games`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#d63031] hover:bg-[#b92a2a] text-white text-sm font-bold transition-all shadow-lg shadow-[#d63031]/25 hover:shadow-[#d63031]/40 active:scale-95"
            >
              <span>Explore Our Games</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="mailto:info@reborninteractive.com?subject=Store%20Inquiry"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 text-sm font-semibold transition-colors"
            >
              <Mail className="w-4 h-4 text-[#d63031]" />
              <span>info@reborninteractive.com</span>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
