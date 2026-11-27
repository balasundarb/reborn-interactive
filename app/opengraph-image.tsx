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
    path.join(process.cwd(), "public", "favicon-384x384.png")
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
            "radial-gradient(circle at 50% 42%, rgba(214, 48, 49, 0.28) 0%, rgba(5, 5, 7, 1) 68%)",
        }}
      >
        <img
          src={logoBase64}
          alt="Re-born Interactive"
          width={290}
          height={290}
          style={{
            width: 290,
            height: 290,
            objectFit: "contain",
          }}
        />
        <div
          style={{
            marginTop: 22,
            fontSize: 42,
            fontWeight: 900,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#ffffff",
          }}
        >
          RE-BORN INTERACTIVE
        </div>
      </div>
    ),
    { ...size }
  );
}
