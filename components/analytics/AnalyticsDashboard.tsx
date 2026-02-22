"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { VisitorStats } from "@/types/visitor";
import type { LucideIcon } from "lucide-react";
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Activity, Eye, Globe, TrendingUp, Monitor, Smartphone,
  Clock, MousePointerClick, RefreshCw, LogOut, Users,
  LayoutDashboard, Map as MapIcon, BarChart2, ChevronRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  user: { name?: string | null; email?: string | null; image?: string | null };
  initialStats: VisitorStats | null;
}

type TabType = "overview" | "pages" | "geo";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  iconBg: string;
  iconColor: string;
  live?: boolean;
  delay?: number;
}

interface GroupedLocation {
  country: string;
  region: string | null;
  lat: number;
  lon: number;
  count: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name?: string | number; value?: string | number; color?: string }>;
  label?: string | number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

// Dynamic values that can't be Tailwind classes
const ACCENT        = "#d63031";
const ACCENT_DIM    = "#b02020";
const ACCENT_GLOW   = "rgba(214,48,49,0.12)";
const ACCENT_BORDER = "rgba(214,48,49,0.22)";

const RED_COLORS   = ["#d63031", "#c0392b", "#992d22", "#7b241c"];
const BLUE_COLORS  = ["#74b9ff", "#0984e3", "#2980b9", "#1a5276"];
const GREEN_COLORS = ["#55efc4", "#00b894", "#00cec9", "#6c5ce7"];

const TABS: TabType[] = ["overview", "pages", "geo"];

const TEXT_MUTED  = "#71717a"; // zinc-500
const TEXT_FAINT  = "#3f3f46"; // zinc-700
const BORDER_DIM  = "rgba(255,255,255,0.06)";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(s: number): string {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r > 0 ? `${m}m ${r}s` : `${m}m`;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function pal(arr: string[], i: number): string {
  return arr[i % arr.length] ?? arr[0] ?? ACCENT;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, iconBg, iconColor, live = false, delay = 0 }: StatCardProps) {
  return (
    <div
      className="group rounded-2xl p-5 border transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: "#111114",
        borderColor: BORDER_DIM,
        animationDelay: `${delay}ms`,
        animation: "fadeup 0.45s ease both",
      }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: iconBg }}
        >
          <Icon size={16} color={iconColor} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-2">
            <span
              className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: TEXT_MUTED }}
            >
              {label}
            </span>
            {live && (
              <span
                className="w-1.5 h-1.5 rounded-full bg-green-400"
                style={{ boxShadow: "0 0 6px #4ade80", animation: "livepulse 1.5s infinite" }}
              />
            )}
          </div>
          <div
            className="text-3xl font-black tracking-tight leading-none"
            style={{ color: "#f4f4f5", fontFamily: "'JetBrains Mono', monospace" }}
          >
            {value}
          </div>
          {sub && (
            <div
              className="mt-1 text-[10px]"
              style={{ color: TEXT_FAINT, fontFamily: "'JetBrains Mono', monospace" }}
            >
              {sub}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl p-6 border transition-colors duration-200 ${className}`}
      style={{ background: "#111114", borderColor: BORDER_DIM }}
    >
      {children}
    </div>
  );
}

function CardTitle({ children, badge }: { children: React.ReactNode; badge?: string }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <span
        className="text-[11px] font-bold uppercase tracking-widest"
        style={{ color: TEXT_MUTED }}
      >
        {children}
      </span>
      {badge && (
        <span
          className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
          style={{
            color: TEXT_MUTED,
            borderColor: BORDER_DIM,
            background: "rgba(255,255,255,0.03)",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3.5 py-2.5 text-xs border"
      style={{
        background: "#18181b",
        borderColor: "rgba(255,255,255,0.1)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        fontFamily: "'JetBrains Mono', monospace",
        minWidth: 120,
      }}
    >
      {label !== undefined && (
        <p
          className="text-[10px] uppercase tracking-widest mb-1.5"
          style={{ color: TEXT_MUTED }}
        >
          {String(label)}
        </p>
      )}
      {payload.map((p, i) => (
        <div key={i} className="flex justify-between gap-3 mt-0.5">
          <span style={{ color: TEXT_MUTED }}>{p.name}</span>
          <strong style={{ color: "#f4f4f5" }}>{p.value}</strong>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon: Icon, text = "No data yet" }: { icon?: LucideIcon; text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-xs font-medium" style={{ color: TEXT_FAINT }}>
      {Icon && <Icon size={22} />}
      <span>{text}</span>
    </div>
  );
}

function BarRow({
  label, count, max, color = ACCENT,
}: { label: string; count: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div
      className="flex items-center gap-3 py-1.5 border-b last:border-b-0"
      style={{ borderColor: TEXT_FAINT + "40" }}
    >
      <span
        className="w-28 shrink-0 text-xs font-medium truncate"
        style={{ color: "#a1a1aa" }}
      >
        {label}
      </span>
      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color, opacity: 0.85 }}
        />
      </div>
      <span
        className="w-8 text-right text-xs font-semibold shrink-0"
        style={{ color: "#a1a1aa", fontFamily: "'JetBrains Mono', monospace" }}
      >
        {count}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AnalyticsDashboard({ user, initialStats }: Props) {
  const [stats, setStats]             = useState<VisitorStats | null>(initialStats);
  const [loading, setLoading]         = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [activeTab, setActiveTab]     = useState<TabType>("overview");
  const [mounted, setMounted]         = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const fetchStats = useCallback(async (silent = false): Promise<void> => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/analytics/stats");
      if (res.ok) {
        setStats((await res.json()) as VisitorStats);
        setLastUpdated(new Date());
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialStats) void fetchStats();
    const iv = setInterval(() => void fetchStats(true), 30_000);
    return () => clearInterval(iv);
  }, [fetchStats, initialStats]);

  const groupedLocations = useMemo<GroupedLocation[]>(() => {
    if (!stats?.locations) return [];
    const map = new Map<string, GroupedLocation>();
    stats.locations.forEach((loc) => {
      const key = `${loc.lat.toFixed(3)},${loc.lon.toFixed(3)}`;
      const e = map.get(key);
      if (e) { e.count++; }
      else map.set(key, { country: loc.country, region: loc.region, lat: loc.lat, lon: loc.lon, count: 1 });
    });
    return Array.from(map.values());
  }, [stats?.locations]);

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0] ?? "").join("").toUpperCase().slice(0, 2)
    : (user.email?.[0]?.toUpperCase() ?? "A");

  const handleSignOut = async (): Promise<void> => {
    await fetch("/api/auth/sign-out", { method: "POST" });
    window.location.href = "/";
  };

  const refMax = stats?.referrers[0]?.count ?? 1;

  // Axis tick style shared across all charts
  const axisTick = { fontSize: 10, fill: TEXT_MUTED, fontFamily: "JetBrains Mono" };

  return (
    <>
      {/* Keyframes — only what Tailwind can't do */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        @keyframes fadeup {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes livepulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.35; }
        }
        @keyframes loadbar {
          0%   { width: 0%;  left: 0; }
          50%  { width: 55%; left: 22%; }
          100% { width: 0%;  left: 100%; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinning svg { animation: spin 0.8s linear infinite; }
        .fade-in { animation: fadeup 0.35s ease both; }
      `}</style>

      {/* ── Root ── */}
      <div
        className="min-h-screen overflow-x-hidden relative"
        style={{ background: "#0a0a0b", fontFamily: "'Outfit', sans-serif", color: "#f4f4f5" }}
      >
        {/* Accent glow */}
        <div
          className="fixed pointer-events-none z-0"
          style={{
            top: -120, right: -120,
            width: 480, height: 480,
            background: "radial-gradient(circle, rgba(214,48,49,0.07) 0%, transparent 65%)",
          }}
        />

        {/* Loading bar */}
        {loading && (
          <div
            className="fixed top-0 left-0 h-0.5 z-50"
            style={{ background: `linear-gradient(90deg, ${ACCENT}, #ff6b6b)`, animation: "loadbar 1.2s ease infinite" }}
          />
        )}

        {/* ── Topbar ── */}
        <header
          className="sticky top-0 z-40 flex items-center justify-between px-7 h-14 border-b"
          style={{
            background: "rgba(10,10,11,0.9)",
            backdropFilter: "blur(20px)",
            borderColor: BORDER_DIM,
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5 text-[13px] font-bold uppercase tracking-widest" style={{ color: "#f4f4f5" }}>
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: ACCENT, boxShadow: `0 0 14px ${ACCENT}60` }}
            >
              <LayoutDashboard size={13} color="#fff" />
            </div>
            Adminpanel
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Refresh */}
            <button
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200 ${loading ? "spinning" : ""}`}
              style={{ borderColor: BORDER_DIM, color: TEXT_MUTED, background: "transparent" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = ACCENT_BORDER;
                (e.currentTarget as HTMLButtonElement).style.color = ACCENT;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = BORDER_DIM;
                (e.currentTarget as HTMLButtonElement).style.color = TEXT_MUTED;
              }}
              onClick={() => void fetchStats(false)}
            >
              <RefreshCw size={12} />
              Refresh
            </button>

            {/* User */}
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DIM})`, boxShadow: `0 0 10px ${ACCENT}40` }}
              >
                {initials}
              </div>
              <span className="text-sm font-medium" style={{ color: TEXT_MUTED }}>
                {user.name ?? user.email}
              </span>
            </div>

            {/* Sign out */}
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200"
              style={{ borderColor: `${ACCENT}30`, color: `${ACCENT}aa`, background: "transparent" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = `${ACCENT}10`;
                (e.currentTarget as HTMLButtonElement).style.color = ACCENT;
                (e.currentTarget as HTMLButtonElement).style.borderColor = ACCENT;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = `${ACCENT}aa`;
                (e.currentTarget as HTMLButtonElement).style.borderColor = `${ACCENT}30`;
              }}
              onClick={() => void handleSignOut()}
            >
              <LogOut size={12} />
              Sign out
            </button>
          </div>
        </header>

        {/* ── Body ── */}
        <main className="relative z-10 max-w-screen-xl mx-auto px-7 pt-9 pb-20">

          {/* Heading */}
          <div className="mb-9" style={{ animation: "fadeup 0.5s ease both" }}>
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "#f4f4f5", letterSpacing: "-0.03em" }}>
              Visitor{" "}
              <em className="not-italic font-black" style={{ color: ACCENT }}>Analytics</em>
            </h1>
            <p
              className="mt-2 text-xs flex items-center gap-2"
              style={{ color: TEXT_MUTED, fontFamily: "'JetBrains Mono', monospace" }}
            >
              <span>Last updated: {mounted ? lastUpdated.toLocaleTimeString() : "—"}</span>
              <span className="w-1 h-1 rounded-full inline-block" style={{ background: TEXT_FAINT }} />
              <span>Refreshes every 30s</span>
            </p>
          </div>

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3 mb-7">
            <StatCard icon={Activity}          label="Active Now"     value={stats?.activeNow ?? 0}                         iconBg="rgba(74,222,128,0.12)"  iconColor="#4ade80" live  delay={0}   />
            <StatCard icon={Eye}               label="Today"          value={formatNumber(stats?.today ?? 0)}                iconBg="rgba(56,189,248,0.12)"  iconColor="#38bdf8"       delay={50}  />
            <StatCard icon={TrendingUp}        label="This Week"      value={formatNumber(stats?.week ?? 0)}                 iconBg="rgba(129,140,248,0.12)" iconColor="#818cf8"       delay={100} />
            <StatCard icon={Users}             label="This Month"     value={formatNumber(stats?.month ?? 0)}                iconBg="rgba(251,146,60,0.12)"  iconColor="#fb923c"       delay={150} />
            <StatCard icon={Globe}             label="Total Visitors" value={formatNumber(stats?.totalVisitors ?? 0)}        iconBg={ACCENT_GLOW}            iconColor={ACCENT}        delay={200} />
            <StatCard icon={MousePointerClick} label="Page Views"     value={formatNumber(stats?.totalPageViews ?? 0)}       iconBg="rgba(232,121,249,0.12)" iconColor="#e879f9"       delay={250} />
            <StatCard icon={Clock}             label="Avg Duration"   value={formatDuration(stats?.avgSessionDuration ?? 0)} iconBg="rgba(45,212,191,0.12)"  iconColor="#2dd4bf" sub="per session" delay={300} />
            <StatCard
              icon={ChevronRight}
              label="Bounce Rate"
              value={`${stats?.bounceRate ?? 0}%`}
              sub="single-page"
              iconBg={(stats?.bounceRate ?? 0) > 60 ? ACCENT_GLOW : "rgba(45,212,191,0.12)"}
              iconColor={(stats?.bounceRate ?? 0) > 60 ? ACCENT : "#2dd4bf"}
              delay={350}
            />
          </div>

          {/* ── Tabs ── */}
          <div
            className="flex gap-0.5 p-1 rounded-xl border w-fit mb-6"
            style={{ background: "#111114", borderColor: BORDER_DIM }}
          >
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 border border-transparent"
                style={
                  activeTab === tab
                    ? { background: ACCENT_GLOW, color: ACCENT, borderColor: ACCENT_BORDER, fontWeight: 600 }
                    : { color: TEXT_MUTED }
                }
              >
                {tab === "overview" && <BarChart2 size={13} />}
                {tab === "pages"    && <MousePointerClick size={13} />}
                {tab === "geo"      && <MapIcon size={13} />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* ══════════════ OVERVIEW ══════════════ */}
          {activeTab === "overview" && (
            <div className="fade-in space-y-3.5">

              {/* Daily growth — full width */}
              <Card>
                <CardTitle badge="30 days">Daily Visitors & Page Views</CardTitle>
                {stats?.dailyGrowth?.length ? (
                  <ResponsiveContainer width="100%" height={210}>
                    <AreaChart data={stats.dailyGrowth} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={ACCENT}   stopOpacity={0.25} />
                          <stop offset="95%" stopColor={ACCENT}   stopOpacity={0}    />
                        </linearGradient>
                        <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#818cf8" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#818cf8" stopOpacity={0}   />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="date"  tick={axisTick} tickLine={false} axisLine={false} />
                      <YAxis                 tick={axisTick} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11, color: TEXT_MUTED, paddingTop: 8 }} />
                      <Area type="monotone" dataKey="visitors"  name="Visitors"   stroke={ACCENT}   strokeWidth={2} fill="url(#gV)" dot={false} />
                      <Area type="monotone" dataKey="pageViews" name="Page Views" stroke="#818cf8" strokeWidth={2} fill="url(#gP)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <EmptyState icon={BarChart2} text="No data in the last 30 days" />}
              </Card>

              {/* Hourly | Devices | Browsers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">

                {/* Hourly */}
                <Card>
                  <CardTitle badge="24h">Hourly Trend</CardTitle>
                  {stats?.hourlyTrend?.length ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={stats.hourlyTrend} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis dataKey="hour" tick={{ ...axisTick, fontSize: 9 }} tickLine={false} axisLine={false} />
                        <YAxis                tick={{ ...axisTick, fontSize: 9 }} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" name="Visits" fill={ACCENT} radius={[3, 3, 0, 0]} opacity={0.8} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <EmptyState icon={Activity} />}
                </Card>

                {/* Devices */}
                <Card>
                  <CardTitle>Devices</CardTitle>
                  {stats?.devices?.length ? (
                    <>
                      <ResponsiveContainer width="100%" height={130}>
                        <PieChart>
                          <Pie data={stats.devices} dataKey="count" nameKey="device" cx="50%" cy="50%" outerRadius={58} innerRadius={34} paddingAngle={3}>
                            {stats.devices.map((_, i) => <Cell key={i} fill={pal(RED_COLORS, i)} />)}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-3 space-y-0">
                        {stats.devices.map((d, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 py-1.5 border-b last:border-b-0"
                            style={{ borderColor: TEXT_FAINT + "40" }}
                          >
                            <div className="flex items-center gap-1.5 w-28 shrink-0">
                              {d.device === "Mobile"
                                ? <Smartphone size={11} color={pal(RED_COLORS, i)} />
                                : <Monitor    size={11} color={pal(RED_COLORS, i)} />}
                              <span className="text-xs font-medium truncate" style={{ color: "#a1a1aa" }}>{d.device}</span>
                            </div>
                            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${d.percentage}%`, background: pal(RED_COLORS, i), opacity: 0.85 }} />
                            </div>
                            <span className="text-xs font-semibold w-8 text-right shrink-0" style={{ color: "#a1a1aa", fontFamily: "'JetBrains Mono', monospace" }}>{d.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : <EmptyState icon={Monitor} />}
                </Card>

                {/* Browsers */}
                <Card>
                  <CardTitle>Browsers</CardTitle>
                  {stats?.browsers?.length ? (
                    <>
                      <ResponsiveContainer width="100%" height={130}>
                        <PieChart>
                          <Pie data={stats.browsers} dataKey="count" nameKey="browser" cx="50%" cy="50%" outerRadius={58} innerRadius={34} paddingAngle={3}>
                            {stats.browsers.map((_, i) => <Cell key={i} fill={pal(BLUE_COLORS, i)} />)}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-3">
                        {stats.browsers.map((b, i) => (
                          <BarRow key={i} label={b.browser} count={b.count} max={stats.browsers[0]?.count ?? 1} color={pal(BLUE_COLORS, i)} />
                        ))}
                      </div>
                    </>
                  ) : <EmptyState />}
                </Card>
              </div>

              {/* OS | Referrers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <Card>
                  <CardTitle>Operating Systems</CardTitle>
                  {stats?.operatingSystems?.length ? (
                    stats.operatingSystems.map((os, i) => (
                      <BarRow key={i} label={os.os} count={os.count} max={stats.operatingSystems[0]?.count ?? 1} color={pal(GREEN_COLORS, i)} />
                    ))
                  ) : <EmptyState icon={Monitor} />}
                </Card>

                <Card>
                  <CardTitle badge="30 days">Top Referrers</CardTitle>
                  {stats?.referrers?.length ? (
                    stats.referrers.slice(0, 6).map((r, i) => (
                      <BarRow key={i} label={r.referrer.replace(/https?:\/\/(www\.)?/, "").slice(0, 30)} count={r.count} max={refMax} color={ACCENT} />
                    ))
                  ) : <EmptyState text="No referrer data yet" />}
                </Card>
              </div>
            </div>
          )}

          {/* ══════════════ PAGES ══════════════ */}
          {activeTab === "pages" && (
            <div className="fade-in space-y-3.5">
              <Card>
                <CardTitle badge="30 days">Top Pages</CardTitle>
                {stats?.topPages?.length ? (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        {["Page", "Views", "Avg Duration"].map((h) => (
                          <th
                            key={h}
                            className="text-left text-[10px] font-bold uppercase tracking-widest pb-3 border-b"
                            style={{ color: TEXT_MUTED, borderColor: BORDER_DIM }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stats.topPages.map((p, i) => (
                        <tr key={i} className="border-b last:border-b-0" style={{ borderColor: TEXT_FAINT + "40" }}>
                          <td className="py-2.5 text-sm font-medium pr-4" style={{ color: "#f4f4f5" }}>{p.pathname}</td>
                          <td className="py-2.5 text-sm font-bold" style={{ color: ACCENT, fontFamily: "'JetBrains Mono', monospace" }}>{p.views.toLocaleString()}</td>
                          <td className="py-2.5 text-sm" style={{ color: "#a1a1aa", fontFamily: "'JetBrains Mono', monospace" }}>{formatDuration(p.avgDuration)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <EmptyState icon={MousePointerClick} text="No page view data yet" />}
              </Card>

              <Card>
                <CardTitle badge="7 days">Peak Hours</CardTitle>
                {stats?.peakHours?.length ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.peakHours} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="hour" tickFormatter={(h: number) => `${h}:00`} tick={axisTick} tickLine={false} axisLine={false} />
                      <YAxis tick={axisTick} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Visits" fill={ACCENT} radius={[4, 4, 0, 0]} opacity={0.8} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyState />}
              </Card>
            </div>
          )}

          {/* ══════════════ GEO ══════════════ */}
          {activeTab === "geo" && (
            <div className="fade-in space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">

                {/* Countries */}
                <Card>
                  <CardTitle badge="30 days">Top Countries</CardTitle>
                  {stats?.topCountries?.length ? (
                    stats.topCountries.map((c, i) => (
                      <div key={i} className="flex items-center gap-3 py-2 border-b last:border-b-0" style={{ borderColor: TEXT_FAINT + "40" }}>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate" style={{ color: "#f4f4f5" }}>{c.country}</div>
                          <div className="text-[10px] mt-0.5" style={{ color: TEXT_MUTED, fontFamily: "'JetBrains Mono', monospace" }}>{c.percentage}% of total</div>
                        </div>
                        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${c.percentage}%`, background: ACCENT, opacity: 0.85 }} />
                        </div>
                        <span className="text-sm font-bold shrink-0" style={{ color: ACCENT, fontFamily: "'JetBrains Mono', monospace" }}>{c.visitors}</span>
                      </div>
                    ))
                  ) : <EmptyState icon={Globe} text="No location data yet" />}
                </Card>

                {/* Regions */}
                <Card>
                  <CardTitle badge="30 days">Top Regions</CardTitle>
                  {stats?.topRegions?.length ? (
                    stats.topRegions.map((r, i) => (
                      <div key={i} className="flex items-center gap-3 py-2 border-b last:border-b-0" style={{ borderColor: TEXT_FAINT + "40" }}>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate" style={{ color: "#f4f4f5" }}>{r.region}</div>
                          <div className="text-[10px] mt-0.5" style={{ color: TEXT_MUTED, fontFamily: "'JetBrains Mono', monospace" }}>{r.percentage}%</div>
                        </div>
                        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${r.percentage}%`, background: "#818cf8", opacity: 0.85 }} />
                        </div>
                        <span className="text-sm font-bold shrink-0" style={{ color: "#818cf8", fontFamily: "'JetBrains Mono', monospace" }}>{r.visitors}</span>
                      </div>
                    ))
                  ) : <EmptyState />}
                </Card>
              </div>

              {/* Location tags */}
              {groupedLocations.length > 0 && (
                <Card>
                  <CardTitle badge={`${groupedLocations.length} spots`}>Visitor Locations</CardTitle>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {[...groupedLocations]
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 48)
                      .map((loc, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-full text-[11px] font-medium border"
                          style={{
                            background: "rgba(214,48,49,0.06)",
                            borderColor: "rgba(214,48,49,0.16)",
                            color: "#a1a1aa",
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          {loc.region ? `${loc.region}, ` : ""}{loc.country}
                          {loc.count > 1 && <span style={{ color: TEXT_MUTED, marginLeft: 3 }}>×{loc.count}</span>}
                        </span>
                      ))}
                  </div>
                </Card>
              )}
            </div>
          )}

        </main>
      </div>
    </>
  );
}