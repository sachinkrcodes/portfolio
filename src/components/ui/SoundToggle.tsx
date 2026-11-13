"use client";

import { useSyncExternalStore } from "react";
import { sound } from "@/lib/sound";

/** True while sound is switched on (shared by every sound control on the page). */
export function useSoundOn() {
  return useSyncExternalStore(sound.subscribe, sound.getSnapshot, sound.getServerSnapshot);
}

/** A small icon button for the top bars: a speaker with waves when sound is on, with a slash when it is off. */
export default function SoundToggle({ className = "" }: { className?: string }) {
  const on = useSoundOn();
  if (!sound.supported) return null;
  return (
    <button
      type="button"
      className={className}
      aria-pressed={on}
      aria-label="Sound"
      title={on ? "Sound is on. Click to turn it off." : "Turn sound on"}
      data-cursor={on ? "Sound off" : "Sound on"}
      onClick={() => sound.toggle()}
    >
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M3 7.6v4.8h3.2L10.6 16V4L6.2 7.6H3z" fill="currentColor" />
        {on ? (
          <path d="M13.2 7.3a3.6 3.6 0 0 1 0 5.4M15.5 5a6.8 6.8 0 0 1 0 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        ) : (
          <path d="M13.4 7.8l4.4 4.4m0-4.4l-4.4 4.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        )}
      </svg>
    </button>
  );
}
