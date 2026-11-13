import { ImageResponse } from "next/og";
import { Mark } from "./_og/mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** The icon iPhones and iPads use when the site is added to the home screen. */
export default function AppleIcon() {
  return new ImageResponse(<Mark size={180} />, size);
}
