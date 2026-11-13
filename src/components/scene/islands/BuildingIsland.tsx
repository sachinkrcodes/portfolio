"use client";

import { useRef } from "react";
import type * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { learning } from "@/data/content";
import { IslandShell } from "../Island";
import { getMats } from "../materials";
import { Box, EdgeBox, StaticBoxes, TechTag, type InstSpec } from "../parts";

const FLOORS = 6;
const SOLID = 3;
const FH = 0.95;

/** Where the floating tags hang. The words come from `learning` in content.ts (first five). */
const TAG_SLOTS: Array<[number, number, number]> = [
  [-3.3, 5.4, 1.4],
  [2.9, 6.4, -1.4],
  [-2.8, 3.4, -2.6],
  [3.7, 3.6, 2.4],
  [0.3, 7.3, 1.4],
];

/** "Currently Building": a tower that is only part built, a crane, hazard barriers and floating tech tags. */
export default function BuildingIsland() {
  const mats = getMats();
  const jib = useRef<THREE.Group>(null);

  // hazard barriers on the front edge
  const barriers: InstSpec[] = [];
  for (let i = 0; i < 6; i++) {
    const a = Math.PI * (0.18 + i * 0.13);
    barriers.push({ p: [Math.cos(a) * 4.5, 0.32, Math.sin(a) * 4.5], s: [1.5, 0.5, 0.12], ry: -a + Math.PI / 2 });
  }
  // upper frame slabs (levels still to be built)
  const slabs: InstSpec[] = [];
  for (let f = SOLID; f < FLOORS; f++) slabs.push({ p: [0, f * FH + 0.05, 0], s: [2.5, 0.1, 2.5] });
  const columns: InstSpec[] = [];
  [
    [-1.2, -1.2],
    [1.2, -1.2],
    [-1.2, 1.2],
    [1.2, 1.2],
  ].forEach(([x, z]) => columns.push({ p: [x, SOLID * FH + ((FLOORS - SOLID) * FH) / 2, z], s: [0.1, (FLOORS - SOLID) * FH, 0.1] }));

  useFrame((s) => {
    if (jib.current) jib.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.22) * 1.1 + 0.6;
  });

  return (
    <IslandShell id="building" pickHeight={9.6} pickY={4.4}>
      {/* tower: three finished floors, three still wireframe */}
      <group position={[-0.9, 0, -0.5]}>
        {Array.from({ length: SOLID }).map((_, f) => (
          <group key={f}>
            <Box p={[0, f * FH + FH / 2, 0]} s={[2.4, FH - 0.08, 2.4]} m={mats.hull} />
            <Box p={[0, f * FH + FH / 2, 1.21]} s={[2.1, 0.45, 0.05]} m={mats.windows} />
            <Box p={[1.21, f * FH + FH / 2, 0]} s={[0.05, 0.45, 2.1]} m={mats.windows} />
          </group>
        ))}
        <StaticBoxes specs={slabs} material={mats.hullLight} />
        <StaticBoxes specs={columns} material={mats.hullLight} />
        {Array.from({ length: FLOORS - SOLID }).map((_, i) => (
          <EdgeBox key={i} size={[2.4, FH, 2.4]} position={[0, (SOLID + i) * FH + FH / 2, 0]} material={i === FLOORS - SOLID - 1 ? mats.wire : mats.wireDim} />
        ))}
      </group>

      {/* crane */}
      <group position={[1.9, 0, 0.9]}>
        <Box p={[0, 3.6, 0]} s={[0.24, 7.2, 0.24]} m={mats.hullLight} />
        <Box p={[0, 0.15, 0]} s={[1.0, 0.3, 1.0]} m={mats.hull} />
        <group ref={jib} position={[0, 7.1, 0]}>
          <Box p={[1.9, 0, 0]} s={[4.6, 0.2, 0.2]} m={mats.hullLight} />
          <Box p={[-1.0, 0, 0]} s={[1.6, 0.2, 0.2]} m={mats.hullLight} />
          <Box p={[-1.5, -0.35, 0]} s={[0.6, 0.55, 0.5]} m={mats.hull} />
          <Box p={[0, 0.35, 0]} s={[0.45, 0.5, 0.45]} m={mats.hull} />
          <Box p={[3.9, -1.1, 0]} s={[0.03, 2.1, 0.03]} m={mats.hullLight} />
          <Box p={[3.9, -2.25, 0]} s={[0.38, 0.28, 0.38]} m={mats.glowHot} />
          <Box p={[4.2, 0.02, 0]} s={[0.16, 0.16, 0.16]} m={mats.glowHot} />
        </group>
      </group>

      <StaticBoxes specs={barriers} material={mats.hazard} />

      {learning.slice(0, TAG_SLOTS.length).map((text, i) => (
        <TechTag key={text} text={text} position={TAG_SLOTS[i]} phase={i * 1.3} />
      ))}
    </IslandShell>
  );
}
