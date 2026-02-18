import React from "react";
import { InfoCard } from "@/components/ui/info-card";

const containerStyle: React.CSSProperties = {
  display: "flex",
  gap: 24,
  padding: 24,
  flexWrap: "wrap",
  justifyContent: "center",
  alignItems: "flex-start",
  background: "none",
  fontFamily: "var(--font-family)",
  margin: 0,
};

const fileContainerStyle: React.CSSProperties = {
  width: 388,
  height: 378,
  borderRadius: "1em",
  position: "relative",
  overflow: "hidden",
  padding: 0,
  cursor: "pointer",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "none",
  boxSizing: "border-box",
};

export const Demo: React.FC = () => (
  <div className="container" style={containerStyle}>
    <div
      className="file-container"
      id="container1"
      style={{
        ...fileContainerStyle,
        ["--hover-text-color" as any]: "#242424", // Unique for card 1
      }}
    >
      <InfoCard
        image="/team/ajay_rahul.webp"
        title="American English"
        description="Master American English efficiently with personalized lessons, cultural insights, and practical exercises."
        borderColor="var(--border-color-1)"
        borderBgColor="var(--border-bg-color)"
        cardBgColor="var(--card-bg-color)"
        shadowColor="var(--shadow-color)"
        textColor="var(--text-color)"
        hoverTextColor="var(--hover-text-color-1)"
        fontFamily="var(--font-family)"
        rtlFontFamily="var(--rtl-font-family)"
        effectBgColor="var(--border-color-1)"
        patternColor1="var(--pattern-color1)"
        patternColor2="var(--pattern-color2)"
        contentPadding="14.3px 16px"
      />
    </div>
    <div
      className="file-container"
      id="container2"
      style={{
        ...fileContainerStyle,
        ["--hover-text-color" as any]: "#fff", // Unique for card 2
      }}
    >
      <InfoCard
        image="/team/balasundar.webp"
        title="British English"
        description="Explore British English nuances, from pronunciation to idiomas and dialect-specific words."
        borderColor="var(--border-color-2)"
        borderBgColor="var(--border-bg-color)"
        cardBgColor="var(--card-bg-color)"
        shadowColor="var(--shadow-color)"
        textColor="var(--text-color)"
        hoverTextColor="var(--hover-text-color-2)"
        fontFamily="var(--font-family)"
        rtlFontFamily="var(--rtl-font-family)"
        effectBgColor="var(--border-color-2)"
        patternColor1="var(--pattern-color1)"
        patternColor2="var(--pattern-color2)"
        contentPadding="14.3px 16px"
      />
    </div>
    <div
      className="file-container"
      id="container3"
      style={{
        ...fileContainerStyle,
        ["--hover-text-color" as any]: "#2196F3", // Unique for card 3
      }}
    >
      <InfoCard
        image="/team/Shekinah.jpg"
        title="עברית"
        description="לימוד השפה העברית המודרנית, דקדוק ואוצר מילים. שיפור מיומנויות דיבור וכתיבה, חקירת ספרות עברית. הכרת תרבות ישראלית, מנהגים והיסטוריה."
        borderColor="var(--border-color-3)"
        borderBgColor="var(--border-bg-color)"
        cardBgColor="var(--card-bg-color)"
        shadowColor="var(--shadow-color)"
        textColor="var(--text-color)"
        hoverTextColor="var(--hover-text-color-3)"
        fontFamily="var(--font-family)"
        rtlFontFamily="var(--rtl-font-family)"
        effectBgColor="var(--border-color-3)"
        patternColor1="var(--pattern-color1)"
        patternColor2="var(--pattern-color2)"
      />
    </div>
  </div>
);
export default Demo;