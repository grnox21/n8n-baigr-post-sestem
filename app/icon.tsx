import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#06070a",
          borderRadius: 7,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 999,
            border: "1.5px solid rgba(217,165,92,0.6)",
            color: "#d9a55c",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          B
        </div>
      </div>
    ),
    size
  );
}
