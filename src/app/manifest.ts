import type { MetadataRoute } from "next";
import { profile, site } from "@/data/content";
import { INK } from "@/lib/palette";

/**
 * Name, colours and icons used when the site is added to a phone home screen. Name and colours come from content.ts and palette.ts.
 * The icons are the logo files in public/ (a cloud with a code mark on dark blue). The artwork sits inside the middle 80% of the
 * 512 px picture, so it stays whole when Android cuts it into a circle or a rounded square ("maskable").
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${profile.name} | ${profile.role}`,
    short_name: profile.name,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: INK,
    theme_color: INK,
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
