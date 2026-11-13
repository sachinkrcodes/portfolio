import { create } from "zustand";
import type { IslandId } from "@/data/content";

export type Mode = "loading" | "hero" | "explore" | "focus";
/** Places the panel can open on without an island: the whole city stays in view and the panel opens beside it. */
export type WidePlaceId = "about" | "contact";
/** A place the panel can open on: one of the four islands, "about" or "contact". */
export type PlaceId = IslandId | WidePlaceId;
export const isWidePlace = (id: PlaceId): id is WidePlaceId => id === "about" || id === "contact";
export interface Target {
  island: PlaceId;
  /** Optional sub target inside an island, e.g. one project on the projects island. */
  sub?: string;
}

const same = (a: Target | null, b: Target | null) => a?.island === b?.island && a?.sub === b?.sub;

interface State {
  /** null until the capability check has run on the client */
  lite: boolean | null;
  reducedMotion: boolean;
  coarse: boolean;
  /** 3D scene has compiled and rendered its first frames */
  ready: boolean;
  /** loader wipe has started: the camera may start moving in */
  revealed: boolean;
  /** loader wipe has finished: hero text may animate in */
  uiReady: boolean;
  mode: Mode;
  hover: Target | null;
  focus: Target | null;
  /** 2 = full effects, 1 = reduced, 0 = minimal */
  perf: 0 | 1 | 2;
  /** resolution scale on top of the tier's own pixel ratio cap (1 = full), moved by the quality governor */
  res: number;
  autoPerf: boolean;

  init: (o: { lite: boolean; reducedMotion: boolean; coarse: boolean; autoPerf: boolean; perf: 0 | 1 | 2 }) => void;
  setLite: (v: boolean) => void;
  setReady: () => void;
  beginReveal: () => void;
  finishReveal: () => void;
  setMode: (m: Mode) => void;
  setHover: (t: Target | null) => void;
  focusOn: (t: Target) => void;
  clearFocus: () => void;
  setPerf: (p: 0 | 1 | 2) => void;
  /** one step of the quality governor: a tier and a resolution scale together */
  setQuality: (perf: 0 | 1 | 2, res: number) => void;
}

export const useStore = create<State>((set, get) => ({
  lite: null,
  reducedMotion: false,
  coarse: false,
  ready: false,
  revealed: false,
  uiReady: false,
  mode: "loading",
  hover: null,
  focus: null,
  perf: 2,
  res: 1,
  autoPerf: true,

  init: ({ lite, reducedMotion, coarse, autoPerf, perf }) => set({ lite, reducedMotion, coarse, autoPerf, perf, ready: lite ? true : get().ready }),
  setLite: (v) =>
    set({
      lite: v,
      ready: v ? true : get().ready,
      focus: null,
      hover: null,
      mode: get().revealed ? "hero" : get().mode,
    }),
  setReady: () => set({ ready: true }),
  beginReveal: () => set({ revealed: true, mode: "hero" }),
  finishReveal: () => set({ uiReady: true }),
  setMode: (m) => set({ mode: m }),
  setHover: (t) => {
    if (!same(get().hover, t)) set({ hover: t });
  },
  focusOn: (t) => {
    if (!get().revealed) return;
    set({ focus: t, mode: "focus", hover: null });
  },
  clearFocus: () => {
    if (get().mode !== "focus") return;
    set({ focus: null, mode: "explore" });
  },
  setPerf: (p) => set({ perf: p }),
  setQuality: (perf, res) => set({ perf, res }),
}));
