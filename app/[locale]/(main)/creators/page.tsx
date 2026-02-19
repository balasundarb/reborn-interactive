"use client";
import React, { useEffect, useState } from "react";
import { InfoCard } from "@/components/ui/info-card";

const CARD_DATA = [
  {
    id: "1",
    image: "/team/ajay_rahul.webp",
    title: "Ajay Rahul",
    description:
      "The Managing Director oversees strategy, finance, and operations of the game development company.",
    colorKey: "1",
    hoverColor: "#242424",
  },
  {
    id: "2",
    image: "/team/balasundar.webp",
    title: "Balasundar",
    description:
      "Creates visual assets for games, including UI elements, promotional materials, and in-game graphics.",
    colorKey: "2",
    hoverColor: "#fff",
  },
  {
    id: "3",
    image: "/team/Shekinah.jpg",
    title: "Shekinah Florance M",
    description:
      "Builds and maintains backend services, APIs, databases, and game dashboards.",
    colorKey: "3",
    hoverColor: "#2196F3",
  },
    {
    id: "4",
    image: "/team/jegan.webp",
    title: "Jegan",
    description:
      "Builds and maintains backend services, APIs, databases, and game dashboards.",
    colorKey: "1",
    hoverColor: "#2196F3",
  },
     {
    id: "5",
    image: "/team/jegan.webp",
    title: "Vishnu",
    description:
      "Builds and maintains backend services, APIs, databases, and game dashboards.",
    colorKey: "2",
    hoverColor: "#2196F3",
  },
];

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

export const Demo: React.FC = () => {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  return (
    <div
      style={{
        ...gridContainerStyle,
        gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
        padding: isMobile ? "2rem 1.25rem" : isTablet ? "3rem 5%" : "4rem 10%",
        gap: isMobile ? "1.5rem" : "2rem",
      }}
    >
      {CARD_DATA.map((card, index) => {
        const isRightAligned = !isMobile && index % 2 !== 0;

        return (
          <div
            key={card.id}
            style={{
              ...itemWrapperStyle,
              gridColumnStart: isRightAligned ? 2 : 1,
              marginTop: isRightAligned ? "100px" : "0px",
            }}
          >
            <div
              style={
                {
                  ...cardWrapperStyle,
                  maxWidth: isMobile ? "100%" : "388px",
                  ["--hover-text-color" as string]: card.hoverColor,
                } as React.CSSProperties
              }
            >
              <InfoCard
                image={card.image}
                title={card.title}
                description={card.description}
                borderColor={`var(--border-color-${card.colorKey})`}
                effectBgColor={`var(--border-color-${card.colorKey})`}
                hoverTextColor={`var(--hover-text-color-${card.colorKey})`}
                borderBgColor="var(--border-bg-color)"
                cardBgColor="var(--card-bg-color)"
                textColor="var(--text-color)"
                fontFamily="var(--font-family)"
                rtlFontFamily="var(--rtl-font-family)"
                patternColor1="var(--pattern-color1)"
                patternColor2="var(--pattern-color2)"
                contentPadding="1.5rem"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// --- Styles ---

const gridContainerStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "2rem",
  padding: "4rem 10%",
  maxWidth: "1200px",
  margin: "0 auto",
  alignItems: "start",
};

const itemWrapperStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  width: "100%",
};

const cardWrapperStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "388px",
  minHeight: "380px",
  position: "relative",
  transition: "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
};

export default Demo;