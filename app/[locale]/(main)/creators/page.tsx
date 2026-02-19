"use client";
import React from "react";
import { InfoCard } from "@/components/ui/info-card";

const ACCENT_RED = "#d63031";

const CARD_DATA = [
  { id: "1", image: "/assets/team/ajay_rahul.webp", title: "Ajay Rahul", description: "The Managing Director oversees strategy, finance, and operations of the game development company." },
  { id: "2", image: "/assets/team/balasundar.webp", title: "Balasundar", description: "Creates visual assets for games, including UI elements and promotional materials." },
  { id: "3", image: "/assets/team/Shekinah.jpg", title: "Shekinah Florance M", description: "Builds and maintains backend services, APIs, databases, and game dashboards." },
  { id: "4", image: "/assets/team/jegan.webp", title: "Jegan", description: "Builds and maintains backend services, APIs, databases, and game dashboards." },
  { id: "5", image: "/assets/team/vishnu.webp", title: "Vishnu", description: "Builds and maintains backend services, APIs, databases, and game dashboards." },
];

export const Demo: React.FC = () => {
  return (
    <section className="w-full bg-[#0a0a0a] py-12 px-6 sm:px-10 lg:px-20 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Title Section */}
        <header className="mb-16 md:mb-24 text-center">
          <div 
            className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-[0.2em] uppercase rounded-full border border-[#d63031]/30 text-[#d63031] bg-[#d63031]/5"
          >
            The Team
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight italic uppercase">
            Creators<span style={{ color: ACCENT_RED }}>.</span>
          </h1>
          <p className="mt-4 text-gray-400 max-w-md mx-auto text-sm md:text-base">
            The architects of digital worlds and seamless experiences.
          </p>
        </header>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-x-12 md:gap-y-0 items-start">
          {CARD_DATA.map((card, index) => {
            // Apply stagger effect only on screens wider than 'md' (768px)
            const isRightColumn = index % 2 !== 0;

            return (
              <div
                key={card.id}
                className={`w-full group relative transition-all duration-500
                  ${isRightColumn ? "md:mt-32" : "md:mt-0"}
                `}
              >
                {/* Glow Background Effect */}
                <div 
                  className="absolute -inset-1 rounded-2xl opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-20 pointer-events-none"
                  style={{ backgroundColor: ACCENT_RED }}
                />

                {/* Card Wrapper */}
                <div className="relative bg-[#111111] rounded-2xl overflow-hidden border border-white/5 transition-colors duration-500">
                  <InfoCard
                    image={card.image}
                    title={card.title}
                    description={card.description}
                    borderColor={ACCENT_RED}
                    effectBgColor={ACCENT_RED}
                    hoverTextColor="#ffffff"
                    borderBgColor="transparent"
                    cardBgColor="transparent"
                    textColor="#cccccc"
                    contentPadding="1.5rem"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Demo;