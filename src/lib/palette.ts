/**
 * THE COLOURS: two hues, nothing else.
 *
 *   CYAN  = light and energy: glows, data lines, anything you can click, focus rings.
 *   BLUE  = atmosphere and depth: sky, clouds, rock, shadows, the tint inside the glass.
 *
 * Every other colour on the site (backgrounds, panels, text tint, rocks, fog, glass edges) is made from these two by
 * mixing them with black or white. White and black are not counted as colours. Change the two hex values below and the
 * whole site (3D scene and interface) follows, because both read from this file.
 */
export const CYAN = "#22D3EE";
export const BLUE = "#2F6BFF";

type RGB = [number, number, number];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex([r, g, b]: RGB): string {
  const p = (v: number) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0");
  return `#${p(r)}${p(g)}${p(b)}`.toUpperCase();
}

function rgbToHsl([r, g, b]: RGB): [number, number, number] {
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === R) h = ((G - B) / d) % 6;
  else if (max === G) h = (B - R) / d + 2;
  else h = (R - G) / d + 4;
  return [(h * 60 + 360) % 360, s, l];
}

function hslToRgb(h: number, s: number, l: number): RGB {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

const hueCyan = rgbToHsl(hexToRgb(CYAN))[0];
const hueBlue = rgbToHsl(hexToRgb(BLUE))[0];

/**
 * A colour that lives on the line between the two hues.
 * t = 0 is the hue of CYAN, t = 1 is the hue of BLUE, 0.5 is the mixture of the two.
 * s = saturation and l = lightness (both 0 to 1). Low l gives the deep shades, low s the greyer ones.
 */
export function tone(t: number, s: number, l: number): string {
  const d = ((hueBlue - hueCyan + 540) % 360) - 180; // shortest way round the wheel
  const h = (hueCyan + d * clamp01(t) + 360) % 360;
  return rgbToHex(hslToRgb(h, clamp01(s), clamp01(l)));
}

/** Mix two hex colours (t = 0 gives a, t = 1 gives b). */
export function mixHex(a: string, b: string, t: number): string {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return rgbToHex([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]);
}

/** "rgba(r,g,b,a)" for canvas drawing. */
export function rgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ------------------------------------------------------------------ derived neutrals (shared by CSS and the 3D scene) */

/** The darkest base: the page and the night sky. It is BLUE at a very low lightness. */
export const INK = tone(1, 0.6, 0.05);
export const INK_2 = tone(1, 0.5, 0.085);
export const INK_3 = tone(1, 0.45, 0.13);
/** Text: white with a trace of BLUE. */
export const FOG = mixHex("#FFFFFF", BLUE, 0.06);
/** Secondary text. */
export const MUTE = tone(1, 0.22, 0.7);

/**
 * The palette as CSS custom properties. layout.tsx puts these on the <html> element (an inline style attribute),
 * and globals.css reads them. They are not written as a <style> tag on purpose: ad blockers and other browser
 * extensions insert their own <style> tags into <head> before React starts, and React then mixes them up with ours.
 */
export function cssVarMap(): Record<string, string> {
  return {
    "--c-cyan": CYAN,
    "--c-blue": BLUE,
    "--ink": INK,
    "--ink-2": INK_2,
    "--ink-3": INK_3,
    "--fog": FOG,
    "--mute": MUTE,
  };
}
