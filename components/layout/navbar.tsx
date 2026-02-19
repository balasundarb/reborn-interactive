"use client";

import { useParams } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { GetInTouch } from "@/components/landingpage/GetinTouch"; 
import { NavMenus } from "../ui/NavMenus";

export function MyNavbar() {
  const { locale } = useParams() as { locale: string };
  const [isGetInTouchOpen, setIsGetInTouchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = useMemo(
    () => [
      { name: "Home", link: `/${locale}` },
      { name: "About", link: `/${locale}/about` },
      { name: "Creators", link: `/${locale}/creators` },
      { name: "News", link: `/${locale}/news` },
    ],
    [locale]
  );

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) closeMenu();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isMenuOpen]);

  return (
    <>
      <nav className="absolute top-0 left-0 z-50 flex w-full items-center justify-between px-8 py-6">
        {/* Logo - Kept Original Colors */}
        <div className="relative">
          <Image
            src="/assets/navbar/Website.png"
            alt="Logo"
            width={600}
            height={200}
            priority
            className="w-20 sm:w-24 md:w-32 h-auto"
          />
        </div>

        {/* Right side Actions */}
        <div className="flex items-center gap-6">
          {/* CTA Button: Sharp Gaming Edge */}
          <button
            onClick={() => setIsGetInTouchOpen(true)}
            className="hidden sm:block relative group px-6 py-2 transition-transform active:scale-95"
          >
            {/* Background Shape */}
            <div className="absolute inset-0 bg-white skew-x-[-15deg] border-r-4 border-red-600 group-hover:bg-red-600 transition-colors" />
            
            <span className="relative text-black text-xs font-black uppercase tracking-widest group-hover:text-white transition-colors">
              Get in touch
            </span>
          </button>

          {/* Hamburger Menu: Clean Industrial Toggle */}
          <button
            onClick={toggleMenu}
            className="group flex flex-col gap-1.5 items-end justify-center p-2 focus:outline-none"
            aria-label="Toggle menu"
          >
            {/* Top Bar */}
            <span className={`h-0.5 bg-white transition-all duration-300 origin-right ${
              isMenuOpen ? 'w-8 -rotate-45 translate-y-[1px]' : 'w-8'
            }`} />
            
            {/* Middle Bar */}
            <span className={`h-0.5 bg-white transition-all duration-300 ${
              isMenuOpen ? 'opacity-0 w-0' : 'w-5 group-hover:w-8'
            }`} />
            
            {/* Bottom Bar */}
            <span className={`h-0.5 bg-white transition-all duration-300 origin-right ${
              isMenuOpen ? 'w-8 rotate-45 -translate-y-[1px]' : 'w-8'
            }`} />
          </button>
        </div>
      </nav>

      {/* NavMenus overlay */}
      <NavMenus
        isOpen={isMenuOpen}
        onClose={closeMenu}
        navItems={navItems}
      />

      <GetInTouch
        isOpen={isGetInTouchOpen}
        onClose={() => setIsGetInTouchOpen(false)}
      />
    </>
  );
}