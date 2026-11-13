"use client";

import { forwardRef, useMemo } from "react";
import { HalfFloatType, Uniform, type WebGLRenderTarget, type WebGLRenderer } from "three";
import { EffectComposer, Bloom, ToneMapping, Vignette } from "@react-three/postprocessing";
import { BlendFunction, Effect, ToneMappingMode } from "postprocessing";
import { useStore } from "@/store/useStore";

/* ------------------------------------------------------------ film grain */
const grainFrag = /* glsl */ `
uniform float uStrength;
uniform float uTimeG;
float hash(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 p = uv * resolution + vec2(uTimeG * 37.0, uTimeG * 91.0);
  float n = (hash(floor(p)) + hash(floor(p * 0.5) + 11.0) * 0.5) / 1.5 - 0.5;
  float lum = dot(inputColor.rgb, vec3(0.299, 0.587, 0.114));
  // the effect runs in linear light: scale the noise so it looks even in the final sRGB picture
  float amt = uStrength * 2.4 * pow(max(lum, 0.0004), 0.583);
  outputColor = vec4(inputColor.rgb + n * amt, inputColor.a);
}`;

class GrainEffect extends Effect {
  constructor(strength: number) {
    super("GrainEffect", grainFrag, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, Uniform>([
        ["uStrength", new Uniform(strength)],
        ["uTimeG", new Uniform(0)],
      ]),
    });
  }
  update(_renderer: WebGLRenderer, _input: WebGLRenderTarget, deltaTime: number) {
    (this.uniforms.get("uTimeG") as Uniform).value += deltaTime;
  }
}

const Grain = forwardRef<GrainEffect, { strength?: number }>(function Grain({ strength = 0.05 }, ref) {
  const effect = useMemo(() => new GrainEffect(strength), [strength]);
  return <primitive ref={ref} object={effect} dispose={null} />;
});

/* ------------------------------------------------------------ the stack */
/**
 * Post processing, by performance tier:
 *   2 = bloom + ACES tone mapping + vignette + grain + MSAA
 *   1 = bloom + tone mapping + vignette
 *   0 = tone mapping only (still needed: the shaders output linear HDR colour)
 * Tiers only ever go down at runtime, so the order of the effects never changes.
 */
export default function Effects() {
  const perf = useStore((s) => s.perf);
  return (
    <EffectComposer multisampling={perf === 2 ? 4 : 0} frameBufferType={HalfFloatType} enableNormalPass={false}>
      {perf >= 1 ? <Bloom intensity={perf === 2 ? 1.0 : 0.8} luminanceThreshold={0.55} luminanceSmoothing={0.25} mipmapBlur radius={0.72} /> : <></>}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      {perf >= 1 ? <Vignette offset={0.28} darkness={0.78} /> : <></>}
      {perf === 2 ? <Grain strength={0.05} /> : <></>}
    </EffectComposer>
  );
}
