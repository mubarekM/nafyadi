import { ImageResponse } from "next/og";

export const alt = "English with Nafyad: live English classes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0b4a38",
        color: "#ffffff",
        padding: 72,
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            width: 72,
            height: 72,
            alignItems: "center",
            justifyContent: "center",
            border: "3px solid rgba(255,255,255,0.6)",
            borderRadius: 14,
            fontSize: 44,
          }}
        >
          N
        </div>
        <div style={{ marginLeft: 24, fontSize: 36 }}>English with Nafyad</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 84, lineHeight: 1.1, fontWeight: 700 }}>
          Speak English with confidence
        </div>
        <div style={{ marginTop: 28, fontSize: 36, color: "#cfe8dd" }}>
          Live classes for kids, teens and adults
        </div>
      </div>
      <div style={{ display: "flex", fontSize: 28, color: "#e0b13c" }}>
        Levels A1 to C1+ · Zoom and Google Meet · Amharic, Afaan Oromoo, English
      </div>
    </div>,
    { ...size },
  );
}
