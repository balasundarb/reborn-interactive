import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const alt = "Re-born Interactive";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logoBuffer = await readFile(
    path.join(process.cwd(), "public", "assets", "navbar", "Website.png")
  );
  const logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#050507",
          backgroundImage:
            "radial-gradient(circle at 50% 45%, rgba(214, 48, 49, 0.25) 0%, rgba(5, 5, 7, 1) 65%)",
          position: "relative",
        }}
      >
        <img
          src={logoBase64}
          alt="Re-born Interactive"
          style={{
            width: 480,
            height: "auto",
            objectFit: "contain",
          }}
        />
        <div
          style={{
            marginTop: 28,
            fontSize: 22,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "#d4d4d8",
            fontWeight: 700,
          }}
        >
          Architecting Digital Emotions
        </div>
      </div>
    ),
    { ...size }
  );
}
