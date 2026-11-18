"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { chooseLite, detectCapability, initialPerf } from "@/lib/capability";
import { useStore } from "@/store/useStore";
import SoundBridge from "./SoundBridge";
import LiteSite from "./lite/LiteSite";
import Loader from "./ui/Loader";
import Ticker from "./ui/Ticker";

// The whole 3D city (scene, labels, top bar, panel, cursor) is client only and loaded on demand,
// so a phone on the 2D page never downloads or parses any of it.
const Experience3D = dynamic(() => import("./Experience3D"), { ssr: false });

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
      webgl2: cap.webgl2,
      autoPerf: auto,
      perf,
    });
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
    // a finger has no hover, so touch screens skip this
    if (window.matchMedia("(pointer: coarse)").matches) return;
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
      {lite === false && <Experience3D />}
      {lite === true && <LiteSite />}
      {lite !== null && <SoundBridge />}
      <Ticker />
      <Loader />
    </>
  );
}
