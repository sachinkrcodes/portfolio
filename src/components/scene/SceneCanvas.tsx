"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useStore } from "@/store/useStore";
import { BG } from "./constants";
import CameraRig from "./CameraRig";
import Effects from "./Effects";
import Interaction from "./Interaction";
import LabelProjector from "./LabelProjector";
import { pickAt } from "./picking";
import { Governor, LADDER, rungFor } from "./quality";
import World from "./World";

/** Tells the loader when shaders are compiled and a few frames have been drawn. */
function ReadySignal() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    let alive = true;
    let fired = false;
    // ?debug: expose the renderer, scene and a picking helper in the console (for testing only)
    const dbg = (window as unknown as { __city?: Record<string, unknown> }).__city;
    if (dbg) {
      dbg.gl = gl;
      dbg.scene = scene;
      dbg.camera = camera;
      dbg.pick = (x: number, y: number) => pickAt(new THREE.Vector2(x, y), camera);
    }
    const fire = () => {
      if (!alive || fired) return;
      fired = true;
      let n = 0;
      const tick = () => {
        if (!alive) return;
        if (++n >= 3) useStore.getState().setReady();
        else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    // never leave the visitor on the loader: go ahead after 6 seconds whatever happens
    const timer = window.setTimeout(fire, 6000);
    gl.compileAsync(scene, camera)
      .then(() => {
        window.clearTimeout(timer);
        fire();
      })
      .catch(() => {});
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [gl, scene, camera]);
  return null;
}

/**
 * Keeps the picture smooth on any device. It watches the frame rate and moves along the quality ladder in quality.ts:
 * down when the city stutters, back up when there is plenty of room. ?perf=0|1|2 pins a tier and turns this off.
 */
function QualityGovernor() {
  const gov = useRef<Governor | null>(null);

  useEffect(() => {
    // a resize or a switch to another tab says nothing about how fast the scene draws
    const disturb = () => gov.current?.disturb();
    window.addEventListener("resize", disturb);
    document.addEventListener("visibilitychange", disturb);
    return () => {
      window.removeEventListener("resize", disturb);
      document.removeEventListener("visibilitychange", disturb);
    };
  }, []);

  useFrame((_, dt) => {
    const st = useStore.getState();
    // the loader (shader compile, the fly-in) is not a measure of normal speed
    if (!st.uiReady || !st.autoPerf) return;
    if (!gov.current) gov.current = new Governor(rungFor(st.perf, st.res));
    const next = gov.current.update(dt, performance.now() / 1000);
    if (next !== null) st.setQuality(LADDER[next].perf, LADDER[next].res);
  });
  return null;
}

export default function SceneCanvas() {
  const perf = useStore((s) => s.perf);
  const res = useStore((s) => s.res);
  const cap = perf === 2 ? 1.75 : perf === 1 ? 1.25 : 1;
  const dpr = Math.min(typeof window === "undefined" ? 1 : window.devicePixelRatio || 1, cap) * res;

  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        flat
        dpr={dpr}
        camera={{ fov: 36, near: 1, far: 1600, position: [0, 80, 110] }}
        gl={{ antialias: false, powerPreference: "high-performance", alpha: false, stencil: false }}
      >
        <color attach="background" args={[BG]} />
        <World />
        <CameraRig />
        <Interaction />
        <LabelProjector />
        <Effects />
        <ReadySignal />
        <QualityGovernor />
      </Canvas>
    </div>
  );
}
