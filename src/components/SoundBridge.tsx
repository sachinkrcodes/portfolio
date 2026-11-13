"use client";

import { useEffect } from "react";
import { sound } from "@/lib/sound";
import { useStore } from "@/store/useStore";

/**
 * Connects the site to the sound engine: islands and buildings under the pointer, panels opening and closing,
 * and button presses each make a small cue. Does nothing while sound is off. Renders nothing.
 */
export default function SoundBridge() {
  useEffect(() => {
    const unsub = useStore.subscribe((st, prev) => {
      if (st.hover && !prev.hover) sound.cue("hover");
      if (st.focus && !prev.focus) sound.cue("open");
      else if (!st.focus && prev.focus) sound.cue("close");
      else if (st.focus && prev.focus && (st.focus.island !== prev.focus.island || st.focus.sub !== prev.focus.sub)) sound.cue("tap");
    });
    const press = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest?.("button, a, [role='button'], summary")) sound.cue("tap");
    };
    const visibility = () => sound.setHidden(document.hidden);
    document.addEventListener("pointerdown", press, { capture: true, passive: true });
    document.addEventListener("visibilitychange", visibility);
    return () => {
      unsub();
      document.removeEventListener("pointerdown", press, true);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  return null;
}
