import type { MetadataRoute } from "next";
import { profile, site } from "@/data/content";
import { INK } from "@/lib/palette";

/** Name, colours and icons used when the site is added to a phone home screen. Everything comes from content.ts and palette.ts. */
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
      { src: "/icon", sizes: "64x64", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
