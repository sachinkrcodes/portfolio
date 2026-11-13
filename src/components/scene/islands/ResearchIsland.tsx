"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useStore } from "@/store/useStore";
import { IslandShell } from "../Island";
import { createHoloMaterial, getMats, rng } from "../materials";
import { Cyl, GlowRing, StaticBoxes, StaticCyls, type InstSpec } from "../parts";

const CENTER_Y = 4.7;
/** Tilt and speed of the four orbiting team members. Index 0 is the team leader. */
const ORBITS = [
  { tilt: 0.35, speed: 0.55, rad: 3.4 },
  { tilt: -0.55, speed: 0.46, rad: 3.1 },
  { tilt: 0.15, speed: 0.62, rad: 3.7 },
  { tilt: 0.85, speed: 0.4, rad: 3.3 },
];

export default function ResearchIsland() {
  const mats = getMats();
  const holo = useMemo(() => createHoloMaterial(), []);
  const cloud = useRef<THREE.Group>(null);
  const sats = useRef<(THREE.Object3D | null)[]>([]);
  const boost = useRef(0);

  // circular bar chart: "cost drivers"
  const { bars, caps } = useMemo(() => {
    const r = rng(41);
    const bars: InstSpec[] = [];
    const caps: InstSpec[] = [];
    const N = 16;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const h = 0.7 + r() * 2.4;
      const x = Math.cos(a) * 4.1;
      const z = Math.sin(a) * 4.1;
      bars.push({ p: [x, h / 2, z], s: [0.42, h, 0.42], ry: -a });
      caps.push({ p: [x, h + 0.03, z], s: [0.46, 0.06, 0.46], ry: -a });
    }
    return { bars, caps };
  }, []);

  // stacks of coins near the base: "cost"
  const coins = useMemo(() => {
    const out: InstSpec[] = [];
    [
      [2.5, 0.8, 4],
      [2.2, 2.7, 3],
      [-2.4, -1.9, 5],
    ].forEach(([x, z, n]) => {
      for (let k = 0; k < n; k++) out.push({ p: [x, 0.08 + k * 0.15, z], s: [0.95, 0.12, 0.95] });
    });
    return out;
  }, []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const st = useStore.getState();
    const on = st.hover?.island === "research" || st.focus?.island === "research" ? 1 : 0;
    boost.current = THREE.MathUtils.damp(boost.current, on, 6, dt);
    holo.uniforms.uBoost.value = boost.current;
    if (cloud.current) cloud.current.rotation.y = t * 0.12;
    ORBITS.forEach((o, i) => {
      const s = sats.current[i];
      if (!s) return;
      const a = t * o.speed + (i * Math.PI) / 2;
      const x = Math.cos(a) * o.rad;
      const z0 = Math.sin(a) * o.rad;
      s.position.set(x, CENTER_Y + z0 * Math.sin(o.tilt), z0 * Math.cos(o.tilt));
      s.rotation.y = t * 1.2;
    });
  });

  return (
    <IslandShell id="research" pickHeight={9.5} pickY={4.2}>
      {/* pedestal under the holographic cloud */}
      <Cyl p={[0, 0.6, 0]} r={1.1} h={1.2} m={mats.hullLight} seg={32} />
      <Cyl p={[0, 1.25, 0]} r={0.55} h={0.2} m={mats.hull} seg={24} />
      <GlowRing radius={1.1} position={[0, 1.22, 0]} tube={0.03} />
      <GlowRing radius={4.5} position={[0, 0.12, 0]} tube={0.025} />
      <GlowRing radius={3.7} position={[0, 0.12, 0]} tube={0.018} />

      {/* the "cloud ERP" */}
      <group ref={cloud} position={[0, CENTER_Y, 0]}>
        {(
          [
            [0, 0, 0, 1.45],
            [1.35, -0.25, 0.3, 1.05],
            [-1.25, -0.3, -0.2, 1.15],
            [0.4, 0.95, -0.4, 0.85],
            [-0.5, 0.75, 0.7, 0.75],
          ] as const
        ).map(([x, y, z, r], i) => (
          <mesh key={i} position={[x, y, z]} material={holo}>
            <icosahedronGeometry args={[r, 3]} />
          </mesh>
        ))}
      </group>

      <StaticBoxes specs={bars} material={mats.bar} />
      <StaticBoxes specs={caps} material={mats.glowHot} />
      <StaticCyls specs={coins} material={mats.hullLight} />

      {/* four researchers; the bright one is the team leader */}
      {ORBITS.map((_, i) => (
        <group key={i} ref={(el) => void (sats.current[i] = el)}>
          <mesh material={i === 0 ? mats.glowHot : mats.glow}>
            <octahedronGeometry args={[i === 0 ? 0.36 : 0.24, 0]} />
          </mesh>
          {i === 0 && <GlowRing radius={0.62} tube={0.018} flat={false} />}
        </group>
      ))}
    </IslandShell>
  );
}
