"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import gsap from "gsap";
import { chooseLite, detectCapability, initialPerf } from "@/lib/capability";
import { buildBed, buildChain, MASTER, playCue } from "@/lib/sound";
import { rig } from "./scene/rig";
import { useStore } from "@/store/useStore";
import DeepLink from "./DeepLink";
import SoundBridge from "./SoundBridge";
import LiteSite from "./lite/LiteSite";
import FocusPanel from "./ui/FocusPanel";
import Labels from "./ui/Labels";
import Loader from "./ui/Loader";
import Overlay from "./ui/Overlay";
import Ticker from "./ui/Ticker";
import Cursor from "./ui/Cursor";

// The 3D scene is client only and loaded on demand, so the 2D version never downloads three.js.
const SceneCanvas = dynamic(() => import("./scene/SceneCanvas"), { ssr: false });

/** Decides between the 3D city and the 2D page, then mounts the right layers. */
export default function Root() {
  const lite = useStore((s) => s.lite);
  const perf = useStore((s) => s.perf);

  useEffect(() => {
    const cap = detectCapability();
    const { perf, auto } = initialPerf(cap);
    useStore.getState().init({
      lite: chooseLite(cap),
      reducedMotion: cap.reducedMotion,
      coarse: cap.coarse,
      autoPerf: auto,
      perf,
    });
    // ?debug exposes the camera rig and store in the console (for testing and tuning only)
    if (new URLSearchParams(window.location.search).has("debug")) {
      (window as unknown as Record<string, unknown>).__city = { gsap, rig, store: useStore, synth: { buildBed, buildChain, playCue, MASTER } };
    }
  }, []);

  // the page scrolls only in 2D mode (see globals.css)
  useEffect(() => {
    document.body.dataset.lite = String(lite === true);
  }, [lite]);

  // the lowest quality tier also drops the glass blur (see globals.css)
  useEffect(() => {
    document.body.dataset.perf = String(perf);
  }, [perf]);

  // liquid glass: the highlight on a glass surface follows the pointer.
  // Pointer events can arrive several times per frame (a gaming mouse sends 1000 a second), so the work is done once per frame.
  useEffect(() => {
    let raf = 0;
    let last: PointerEvent | null = null;
    const apply = () => {
      raf = 0;
      const e = last;
      last = null;
      const g = (e?.target as Element | null)?.closest?.<HTMLElement>(".glass");
      if (!e || !g) return;
      const r = g.getBoundingClientRect();
      g.style.setProperty("--mx", `${(e.clientX - r.left).toFixed(0)}px`);
      g.style.setProperty("--my", `${(e.clientY - r.top).toFixed(0)}px`);
    };
    const move = (e: PointerEvent) => {
      last = e;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {lite === false && (
        <>
          <SceneCanvas />
          <Labels />
          <Overlay />
          <FocusPanel />
          <DeepLink />
          <Cursor />
        </>
      )}
      {lite === true && <LiteSite />}
      {lite !== null && <SoundBridge />}
      <Ticker />
      <Loader />
    </>
  );
}
