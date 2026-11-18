import type { CSSProperties } from "react";
import type { Metadata, Viewport } from "next";
import "@fontsource-variable/bricolage-grotesque/index.css";
import "@fontsource-variable/instrument-sans/index.css";
import "./globals.css";
import { profile, site } from "@/data/content";
import { validateContent } from "@/data/validate";
import { INK, cssVarMap } from "@/lib/palette";
import { siteUrl } from "@/lib/site";

// Checks src/data/content.ts every time the site is built or started. Mistakes that would break the site
// (duplicate ids, links that are not links) stop `npm run build`; style slips are only printed.
{
  const { errors, warnings } = validateContent();
  for (const w of warnings) console.warn(`[content] warning: ${w}`);
  if (errors.length) {
    const message = `src/data/content.ts has ${errors.length} problem${errors.length > 1 ? "s" : ""}:\n - ${errors.join("\n - ")}`;
    if (process.env.NODE_ENV === "production") throw new Error(message);
    console.error(`[content] ${message}`);
  }
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: site.title, template: `%s | ${profile.name}` },
  description: site.description,
  applicationName: `${profile.name} portfolio`,
  authors: [{ name: profile.name, url: profile.github }],
  creator: profile.name,
  keywords: [profile.name, profile.role, ...profile.stack, "portfolio", profile.location.city],
  alternates: { canonical: "/" },
  // the share picture comes from app/opengraph-image.tsx (made from content.ts), the icons are the logo files app/icon.png, app/apple-icon.png and app/favicon.ico
  openGraph: { title: site.title, description: site.description, type: "website", locale: "en_IN", siteName: profile.name, url: "/" },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: INK,
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  // Deliberately no `viewportFit: "cover"`: without it the browser keeps the page out of the notch, the rounded corners and the
  // home bar by itself, so nothing can end up hidden on a phone. (With "cover" every fixed control would need its own safe-area padding.)
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The two colours from src/lib/palette.ts become CSS variables on <html>. suppressHydrationWarning is on <html> and
    // <body> because browser extensions (ad blockers, Grammarly, dark mode) add attributes to them before React loads.
    <html lang="en" style={cssVarMap() as CSSProperties} suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
