/**
 * Optional sound for the site. Everything is made live with the Web Audio API (no audio files to download).
 *
 *   - OFF by default. It starts only when the visitor presses a sound button, because browsers block sound that
 *     starts by itself and because a recruiter opening your site at work should never be surprised by noise.
 *   - A quiet ambient bed (a calm open chord that slowly breathes, plus a little air) and short cues:
 *     "hover" (an island or building is under the pointer), "tap" (a button), "open" and "close" (a panel).
 *   - The choice is remembered in localStorage ("cc-sound"). If it was on, sound starts again at the first click or key press.
 *   - It pauses when the tab is hidden and fades in and out, so it never clicks or cuts off.
 *
 * `buildBed` and `playCue` take any AudioContext, so they can also run offline (for testing the volume).
 */

export type Cue = "hover" | "tap" | "open" | "close" | "on";

const STORE_KEY = "cc-sound";
/** overall level of everything (0 to 1). The bed and the cues are mixed quietly below this. */
export const MASTER = 0.9;
/** the safety limiter at the end of the chain. It only touches loud peaks. */
const LIMITER = { threshold: -3, knee: 3, ratio: 20 };
/**
 * How loud the ambient bed is. Measured offline (see docs/GUIDE.md, "Sound"): about -28 dBFS RMS, which is background level,
 * far below the level of music. The cues below are set to sit a few dB above it, so they are heard but never sharp.
 */
const BED_LEVEL = 0.07;

/* ------------------------------------------------------------------ synthesis */

function noiseBuffer(ctx: BaseAudioContext, seconds: number): AudioBuffer {
  const buf = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * seconds)), ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  // brown noise: a low, soft hiss (like wind), not the sharp hiss of white noise
  for (let i = 0; i < d.length; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    d[i] = last * 3.5;
  }
  return buf;
}

/** The ambient bed. Returns a function that stops it. */
export function buildBed(ctx: BaseAudioContext, dest: AudioNode): () => void {
  const bus = ctx.createGain();
  bus.gain.value = BED_LEVEL;
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 720;
  lowpass.Q.value = 0.4;
  lowpass.connect(bus);
  bus.connect(dest);

  const sources: AudioScheduledSourceNode[] = [];
  // A2 (twice, slightly apart, so the two beat slowly), E3, A3, B3, then E4 and A4 higher up: an open, calm chord.
  // The low notes give body on headphones; the higher ones are what small laptop and phone speakers can actually play.
  const voices: Array<{ f: number; cents: number; level: number; type: OscillatorType }> = [
    { f: 110, cents: -5, level: 0.5, type: "sine" },
    { f: 110, cents: 6, level: 0.4, type: "triangle" },
    { f: 164.81, cents: 3, level: 0.32, type: "sine" },
    { f: 246.94, cents: -4, level: 0.17, type: "sine" },
    { f: 220, cents: 2, level: 0.22, type: "triangle" },
    { f: 329.63, cents: 4, level: 0.16, type: "sine" },
    { f: 440, cents: -3, level: 0.1, type: "sine" },
  ];
  voices.forEach((v, i) => {
    const osc = ctx.createOscillator();
    osc.type = v.type;
    osc.frequency.value = v.f;
    osc.detune.value = v.cents;
    const gain = ctx.createGain();
    gain.gain.value = v.level;
    // every voice swells and fades at its own slow pace
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.045 + i * 0.017;
    const depth = ctx.createGain();
    depth.gain.value = v.level * 0.45;
    lfo.connect(depth);
    depth.connect(gain.gain);
    osc.connect(gain);
    gain.connect(lowpass);
    osc.start();
    lfo.start();
    sources.push(osc, lfo);
  });

  // the filter opens and closes very slowly: the sound seems to breathe
  const sweep = ctx.createOscillator();
  sweep.frequency.value = 0.05;
  const sweepDepth = ctx.createGain();
  sweepDepth.gain.value = 230;
  sweep.connect(sweepDepth);
  sweepDepth.connect(lowpass.frequency);
  sweep.start();
  sources.push(sweep);

  // a little air
  const air = ctx.createBufferSource();
  air.buffer = noiseBuffer(ctx, 3);
  air.loop = true;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 900;
  band.Q.value = 0.6;
  const airGain = ctx.createGain();
  airGain.gain.value = 0.05;
  air.connect(band);
  band.connect(airGain);
  airGain.connect(bus);
  air.start();
  sources.push(air);

  return () => {
    sources.forEach((s) => {
      try {
        s.stop();
      } catch {
        /* already stopped */
      }
    });
    bus.disconnect();
  };
}

/** One short sound. `when` is on the context's own clock (seconds). */
export function playCue(ctx: BaseAudioContext, dest: AudioNode, cue: Cue, when = ctx.currentTime) {
  const blip = (freq: number, at: number, dur: number, peak: number, type: OscillatorType = "sine", glide = 1) => {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, at);
    if (glide !== 1) osc.frequency.exponentialRampToValueAtTime(freq * glide, at + dur);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(peak, at + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(at);
    osc.stop(at + dur + 0.05);
  };
  // a soft rush of air that rises (opening) or falls (closing)
  const whoosh = (at: number, dur: number, from: number, to: number, peak: number) => {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx, dur + 0.1);
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.Q.value = 0.9;
    band.frequency.setValueAtTime(from, at);
    band.frequency.exponentialRampToValueAtTime(to, at + dur);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(peak, at + dur * 0.35);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    src.connect(band);
    band.connect(gain);
    gain.connect(dest);
    src.start(at);
    src.stop(at + dur + 0.1);
  };

  switch (cue) {
    case "hover":
      blip(1180, when, 0.07, 0.075, "sine", 1.2);
      break;
    case "tap":
      blip(640, when, 0.07, 0.15, "triangle", 0.8);
      break;
    case "open":
      whoosh(when, 0.5, 300, 1900, 0.09);
      blip(392, when, 0.3, 0.15);
      blip(587, when + 0.09, 0.36, 0.13);
      blip(784, when + 0.19, 0.55, 0.085);
      break;
    case "close":
      whoosh(when, 0.4, 1700, 300, 0.075);
      blip(587, when, 0.24, 0.13);
      blip(392, when + 0.1, 0.42, 0.115);
      break;
    case "on":
      blip(440, when, 0.5, 0.14);
      blip(554.37, when + 0.1, 0.5, 0.12);
      blip(659.25, when + 0.2, 0.7, 0.1);
      break;
  }
}

/**
 * The path every sound takes to the speakers: `out` (the master volume) goes through a limiter, so nothing can ever be loud.
 * `cues` is where the short cues play: they go through a small echo, which gives them some space.
 * The engine and the loudness test use this same function, so what is measured is what is heard.
 */
export function buildChain(ctx: BaseAudioContext, level = 0): { out: GainNode; cues: GainNode } {
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = LIMITER.threshold;
  limiter.knee.value = LIMITER.knee;
  limiter.ratio.value = LIMITER.ratio;
  limiter.attack.value = 0.004;
  limiter.release.value = 0.25;
  const out = ctx.createGain();
  out.gain.value = level;
  out.connect(limiter);
  limiter.connect(ctx.destination);

  const cues = ctx.createGain();
  const echo = ctx.createDelay(0.5);
  echo.delayTime.value = 0.19;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.3;
  const wet = ctx.createGain();
  wet.gain.value = 0.35;
  cues.connect(out);
  cues.connect(echo);
  echo.connect(feedback);
  feedback.connect(echo);
  echo.connect(wet);
  wet.connect(out);
  return { out, cues };
}

/* ------------------------------------------------------------------ the engine the site talks to */

type ACtor = typeof AudioContext;

class SoundEngine {
  private ctx: AudioContext | null = null;
  private out: GainNode | null = null;
  private cues: GainNode | null = null;
  private stopBed: (() => void) | null = null;
  private want = false;
  private armed = false;
  private hidden = false;
  private lastHover = 0;
  private readonly subs = new Set<() => void>();

  constructor() {
    if (typeof window === "undefined") return;
    try {
      this.want = window.localStorage.getItem(STORE_KEY) === "on";
    } catch {
      /* storage blocked: sound simply starts off every time */
    }
    // sound that was on last time starts again at the first click or key press (browsers do not allow it before)
    if (this.want) this.arm();
  }

  /* what React reads */
  subscribe = (fn: () => void) => {
    this.subs.add(fn);
    return () => void this.subs.delete(fn);
  };
  getSnapshot = () => this.want;
  getServerSnapshot = () => false;

  /** Is sound supported here at all? */
  get supported() {
    return typeof window !== "undefined" && !!(window.AudioContext ?? (window as unknown as { webkitAudioContext?: ACtor }).webkitAudioContext);
  }

  /** Switch on or off. Call it from a click or key press. */
  set(on: boolean) {
    if (on === this.want) return;
    this.want = on;
    try {
      window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      /* ignore */
    }
    if (on) void this.start(true);
    else this.fadeOut();
    this.subs.forEach((f) => f());
  }
  toggle() {
    this.set(!this.want);
  }

  /** The tab went to the background or came back. */
  setHidden(hidden: boolean) {
    this.hidden = hidden;
    if (!this.ctx) return;
    if (hidden) void this.ctx.suspend().catch(() => {});
    else if (this.want) void this.ctx.resume().catch(() => {});
  }

  /** Play a short cue (does nothing while sound is off or the tab is hidden). */
  cue(name: Cue) {
    const ctx = this.ctx;
    if (!this.want || !ctx || !this.cues || ctx.state !== "running" || this.hidden) return;
    if (name === "hover") {
      const now = performance.now();
      if (now - this.lastHover < 140) return;
      this.lastHover = now;
    }
    playCue(ctx, this.cues, name);
  }

  private arm() {
    if (this.armed) return;
    this.armed = true;
    const go = () => {
      window.removeEventListener("click", go, true);
      window.removeEventListener("keydown", go, true);
      window.removeEventListener("touchend", go, true);
      this.armed = false;
      if (this.want) void this.start(false);
    };
    window.addEventListener("click", go, true);
    window.addEventListener("keydown", go, true);
    window.addEventListener("touchend", go, true);
  }

  private ensure(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: ACtor }).webkitAudioContext;
    if (!AC) return null;
    const ctx = new AC({ latencyHint: "interactive" });
    const { out, cues } = buildChain(ctx);
    this.ctx = ctx;
    this.out = out;
    this.cues = cues;
    return ctx;
  }

  private async start(chime: boolean) {
    const ctx = this.ensure();
    if (!ctx || !this.out) {
      // this browser has no Web Audio: say so by switching back off
      this.want = false;
      this.subs.forEach((f) => f());
      return;
    }
    try {
      if (ctx.state !== "running") await ctx.resume();
    } catch {
      return;
    }
    if (!this.want) return;
    if (!this.stopBed && this.out) this.stopBed = buildBed(ctx, this.out);
    const t = ctx.currentTime;
    this.out.gain.cancelScheduledValues(t);
    this.out.gain.setTargetAtTime(MASTER, t, 0.7);
    if (chime && this.cues) playCue(ctx, this.cues, "on");
  }

  private fadeOut() {
    const ctx = this.ctx;
    if (!ctx || !this.out) return;
    const t = ctx.currentTime;
    this.out.gain.cancelScheduledValues(t);
    this.out.gain.setTargetAtTime(0, t, 0.1);
    window.setTimeout(() => {
      if (this.want) return;
      this.stopBed?.();
      this.stopBed = null;
      void ctx.suspend().catch(() => {});
    }, 700);
  }
}

export const sound = new SoundEngine();
