import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store",
  description:
    "Official Re-born Interactive armory — digital game editions, limited studio apparel, collectibles, and soundtracks dropping soon.",
};

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
