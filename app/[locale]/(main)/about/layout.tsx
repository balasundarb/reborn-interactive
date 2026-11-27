import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Re-born Interactive's studio philosophy, historical & cinematic craft, and mission to build unforgettable interactive worlds.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
