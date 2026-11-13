/**
 * All custom GLSL lives here. Colours are LINEAR (the post stack converts to sRGB at the end).
 * Fog is done by hand (same maths as THREE.FogExp2) so custom shaders match the standard materials.
 */

export const NOISE = /* glsl */ `
float hash21(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float hash31(vec3 p3){ p3 = fract(p3 * .1031); p3 += dot(p3, p3.zyx + 31.32); return fract((p3.x + p3.y) * p3.z); }
vec3 hash33(vec3 p3){ p3 = fract(p3 * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yxz + 33.33); return fract((p3.xxy + p3.yxx) * p3.zyx); }
float vnoise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i); float b = hash21(i + vec2(1.0, 0.0)); float c = hash21(i + vec2(0.0, 1.0)); float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p){ float v = 0.0; float a = 0.5; for (int i = 0; i < 5; i++) { v += a * vnoise(p); p = p * 2.02 + 17.3; a *= 0.5; } return v; }
`;

const FOG_PARS = /* glsl */ `
uniform vec3 uFogColor;
uniform float uFogDensity;
varying float vDepth;
vec3 applyFog(vec3 col){ float f = 1.0 - exp(-uFogDensity * uFogDensity * vDepth * vDepth); return mix(col, uFogColor, f); }
`;

/* ------------------------------------------------------------------ SKY */
export const skyVert = /* glsl */ `
varying vec3 vDir;
void main(){
  vDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

export const skyFrag = /* glsl */ `
uniform float uTime;
uniform vec3 uAccent;
uniform vec3 uBlue;
varying vec3 vDir;
${NOISE}
float starLayer(vec3 d, float scale, float thresh, float seed, float radius){
  vec3 p = d * scale; vec3 ip = floor(p); vec3 fp = fract(p);
  float h = hash31(ip + seed);
  vec3 off = hash33(ip + seed * 1.7) * 0.6 + 0.2;
  float dist = length(fp - off);
  float tw = 0.7 + 0.3 * sin(uTime * (0.8 + h * 2.5) + h * 40.0);
  return smoothstep(radius, 0.0, dist) * step(thresh, h) * tw;
}
void main(){
  vec3 d = normalize(vDir);
  float h = d.y;
  // the whole sky is the two palette colours: blue overhead, a mixture of blue and cyan at the horizon
  vec3 zenith  = uBlue * 0.0115;
  vec3 mid     = mix(uBlue, uAccent, 0.25) * 0.031;
  vec3 horizon = mix(uBlue, uAccent, 0.50) * 0.1157;
  vec3 col = mix(horizon, mid, smoothstep(-0.02, 0.20, h));
  col = mix(col, zenith, smoothstep(0.15, 0.70, h));
  col = mix(col, uBlue * 0.017, smoothstep(0.0, -0.35, h));

  if (h > 0.0) {
    // soft nebula band
    float n = fbm(d.xz / (abs(d.y) + 0.45) * 0.9 + uTime * 0.004);
    col += uAccent * 0.010 * n * smoothstep(0.02, 0.45, h) * (1.0 - smoothstep(0.45, 0.95, h));

    // stars
    float st = starLayer(d, 70.0, 0.965, 0.0, 0.16) * 1.0
             + starLayer(d, 150.0, 0.975, 3.0, 0.30) * 0.75
             + starLayer(d, 320.0, 0.985, 7.0, 0.46) * 0.55;
    st *= smoothstep(0.02, 0.22, h);
    col += (vec3(0.6) + uBlue * 0.4) * st * 1.4;

    // moon
    vec3 moonDir = normalize(vec3(-0.50, 0.42, -0.75));
    float md = dot(d, moonDir);
    col += (vec3(0.7) + uBlue * 0.3) * smoothstep(0.9987, 0.9992, md) * 2.2;
    col += mix(uBlue, uAccent, 0.4) * 0.8 * pow(max(md, 0.0), 120.0) * 0.55;
    col += uBlue * 0.4 * pow(max(md, 0.0), 14.0) * 0.45;

  }

  gl_FragColor = vec4(col, 1.0);
}`;

/* ------------------------------------------------------------ CLOUD SEA */
export const cloudVert = /* glsl */ `
varying vec3 vWorld;
varying float vDepth;
void main(){
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vec4 mv = viewMatrix * wp;
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}`;

export const cloudFrag = /* glsl */ `
uniform float uTime;
uniform float uScale;
uniform float uOpacity;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec2 uCenter;
${FOG_PARS}
varying vec3 vWorld;
${NOISE}
void main(){
  vec2 p = vWorld.xz * uScale;
  float n  = fbm(p + vec2(uTime * 0.010, uTime * 0.004));
  float n2 = fbm(p * 2.3 - vec2(uTime * 0.018, 0.0) + 7.0);
  float d = smoothstep(0.36, 0.80, n * 0.75 + n2 * 0.35);
  float fade = 1.0 - smoothstep(70.0, 230.0, length(vWorld.xz - uCenter));
  vec3 col = mix(uColorA, uColorB, d);
  col += uColorB * 0.45 * smoothstep(0.55, 0.9, n2) * d;
  col = applyFog(col);
  gl_FragColor = vec4(col, d * uOpacity * fade);
}`;

/** Additive glow that "spills" from the city onto the clouds. */
export const glowFrag = /* glsl */ `
uniform vec3 uAccent;
uniform float uIntensity;
varying vec2 vUv;
void main(){
  float r = length(vUv - 0.5) * 2.0;
  float a = exp(-r * r * 4.5) * uIntensity;
  gl_FragColor = vec4(uAccent * a, a);
}`;
export const glowVert = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

/* ------------------------------------------------------ ISLAND PLATFORM */
export const platformVert = /* glsl */ `
varying vec2 vLocal;
varying float vDepth;
void main(){
  vLocal = position.xy;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}`;

export const platformFrag = /* glsl */ `
uniform float uTime;
uniform float uHover;
uniform float uRadius;
uniform vec3 uAccent;
uniform vec3 uBlue;
${FOG_PARS}
varying vec2 vLocal;
float gridLines(vec2 p, float cell, float w){
  vec2 q = p / cell;
  vec2 g = abs(fract(q - 0.5) - 0.5) / max(fwidth(q), vec2(1e-4));
  return 1.0 - clamp(min(g.x, g.y) / w, 0.0, 1.0);
}
void main(){
  float r = length(vLocal) / uRadius;
  vec3 col = uBlue * 0.0245 + mix(uBlue, uAccent, 0.3) * 0.017 * (1.0 - r);
  float g1 = gridLines(vLocal, 1.0, 1.0);
  float g2 = gridLines(vLocal, 4.0, 1.5);
  float rim = smoothstep(0.82, 1.0, r);
  float s = fract(uTime * 0.07);
  float ring = exp(-pow((r - s * 1.15) * 13.0, 2.0)) * (1.0 - s);
  float k = 0.55 + uHover * 1.2;
  col += uAccent * (g1 * 0.050 + g2 * 0.170) * k * (1.0 - 0.55 * r);
  col += uAccent * rim * (0.35 + 0.9 * uHover);
  col += uAccent * ring * (0.18 + 0.45 * uHover);
  gl_FragColor = vec4(applyFog(col), 1.0);
}`;

/* ------------------------------------------------------------ DATA LINE */
export const lineVert = /* glsl */ `
varying vec2 vUv;
varying float vDepth;
void main(){
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}`;

export const lineFrag = /* glsl */ `
uniform float uTime;
uniform float uHot;
uniform float uOffset;
uniform vec3 uAccent;
uniform float uFogDensity;
varying vec2 vUv;
varying float vDepth;
void main(){
  float along = vUv.x;
  float p = fract(along * 4.0 - uTime * 0.20 + uOffset);
  float pulse = smoothstep(0.0, 0.012, p) * (1.0 - smoothstep(0.012, 0.30, p));
  float a = 0.16 + 0.22 * uHot + pulse * (0.75 + 0.5 * uHot);
  a *= smoothstep(0.0, 0.05, along) * (1.0 - smoothstep(0.95, 1.0, along));
  float f = 1.0 - exp(-uFogDensity * uFogDensity * vDepth * vDepth);
  a *= 1.0 - f * 0.7;
  gl_FragColor = vec4(uAccent * (0.9 + pulse * 2.6 + uHot * 0.8), a);
}`;

/* ---------------------------------------------------------- HOLO CLOUD */
export const holoVert = /* glsl */ `
varying vec3 vN;
varying vec3 vV;
varying float vWorldY;
varying float vDepth;
void main(){
  vN = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vV = normalize(-mv.xyz);
  vDepth = -mv.z;
  vWorldY = (modelMatrix * vec4(position, 1.0)).y;
  gl_Position = projectionMatrix * mv;
}`;

export const holoFrag = /* glsl */ `
uniform float uTime;
uniform vec3 uAccent;
uniform float uBoost;
uniform float uFogDensity;
varying vec3 vN;
varying vec3 vV;
varying float vWorldY;
varying float vDepth;
void main(){
  float fres = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.0);
  float scan = 0.5 + 0.5 * sin(vWorldY * 14.0 - uTime * 1.8);
  float a = (0.07 + fres * 0.62 + scan * 0.05) * (0.8 + uBoost * 0.6);
  float f = 1.0 - exp(-uFogDensity * uFogDensity * vDepth * vDepth);
  a *= 1.0 - f * 0.6;
  gl_FragColor = vec4(uAccent * (0.7 + fres * 2.2 + uBoost), a);
}`;

/* ------------------------------------------------------------ PARTICLES */
export const particleVert = /* glsl */ `
attribute float aSeed;
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
varying float vA;
void main(){
  vec3 p = position;
  float m = mod(uTime * (0.12 + aSeed * 0.22) + aSeed * 40.0, 34.0);
  p.y += m - 10.0;
  p.x += sin(uTime * 0.2 + aSeed * 20.0) * 0.9;
  p.z += cos(uTime * 0.17 + aSeed * 30.0) * 0.9;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = min(uSize * (0.6 + aSeed) * uPixelRatio * (40.0 / -mv.z), 14.0 * uPixelRatio);
  vA = (0.2 + 0.8 * (0.5 + 0.5 * sin(uTime * (1.0 + aSeed * 2.0) + aSeed * 50.0))) * smoothstep(0.0, 3.0, m) * (1.0 - smoothstep(30.0, 34.0, m));
}`;

export const particleFrag = /* glsl */ `
uniform vec3 uAccent;
varying float vA;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(uAccent * 1.8, a * a * vA);
}`;

/* ----------------------------------------------------------- HOVER RING */
export const ringFrag = /* glsl */ `
uniform float uTime;
uniform float uHover;
uniform vec3 uAccent;
varying vec2 vUv;
void main(){
  float r = length(vUv - 0.5) * 2.0;
  float s = fract(uTime * 0.45);
  float wave = exp(-pow((r - (0.55 + s * 0.45)) * 16.0, 2.0)) * (1.0 - s);
  float edge = smoothstep(0.98, 0.9, r);
  float a = (wave * 0.9 + exp(-pow((r - 0.92) * 40.0, 2.0)) * 0.5) * edge * uHover;
  gl_FragColor = vec4(uAccent * 2.0, a);
}`;
