// components/layout/VisitorTracker.tsx
"use client";

import { useVisitTracker } from "@/hooks/useVisitTracker";

export function VisitorTracker() {
  useVisitTracker();
  return null; // renders nothing, just runs the hook
}