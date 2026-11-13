"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useStore } from "@/store/useStore";
import { rng, createParticleMaterial } from "./materials";

/** Rising motes of light. One draw call; all the motion happens in the vertex shader. */
export default function Particles() {
  const perf = useStore((s) => s.perf);
  const dpr = useThree((s) => s.viewport.dpr);
  const count = perf === 2 ? 700 : perf === 1 ? 380 : 140;

  const geo = useMemo(() => {
    const r = rng(77);
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = -48 + r() * 100;
      pos[i * 3 + 1] = -3 + r() * 6;
      pos[i * 3 + 2] = -48 + r() * 80;
      seed[i] = r();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return g;
  }, [count]);

  const mat = useMemo(() => createParticleMaterial(dpr), []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    mat.uniforms.uPixelRatio.value = dpr;
  }, [dpr, mat]);

  return <points geometry={geo} material={mat} frustumCulled={false} renderOrder={5} />;
}
