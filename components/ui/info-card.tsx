"use client";
import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";

// RTL detection for Hebrew/Arabic
function isRTL(text: string) {
  return /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F]/.test(text);
}

export interface InfoCardProps {
  image: string;
  title: string;
  designation?: string;
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
  designation,
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
  const [modalOpen, setModalOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const borderRef = useRef<HTMLDivElement>(null);
  const modalBackdropRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  // ─── GSAP: Card hover enter animation ───────────────────────────────────────
  const handleMouseEnter = () => {
    setHovered(true);
    if (!imageRef.current || !contentRef.current) return;

    // Image lifts and scales
    gsap.to(imageRef.current, {
      y: -40,
      scale: 1.05,
      duration: 0.55,
      ease: "power3.out",
    });
    gsap.to(imageRef.current.querySelector("img"), {
      scale: 1.5,
      duration: 0.6,
      ease: "power3.out",
    });

    // Content fades up slightly
    gsap.fromTo(
      contentRef.current,
      { y: 10, opacity: 0.6 },
      { y: 0, opacity: 1, duration: 0.45, ease: "power2.out" }
    );

    // Glow pulse
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        opacity: 0.35,
        scale: 1.1,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  };

  // ─── GSAP: Card hover leave animation ───────────────────────────────────────
  const handleMouseLeave = () => {
    setHovered(false);
    if (borderRef.current) borderRef.current.style.setProperty("--rotation", "0deg");

    if (!imageRef.current || !contentRef.current) return;

    gsap.to(imageRef.current, {
      y: 0,
      scale: 1,
      duration: 0.5,
      ease: "power3.inOut",
    });
    gsap.to(imageRef.current.querySelector("img"), {
      scale: 1,
      duration: 0.5,
      ease: "power3.inOut",
    });

    gsap.to(contentRef.current, {
      y: 0,
      opacity: 1,
      duration: 0.4,
      ease: "power2.inOut",
    });

    if (glowRef.current) {
      gsap.to(glowRef.current, {
        opacity: 0,
        scale: 1,
        duration: 0.45,
        ease: "power2.inOut",
      });
    }
  };

  // Track whether an exit animation is currently running to avoid double-firing
  const isExitingRef = useRef(false);

  // ─── Modal: open → mount portal, then animate in ────────────────────────────
  useEffect(() => {
    if (modalOpen) {
      isExitingRef.current = false;
      setIsModalVisible(true);
    }
  }, [modalOpen]);

  // ─── Animate IN once the portal is mounted and modalOpen is true ─────────────
  useEffect(() => {
    if (isModalVisible && modalOpen) {
      // Small rAF delay so refs are guaranteed to point at DOM nodes
      const id = requestAnimationFrame(() => {
        gsap.killTweensOf([modalBackdropRef.current, modalContentRef.current]);
        gsap.fromTo(
          modalBackdropRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.35, ease: "power2.out" }
        );
        gsap.fromTo(
          modalContentRef.current,
          { scale: 0.85, opacity: 0, y: 40 },
          { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.4)" }
        );
      });
      return () => cancelAnimationFrame(id);
    }
  }, [isModalVisible, modalOpen]);

  // ─── handleClose: animate OUT, then unmount ──────────────────────────────────
  const handleClose = () => {
    if (isExitingRef.current) return; // prevent double-close
    isExitingRef.current = true;

    gsap.killTweensOf([modalBackdropRef.current, modalContentRef.current]);

    const tl = gsap.timeline({
      onComplete: () => {
        isExitingRef.current = false;
        setModalOpen(false);
        setIsModalVisible(false);
      },
    });

    tl.to(modalContentRef.current, {
      scale: 0.85,
      opacity: 0,
      y: 30,
      duration: 0.3,
      ease: "power2.in",
    }).to(
      modalBackdropRef.current,
      { opacity: 0, duration: 0.25, ease: "power2.inOut" },
      "<"
    );
  };

  // ─── Escape key + body scroll lock ──────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalVisible) handleClose();
    };
    if (isModalVisible) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isModalVisible]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const border = borderRef.current;
    if (!border) return;
    const rect = border.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    border.style.setProperty("--rotation", `${Math.atan2(y, x)}rad`);
  };

  const rtl =
    isRTL(title) || (designation ? isRTL(designation) : false) || isRTL(description);
  const effectiveFont = rtl ? rtlFontFamily : fontFamily;

  const pattern =
    `linear-gradient(45deg, ${patternColor1} 25%, transparent 25%, transparent 75%, ${patternColor2} 75%),` +
    `linear-gradient(-45deg, ${patternColor2} 25%, transparent 25%, transparent 75%, ${patternColor1} 75%)`;

  const borderGradient = `conic-gradient(from var(--rotation,0deg), ${borderColor} 0deg, ${borderColor} 120deg, ${borderBgColor} 120deg, ${borderBgColor} 360deg)`;

  // ─── Clicking anywhere on the card opens the modal ──────────────────────────
  const handleCardClick = () => {
    if (!isExitingRef.current) setModalOpen(true);
  };

  return (
    <>
      {/* ── Card ── */}
      <div
        ref={borderRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleCardClick}
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
          transition: "box-shadow 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
          position: "relative",
          fontFamily: effectiveFont,
          boxShadow: hovered ? `0 20px 40px ${shadowColor}` : "0 0 0 transparent",
          overflow: "visible",
          overflowY: "visible",
          zIndex: hovered ? 50 : 1,
        } as React.CSSProperties}
      >
        {/* Ambient glow behind card */}
        <div
          ref={glowRef}
          style={{
            position: "absolute",
            inset: "-20px",
            borderRadius: "36px",
            background: `radial-gradient(ellipse at center, ${shadowColor}, transparent 70%)`,
            opacity: 0,
            pointerEvents: "none",
            zIndex: -1,
          }}
        />

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
            overflow: "visible",
            overflowY: "visible",
          }}
        />

        {/* Main Content Wrapper */}
        <div
          style={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            zIndex: 10,
          }}
        >
          {/* Image Container — GSAP controlled via ref */}
          <div
            ref={imageRef}
            style={{
              position: "absolute",
              top: 0,
              left: borderPadding,
              right: borderPadding,
              height: "65%",
              borderRadius: "18px 18px 0 0",
              overflow: "hidden",
              overflowY: "visible",
              zIndex: 5,
              willChange: "transform",
            }}
          >
            <img
              src={image}
              alt={title}
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "top",
                willChange: "transform",
                pointerEvents: "none",
                userSelect: "none",
              }}
            />
          </div>

          {/* Content Section (bottom) */}
          <div
            ref={contentRef}
            style={{
              marginTop: "65%",
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              padding: contentPadding,
              background: cardBgColor,
              borderRadius: "0 0 18px 18px",
              zIndex: 20,
              willChange: "transform, opacity",
            }}
          >
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                marginBottom: designation ? 4 : 8,
                color: hovered ? hoverTextColor : textColor,
                transition: "color 0.3s ease",
                position: "relative",
                display: "inline-block",
                width: "fit-content",
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
                  borderRadius: "2px",
                }}
              />
            </h1>

            {designation && (
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 400,
                  color: hovered ? hoverTextColor : textColor,
                  opacity: 0.7,
                  marginBottom: 8,
                  direction: isRTL(designation) ? "rtl" : "ltr",
                }}
              >
                {designation}
              </p>
            )}

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
                textAlign: "justify",
              }}
            >
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* ── Modal Portal ── */}
      {isModalVisible &&
        createPortal(
          <div
            ref={modalBackdropRef}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.80)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "20px",
              opacity: 0,
            }}
            onClick={handleClose}
          >
            <div
              ref={modalContentRef}
              style={{
                background: cardBgColor,
                borderRadius: "24px",
                maxWidth: "900px",
                width: "90%",
                maxHeight: "80vh",
                overflow: "auto",
                display: "flex",
                flexDirection: "row",
                border: `2px solid ${borderColor}`,
                boxShadow: `0 25px 50px -12px ${shadowColor}`,
                opacity: 0,
                transform: "scale(0.85) translateY(40px)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image side */}
              <div
                style={{
                  flex: "0 0 40%",
                  backgroundColor: "#111",
                  borderRadius: "22px 0 0 22px",
                  overflow: "visible",
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
                  }}
                />
              </div>

              {/* Content side */}
              <div
                style={{
                  flex: "1",
                  padding: "32px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <h2
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    color: hoverTextColor,
                    margin: 0,
                    direction: isRTL(title) ? "rtl" : "ltr",
                  }}
                >
                  {title}
                </h2>

                {designation && (
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: 500,
                      color: borderColor,
                      margin: "0 0 8px 0",
                      direction: isRTL(designation) ? "rtl" : "ltr",
                    }}
                  >
                    {designation}
                  </p>
                )}

                <p
                  style={{
                    fontSize: "16px",
                    lineHeight: 1.7,
                    color: textColor,
                    opacity: 0.9,
                    direction: isRTL(description) ? "rtl" : "ltr",
                    textAlign: "justify",
                    overflowY: "auto",
                    paddingRight: "8px",
                    margin: 0,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {description}
                </p>

                <button
                  onClick={handleClose}
                  style={{
                    alignSelf: "flex-end",
                    background: "transparent",
                    border: `1px solid ${borderColor}`,
                    color: borderColor,
                    padding: "8px 24px",
                    borderRadius: "40px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    marginTop: "16px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = borderColor;
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = borderColor;
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};