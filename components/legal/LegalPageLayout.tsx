import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, FileText, Cookie } from "lucide-react";

export interface LegalSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface LegalPageLayoutProps {
  locale: string;
  active: "terms" | "privacy" | "cookies";
  badge: string;
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export default function LegalPageLayout({
  locale,
  active,
  badge,
  title,
  subtitle,
  lastUpdated,
  sections,
}: LegalPageLayoutProps) {
  const navItems = [
    {
      key: "terms" as const,
      label: "Terms & Conditions",
      href: `/${locale}/terms`,
      icon: FileText,
    },
    {
      key: "privacy" as const,
      label: "Privacy Policy",
      href: `/${locale}/privacy`,
      icon: ShieldCheck,
    },
    {
      key: "cookies" as const,
      label: "Cookie Policy",
      href: `/${locale}/cookies`,
      icon: Cookie,
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#050507] text-zinc-200 pt-36 sm:pt-40 pb-24 overflow-x-clip">
      {/* Ambient background glow & subtle grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[420px] w-[780px] rounded-full bg-[#d63031]/10 blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_70%_40%_at_50%_0%,#000_60%,transparent_100%)]"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Back link */}
        <Link
          href={`/${locale}`}
          className="relative z-20 inline-flex items-center gap-2 px-3 py-1.5 -ml-3 rounded-lg text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 hover:text-white hover:bg-white/5 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#d63031] transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>

        {/* Header */}
        <header className="border-b border-white/10 pb-10 mb-12">
          <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-[#d63031]/10 border border-[#d63031]/30 text-[#d63031] font-mono text-[11px] uppercase tracking-[0.25em] mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d63031] animate-pulse" />
            {badge}
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase italic">
            {title}
            <span className="text-[#d63031]">.</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
          <p className="mt-4 font-mono text-xs uppercase tracking-widest text-zinc-500">
            Last Updated: <span className="text-zinc-300">{lastUpdated}</span>
          </p>
        </header>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Sticky Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="lg:sticky lg:top-28 space-y-6">
              {/* Policy Switcher */}
              <div className="rounded-2xl bg-zinc-950/80 border border-white/10 p-5 backdrop-blur-md">
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500 mb-3">
                  Legal Documents
                </p>
                <nav className="space-y-1.5">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.key === active;
                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? "bg-[#d63031]/15 text-white border border-[#d63031]/40 shadow-[0_0_20px_rgba(214,48,49,0.12)]"
                            : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? "text-[#d63031]" : "text-zinc-500"
                          }`}
                        />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Section Index */}
              <div className="hidden lg:block rounded-2xl bg-zinc-950/60 border border-white/10 p-5 backdrop-blur-md">
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500 mb-3">
                  On This Page
                </p>
                <ul className="space-y-2">
                  {sections.map((section, idx) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="flex items-start gap-2.5 text-xs text-zinc-400 hover:text-white transition-colors group"
                      >
                        <span className="font-mono text-[10px] text-[#d63031]/80 mt-0.5">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span className="leading-snug group-hover:translate-x-0.5 transition-transform">
                          {section.title}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* Policy Sections */}
          <div className="lg:col-span-8 space-y-6">
            {sections.map((section, idx) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-28 rounded-2xl bg-zinc-950/70 border border-white/10 p-6 sm:p-8 backdrop-blur-md hover:border-white/20 transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#d63031]/15 border border-[#d63031]/30 font-mono text-xs font-bold text-[#d63031]">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {section.title}
                  </h2>
                </div>
                <div className="space-y-3 text-sm sm:text-[15px] text-zinc-300 leading-relaxed">
                  {section.content}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
