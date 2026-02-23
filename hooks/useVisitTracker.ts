"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// ─────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────

const TRACK_ENDPOINT = "/api/analytics/track";
const PING_INTERVAL  = 30_000;
const SESSION_KEY    = "reborn_va_session_id";
const LOCALE_RE      = /^\/(en|ta|fr|de|es|ja|ko|zh|ar|pt|ru|hi)(?=\/|$)/;
const DEDUP_WINDOW_MS = 1000;


// ─────────────────────────────────────────────────────────────
// StrictMode-safe module state (NOT inside component)
// ─────────────────────────────────────────────────────────────

let _lastTrackedPath: string | null = null;
let _lastTrackedTime = 0;
let _inflightPath: string | null = null;


// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";

  let id =
    sessionStorage.getItem(SESSION_KEY) ??
    localStorage.getItem(SESSION_KEY);

  if (!id) {
    id = crypto.randomUUID();
    try {
      sessionStorage.setItem(SESSION_KEY, id);
      localStorage.setItem(SESSION_KEY, id);
    } catch {
      // ignore private mode failures
    }
  }

  return id;
}

function stripLocale(path: string): string {
  return path.replace(LOCALE_RE, "") || "/";
}

async function sendTrack(
  payload: Record<string, unknown>
): Promise<string | null> {
  try {
    const res = await fetch(TRACK_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });

    if (!res.ok) return null;

    const data = (await res.json()) as { pageViewId?: string };
    return data.pageViewId ?? null;
  } catch {
    return null;
  }
}


// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────

export function useVisitTracker() {
  const rawPathname = usePathname();
  const pathname = stripLocale(rawPathname);

  const pageViewIdRef = useRef<string | null>(null);
  const pageStartRef  = useRef<number>(Date.now());
  const intervalRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  // ───────────────────────────────────────────────────────────
  // Pageview Tracking (StrictMode-safe)
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    const sid = getOrCreateSessionId();
    if (!sid) return;

    const now = Date.now();

    // Dedup within short time window (StrictMode protection)
    if (
      _lastTrackedPath === pathname &&
      now - _lastTrackedTime < DEDUP_WINDOW_MS
    ) {
      return;
    }

    // Prevent duplicate inflight calls
    if (_inflightPath === pathname) return;

    // Send duration for previous page (if exists)
    if (pageViewIdRef.current && _lastTrackedPath !== pathname) {
      const duration = Math.round(
        (now - pageStartRef.current) / 1000
      );

      void sendTrack({
        type: "duration",
        sessionId: sid,
        pageViewId: pageViewIdRef.current,
        duration,
      });
    }

    _inflightPath = pathname;
    _lastTrackedPath = pathname;
    _lastTrackedTime = now;

    pageStartRef.current = now;
    pageViewIdRef.current = null;

    void sendTrack({
      type: "pageview",
      sessionId: sid,
      pathname,
      title: document.title,
      referrer: document.referrer || null,
    }).then((pvId) => {
      pageViewIdRef.current = pvId;
      _inflightPath = null;
    });

  }, [pathname]);


  // ───────────────────────────────────────────────────────────
  // Keepalive Ping
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const sid = getOrCreateSessionId();
      if (!sid || document.visibilityState === "hidden") return;

      void sendTrack({
        type: "ping",
        sessionId: sid,
      });
    }, PING_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pathname]);


  // ───────────────────────────────────────────────────────────
  // Flush Duration on Page Hide / Close
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    const flush = () => {
      const sid = getOrCreateSessionId();
      if (!sid || !pageViewIdRef.current) return;

      const duration = Math.round(
        (Date.now() - pageStartRef.current) / 1000
      );

      navigator.sendBeacon(
        TRACK_ENDPOINT,
        JSON.stringify({
          type: "duration",
          sessionId: sid,
          pageViewId: pageViewIdRef.current,
          duration,
        })
      );
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };

    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [pathname]);
}