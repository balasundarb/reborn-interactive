import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "News",
  description:
    "Latest studio transmissions, game development updates, trailers, and community announcements from Re-born Interactive.",
};

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
