import * as THREE from "three";
import { SCENE } from "./constants";

/** Cheap smooth 3D value noise (0..1). Deterministic, used for rock shapes. */
function hash3(x: number, y: number, z: number) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
}
export function noise3(x: number, y: number, z: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const xf = x - xi;
  const yf = y - yi;
  const zf = z - zi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const w = zf * zf * (3 - 2 * zf);
  const l = (a: number, b: number, t: number) => a + (b - a) * t;
  return l(
    l(l(hash3(xi, yi, zi), hash3(xi + 1, yi, zi), u), l(hash3(xi, yi + 1, zi), hash3(xi + 1, yi + 1, zi), u), v),
    l(l(hash3(xi, yi, zi + 1), hash3(xi + 1, yi, zi + 1), u), l(hash3(xi, yi + 1, zi + 1), hash3(xi + 1, yi + 1, zi + 1), u), v),
    w,
  );
}

/**
 * A floating island body: flat circular top, jagged inverted cone below.
 * Built from an icosphere so it is cheap (about 1300 triangles) and looks faceted with flat shading.
 */
export function makeRockGeometry(radius: number, depth: number, seed: number) {
  const geo = new THREE.IcosahedronGeometry(1, 3);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  const v = new THREE.Vector3();
  const c = new THREE.Color();
  const rim = new THREE.Color(SCENE.rockRim);
  const mid = new THREE.Color(SCENE.rockMid);
  const tip = new THREE.Color(SCENE.rockTip);

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = noise3(v.x * 2.4 + seed, v.y * 2.4 + seed * 0.7, v.z * 2.4 + seed * 1.3);
    if (v.y >= -1e-6) {
      // flat top
      pos.setXYZ(i, v.x * radius * 0.992, 0, v.z * radius * 0.992);
      c.copy(rim);
    } else {
      const u = Math.min(1, -v.y);
      const hl = Math.hypot(v.x, v.z) || 1e-6;
      const taper = Math.pow(1 - u, 0.72);
      const rough = 1 + (n - 0.5) * 0.42 * (0.35 + u);
      const rr = radius * taper * rough;
      const yy = -u * depth * (1 + (n - 0.5) * 0.28);
      pos.setXYZ(i, (v.x / hl) * rr, yy, (v.z / hl) * rr);
      const strata = 0.82 + 0.3 * Math.sin(yy * 3.1 + n * 4.0);
      c.copy(rim).lerp(mid, Math.min(1, u * 2.2)).lerp(tip, Math.max(0, u * 1.25 - 0.45)).multiplyScalar(strata);
    }
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

/** Small irregular rock chunk (for floating debris). */
export function makeChunkGeometry(seed: number) {
  const geo = new THREE.IcosahedronGeometry(1, 1);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  const v = new THREE.Vector3();
  const c = new THREE.Color(SCENE.chunk);
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = noise3(v.x * 3 + seed, v.y * 3, v.z * 3 + seed);
    v.multiplyScalar(0.7 + n * 0.6);
    v.y *= 0.8;
    pos.setXYZ(i, v.x, v.y, v.z);
    const k = 0.75 + n * 0.5;
    colors[i * 3] = c.r * k;
    colors[i * 3 + 1] = c.g * k;
    colors[i * 3 + 2] = c.b * k;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

/** Blood drop shape for the Blood Bank Finder marker. */
export function makeDropGeometry() {
  const R = 0.55;
  const pts: THREE.Vector2[] = [];
  // rounded bottom, from the lowest point up to the widest point
  for (let i = 0; i <= 12; i++) {
    const a = -Math.PI / 2 + (i / 12) * (Math.PI / 2);
    pts.push(new THREE.Vector2(Math.max(Math.cos(a) * R, 0.0001), Math.sin(a) * R));
  }
  // tapering up to the tip
  for (let i = 1; i <= 16; i++) {
    const t = i / 16;
    pts.push(new THREE.Vector2(Math.max(R * Math.pow(1 - t, 1.5), 0.0001), t * 1.4));
  }
  return new THREE.LatheGeometry(pts, 28);
}

/** Triangular prism (for sawtooth roofs). Extruded along Z. */
export function makeWedgeGeometry(w: number, h: number, d: number) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(w, 0);
  s.lineTo(0, h);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false });
  g.translate(-w / 2, 0, -d / 2);
  return g;
}

/** Edges of a box as line segments (for "under construction" wireframes). */
export function makeBoxEdges(w: number, h: number, d: number) {
  return new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d));
}
