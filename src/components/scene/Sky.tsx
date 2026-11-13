"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type * as THREE from "three";
import { createSkyMaterial } from "./materials";

/** Gradient night sky with stars and a moon, drawn on a big sphere that follows the camera. */
export default function Sky() {
  const mat = useMemo(() => createSkyMaterial(), []);
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ camera }) => {
    ref.current?.position.copy(camera.position);
  });
  return (
    <mesh ref={ref} material={mat} renderOrder={-1000} frustumCulled={false}>
      <sphereGeometry args={[700, 48, 28]} />
    </mesh>
  );
}
