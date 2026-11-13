"use client";

import { useState } from "react";
import { milestones } from "@/data/content";

function PauseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
      <rect x="2" y="1.5" width="3" height="9" rx="1" />
      <rect x="7" y="1.5" width="3" height="9" rx="1" />
    </svg>
  );
}
function PlayIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
      <path d="M3 1.8v8.4a.6.6 0 0 0 .9.5l6.7-4.2a.6.6 0 0 0 0-1L3.9 1.3a.6.6 0 0 0-.9.5Z" />
    </svg>
  );
}

/**
 * Bottom marquee. The list is rendered twice so the loop is seamless; the copy is hidden from screen readers.
 * It moves by itself for longer than five seconds, so there is a Pause button (and it also pauses under the mouse,
 * and stands still when the visitor asked their device for reduced motion).
 */
export default function Ticker() {
  const [paused, setPaused] = useState(false);
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden}>
      {milestones.map((m, i) => (
        <li key={i} className="label flex items-center whitespace-nowrap text-fog/90">
          <span className="px-7">{m}</span>
          <span className="inline-block h-1 w-1 rounded-full bg-accent" aria-hidden="true" />
        </li>
      ))}
    </ul>
  );
  return (
    <aside
      aria-label="Highlights"
      data-paused={paused ? "1" : "0"}
      className="marquee glass fixed bottom-3.5 left-3.5 right-3.5 z-30 flex h-10 overflow-hidden sm:left-5 sm:right-5"
    >
      <button
        type="button"
        className="ticker-toggle grid h-10 w-10 shrink-0 place-items-center rounded-full text-fog/80 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="Pause the ticker"
        aria-pressed={paused}
        onClick={() => setPaused((p) => !p)}
        data-cursor={paused ? "Play" : "Pause"}
      >
        {paused ? <PlayIcon /> : <PauseIcon />}
      </button>
      {/* the fade sits on an inner layer so the capsule keeps its crisp glass edge */}
      <div className="h-full min-w-0 flex-1 overflow-hidden rounded-full" style={{ maskImage: "linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent)" }}>
        <div className="marquee-track flex h-full w-max items-center">
          {row(false)}
          {[1, 2, 3, 4, 5].map((k) => (
            <div key={k} className="flex shrink-0">
              {row(true)}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
