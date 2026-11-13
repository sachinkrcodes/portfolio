"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { ACCENT, SCENE } from "../constants";
import { getMats } from "../materials";
import { Box, Cyl, GlowRing } from "../parts";

type V3 = [number, number, number];

/**
 * The extra buildings on the projects island. A new project in content.ts gets one of these (or the one named in its
 * `building` field) without any change to the 3D code. They use the same materials and parts as the three original buildings.
 */

/** A thin ring that grows and fades, like the halo over the Blood Bank drop. */
function pulseMaterial() {
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color(ACCENT).multiplyScalar(2.2),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
}

/* ------------------------------------------------ "pipeline": a build, test and ship line with a packet running through gates */
export function Pipeline({ at }: { at: V3 }) {
  const mats = getMats();
  const packet = useRef<THREE.Mesh>(null);
  const trail = useRef<THREE.Mesh>(null);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    const x = -2.1 + ((t * 0.26) % 1) * 4.2;
    if (packet.current) {
      packet.current.position.set(x, 0.62, 0.95);
      packet.current.rotation.y = t * 2;
    }
    if (trail.current) trail.current.position.set(x - 0.42, 0.55, 0.95);
  });

  return (
    <group position={at} rotation-y={-0.2}>
      <Box p={[0, 0.07, 0.2]} s={[5.0, 0.14, 2.7]} m={mats.hullLight} />
      {/* stations: build, test, ship */}
      <Box p={[-1.6, 0.9, -0.3]} s={[1.2, 1.5, 1.2]} m={mats.hull} />
      <Box p={[-1.6, 1.0, 0.31]} s={[0.95, 0.5, 0.04]} m={mats.windows} />
      <Box p={[0, 1.25, -0.3]} s={[1.2, 2.3, 1.2]} m={mats.rack} />
      <Box p={[1.6, 0.8, -0.3]} s={[1.2, 1.3, 1.2]} m={mats.hull} />
      <Box p={[1.6, 1.5, -0.3]} s={[1.0, 0.12, 1.0]} m={mats.glowHot} />
      {/* the conveyor in front of them */}
      <Box p={[0, 0.24, 0.95]} s={[4.8, 0.14, 0.62]} m={mats.hull} />
      <Box p={[0, 0.33, 0.95]} s={[4.8, 0.025, 0.1]} m={mats.glow} />
      {/* two gates the packet passes through */}
      {[-0.8, 0.8].map((x) => (
        <group key={x} position={[x, 0.72, 0.95]} rotation-y={Math.PI / 2}>
          <GlowRing radius={0.55} flat={false} tube={0.03} />
        </group>
      ))}
      <mesh ref={packet} material={mats.glowHot}>
        <boxGeometry args={[0.3, 0.24, 0.3]} />
      </mesh>
      <mesh ref={trail} material={mats.glow}>
        <boxGeometry args={[0.5, 0.1, 0.1]} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------ "dish": a satellite dish that sweeps around, with radar pulses */
export function Dish({ at }: { at: V3 }) {
  const mats = getMats();
  const head = useRef<THREE.Group>(null);
  const r1 = useRef<THREE.Mesh>(null);
  const r2 = useRef<THREE.Mesh>(null);
  const bowl = useMemo(() => new THREE.MeshStandardMaterial({ color: SCENE.hullLight, roughness: 0.45, metalness: 0.4, side: THREE.DoubleSide }), []);
  const pulses = useMemo(() => [pulseMaterial(), pulseMaterial()], []);
  const R = 1.9;

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (head.current) head.current.rotation.y = t * 0.35;
    [r1.current, r2.current].forEach((m, i) => {
      if (!m) return;
      const k = (t * 0.4 + i * 0.5) % 1;
      m.scale.setScalar(0.45 + k * 2.2);
      pulses[i].opacity = (1 - k) * 0.7;
    });
  });

  return (
    <group position={at}>
      <Cyl p={[0, 0.08, 0]} r={2.4} h={0.16} m={mats.hullLight} seg={40} />
      <GlowRing radius={2.4} tube={0.028} position={[0, 0.17, 0]} />
      <Box p={[-1.4, 0.65, 0.9]} s={[0.9, 1.1, 0.9]} m={mats.rack} ry={0.3} />
      <Box p={[1.5, 0.5, 0.7]} s={[0.8, 0.8, 0.8]} m={mats.hull} ry={-0.3} />
      <Cyl p={[0, 1.7, 0]} r={0.3} rTop={0.16} h={3.2} m={mats.hull} />
      <group ref={head} position={[0, 3.3, 0]}>
        <group rotation-x={0.5}>
          {/* the bowl is a cap of a sphere around its lowest point, opening upward */}
          <mesh material={bowl} position={[0, R, 0]}>
            <sphereGeometry args={[R, 36, 10, 0, Math.PI * 2, Math.PI - 0.8, 0.8]} />
          </mesh>
          <Box p={[0, 0.65, 0]} s={[0.05, 1.3, 0.05]} m={mats.hullLight} />
          <mesh position={[0, 1.35, 0]} material={mats.glowHot}>
            <sphereGeometry args={[0.13, 12, 10]} />
          </mesh>
        </group>
      </group>
      <mesh ref={r1} material={pulses[0]} rotation-x={-Math.PI / 2} position={[0, 0.2, 0]}>
        <ringGeometry args={[0.9, 0.96, 64]} />
      </mesh>
      <mesh ref={r2} material={pulses[1]} rotation-x={-Math.PI / 2} position={[0, 0.2, 0]}>
        <ringGeometry args={[0.9, 0.96, 64]} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------ "tiers": a stack of layers that turn slowly, with an orb on top */
const TIER_R = [2.1, 1.75, 1.4, 1.05];
const TIER_H = 0.5;
const TIER_GAP = 0.3;

export function Tiers({ at }: { at: V3 }) {
  const mats = getMats();
  const layers = useRef<(THREE.Group | null)[]>([]);
  const orbRing = useRef<THREE.Group>(null);
  const skin = [mats.hull, mats.windows, mats.hullLight, mats.rack];
  const top = 0.16 + TIER_R.length * (TIER_H + TIER_GAP) - TIER_GAP;

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    layers.current.forEach((g, i) => {
      if (g) g.rotation.y = t * 0.25 * (i % 2 ? -1 : 1);
    });
    if (orbRing.current) orbRing.current.rotation.y = t * 0.9;
  });

  return (
    <group position={at}>
      <Cyl p={[0, 0.08, 0]} r={2.55} h={0.16} m={mats.hullLight} seg={40} />
      <GlowRing radius={2.55} tube={0.028} position={[0, 0.17, 0]} />
      <Cyl p={[0, top / 2 + 0.1, 0]} r={0.22} h={top} m={mats.hull} seg={16} />
      {TIER_R.map((r, i) => (
        <group key={i} ref={(el) => void (layers.current[i] = el)} position={[0, 0.16 + i * (TIER_H + TIER_GAP) + TIER_H / 2, 0]}>
          <Cyl p={[0, 0, 0]} r={r} h={TIER_H} m={skin[i]} seg={36} />
          <GlowRing radius={r + 0.02} tube={0.025} position={[0, TIER_H / 2, 0]} hot={i === TIER_R.length - 1} />
        </group>
      ))}
      <mesh position={[0, top + 0.55, 0]} material={mats.glowHot}>
        <sphereGeometry args={[0.4, 20, 16]} />
      </mesh>
      <group ref={orbRing} position={[0, top + 0.55, 0]}>
        <GlowRing radius={0.8} flat={false} tube={0.025} />
      </group>
    </group>
  );
}
