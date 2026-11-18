"use client";

import { useState } from "react";
import type { Shot } from "@/data/content";

/**
 * Screenshots of a project running: one large picture, its caption, and small pictures to switch between them.
 * Clicking the large picture opens the full size file in a new tab. Pictures load only when they come near the screen.
 * The files live in public/projects/<project id>/ and are listed in `shots` in src/data/content.ts.
 */
export default function Shots({ shots, name }: { shots: Shot[]; name: string }) {
  const [i, setI] = useState(0);
  const s = shots[Math.min(i, shots.length - 1)];
  if (!s) return null;
  return (
    <figure className="max-w-[680px]">
      <a href={s.src} target="_blank" rel="noreferrer" data-cursor="Open" className="block overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]" title="Open the full size picture">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={s.src} src={s.src} alt={`${name}: ${s.caption}`} loading="lazy" decoding="async" className="aspect-[16/10] w-full object-cover object-top" />
      </a>
      <figcaption className="mt-3 text-[0.88rem] leading-snug text-fog/80">{s.caption}</figcaption>
      {shots.length > 1 && (
        <div role="group" aria-label={`Screenshots of ${name}`} className="mt-3 grid grid-cols-3 gap-2">
          {shots.map((t, n) => (
            <button
              key={t.src}
              type="button"
              onClick={() => setI(n)}
              aria-pressed={n === i}
              aria-label={`Show screenshot ${n + 1} of ${shots.length}: ${t.caption}`}
              data-cursor="View"
              className={`overflow-hidden rounded-lg border transition-[opacity,border-color] ${n === i ? "border-accent" : "border-white/10 opacity-60 hover:opacity-100"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.src} alt="" loading="lazy" decoding="async" className="aspect-[16/10] w-full object-cover object-top" />
            </button>
          ))}
        </div>
      )}
    </figure>
  );
}
