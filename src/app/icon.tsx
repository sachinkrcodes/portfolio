import { ImageResponse } from "next/og";
import { Mark } from "./_og/mark";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** The browser tab icon. */
export default function Icon() {
  return new ImageResponse(<Mark size={64} />, size);
}
