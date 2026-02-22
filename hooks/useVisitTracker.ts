"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// ─── Config ───────────────────────────────────────────────────────────────────

const TRACK_ENDPOINT = "/api/analytics/track";
const PING_INTERVAL = 30_000; // 30 seconds (keeps session "active")
const SESSION_KEY = "va_session_id";

// ─── Session ID ───────────────────────────────────────────────────────────────

function getSessionId(): string {
  if (typeof window === "undefined") return "";

  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    // Fall back to localStorage so it survives multiple tabs but resets on
    // browser close if you switch the key to sessionStorage-only below.
    id = localStorage.getItem(SESSION_KEY);
  }
  if (!id) {
    id = crypto.randomUUID();
    try {
      sessionStorage.setItem(SESSION_KEY, id);
      localStorage.setItem(SESSION_KEY, id);
    } catch {
      // Private browsing — carry on
    }
  }
  return id;
}

// ─── Core send ────────────────────────────────────────────────────────────────

async function sendTrack(payload: Record<string, unknown>): Promise<string | null> {
  try {
    const res = await fetch(TRACK_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // keepalive so it fires even during page unload
      keepalive: true,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.pageViewId ?? null;
  } catch {
    return null;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useVisitTracker() {
  const pathname = usePathname();
  const sessionIdRef = useRef<string>("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pageViewIdRef = useRef<string | null>(null);
  const pageStartRef = useRef<number>(Date.now());

  // Init session ID once
  useEffect(() => {
    sessionIdRef.current = getSessionId();
  }, []);

  // Track page views + duration whenever pathname changes
  useEffect(() => {
    if (!sessionIdRef.current) return;

    // Send duration for the *previous* page before tracking the new one
    const prevPageViewId = pageViewIdRef.current;
    const prevStart = pageStartRef.current;

    if (prevPageViewId) {
      const duration = Math.round((Date.now() - prevStart) / 1000);
      sendTrack({
        sessionId: sessionIdRef.current,
        pageViewId: prevPageViewId,
        duration,
        pathname,
      });
    }

    // Track the new page view
    pageStartRef.current = Date.now();
    pageViewIdRef.current = null;

    sendTrack({
      sessionId: sessionIdRef.current,
      pathname,
      title: document.title,
      referrer: document.referrer || null,
    }).then((pvId) => {
      pageViewIdRef.current = pvId;
    });
  }, [pathname]);

  // Keep-alive ping every 30s
  useEffect(() => {
    if (!sessionIdRef.current) return;

    // Clear any existing interval
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      if (document.visibilityState === "hidden") return; // don't ping hidden tabs
      sendTrack({
        sessionId: sessionIdRef.current,
        pathname,
        title: document.title,
        referrer: null,
      });
    }, PING_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pathname]);

  // Send final duration on tab close / navigation away
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!sessionIdRef.current || !pageViewIdRef.current) return;
      const duration = Math.round((Date.now() - pageStartRef.current) / 1000);
      // sendBeacon is fire-and-forget, perfect for unload
      navigator.sendBeacon(
        TRACK_ENDPOINT,
        JSON.stringify({
          sessionId: sessionIdRef.current,
          pageViewId: pageViewIdRef.current,
          duration,
          pathname,
        })
      );
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleBeforeUnload();
      }
    };

    window.addEventListener("pagehide", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pathname]);
}