export interface Capability {
  webgl2: boolean;
  reducedMotion: boolean;
  coarse: boolean;
  small: boolean;
  lowPower: boolean;
}

/** Runs on the client only. */
export function detectCapability(): Capability {
  let webgl2 = false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    webgl2 = !!gl;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webgl2 = false;
  }
  const mq = (q: string) => window.matchMedia(q).matches;
  const nav = navigator as Navigator & { deviceMemory?: number };
  return {
    webgl2,
    reducedMotion: mq("(prefers-reduced-motion: reduce)"),
    coarse: mq("(pointer: coarse)"),
    small: window.innerWidth < 820,
    lowPower: (navigator.hardwareConcurrency ?? 8) <= 2 || (nav.deviceMemory ?? 8) <= 2,
  };
}

/**
 * Decide between the 3D city and the fast 2D version.
 * Override with ?mode=lite or ?mode=3d (also remembered in localStorage by the toggle).
 */
export function chooseLite(cap: Capability): boolean {
  const params = new URLSearchParams(window.location.search);
  const q = params.get("mode");
  if (q === "lite") return true;
  if (q === "3d") return false;
  try {
    const saved = localStorage.getItem("cc-mode");
    if (saved === "lite") return true;
    if (saved === "3d") return false;
  } catch {
    /* storage blocked: ignore */
  }
  if (!cap.webgl2) return true;
  if (cap.coarse && cap.small) return true;
  if (cap.lowPower) return true;
  return false;
}

/**
 * ?perf=2 (or "high"), ?perf=1, ?perf=0 pin a quality tier and turn off the automatic quality control.
 * Handy for demos, screenshots and for testing on a slow machine.
 * Without it the 3D city starts at full quality on a laptop or desktop, one step lower on tablets and weak machines,
 * and the quality governor (scene/quality.ts) moves it up or down from there.
 */
export function initialPerf(cap: Capability): { perf: 0 | 1 | 2; auto: boolean } {
  const q = new URLSearchParams(window.location.search).get("perf");
  if (q === "high" || q === "2") return { perf: 2, auto: false };
  if (q === "1") return { perf: 1, auto: false };
  if (q === "0" || q === "low") return { perf: 0, auto: false };
  return { perf: cap.coarse || cap.lowPower ? 1 : 2, auto: true };
}
