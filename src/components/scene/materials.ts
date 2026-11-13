import * as THREE from "three";
import { rgba, mixHex } from "@/lib/palette";
import { ACCENT, BLUE_HEX, FOG_COLOR, FOG_DENSITY, SCENE } from "./constants";
import {
  cloudFrag,
  cloudVert,
  glowFrag,
  glowVert,
  holoFrag,
  holoVert,
  lineFrag,
  lineVert,
  particleFrag,
  particleVert,
  platformFrag,
  platformVert,
  ringFrag,
  skyFrag,
  skyVert,
} from "./shaders";

/** Shared uniform objects: every custom shader points at these, so fog and accent stay in sync. */
export const shared = {
  uTime: { value: 0 },
  uFogColor: { value: new THREE.Color(FOG_COLOR) },
  uFogDensity: { value: FOG_DENSITY },
  uAccent: { value: new THREE.Color(ACCENT) },
  uBlue: { value: new THREE.Color(BLUE_HEX) },
};

/** Small seeded random so textures look the same on every load. */
export function rng(seed: number) {
  let a = Math.floor(seed * 1e6) >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, srgb = true) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function ledTexture() {
  const r = rng(11);
  return canvasTex(64, 128, (g, w, h) => {
    g.fillStyle = "#000";
    g.fillRect(0, 0, w, h);
    const rows = 16;
    const rh = h / rows;
    for (let i = 0; i < rows; i++) {
      g.fillStyle = rgba(ACCENT, 0.1);
      g.fillRect(2, i * rh + 1, w - 4, rh - 2);
      for (let k = 0; k < 7; k++) {
        if (r() < 0.42) continue;
        g.fillStyle = rgba(ACCENT, 0.6 + r() * 0.4);
        g.fillRect(6 + k * 8, i * rh + rh * 0.34, 3, rh * 0.32);
      }
      g.fillStyle = rgba(ACCENT, 0.22);
      g.fillRect(w - 18, i * rh + rh * 0.3, 12, 1);
      g.fillRect(w - 18, i * rh + rh * 0.62, 12, 1);
    }
  });
}

function windowTexture() {
  const r = rng(23);
  return canvasTex(128, 32, (g, w, h) => {
    g.fillStyle = "#000";
    g.fillRect(0, 0, w, h);
    const cols = 16;
    const rows = 3;
    const cw = w / cols;
    const ch = h / rows;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (r() < 0.35) continue;
        g.fillStyle = rgba(mixHex(ACCENT, "#FFFFFF", 0.78), 0.5 + r() * 0.5);
        g.fillRect(x * cw + 3, y * ch + 4, cw - 6, ch - 8);
      }
    }
  });
}

function crateTextures() {
  const color = canvasTex(128, 64, (g, w, h) => {
    g.fillStyle = SCENE.crateA;
    g.fillRect(0, 0, w, h);
    for (let x = 6; x < w - 6; x += 5) {
      g.fillStyle = x % 10 === 6 ? SCENE.crateB : SCENE.crateC;
      g.fillRect(x, 5, 3, h - 10);
    }
    g.strokeStyle = SCENE.crateEdge;
    g.lineWidth = 4;
    g.strokeRect(2, 2, w - 4, h - 4);
  });
  const emissive = canvasTex(128, 64, (g, w, h) => {
    g.fillStyle = "#000";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = rgba(ACCENT, 0.85);
    g.lineWidth = 2;
    g.strokeRect(3, 3, w - 6, h - 6);
    g.fillStyle = rgba(ACCENT, 0.55);
    g.fillRect(w / 2 - 1, 8, 2, h - 16);
  });
  return { color, emissive };
}

function hazardTexture() {
  return canvasTex(64, 16, (g, w, h) => {
    g.fillStyle = SCENE.hazardBase;
    g.fillRect(0, 0, w, h);
    g.fillStyle = rgba(ACCENT, 0.95);
    for (let x = -h; x < w + h; x += 16) {
      g.beginPath();
      g.moveTo(x, h);
      g.lineTo(x + 8, h);
      g.lineTo(x + 8 + h, 0);
      g.lineTo(x + h, 0);
      g.closePath();
      g.fill();
    }
  });
}

export interface Mats {
  rack: THREE.MeshStandardMaterial;
  crate: THREE.MeshStandardMaterial;
  hull: THREE.MeshStandardMaterial;
  hullLight: THREE.MeshStandardMaterial;
  windows: THREE.MeshStandardMaterial;
  hazard: THREE.MeshStandardMaterial;
  rock: THREE.MeshStandardMaterial;
  bar: THREE.MeshStandardMaterial;
  glow: THREE.MeshBasicMaterial;
  glowHot: THREE.MeshBasicMaterial;
  wire: THREE.LineBasicMaterial;
  wireDim: THREE.LineBasicMaterial;
}

let cached: Mats | null = null;

export function getMats(): Mats {
  if (cached) return cached;
  const led = ledTexture();
  const win = windowTexture();
  const crate = crateTextures();
  const haz = hazardTexture();
  const glowColor = new THREE.Color(ACCENT).multiplyScalar(2.0);
  cached = {
    rack: new THREE.MeshStandardMaterial({
      color: SCENE.rack,
      roughness: 0.5,
      metalness: 0.55,
      emissive: "#ffffff",
      emissiveMap: led,
      emissiveIntensity: 2.2,
    }),
    crate: new THREE.MeshStandardMaterial({
      map: crate.color,
      emissive: "#ffffff",
      emissiveMap: crate.emissive,
      emissiveIntensity: 1.5,
      roughness: 0.65,
      metalness: 0.4,
    }),
    hull: new THREE.MeshStandardMaterial({ color: SCENE.hull, roughness: 0.6, metalness: 0.3 }),
    hullLight: new THREE.MeshStandardMaterial({ color: SCENE.hullLight, roughness: 0.5, metalness: 0.35 }),
    windows: new THREE.MeshStandardMaterial({
      color: SCENE.windowBody,
      emissive: "#ffffff",
      emissiveMap: win,
      emissiveIntensity: 1.8,
      roughness: 0.4,
      metalness: 0.2,
    }),
    hazard: new THREE.MeshStandardMaterial({
      map: haz,
      emissive: "#ffffff",
      emissiveMap: haz,
      emissiveIntensity: 1.1,
      roughness: 0.7,
    }),
    rock: new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95, metalness: 0.05 }),
    bar: new THREE.MeshStandardMaterial({
      color: SCENE.bar,
      emissive: ACCENT,
      emissiveIntensity: 1.05,
      roughness: 0.35,
      metalness: 0.4,
    }),
    glow: new THREE.MeshBasicMaterial({ color: glowColor, toneMapped: false }),
    glowHot: new THREE.MeshBasicMaterial({ color: new THREE.Color(ACCENT).multiplyScalar(3.2), toneMapped: false }),
    wire: new THREE.LineBasicMaterial({ color: new THREE.Color(ACCENT).multiplyScalar(1.6), transparent: true, opacity: 0.85 }),
    wireDim: new THREE.LineBasicMaterial({ color: new THREE.Color(ACCENT).multiplyScalar(1.2), transparent: true, opacity: 0.35 }),
  };
  return cached;
}

/* ------------------------------------------------------------ shaders */

export function createSkyMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: skyVert,
    fragmentShader: skyFrag,
    uniforms: { uTime: shared.uTime, uAccent: shared.uAccent, uBlue: shared.uBlue },
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: false,
  });
}

export function createCloudMaterial(o: { scale: number; opacity: number; colorA: string; colorB: string; center?: [number, number] }) {
  return new THREE.ShaderMaterial({
    vertexShader: cloudVert,
    fragmentShader: cloudFrag,
    uniforms: {
      uTime: shared.uTime,
      uFogColor: shared.uFogColor,
      uFogDensity: shared.uFogDensity,
      uScale: { value: o.scale },
      uOpacity: { value: o.opacity },
      uColorA: { value: new THREE.Color(o.colorA) },
      uColorB: { value: new THREE.Color(o.colorB) },
      uCenter: { value: new THREE.Vector2(...(o.center ?? [6, -6])) },
    },
    transparent: true,
    depthWrite: false,
  });
}

export function createGlowMaterial(intensity: number) {
  return new THREE.ShaderMaterial({
    vertexShader: glowVert,
    fragmentShader: glowFrag,
    uniforms: { uAccent: shared.uAccent, uIntensity: { value: intensity } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

export function createPlatformMaterial(radius: number) {
  return new THREE.ShaderMaterial({
    vertexShader: platformVert,
    fragmentShader: platformFrag,
    uniforms: {
      uTime: shared.uTime,
      uHover: { value: 0 },
      uRadius: { value: radius },
      uAccent: shared.uAccent,
      uBlue: shared.uBlue,
      uFogColor: shared.uFogColor,
      uFogDensity: shared.uFogDensity,
    },
  });
}

export function createLineMaterial(offset: number) {
  return new THREE.ShaderMaterial({
    vertexShader: lineVert,
    fragmentShader: lineFrag,
    uniforms: {
      uTime: shared.uTime,
      uHot: { value: 0 },
      uOffset: { value: offset },
      uAccent: shared.uAccent,
      uFogDensity: shared.uFogDensity,
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

export function createHoloMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: holoVert,
    fragmentShader: holoFrag,
    uniforms: { uTime: shared.uTime, uAccent: shared.uAccent, uBoost: { value: 0 }, uFogDensity: shared.uFogDensity },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

export function createParticleMaterial(pixelRatio: number) {
  return new THREE.ShaderMaterial({
    vertexShader: particleVert,
    fragmentShader: particleFrag,
    uniforms: {
      uTime: shared.uTime,
      uSize: { value: 5 },
      uPixelRatio: { value: pixelRatio },
      uAccent: shared.uAccent,
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

export function createRingMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: glowVert,
    fragmentShader: ringFrag,
    uniforms: { uTime: shared.uTime, uHover: { value: 0 }, uAccent: shared.uAccent },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}
