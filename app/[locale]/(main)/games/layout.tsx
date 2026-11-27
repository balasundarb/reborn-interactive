import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Games",
  description:
    "Explore Re-born Interactive's catalog of atmospheric and narrative-driven games including Through Her Eyes, Project Neo, Zero Gravity, and Protocol Crimson.",
  alternates: {
    canonical: "/en/games",
  },
  openGraph: {
    title: "Games | Re-born Interactive",
    description:
      "Explore Re-born Interactive's catalog of atmospheric and narrative-driven games.",
  },
};

export default function GamesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
