"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Billboard } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { IslandId } from "@/data/content";
import { FOG, INK_2, rgba } from "@/lib/palette";
import { ACCENT } from "./constants";
import { registerPick, unregisterPick } from "./picking";
import { getMats } from "./materials";

type V3 = [number, number, number];

export interface InstSpec {
  p: V3;
  s: V3;
  ry?: number;
  rz?: number;
}

const UNIT_BOX = new THREE.BoxGeometry(1, 1, 1);
const UNIT_CYL = new THREE.CylinderGeometry(0.5, 0.5, 1, 22);

/** Many copies of one shape, one draw call. Layout is static and set once. */
function StaticMeshes({ geometry, specs, material }: { geometry: THREE.BufferGeometry; specs: InstSpec[]; material: THREE.Material }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    specs.forEach((b, i) => {
      o.position.set(...b.p);
      o.rotation.set(0, b.ry ?? 0, b.rz ?? 0);
      o.scale.set(...b.s);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [specs]);
  return <instancedMesh ref={ref} args={[geometry, material, specs.length]} frustumCulled={false} />;
}

export const StaticBoxes = (p: { specs: InstSpec[]; material: THREE.Material }) => <StaticMeshes geometry={UNIT_BOX} {...p} />;
/** Cylinders: `s` is (diameter, height, diameter). */
export const StaticCyls = (p: { specs: InstSpec[]; material: THREE.Material }) => <StaticMeshes geometry={UNIT_CYL} {...p} />;

/** A single box. `s` is the full size. */
export function Box({ p, s, m, ry = 0, rx = 0, rz = 0 }: { p: V3; s: V3; m: THREE.Material; ry?: number; rx?: number; rz?: number }) {
  return <mesh geometry={UNIT_BOX} material={m} position={p} scale={s} rotation={[rx, ry, rz]} />;
}

/** A single cylinder (or cone when `rTop` differs). */
export function Cyl({ p, r, h, m, rTop, seg = 22 }: { p: V3; r: number; h: number; m: THREE.Material; rTop?: number; seg?: number }) {
  return (
    <mesh position={p} material={m}>
      <cylinderGeometry args={[rTop ?? r, r, h, seg]} />
    </mesh>
  );
}

/** Invisible mesh used for hover and click. Never drawn, only raycast. */
export function PickProxy({
  island,
  sub,
  position,
  children,
}: {
  island: IslandId;
  sub?: string;
  position?: V3;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    m.userData = { island, sub };
    registerPick(m);
    return () => unregisterPick(m);
  }, [island, sub]);
  return (
    <mesh ref={ref} visible={false} position={position}>
      {children}
    </mesh>
  );
}

/** Thin glowing ring. `flat` lays it on the ground, otherwise it stands up. */
export function GlowRing({
  radius,
  tube = 0.03,
  position = [0, 0, 0],
  flat = true,
  hot = false,
}: {
  radius: number;
  tube?: number;
  position?: V3;
  flat?: boolean;
  hot?: boolean;
}) {
  const mats = getMats();
  return (
    <mesh position={position} rotation-x={flat ? Math.PI / 2 : 0} material={hot ? mats.glowHot : mats.glow}>
      <torusGeometry args={[radius, tube, 8, 72]} />
    </mesh>
  );
}

/** Wireframe outline of a box. */
export function EdgeBox({ size, position, material }: { size: V3; position: V3; material: THREE.Material }) {
  const geo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(...size)), [size]);
  return <lineSegments geometry={geo} material={material} position={position} />;
}

/* -------------------------------------------------------------- tech tags */

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function makeTagTexture(text: string) {
  const W = 340;
  const H = 88;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const font = '600 33px "Instrument Sans Variable", ui-sans-serif, system-ui, sans-serif';
  const draw = () => {
    g.clearRect(0, 0, W, H);
    g.font = font;
    g.textBaseline = "middle";
    // the pill is as wide as its text, centred on the tag's anchor
    const pw = Math.min(W - 8, 62 + g.measureText(text).width + 30);
    const x0 = (W - pw) / 2;
    roundRect(g, x0, 4, pw, H - 8, 40);
    g.fillStyle = rgba(INK_2, 0.84);
    g.fill();
    g.strokeStyle = rgba(ACCENT, 0.95);
    g.lineWidth = 3;
    g.stroke();
    g.fillStyle = ACCENT;
    g.beginPath();
    g.arc(x0 + 36, H / 2, 7, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = FOG;
    g.fillText(text, x0 + 58, H / 2 + 2);
    tex.needsUpdate = true;
  };
  draw();
  // the font may not be loaded yet: redraw once it is
  try {
    document.fonts?.load(font).then(draw).catch(() => {});
  } catch {
    /* ignore */
  }
  return tex;
}

/** A floating label that always faces the camera. Used on the "Currently Building" island. */
export function TechTag({ text, position, phase = 0 }: { text: string; position: V3; phase?: number }) {
  const tex = useMemo(() => makeTagTexture(text), [text]);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, depthWrite: false }), [tex]);
  const g = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (g.current) g.current.position.y = position[1] + Math.sin(s.clock.elapsedTime * 0.9 + phase) * 0.18;
  });
  return (
    <group ref={g} position={position}>
      <Billboard>
        <mesh material={mat} renderOrder={6}>
          <planeGeometry args={[3.1, 0.8]} />
        </mesh>
      </Billboard>
    </group>
  );
}
