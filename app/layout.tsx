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

export const metadata: Metadata = {
  title: "Re-born Interactive",
  description: "Game Designing company.",
  icons: {
    apple: "/favicon-180x180.png",
  },
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#ffffff",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
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