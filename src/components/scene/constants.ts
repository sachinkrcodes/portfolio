import { projects, type IslandId } from "@/data/content";
import { BLUE, CYAN, INK, tone } from "@/lib/palette";

/** Light and energy (glows, lines, lit windows): the cyan. */
export const ACCENT = CYAN;
/** Atmosphere (sky, clouds, rock): the blue. */
export const BLUE_HEX = BLUE;
export const BG = INK;
export const FOG_COLOR = tone(0.75, 0.5, 0.075);
export const FOG_DENSITY = 0.0105;

/**
 * Every colour in the 3D scene, made from the two palette hues only.
 * tone(t, saturation, lightness): t = 0 is the cyan hue, t = 1 the blue hue, 0.5 the mixture of the two.
 */
export const SCENE = {
  // lights
  hemiSky: tone(0.63, 0.41, 0.49),
  hemiGround: tone(0.86, 0.49, 0.084),
  moon: tone(0.83, 1, 0.83),
  underglow: tone(0.3, 0.58, 0.44),
  // sea of clouds (dark to light)
  cloudLowA: tone(0.8, 0.7, 0.07),
  cloudLowB: tone(0.78, 0.66, 0.36),
  cloudMidA: tone(0.8, 0.7, 0.1),
  cloudMidB: tone(0.72, 0.62, 0.4),
  // island rock
  rockRim: tone(1, 0.26, 0.39),
  rockMid: tone(1, 0.295, 0.24),
  rockTip: tone(1, 0.355, 0.12),
  chunk: tone(1, 0.33, 0.153),
  // buildings
  hull: tone(1, 0.31, 0.24),
  hullLight: tone(1, 0.28, 0.355),
  rack: tone(1, 0.32, 0.092),
  windowBody: tone(1, 0.34, 0.065),
  bar: tone(0.5, 0.52, 0.082),
  hazardBase: tone(1, 0.34, 0.07),
  crateA: tone(1, 0.3, 0.15),
  crateB: tone(1, 0.3, 0.19),
  crateC: tone(1, 0.3, 0.12),
  crateEdge: tone(1, 0.3, 0.25),
};

export interface IslandCfg {
  pos: [number, number, number];
  /** platform radius */
  r: number;
  /** how far the rock hangs below the platform */
  depth: number;
  phase: number;
  seed: number;
  /** camera azimuth (radians) when focused on this island */
  azimuth: number;
  /** camera distance when focused on this island */
  zoom: number;
  /** height of the floating label above the island centre */
  labelY: number;
}

export const ISLANDS: Record<IslandId, IslandCfg> = {
  projects: { pos: [10, 0, -4], r: 8.6, depth: 7.6, phase: 0.0, seed: 1.3, azimuth: 0.18, zoom: 38, labelY: 8.6 },
  research: { pos: [6, 5.5, -23], r: 6.4, depth: 6.2, phase: 1.7, seed: 4.1, azimuth: -0.2, zoom: 27, labelY: 8.0 },
  experience: { pos: [-6.5, -1.5, 3], r: 6.8, depth: 6.6, phase: 3.1, seed: 7.7, azimuth: -0.3, zoom: 29, labelY: 6.8 },
  building: { pos: [18, -2.5, 10], r: 5.5, depth: 5.4, phase: 4.4, seed: 9.2, azimuth: 0.32, zoom: 31, labelY: 9.8 },
};

type V3 = [number, number, number];

/** The look of a project building on the projects island. */
export type BuildingKind = "bloodbank" | "sentiment" | "suzuki" | "pipeline" | "dish" | "tiers";

/**
 * Where project buildings stand on the projects island (offsets from the island centre).
 * The island has room for six. The first three are the original spots.
 * `view` turns the close-up camera a little (radians) so a building at the back is seen from the side, not through the one in front.
 */
export const PROJECT_SLOTS: Array<{ at: V3; view: number }> = [
  { at: [-3.4, 0, 0.8], view: 0 },
  { at: [3.4, 0, 3.0], view: 0 },
  { at: [1.0, 0, -4.4], view: 0 },
  { at: [4.9, 0, -1.5], view: 0.85 },
  { at: [-3.9, 0, -3.6], view: -0.85 },
  { at: [-1.5, 0, 5.1], view: 0 },
];

/** The first three buildings are modelled on their projects, so they follow the project by id and keep their spot. */
const ORIGINAL: Record<string, { kind: BuildingKind; slot: number; labelY: number; zoom: number }> = {
  "blood-bank-finder": { kind: "bloodbank", slot: 0, labelY: 8.6, zoom: 18 },
  "sentiment-analysis-app": { kind: "sentiment", slot: 1, labelY: 7.2, zoom: 17 },
  "suzuki-kasami-simulator": { kind: "suzuki", slot: 2, labelY: 4.8, zoom: 17 },
};
/** Every other project gets one of these in turn (or the one named in its `building` field). Tall ones first: they go to the back of the island. */
const EXTRA_KINDS = ["dish", "tiers", "pipeline"] as const;
const EXTRA_LABEL_Y: Record<(typeof EXTRA_KINDS)[number], number> = { dish: 7.0, tiers: 6.6, pipeline: 4.8 };

export interface ProjectBuilding {
  id: string;
  kind: BuildingKind;
  local: V3;
  label: string;
  zoom: number;
  labelY: number;
  view: number;
}

/** One building per project, built from `projects` in content.ts. Projects beyond the sixth have no building (the panel and 2D page still show them). */
function layoutBuildings(): ProjectBuilding[] {
  const taken = new Set<number>();
  const byId = new Map<string, ProjectBuilding>();
  for (const p of projects) {
    const o = ORIGINAL[p.id];
    if (!o) continue;
    taken.add(o.slot);
    byId.set(p.id, { id: p.id, kind: o.kind, local: PROJECT_SLOTS[o.slot].at, label: p.name, zoom: o.zoom, labelY: o.labelY, view: PROJECT_SLOTS[o.slot].view });
  }
  let free = 0;
  let extra = 0;
  for (const p of projects) {
    if (byId.has(p.id)) continue;
    while (taken.has(free)) free++;
    if (free >= PROJECT_SLOTS.length) break;
    taken.add(free);
    const kind = p.building ?? EXTRA_KINDS[extra++ % EXTRA_KINDS.length];
    byId.set(p.id, {
      id: p.id,
      kind,
      local: PROJECT_SLOTS[free].at,
      label: p.name,
      zoom: 17,
      labelY: EXTRA_LABEL_Y[kind as (typeof EXTRA_KINDS)[number]],
      view: PROJECT_SLOTS[free].view,
    });
  }
  return projects.filter((p) => byId.has(p.id)).map((p) => byId.get(p.id)!);
}

export const BUILDINGS: ProjectBuilding[] = layoutBuildings();

/** Sub targets on the projects island (local offsets from the island centre), one per building. */
export const SUBS: Record<string, { island: IslandId; local: V3; zoom: number; label: string; labelY: number; view: number }> = Object.fromEntries(
  BUILDINGS.map((b) => [b.id, { island: "projects" as IslandId, local: b.local, zoom: b.zoom, label: b.label, labelY: b.labelY, view: b.view }]),
);

/** Camera for the hero (slow drift) and bounds for explore mode. */
export const HERO = { target: [6.5, 1, -8] as [number, number, number], radius: 75, elevation: 0.5, shift: -0.23 };
export const BOUNDS = { minX: -26, maxX: 42, minZ: -38, maxZ: 24, minR: 15, maxR: 96 };

/** Data lines between islands (from, to, arc height). */
export const LINKS: Array<{ from: IslandId; to: IslandId; lift: number }> = [
  { from: "experience", to: "projects", lift: 6 },
  { from: "projects", to: "research", lift: 7 },
  { from: "research", to: "experience", lift: 8 },
  { from: "building", to: "projects", lift: 4 },
];
