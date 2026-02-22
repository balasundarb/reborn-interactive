// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/lib/providers/StoreProvider";

import { Toaster } from "sonner";
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
          {children}  
             <Toaster position="top-right" richColors />
        </StoreProvider>
        
      </body>
      
    </html>
  );
}