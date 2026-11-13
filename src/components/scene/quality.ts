/**
 * Automatic quality control for the 3D city. Pure logic (no React, no three.js), so it can be tested on its own.
 *
 * Quality is a ladder of "rungs", best first. Each rung is a post-processing tier (see Effects.tsx) and a resolution scale.
 * The governor watches the frame rate and walks the ladder:
 *   - down when the picture is not smooth (under LOW fps for DOWN_WINDOWS seconds in a row)
 *   - up when there is plenty of room (over HIGH fps for UP_WINDOWS seconds in a row)
 * Rules that keep it calm:
 *   - a rung that was tried, did not hold, and was left again within RETRY_SEC is not tried again
 *   - a walk down that gives no real gain after three steps (a 30 Hz screen, a slow processor: quality is not the problem)
 *     goes back to where it started and stops lowering quality for a long while
 *   - the second after a change, and any second with a resize, a tab switch or a pause of more than 2 seconds, is ignored
 */

export interface Rung {
  /** post-processing tier: 2 = full, 1 = reduced, 0 = minimal */
  perf: 0 | 1 | 2;
  /** pixel ratio multiplier on top of the tier's own cap */
  res: number;
}

export const LADDER: readonly Rung[] = [
  { perf: 2, res: 1 },
  { perf: 1, res: 1 },
  { perf: 1, res: 0.85 },
  { perf: 0, res: 0.85 },
  { perf: 0, res: 0.7 },
  { perf: 0, res: 0.55 },
];

/** The rung that matches a tier and resolution (used for the starting point). */
export function rungFor(perf: number, res = 1): number {
  let best = 0;
  let bestDist = Infinity;
  LADDER.forEach((r, i) => {
    const d = Math.abs(r.perf - perf) * 10 + Math.abs(r.res - res);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  });
  return best;
}

export interface GovernorOptions {
  /** length of one measuring window, seconds */
  windowSec: number;
  /** below this many frames per second a window counts as "not smooth" */
  low: number;
  /** above this many frames per second a window counts as "plenty of room" */
  high: number;
  /** consecutive not smooth windows before going down */
  downWindows: number;
  /** consecutive roomy windows before going up */
  upWindows: number;
  /** a rung left again within this many seconds of being entered going up is blocked for the rest of the session */
  retrySec: number;
  /** a walk down with less than this gain after three steps is undone */
  minGain: number;
  /** seconds without lowering quality after a walk that did not help */
  holdSec: number;
}

export const DEFAULTS: GovernorOptions = { windowSec: 1, low: 46, high: 57, downWindows: 2, upWindows: 6, retrySec: 20, minGain: 1.12, holdSec: 1500 };

export class Governor {
  rung: number;
  private readonly o: GovernorOptions;
  private acc = 0;
  private frames = 0;
  private lowRun = 0;
  private highRun = 0;
  private settle = 1;
  private skipWindow = false;
  private blocked = new Set<number>();
  private lastUpAt = -Infinity;
  private lastUpTo = -1;
  private walk: { from: number; fps: number; steps: number } | null = null;
  private noDownUntil = -Infinity;

  constructor(start = 0, options: Partial<GovernorOptions> = {}) {
    this.rung = start;
    this.o = { ...DEFAULTS, ...options };
  }

  /** Something outside our control disturbed the timing (resize, tab switch): ignore the window in progress. */
  disturb() {
    this.acc = 0;
    this.frames = 0;
    this.skipWindow = true;
  }

  /**
   * Feed one frame: `dt` seconds since the last one, `now` seconds on a steady clock.
   * Returns the new rung when quality should change, otherwise null.
   */
  update(dt: number, now: number): number | null {
    if (!(dt > 0)) return null;
    // a tab switch, a sleeping laptop or a paused debugger is not a measure of how fast we draw.
    // (A phone that really needs 0.5 to 2 seconds per frame is measured as usual: it is the one that needs help most.)
    if (dt > 2) {
      this.disturb();
      return null;
    }
    this.acc += dt;
    this.frames++;
    if (this.acc < this.o.windowSec) return null;

    const fps = this.frames / this.acc;
    this.acc = 0;
    this.frames = 0;
    if (this.skipWindow) {
      this.skipWindow = false;
      return null;
    }
    // the window right after a change holds the cost of the change itself (new buffers, new shaders)
    if (this.settle > 0) {
      this.settle--;
      return null;
    }

    if (fps < this.o.low) {
      this.lowRun++;
      this.highRun = 0;
    } else if (fps >= this.o.high) {
      this.highRun++;
      this.lowRun = 0;
    } else {
      this.lowRun = 0;
      this.highRun = 0;
    }
    // smooth again: the walk down is over
    if (this.walk && fps >= this.o.low) this.walk = null;

    const last = LADDER.length - 1;
    if (this.lowRun >= this.o.downWindows && this.rung < last && now >= this.noDownUntil) {
      if (!this.walk) this.walk = { from: this.rung, fps, steps: 0 };
      // three steps down and still no real gain: quality is not the bottleneck. Go back and leave it alone.
      if (this.walk.steps >= 3 && fps < this.walk.fps * this.o.minGain) {
        const back = this.walk.from;
        this.walk = null;
        this.noDownUntil = now + this.o.holdSec;
        return this.moveTo(back);
      }
      // a rung we only just climbed to did not hold: never try it again
      if (this.rung === this.lastUpTo && now - this.lastUpAt < this.o.retrySec) this.blocked.add(this.rung);
      this.walk.steps++;
      return this.moveTo(this.rung + 1);
    }
    if (this.highRun >= this.o.upWindows && this.rung > 0 && !this.walk && !this.blocked.has(this.rung - 1)) {
      this.lastUpAt = now;
      this.lastUpTo = this.rung - 1;
      return this.moveTo(this.rung - 1);
    }
    return null;
  }

  private moveTo(rung: number): number {
    this.rung = rung;
    this.lowRun = 0;
    this.highRun = 0;
    this.settle = 1;
    return rung;
  }
}
