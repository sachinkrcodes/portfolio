"use client";

import { useMemo } from "react";
import { SCENE } from "./constants";
import { createCloudMaterial, createGlowMaterial } from "./materials";

/** Two drifting cloud layers under the islands plus a soft cyan glow "spilling" from the city onto them. */
export default function CloudSea() {
  const low = useMemo(() => createCloudMaterial({ scale: 0.04, opacity: 0.95, colorA: SCENE.cloudLowA, colorB: SCENE.cloudLowB, center: [6, -6] }), []);
  const mid = useMemo(() => createCloudMaterial({ scale: 0.062, opacity: 0.55, colorA: SCENE.cloudMidA, colorB: SCENE.cloudMidB, center: [8, -2] }), []);
  const glowBig = useMemo(() => createGlowMaterial(0.24), []);
  const glowCity = useMemo(() => createGlowMaterial(0.36), []);

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[4, -26, -6]} material={low} renderOrder={-30}>
        <planeGeometry args={[900, 900, 1, 1]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[4, -12.5, -6]} material={mid} renderOrder={-20}>
        <planeGeometry args={[760, 760, 1, 1]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[4, -9.5, -6]} material={glowBig} renderOrder={-10}>
        <planeGeometry args={[190, 150]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[5, -8.5, -6]} material={glowCity} renderOrder={-9}>
        <planeGeometry args={[84, 70]} />
      </mesh>
    </group>
  );
}
