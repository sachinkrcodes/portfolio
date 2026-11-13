"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { IslandId } from "@/data/content";
import { useStore } from "@/store/useStore";
import { ACCENT, ISLANDS } from "./constants";
import { makeChunkGeometry, makeRockGeometry } from "./geometry";
import { createPlatformMaterial, createRingMaterial, getMats, rng } from "./materials";
import { PickProxy } from "./parts";
import { islandGroups } from "./registry";

const CHUNKS = 9;

/**
 * Everything an island has in common: the floating rock, the grid platform, a hover ring,
 * loose debris, a light, the gentle bob, and the invisible volume used for hover and click.
 * The content of the island goes in as children, positioned relative to the platform centre.
 */
export function IslandShell({
  id,
  pickHeight = 7,
  pickY = 3.2,
  children,
}: {
  id: IslandId;
  pickHeight?: number;
  pickY?: number;
  children?: React.ReactNode;
}) {
  const cfg = ISLANDS[id];
  const mats = getMats();
  const group = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  const chunks = useRef<THREE.InstancedMesh>(null);
  const amt = useRef(0);

  const rock = useMemo(() => makeRockGeometry(cfg.r, cfg.depth, cfg.seed), [cfg]);
  const chunk = useMemo(() => makeChunkGeometry(cfg.seed + 2), [cfg]);
  const platform = useMemo(() => createPlatformMaterial(cfg.r * 0.99), [cfg]);
  const ring = useMemo(() => createRingMaterial(), []);

  useLayoutEffect(() => {
    const m = chunks.current;
    if (!m) return;
    const r = rng(cfg.seed);
    const o = new THREE.Object3D();
    for (let i = 0; i < CHUNKS; i++) {
      const a = r() * Math.PI * 2;
      const rad = cfg.r * (0.6 + r() * 0.85);
      o.position.set(Math.cos(a) * rad, -cfg.depth * (0.08 + r() * 0.85), Math.sin(a) * rad);
      o.rotation.set(r() * 3, r() * 3, r() * 3);
      o.scale.setScalar(0.25 + r() * r() * 1.1);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [cfg]);

  useEffect(() => {
    const g = group.current;
    if (!g) return;
    islandGroups.set(id, g);
    return () => {
      islandGroups.delete(id);
    };
  }, [id]);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const st = useStore.getState();
    // hover lights the island up fully; once it is focused (camera close) a calmer glow is enough
    const on = st.hover?.island === id ? 1 : st.focus?.island === id ? 0.4 : 0;
    amt.current = THREE.MathUtils.damp(amt.current, on, 7, dt);
    const motion = st.reducedMotion ? 0 : 1;
    g.position.y = cfg.pos[1] + Math.sin(t * 0.55 + cfg.phase) * 0.32 * motion + amt.current * 0.22;
    g.rotation.y = Math.sin(t * 0.13 + cfg.phase) * 0.035 * motion;
    platform.uniforms.uHover.value = amt.current;
    ring.uniforms.uHover.value = amt.current;
    if (light.current) light.current.intensity = 130 + amt.current * 90;
  });

  return (
    <group ref={group} position={cfg.pos}>
      <mesh geometry={rock} material={mats.rock} />
      <mesh rotation-x={-Math.PI / 2} position-y={0.03} material={platform}>
        <circleGeometry args={[cfg.r * 0.99, 80]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.09} material={ring} renderOrder={4}>
        <planeGeometry args={[cfg.r * 2.2, cfg.r * 2.2]} />
      </mesh>
      <instancedMesh ref={chunks} args={[chunk, mats.rock, CHUNKS]} frustumCulled={false} />
      <pointLight ref={light} color={ACCENT} position={[0, 8.5, 0]} distance={cfg.r * 3.6} decay={2} intensity={130} />
      <PickProxy island={id} position={[0, pickY, 0]}>
        <cylinderGeometry args={[cfg.r * 0.96, cfg.r * 0.96, pickHeight, 28]} />
      </PickProxy>
      {children}
    </group>
  );
}
