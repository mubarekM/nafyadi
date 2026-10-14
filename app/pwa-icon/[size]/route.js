import { ImageResponse } from "next/og";

export function generateStaticParams() {
  return [{ size: "192" }, { size: "512" }];
}

export async function GET(_request, { params }) {
  const { size } = await params;
  const px = size === "512" ? 512 : 192;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0b4a38",
        color: "#ffffff",
        fontSize: Math.round(px * 0.62),
        fontWeight: 700,
      }}
    >
      N
    </div>,
    { width: px, height: px },
  );
}
