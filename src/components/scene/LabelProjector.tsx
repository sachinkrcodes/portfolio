"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { islandOrder, type IslandId } from "@/data/content";
import { ISLANDS, SUBS } from "./constants";
import { useStore } from "@/store/useStore";
import { heroCopy, islandGroups, labelEls } from "./registry";
import { rig } from "./rig";

interface Anchor {
  key: string;
  island: IslandId;
  dx: number;
  dz: number;
  /** where the label chip sits above the platform */
  top: number;
  /** where its stem touches the island */
  base: number;
}

/**
 * Moves the DOM labels so they sit above their islands, with a stem that runs down to the island.
 * Runs in the render loop and writes straight to the elements (no React state), so labels follow the
 * floating islands at full frame rate for free.
 */
export default function LabelProjector() {
  const a = useMemo(() => new THREE.Vector3(), []);
  const b = useMemo(() => new THREE.Vector3(), []);
  const widths = useMemo(() => new Map<string, number>(), []);
  const heights = useMemo(() => new Map<string, number>(), []);
  // where the hero text is on screen (measured every so often while the hero is up), and a frame counter for that
  const copy = useMemo(() => ({ rects: [] as { l: number; t: number; r: number; b: number }[], n: 0 }), []);
  // the last values written to each label element, so a label that has not moved is not touched (no needless style work per frame).
  // Keyed by the element itself: a label that React creates again starts with a clean slate.
  const written = useMemo(() => new WeakMap<HTMLElement, { t: string; stem: string; dx: string; behind: string; near: string; covered: string }>(), []);

  const anchors = useMemo<Anchor[]>(
    () => [
      ...islandOrder.map((id) => ({ key: id, island: id, dx: 0, dz: 0, top: ISLANDS[id].labelY, base: 0.6 })),
      ...Object.entries(SUBS).map(([sub, s]) => ({ key: `sub:${sub}`, island: s.island, dx: s.local[0], dz: s.local[2], top: s.labelY, base: 0.8 })),
    ],
    [],
  );

  // chip widths are measured once (and again after a resize) instead of every frame
  useEffect(() => {
    const clear = () => {
      widths.clear();
      heights.clear();
      copy.n = 0;
    };
    window.addEventListener("resize", clear);
    return () => window.removeEventListener("resize", clear);
  }, [widths, heights, copy]);

  useFrame(({ camera, size }) => {
    const near = rig.cur.radius < 40 ? "1" : "0";
    const inHero = useStore.getState().mode === "hero";
    // On narrow screens the title card and the bars sit on top of the islands. A label that would end up behind them steps aside
    // until the visitor starts exploring. They only move when the window is resized, so they are measured every 20th frame.
    if (inHero && heroCopy.el && copy.n++ % 20 === 0) {
      copy.rects.length = 0;
      const parts = [
        ...heroCopy.el.querySelectorAll<HTMLElement>(".hero-pill, [data-w], .hero-role > span, .hero-actions .btn"),
        ...document.querySelectorAll<HTMLElement>("header .glass, .marquee"),
      ];
      for (const n of parts) {
        const r = n.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) copy.rects.push({ l: r.left, t: r.top, r: r.right, b: r.bottom });
      }
    }
    for (const an of anchors) {
      const el = labelEls.get(an.key);
      const g = islandGroups.get(an.island);
      if (!el || !g) continue;

      b.set(g.position.x + an.dx, g.position.y + an.base, g.position.z + an.dz).project(camera);
      a.set(g.position.x + an.dx, g.position.y + an.top, g.position.z + an.dz).project(camera);
      const bx = (b.x * 0.5 + 0.5) * size.width;
      const by = (-b.y * 0.5 + 0.5) * size.height;
      const ty = (-a.y * 0.5 + 0.5) * size.height;

      let w = widths.get(an.key);
      if (w === undefined) {
        const chip = el.querySelector<HTMLElement>(".city-chip");
        w = chip ? chip.offsetWidth : 0;
        if (w) widths.set(an.key, w);
      }
      // keep the chip on screen (the stem still points at the island)
      const half = w / 2 + 14;
      const cx = Math.min(Math.max(bx, half), Math.max(half, size.width - half));

      let covered = "0";
      if (inHero && w && !an.key.startsWith("sub:") && copy.rects.length) {
        let h = heights.get(an.key);
        if (h === undefined) {
          h = el.querySelector<HTMLElement>(".city-chip")?.offsetHeight ?? 0;
          if (h) heights.set(an.key, h);
        }
        if (h) {
          // stay hidden until it is clearly clear of the text (28 px), so a label at the edge does not flicker while the camera drifts
          const pad = written.get(el)?.covered === "1" ? 28 : 8;
          const stem = Math.min(420, Math.max(14, by - ty));
          const l = cx - w / 2 - pad;
          const r = cx + w / 2 + pad;
          const t = by - stem - h - pad;
          const bm = by - stem + pad;
          for (const c of copy.rects) {
            if (l < c.r && r > c.l && t < c.b && bm > c.t) {
              covered = "1";
              break;
            }
          }
        }
      }

      const next = {
        t: `translate3d(${bx.toFixed(1)}px, ${by.toFixed(1)}px, 0)`,
        stem: `${Math.min(420, Math.max(14, by - ty)).toFixed(0)}px`,
        dx: `${(cx - bx).toFixed(0)}px`,
        behind: b.z > 1 ? "1" : "0",
        near,
        covered,
      };
      const prev = written.get(el);
      if (prev?.t !== next.t) el.style.transform = next.t;
      if (prev?.stem !== next.stem) el.style.setProperty("--stem", next.stem);
      if (prev?.dx !== next.dx) el.style.setProperty("--dx", next.dx);
      if (prev?.behind !== next.behind) el.dataset.behind = next.behind;
      if (prev?.near !== next.near) el.dataset.near = next.near;
      if (prev?.covered !== next.covered) el.dataset.covered = next.covered;
      written.set(el, next);
    }
  });

  return null;
}
