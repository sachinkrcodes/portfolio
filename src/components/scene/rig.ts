import gsap from "gsap";
import type { IslandId } from "@/data/content";
import { isWidePlace, type PlaceId, type Target } from "@/store/useStore";
import { BOUNDS, HERO, ISLANDS, SUBS } from "./constants";

/**
 * Camera pose, orbit style: a look-at point, a distance, and two angles.
 * `shift` slides the whole picture sideways (fraction of screen width) to leave room for text or a panel.
 */
export interface Pose {
  x: number;
  y: number;
  z: number;
  radius: number;
  azimuth: number;
  elevation: number;
  shift: number;
}

export const INTRO: Pose = { x: 6.5, y: 1, z: -8, radius: 104, azimuth: -0.6, elevation: 0.95, shift: 0 };
export const HERO_POSE: Pose = {
  x: HERO.target[0],
  y: HERO.target[1],
  z: HERO.target[2],
  radius: HERO.radius,
  azimuth: 0,
  elevation: HERO.elevation,
  shift: HERO.shift,
};

/**
 * Module level singleton (not React state) so the render loop can read it without re-rendering anything.
 * `goal` is where the camera wants to be (GSAP and user input write here), `cur` is where it is (damped toward goal).
 */
export const rig = {
  goal: { ...INTRO } as Pose,
  cur: { ...INTRO } as Pose,
  /** how fast cur follows goal: high during scripted moves, lower during manual control */
  lambda: 5,
  /** pan inertia, world units per second */
  vx: 0,
  vz: 0,
  /** pointer position -1..1 (target and smoothed) for the parallax tilt */
  tpx: 0,
  tpy: 0,
  px: 0,
  py: 0,
  dragging: false,
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Scripted camera move. */
export function flyTo(p: Partial<Pose>, duration = 2.4, ease = "power3.inOut") {
  rig.vx = rig.vz = 0;
  rig.lambda = 9;
  gsap.to(rig.goal, {
    ...p,
    duration,
    ease,
    overwrite: "auto",
    onComplete: () => {
      rig.lambda = 5;
    },
  });
}

/** Slide the picture back to the centre (used when the hero text goes away). */
export function relaxShift(duration = 1.3) {
  gsap.to(rig.goal, { shift: 0, duration, ease: "power2.out", overwrite: "auto" });
}

/** The user grabbed the camera: stop any scripted move on the position and zoom. */
export function takeControl() {
  gsap.killTweensOf(rig.goal, "x,y,z,radius,azimuth,elevation");
  rig.lambda = 6;
}

export function clampGoal() {
  const g = rig.goal;
  g.x = clamp(g.x, BOUNDS.minX, BOUNDS.maxX);
  g.z = clamp(g.z, BOUNDS.minZ, BOUNDS.maxZ);
  g.radius = clamp(g.radius, BOUNDS.minR, BOUNDS.maxR);
}

/* ------------------------------------------------------------------ poses */

export function islandPose(id: IslandId): Pose {
  const c = ISLANDS[id];
  return { x: c.pos[0], y: c.pos[1] + 3, z: c.pos[2], radius: c.zoom, azimuth: c.azimuth, elevation: 0.52, shift: 0.17 };
}

export function subPose(sub: string): Pose | null {
  const s = SUBS[sub];
  if (!s) return null;
  const c = ISLANDS[s.island];
  return {
    x: c.pos[0] + s.local[0],
    y: c.pos[1] + 3.4,
    z: c.pos[2] + s.local[2],
    radius: s.zoom,
    azimuth: c.azimuth - 0.12 + s.view,
    elevation: 0.5,
    shift: 0.17,
  };
}

/** About: the whole city in view (a different angle from the hero), pushed left so the panel has room on the right. */
export function aboutPose(): Pose {
  return { x: HERO.target[0], y: HERO.target[1], z: HERO.target[2], radius: 72, azimuth: -0.12, elevation: 0.5, shift: 0.17 };
}

export function focusPose(t: Target): Pose {
  if (isWidePlace(t.island)) return aboutPose();
  return (t.sub ? subPose(t.sub) : null) ?? islandPose(t.island);
}

/** A comfortable overview of one island (used by "View Projects" and when leaving a close-up). */
export function overviewPose(id: PlaceId): Pose {
  // leaving About or Contact: the whole city, centred
  if (isWidePlace(id)) return { x: HERO.target[0], y: 0, z: HERO.target[2], radius: 74, azimuth: 0.04, elevation: 0.56, shift: 0 };
  const c = ISLANDS[id];
  return {
    x: clamp(c.pos[0], BOUNDS.minX, BOUNDS.maxX),
    y: 0,
    z: clamp(c.pos[2], BOUNDS.minZ, BOUNDS.maxZ),
    radius: Math.max(BOUNDS.minR + 14, c.zoom + 18),
    azimuth: 0.06,
    elevation: 0.58,
    shift: 0,
  };
}
