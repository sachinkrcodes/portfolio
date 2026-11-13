"use client";

import { useMemo } from "react";
import { makeWedgeGeometry } from "../geometry";
import { IslandShell } from "../Island";
import { getMats } from "../materials";
import { Box, Cyl, GlowRing, StaticCyls, type InstSpec } from "../parts";

/** Two workplaces and an ERP terminal: Sarla Performance Fibers (plant) and Hi-Tech Inks (block and drums). */
export default function ExperienceIsland() {
  const mats = getMats();
  const wedge = useMemo(() => makeWedgeGeometry(1.3, 0.85, 2.7), []);
  const drums = useMemo<InstSpec[]>(
    () =>
      [
        [0.4, 3.0],
        [1.15, 3.35],
        [1.9, 3.0],
        [0.75, 2.45],
        [1.55, 2.4],
      ].map(([x, z]) => ({ p: [x, 0.42, z], s: [0.7, 0.84, 0.7] })),
    [],
  );

  return (
    <IslandShell id="experience" pickHeight={7.6} pickY={3.4}>
      {/* ---------- Sarla Performance Fibers: hall, sawtooth roof, chimneys, silo ---------- */}
      <group position={[-2.4, 0, -0.6]}>
        <Box p={[0, 0.9, 0]} s={[5.4, 1.8, 2.8]} m={mats.hull} />
        <Box p={[0, 1.0, 1.43]} s={[4.7, 0.62, 0.06]} m={mats.windows} />
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} geometry={wedge} material={mats.hullLight} position={[-2.0 + i * 1.3 + 0.65, 1.8, 0]} />
        ))}
        {/* chimneys with glowing rims */}
        <Cyl p={[-2.3, 3.2, -1.0]} r={0.3} rTop={0.22} h={3.2} m={mats.hull} />
        <GlowRing radius={0.22} tube={0.04} position={[-2.3, 4.8, -1.0]} hot />
        <Cyl p={[-1.5, 2.8, -1.05]} r={0.27} rTop={0.2} h={2.5} m={mats.hull} />
        <GlowRing radius={0.2} tube={0.04} position={[-1.5, 4.05, -1.05]} hot />
        {/* silo */}
        <Cyl p={[3.4, 1.7, -0.9]} r={0.85} h={3.4} m={mats.hullLight} seg={28} />
        <mesh position={[3.4, 3.4, -0.9]} material={mats.hullLight}>
          <sphereGeometry args={[0.85, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        <GlowRing radius={0.87} tube={0.03} position={[3.4, 2.5, -0.9]} />
        <GlowRing radius={0.87} tube={0.03} position={[3.4, 1.1, -0.9]} />
        {/* pipe from the hall to the silo */}
        <Box p={[2.0, 1.2, -0.9]} s={[1.6, 0.2, 0.2]} m={mats.hullLight} />
      </group>

      {/* ---------- Hi-Tech Inks: block and ink drums ---------- */}
      <group position={[2.2, 0, 0.6]}>
        <Box p={[1.4, 1.2, 0]} s={[2.5, 2.4, 2.3]} m={mats.hull} />
        <Box p={[1.4, 1.45, 1.16]} s={[2.1, 0.5, 0.06]} m={mats.windows} />
        <Box p={[1.4, 0.7, 1.16]} s={[2.1, 0.4, 0.06]} m={mats.windows} />
        <Box p={[1.4, 2.5, 0]} s={[2.6, 0.12, 2.4]} m={mats.hullLight} />
        <StaticCyls specs={drums} material={mats.hullLight} />
        {drums.map((d, i) => (
          <GlowRing key={i} radius={0.36} tube={0.022} position={[d.p[0], 0.62, d.p[2]]} />
        ))}
      </group>

      {/* ---------- ERP terminal: where the data work happened ---------- */}
      <group position={[-1.4, 0, 3.7]} rotation-y={0.25}>
        <Box p={[0, 0.25, 0]} s={[1.9, 0.5, 1.1]} m={mats.hullLight} />
        <Box p={[0, 0.8, -0.1]} s={[0.18, 0.6, 0.18]} m={mats.hull} />
        <Box p={[0, 1.45, -0.15]} s={[1.7, 1.05, 0.1]} m={mats.rack} rx={-0.18} />
        <GlowRing radius={1.35} tube={0.02} position={[0, 0.02, 0]} />
      </group>
    </IslandShell>
  );
}
