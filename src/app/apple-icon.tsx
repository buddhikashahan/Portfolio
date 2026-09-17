import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** iOS home-screen icon. iOS applies its own corner mask, so no radius here. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2563eb",
          color: "#ffffff",
          fontSize: 116,
          fontWeight: 700,
        }}
      >
        B
      </div>
    ),
    size,
  );
}
