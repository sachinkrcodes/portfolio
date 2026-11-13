"use client";

import { CYAN, FOG, INK, MUTE } from "@/lib/palette";

/**
 * The last safety net: used only if the page frame itself fails. It replaces the whole page, so it cannot rely on
 * the site's stylesheet and uses plain inline styles with the two palette colours.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: INK, color: FOG, fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
          <div style={{ maxWidth: 520 }} role="alert">
            <p style={{ color: CYAN, letterSpacing: 2, textTransform: "uppercase", fontSize: 13, margin: 0 }}>Something went wrong</p>
            <h1 style={{ fontSize: 40, lineHeight: 1.1, margin: "16px 0" }}>The city lost its signal.</h1>
            <p style={{ color: MUTE, lineHeight: 1.6, margin: "0 0 24px" }}>Reload the page to try again.</p>
            <button
              type="button"
              onClick={reset}
              style={{ background: "transparent", color: FOG, border: `1px solid ${CYAN}`, borderRadius: 999, padding: "12px 26px", fontSize: 16, cursor: "pointer" }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
