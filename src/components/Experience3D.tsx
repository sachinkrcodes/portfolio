"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import gsap from "gsap";
import { buildBed, buildChain, MASTER, playCue } from "@/lib/sound";
import { rig } from "./scene/rig";
import { useStore } from "@/store/useStore";
import DeepLink from "./DeepLink";
import FocusPanel from "./ui/FocusPanel";
import Labels from "./ui/Labels";
import Overlay from "./ui/Overlay";
import Cursor from "./ui/Cursor";

// The 3D scene is client only and loaded on demand, so the 2D version never downloads three.js.
const SceneCanvas = dynamic(() => import("./scene/SceneCanvas"), { ssr: false });

/**
 * Everything that belongs to the 3D city: the scene, the labels, the top bar, the glass panel, deep links and the cursor.
 * Root loads it only when the 3D city is chosen, so the 2D page (phones) never downloads or parses any of it.
 */
export default function Experience3D() {
  useEffect(() => {
    // ?debug exposes the camera rig and store in the console (for testing and tuning only)
    if (new URLSearchParams(window.location.search).has("debug")) {
      (window as unknown as Record<string, unknown>).__city = { gsap, rig, store: useStore, synth: { buildBed, buildChain, playCue, MASTER } };
    }
  }, []);
  return (
    <>
      <SceneCanvas />
      <Labels />
      <Overlay />
      <FocusPanel />
      <DeepLink />
      <Cursor />
    </>
  );
}
