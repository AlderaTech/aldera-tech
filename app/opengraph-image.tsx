import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const alt =
  "Aldera Tech — Modern Software Engineering & Digital Product Studio";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "space-between",
        backgroundColor: "#0F263A",
        padding: "80px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            backgroundColor: "#00B1E1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "20px",
              height: "20px",
              backgroundColor: "#0F263A",
              borderRadius: "4px",
            }}
          />
        </div>
        <span
          style={{
            fontSize: "36px",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#FFFFFF",
          }}
        >
          Aldera Tech
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          maxWidth: "950px",
        }}
      >
        <h1
          style={{
            fontSize: "64px",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            color: "#FFFFFF",
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          Rekayasa Perangkat Lunak & Akselerasi Produk Digital
        </h1>
        <p
          style={{
            fontSize: "26px",
            color: "#94A3B8",
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          Mitra teknologi terpercaya untuk membangun web app, mobile app, dan
          sistem enterprise berkinerja tinggi.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "24px",
          borderTop: "1px solid rgba(255, 255, 255, 0.12)",
          paddingTop: "32px",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#00B1E1",
            }}
          />
          <span style={{ fontSize: "20px", color: "#E2E8F0", fontWeight: 600 }}>
            aldera.tech
          </span>
        </div>
        <span style={{ fontSize: "20px", color: "#64748B" }}>•</span>
        <span style={{ fontSize: "20px", color: "#94A3B8" }}>
          Clean Architecture • High Performance • Radical Transparency
        </span>
      </div>
    </div>,
    {
      ...size,
    }
  );
}
