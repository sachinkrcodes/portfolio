"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useStore } from "@/store/useStore";
import { ISLANDS, LINKS } from "./constants";
import { createLineMaterial, getMats } from "./materials";

interface Link {
  curve: THREE.QuadraticBezierCurve3;
  geo: THREE.TubeGeometry;
  mat: THREE.ShaderMaterial;
  from: string;
  to: string;
  a: THREE.Vector3;
  b: THREE.Vector3;
}

const dummy = new THREE.Object3D();

/** Glowing data lines that arc between islands, with small packets travelling along them. */
export default function DataLines() {
  const mats = getMats();

  const links = useMemo<Link[]>(
    () =>
      LINKS.map((l, i) => {
        const A = ISLANDS[l.from];
        const B = ISLANDS[l.to];
        const dir = new THREE.Vector3(B.pos[0] - A.pos[0], 0, B.pos[2] - A.pos[2]).normalize();
        const a = new THREE.Vector3(A.pos[0] + dir.x * A.r * 0.8, A.pos[1] + 0.5, A.pos[2] + dir.z * A.r * 0.8);
        const b = new THREE.Vector3(B.pos[0] - dir.x * B.r * 0.8, B.pos[1] + 0.5, B.pos[2] - dir.z * B.r * 0.8);
        const mid = a.clone().add(b).multiplyScalar(0.5);
        mid.y = Math.max(a.y, b.y) + l.lift;
        const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
        return {
          curve,
          geo: new THREE.TubeGeometry(curve, 96, 0.075, 6, false),
          mat: createLineMaterial(i * 0.37),
          from: l.from,
          to: l.to,
          a,
          b,
        };
      }),
    [],
  );

  const packets = useRef<THREE.InstancedMesh>(null);

  useFrame((state, dt) => {
    const st = useStore.getState();
    const t = state.clock.elapsedTime;
    const active = st.focus ?? st.hover;

    links.forEach((k) => {
      const isHot = !!active && (active.island === k.from || active.island === k.to);
      const u = k.mat.uniforms.uHot;
      u.value = THREE.MathUtils.damp(u.value as number, isHot ? 1 : 0, 6, dt);
    });

    const m = packets.current;
    if (!m) return;
    let n = 0;
    links.forEach((k, i) => {
      for (let j = 0; j < 2; j++) {
        const f = (t * (0.05 + 0.012 * i) + j * 0.5 + i * 0.21) % 1;
        k.curve.getPointAt(j === 0 ? f : 1 - f, dummy.position);
        dummy.scale.setScalar(0.85 + 0.6 * Math.sin(f * Math.PI));
        dummy.updateMatrix();
        m.setMatrixAt(n++, dummy.matrix);
      }
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {links.map((k, i) => (
        <group key={i}>
          <mesh geometry={k.geo} material={k.mat} renderOrder={3} frustumCulled={false} />
          {[k.a, k.b].map((p, j) => (
            <group key={j} position={p}>
              <mesh material={mats.glowHot}>
                <sphereGeometry args={[0.26, 14, 10]} />
              </mesh>
              <mesh rotation-x={Math.PI / 2} material={mats.glow}>
                <torusGeometry args={[0.7, 0.03, 8, 40]} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
      <instancedMesh ref={packets} args={[undefined, undefined, links.length * 2]} material={mats.glowHot} frustumCulled={false}>
        <sphereGeometry args={[0.17, 10, 8]} />
      </instancedMesh>
    </group>
  );
}
