import { BLUE, CYAN, INK, INK_2 } from "@/lib/palette";

/**
 * The small logo used for the browser tab icon and the phone home screen icon: one floating island with a glowing
 * point above it, in the two site colours. Drawn as SVG so it stays sharp at any size.
 * (Underscore folder: Next.js does not treat it as a route.)
 */
export function Mark({ size }: { size: number }) {
  return (
    <div style={{ width: size, height: size, display: "flex", background: INK }}>
      <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="glow" cx="50%" cy="38%" r="55%">
            <stop offset="0%" stopColor={BLUE} stopOpacity="0.55" />
            <stop offset="100%" stopColor={INK} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="rock" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BLUE} />
            <stop offset="100%" stopColor={INK_2} />
          </linearGradient>
        </defs>
        <rect width="64" height="64" fill="url(#glow)" />
        <path d="M13 35 L51 35 L36 56 Q32 60 28 56 Z" fill="url(#rock)" />
        <ellipse cx="32" cy="35" rx="19" ry="6.5" fill={INK_2} stroke={CYAN} strokeWidth="2.4" />
        <circle cx="32" cy="19" r="4.2" fill={CYAN} />
        <circle cx="32" cy="19" r="8" fill={CYAN} fillOpacity="0.18" />
      </svg>
    </div>
  );
}
