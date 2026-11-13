import { BLUE, CYAN, INK, INK_2, INK_3 } from "@/lib/palette";

/**
 * The picture on the right of the share preview: floating islands joined by glowing lines, in the two site colours.
 * A flat vector sketch of the 3D city (the share image is made on the server, so it cannot run the real scene).
 */
export function Islands({ width, height }: { width: number; height: number }) {
  const island = (cx: number, cy: number, rx: number, ry: number, drop: number, key: string) => (
    <g key={key}>
      <path d={`M${cx - rx} ${cy} L${cx + rx} ${cy} L${cx + rx * 0.3} ${cy + drop * 0.78} Q${cx} ${cy + drop * 1.05} ${cx - rx * 0.3} ${cy + drop * 0.78} Z`} fill="url(#rock)" />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={INK_2} stroke={CYAN} strokeWidth="3" />
      <ellipse cx={cx} cy={cy} rx={rx * 0.72} ry={ry * 0.62} fill="none" stroke={CYAN} strokeOpacity="0.35" strokeWidth="1.5" />
    </g>
  );
  const tower = (x: number, base: number, w: number, h: number, key: string) => (
    <g key={key}>
      <rect x={x} y={base - h} width={w} height={h} rx="3" fill={INK_3} stroke={CYAN} strokeOpacity="0.7" strokeWidth="1.6" />
      {Array.from({ length: Math.floor(h / 16) }).map((_, i) => (
        <rect key={i} x={x + w * 0.22} y={base - h + 8 + i * 16} width={w * 0.56} height="5" rx="1.5" fill={CYAN} fillOpacity={i % 3 === 1 ? 0.35 : 0.85} />
      ))}
    </g>
  );

  return (
    <svg width={width} height={height} viewBox="0 0 520 520" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rock" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BLUE} stopOpacity="0.85" />
          <stop offset="100%" stopColor={INK} stopOpacity="0.9" />
        </linearGradient>
        <radialGradient id="halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={CYAN} stopOpacity="0.55" />
          <stop offset="100%" stopColor={CYAN} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* glowing links between the islands */}
      <path d="M150 170 C 210 110, 300 120, 345 190" fill="none" stroke={CYAN} strokeWidth="3" strokeOpacity="0.8" strokeDasharray="2 9" strokeLinecap="round" />
      <path d="M150 170 C 110 260, 120 330, 140 395" fill="none" stroke={CYAN} strokeWidth="3" strokeOpacity="0.8" strokeDasharray="2 9" strokeLinecap="round" />
      <path d="M345 215 C 360 300, 300 350, 215 392" fill="none" stroke={CYAN} strokeWidth="3" strokeOpacity="0.8" strokeDasharray="2 9" strokeLinecap="round" />

      {island(150, 170, 96, 26, 92, "a")}
      {tower(120, 168, 22, 64, "t1")}
      {tower(152, 168, 26, 92, "t2")}
      {tower(186, 168, 20, 48, "t3")}

      {island(345, 200, 130, 34, 128, "b")}
      <circle cx="345" cy="108" r="46" fill="url(#halo)" />
      {tower(300, 198, 30, 104, "t4")}
      {tower(342, 198, 34, 150, "t5")}
      {tower(388, 198, 26, 80, "t6")}
      <circle cx="359" cy="38" r="7" fill={CYAN} />

      {island(165, 398, 76, 20, 70, "c")}
      {tower(135, 396, 20, 40, "t7")}
      {tower(165, 396, 24, 62, "t8")}
    </svg>
  );
}
