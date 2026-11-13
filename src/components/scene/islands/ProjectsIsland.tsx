"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { ACCENT, BUILDINGS, type BuildingKind } from "../constants";
import { makeDropGeometry } from "../geometry";
import { IslandShell } from "../Island";
import { getMats } from "../materials";
import { Box, Cyl, GlowRing, PickProxy } from "../parts";
import { Dish, Pipeline, Tiers } from "./ProjectBuildings";

type V3 = [number, number, number];

/* ------------------------------------------------ Blood Bank Finder: racks, crates and a blood drop */
function BloodBank({ at }: { at: V3 }) {
  const mats = getMats();
  const dropGeo = useMemo(() => makeDropGeometry(), []);
  const haloMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(ACCENT).multiplyScalar(2.2),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [],
  );
  const drop = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (drop.current) {
      drop.current.position.y = 6.1 + Math.sin(t * 1.4) * 0.2;
      drop.current.rotation.y = t * 0.8;
    }
    if (halo.current) {
      const k = (t * 0.5) % 1;
      halo.current.scale.setScalar(0.55 + k * 1.5);
      haloMat.opacity = (1 - k) * 0.85;
    }
  });

  return (
    <group position={at}>
      <Cyl p={[0, 0.08, 0]} r={2.7} h={0.16} m={mats.hullLight} seg={44} />
      <GlowRing radius={2.7} tube={0.03} position={[0, 0.17, 0]} />
      {/* server racks (the LED texture is the data) */}
      <mesh position={[0, 2.35, 0]} material={mats.rack}>
        <boxGeometry args={[1.5, 4.4, 1.5]} />
      </mesh>
      <mesh position={[1.75, 1.4, 0.5]} rotation-y={0.25} material={mats.rack}>
        <boxGeometry args={[1.25, 2.6, 1.25]} />
      </mesh>
      <mesh position={[-1.6, 1.0, -0.45]} rotation-y={-0.2} material={mats.rack}>
        <boxGeometry args={[1.1, 1.9, 1.1]} />
      </mesh>
      {/* donation crates */}
      <Box p={[-1.5, 0.45, 1.35]} s={[1.0, 0.7, 0.75]} m={mats.crate} ry={0.35} />
      <Box p={[-2.15, 0.45, 0.35]} s={[0.9, 0.7, 0.7]} m={mats.crate} ry={-0.2} />
      <Box p={[-1.6, 1.15, 1.2]} s={[0.8, 0.7, 0.7]} m={mats.crate} ry={0.6} />
      <Box p={[1.9, 0.45, -1.2]} s={[1.0, 0.7, 0.75]} m={mats.crate} ry={0.1} />
      <Box p={[0.5, 0.45, 1.9]} s={[0.8, 0.7, 0.7]} m={mats.crate} ry={-0.5} />
      {/* the drop (a map pin for "find a donor") */}
      <mesh ref={drop} geometry={dropGeo} material={mats.glowHot} position={[0, 6.1, 0]} scale={0.95} />
      <mesh ref={halo} material={haloMat} rotation-x={-Math.PI / 2} position={[0, 4.75, 0]}>
        <ringGeometry args={[0.8, 0.87, 56]} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------ Sentiment Analysis: bar chart, trend line and a gauge */
const HEIGHTS = [0.9, 1.7, 2.5, 1.4, 3.2, 2.1, 2.9];

function Sentiment({ at }: { at: V3 }) {
  const mats = getMats();
  const gauge = useRef<THREE.Group>(null);
  const line = useMemo(() => {
    const pts = HEIGHTS.map((h, i) => new THREE.Vector3(-1.5 + i * 0.5, h + 0.75, 0));
    return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mats.wire);
  }, [mats]);

  useFrame((s) => {
    if (gauge.current) gauge.current.rotation.y = s.clock.elapsedTime * 0.6;
  });

  return (
    <group position={at} rotation-y={-0.35}>
      <Box p={[0, 0.07, 0]} s={[3.8, 0.14, 2.4]} m={mats.hullLight} />
      {HEIGHTS.map((h, i) => (
        <group key={i} position={[-1.5 + i * 0.5, 0.14, 0]}>
          <Box p={[0, h / 2, 0]} s={[0.36, h, 0.36]} m={mats.bar} />
          <Box p={[0, h + 0.03, 0]} s={[0.4, 0.06, 0.4]} m={mats.glowHot} />
        </group>
      ))}
      <primitive object={line} position={[0, 0.14, 0]} />
      <group ref={gauge} position={[0, 4.7, 0]}>
        <GlowRing radius={0.95} flat={false} tube={0.025} />
        <GlowRing radius={0.62} flat={false} tube={0.02} hot />
      </group>
    </group>
  );
}

/* ------------------------------------------------ Suzuki-Kasami: processes on a ring passing a token */
const N = 7;
const R = 1.8;

function Suzuki({ at }: { at: V3 }) {
  const mats = getMats();
  const nodePos = useMemo(() => Array.from({ length: N }, (_, i) => new THREE.Vector3(Math.cos((i / N) * Math.PI * 2) * R, 0.95, Math.sin((i / N) * Math.PI * 2) * R)), []);
  const loop = useMemo(() => new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(nodePos), mats.wire), [nodePos, mats]);
  const chords = useMemo(() => {
    const pairs = [
      [0, 3],
      [1, 5],
      [2, 6],
      [4, 0],
    ];
    const pts: THREE.Vector3[] = [];
    pairs.forEach(([a, b]) => pts.push(nodePos[a], nodePos[b]));
    return new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), mats.wireDim);
  }, [nodePos, mats]);

  const token = useRef<THREE.Mesh>(null);
  const trail = useRef<THREE.Mesh>(null);
  const nodes = useRef<(THREE.Group | null)[]>([]);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    const a = t * 0.9;
    if (token.current) token.current.position.set(Math.cos(a) * R, 1.7 + Math.sin(t * 4) * 0.05, Math.sin(a) * R);
    if (trail.current) trail.current.position.set(Math.cos(a - 0.4) * R, 1.62, Math.sin(a - 0.4) * R);
    nodes.current.forEach((g, i) => {
      if (!g) return;
      const na = (i / N) * Math.PI * 2;
      const d = Math.abs(Math.atan2(Math.sin(a - na), Math.cos(a - na)));
      g.scale.setScalar(1 + 0.45 * Math.exp(-d * d * 7));
    });
  });

  return (
    <group position={at}>
      <Cyl p={[0, 0.08, 0]} r={2.55} h={0.16} m={mats.hullLight} seg={40} />
      <GlowRing radius={2.55} tube={0.028} position={[0, 0.17, 0]} />
      <primitive object={loop} />
      <primitive object={chords} />
      {nodePos.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]} ref={(el) => void (nodes.current[i] = el)}>
          <Box p={[0, 0.45, 0]} s={[0.5, 0.9, 0.5]} m={mats.hull} />
          <Box p={[0, 1.0, 0]} s={[0.32, 0.12, 0.32]} m={mats.glowHot} />
        </group>
      ))}
      <mesh ref={token} material={mats.glowHot}>
        <sphereGeometry args={[0.25, 16, 12]} />
      </mesh>
      <mesh ref={trail} material={mats.glow}>
        <sphereGeometry args={[0.15, 12, 10]} />
      </mesh>
    </group>
  );
}

/**
 * Invisible hit volumes for each kind of building. They follow the shape of the building closely, so a building in front
 * does not steal clicks from the one behind it. cyl = [radius, height, centre height], box = [width, height, depth, centre height],
 * cone = [top radius, bottom radius, height, centre height].
 */
type Volume = { cyl: [number, number, number] } | { box: [number, number, number, number] } | { cone: [number, number, number, number] };
const PICK: Record<BuildingKind, Volume[]> = {
  bloodbank: [{ cyl: [2.6, 2.8, 1.4] }, { cyl: [1.2, 7.0, 3.5] }],
  sentiment: [{ cyl: [2.2, 4.0, 2.0] }, { cyl: [1.1, 2.4, 4.7] }],
  suzuki: [{ cyl: [2.6, 3.4, 1.7] }],
  pipeline: [{ box: [4.8, 3.0, 2.6, 1.5] }],
  dish: [{ cyl: [2.3, 1.6, 0.8] }, { cyl: [1.5, 4.4, 3.1] }],
  tiers: [{ cone: [1.3, 2.3, 5.0, 2.5] }],
};

function VolumeGeometry({ v }: { v: Volume }) {
  if ("cyl" in v) return <cylinderGeometry args={[v.cyl[0], v.cyl[0], v.cyl[1], 20]} />;
  if ("box" in v) return <boxGeometry args={[v.box[0], v.box[1], v.box[2]]} />;
  return <cylinderGeometry args={[v.cone[0], v.cone[1], v.cone[2], 20]} />;
}
const volumeY = (v: Volume) => ("cyl" in v ? v.cyl[2] : "box" in v ? v.box[3] : v.cone[3]);

function Building({ kind, at }: { kind: BuildingKind; at: V3 }) {
  switch (kind) {
    case "bloodbank":
      return <BloodBank at={at} />;
    case "sentiment":
      return <Sentiment at={at} />;
    case "suzuki":
      return <Suzuki at={at} />;
    case "pipeline":
      return <Pipeline at={at} />;
    case "dish":
      return <Dish at={at} />;
    default:
      return <Tiers at={at} />;
  }
}

/** One building per project in content.ts (see BUILDINGS in constants.ts). */
export default function ProjectsIsland() {
  return (
    <IslandShell id="projects" pickHeight={8.4} pickY={3.8}>
      {BUILDINGS.map((b) => (
        <Building key={b.id} kind={b.kind} at={b.local} />
      ))}
      {/* pick volumes per project; they win over the island volume underneath */}
      {BUILDINGS.flatMap((b) =>
        PICK[b.kind].map((v, i) => (
          <PickProxy key={`${b.id}-${i}`} island="projects" sub={b.id} position={[b.local[0], volumeY(v), b.local[2]]}>
            <VolumeGeometry v={v} />
          </PickProxy>
        )),
      )}
    </IslandShell>
  );
}
