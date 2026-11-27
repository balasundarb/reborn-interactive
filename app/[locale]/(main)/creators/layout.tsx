import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creators",
  description:
    "Meet the artists, engineers, narrative designers, and visionaries behind Re-born Interactive.",
  alternates: {
    canonical: "/en/creators",
  },
};

export default function CreatorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
