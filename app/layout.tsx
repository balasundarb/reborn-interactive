// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/lib/providers/StoreProvider";

import { Toaster } from "sonner";
import Cursor from "@/components/cursor/cursor";
import { Lollipop, ShieldAlert, SquareScissorsIcon, Trophy, Zap } from "lucide-react";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://reborninteractive.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Re-born Interactive | Architecting Digital Emotions",
    template: "%s | Re-born Interactive",
  },
  description:
    "Re-born Interactive is an independent game studio crafting atmospheric, story-driven, and next-gen interactive worlds including Through Her Eyes.",
  keywords: [
    "Re-born Interactive",
    "Reborn Interactive",
    "game studio",
    "indie game developer",
    "Through Her Eyes",
    "narrative adventure games",
    "Unreal Engine 5 studio",
  ],
  authors: [{ name: "Re-born Interactive Co., Ltd.", url: siteUrl }],
  creator: "Re-born Interactive",
  publisher: "Re-born Interactive Co., Ltd.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Re-born Interactive",
    title: "Re-born Interactive | Architecting Digital Emotions",
    description:
      "Independent game studio crafting atmospheric, story-driven, and next-gen interactive worlds.",
    images: [
      {
        url: "/assets/game/through her eyes.png",
        width: 1200,
        height: 630,
        alt: "Re-born Interactive — Through Her Eyes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Re-born Interactive | Architecting Digital Emotions",
    description:
      "Independent game studio crafting atmospheric, story-driven, and next-gen interactive worlds.",
    images: ["/assets/game/through her eyes.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon-192x192.png",
    apple: "/favicon-180x180.png",
  },
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#050507",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Re-born Interactive",
  legalName: "Re-born Interactive Co., Ltd.",
  url: siteUrl,
  logo: `${siteUrl}/favicon-384x384.png`,
  email: "info@reborninteractive.com",
  sameAs: [
    "https://x.com/RebornInte41311",
    "https://github.com/reborninteractive36",
    "https://www.linkedin.com/company/reborn-interactive-games/",
    "https://www.instagram.com/reborninteractive_/",
  ],
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <StoreProvider>
          <Cursor />
          {children}
          <Toaster
            theme="dark"
            position="top-right"
            toastOptions={{
              duration: 5000,
              classNames: {
                toast: `
        group relative overflow-hidden
        bg-zinc-950/90 backdrop-blur-md 
        border border-zinc-800 border-l-[4px] border-l-[#d63031]
        rounded-none shadow-[0_0_20px_rgba(0,0,0,0.5),_inset_0_1px_1px_rgba(255,255,255,0.05)]
        p-4 flex items-center gap-4
      `,
                title: 'text-[12px] font-black uppercase tracking-[0.15em] italic leading-none mb-1',
                description: 'text-[10px] text-zinc-500 font-mono uppercase leading-tight opacity-80',
              },
            }}
            icons={{
              success: <Trophy className="w-5 h-5 text-green-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />,
              error: <ShieldAlert className="w-5 h-5 text-[#d63031] animate-pulse drop-shadow-[0_0_8px_rgba(214,48,49,0.6)]" />,
              info: <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400/20 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />,
            }}
          />
        </StoreProvider>

      </body>

    </html>
  );
}