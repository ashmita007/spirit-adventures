import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

// Branded share card (WhatsApp, Instagram DMs, Facebook, X, LinkedIn previews)
export const runtime = "nodejs";
export const alt = "Spirit Adventures: treks, rafting and Himalayan expeditions";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logo = await readFile(path.join(process.cwd(), "public/images/logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #062B49 0%, #0A6FAE 60%, #38BDF8 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", background: "white", borderRadius: 24, padding: "18px 28px", alignSelf: "flex-start" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} alt="" width={340} height={90} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 1.02, letterSpacing: -2 }}>FIND YOUR NEXT</div>
          <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 1.02, letterSpacing: -2, color: "#BAE6FD" }}>ADVENTURE</div>
          <div style={{ marginTop: 22, fontSize: 30, color: "#E0F2FE" }}>
            Treks · River rafting · Beach trails · Himalayan expeditions
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#E0F2FE" }}>spiritadventures.in · +91 96665 67551</div>
      </div>
    ),
    size
  );
}
