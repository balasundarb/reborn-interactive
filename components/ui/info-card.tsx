"use client";
import React, { useRef, useState } from "react";

// RTL detection for Hebrew/Arabic
function isRTL(text: string) {
  return /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F]/.test(text);
}

export interface InfoCardProps {
  image: string;
  title: string;
  description: string;
  width?: number;
  height?: number;
  borderColor?: string;
  borderBgColor?: string;
  borderWidth?: number;
  borderPadding?: number;
  cardBgColor?: string;
  shadowColor?: string;
  patternColor1?: string;
  patternColor2?: string;
  textColor?: string;
  hoverTextColor?: string;
  fontFamily?: string;
  rtlFontFamily?: string;
  effectBgColor?: string;
  contentPadding?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  image,
  title,
  description,
  width = 388,
  height = 478,
  borderColor = "#d63031",
  borderBgColor = "#242424",
  borderWidth = 5,
  borderPadding = 14,
  cardBgColor = "transparent",
  shadowColor = "rgba(214, 48, 49, 0.2)",
  patternColor1 = "rgba(230,230,230,0.08)",
  patternColor2 = "rgba(240,240,240,0.08)",
  textColor = "#f5f5f5",
  hoverTextColor = "#ffffff",
  fontFamily = "'Roboto Mono', monospace",
  rtlFontFamily = "'Montserrat', sans-serif",
  effectBgColor = "#d63031",
  contentPadding = "20px 24px",
}) => {
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const borderRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const border = borderRef.current;
    if (!border) return;
    const rect = border.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const angle = Math.atan2(y, x);
    border.style.setProperty("--rotation", `${angle}rad`);
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x: px, y: py });
  };

  const rtl = isRTL(title) || isRTL(description);
  const effectiveFont = rtl ? rtlFontFamily : fontFamily;

  const pattern =
    `linear-gradient(45deg, ${patternColor1} 25%, transparent 25%, transparent 75%, ${patternColor2} 75%),` +
    `linear-gradient(-45deg, ${patternColor2} 25%, transparent 25%, transparent 75%, ${patternColor1} 75%)`;

  const borderGradient = `conic-gradient(from var(--rotation,0deg), ${borderColor} 0deg, ${borderColor} 120deg, ${borderBgColor} 120deg, ${borderBgColor} 360deg)`;

  return (
    <div
      ref={borderRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        if (borderRef.current) borderRef.current.style.setProperty("--rotation", "0deg");
      }}
      style={{
        width,
        height,
        border: `${borderWidth}px solid transparent`,
        borderRadius: "24px",
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box",
        backgroundImage: `linear-gradient(${cardBgColor}, ${cardBgColor}), ${borderGradient}`,
        padding: borderPadding,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
        position: "relative",
        fontFamily: effectiveFont,
        boxShadow: hovered ? `0 20px 40px ${shadowColor}` : "0 0 0 transparent",
        transform: hovered ? "translateY(0)" : "translateY(0)",
        /* ALLOW IMAGE TO BREAK OUT TOP */
        overflow: "visible",
        zIndex: hovered ? 50 : 1,
      } as React.CSSProperties}
    >
      {/* Pattern & Background Layer */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "18px",
          background: cardBgColor,
          backgroundImage: pattern,
          backgroundSize: "24px 24px",
          backgroundPosition: hovered ? "12px 12px" : "0px 0px",
          transition: "background-position 0.6s ease",
          zIndex: 0,
          /* CLIP SIDES AND BOTTOM ONLY */
          overflow: "hidden",
        }}
      >
        {/* Empty spacer to keep content flow if needed */}
      </div>

      {/* Main Content Wrapper */}
      <div
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          padding: contentPadding,
          marginTop: "65%",
          background: cardBgColor,
          borderRadius: "0 0 18px 18px",
          zIndex: 10,
        }}
      >

        {/* Image Container */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: borderPadding,
            right: borderPadding,
            height: "65%",
            borderRadius: "18px 18px 0 0",
            overflow: "hidden",
            zIndex: 5,
            transition: "transform 0.6s cubic-bezier(0.33, 1, 0.68, 1)",
            transform: hovered ? "translateY(-40px)" : "translateY(0)",
          }}
        >
          <img
            src={image}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top",
              transition: "transform 0.6s cubic-bezier(0.33, 1, 0.68, 1)",
              transform: hovered ? "scale(1.50)" : "scale(1)",
            }}
          />
        </div>

        {/* Content Section */}
        <div
          style={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            padding: contentPadding,
            transition: "transform 0.4s ease",
         //   background: cardBgColor, // Covers the image zoom if it overlaps downwards
            borderRadius: "0 0 18px 18px",
            zIndex: 20
          }}
        >
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              marginBottom: 8,
              color: hovered ? hoverTextColor : textColor,
              transition: "color 0.3s ease",
              position: "relative",
              display: 'inline-block',
              width: 'fit-content',
              direction: isRTL(title) ? "rtl" : "ltr",
            }}
          >
            <span style={{ position: "relative", zIndex: 2 }}>{title}</span>
            <span
              style={{
                position: "absolute",
                bottom: 2,
                left: -2,
                right: -2,
                height: hovered ? "100%" : "4px",
                backgroundColor: effectBgColor,
                zIndex: 1,
                transition: "all 0.4s cubic-bezier(0.19, 1, 0.22, 1)",
                opacity: hovered ? 1 : 0.6,
                borderRadius: '2px'
              }}
            />
          </h1>
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              lineHeight: 1.5,
             color: hovered ? hoverTextColor : textColor,
              opacity: 0.8,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              direction: isRTL(description) ? "rtl" : "ltr",
              textAlign: "justify"
            }}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};