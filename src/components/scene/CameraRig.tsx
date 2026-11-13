"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useStore } from "@/store/useStore";
import { HERO_POSE, clampGoal, flyTo, focusPose, overviewPose, relaxShift, rig, type Pose } from "./rig";

const KEYS: (keyof Pose)[] = ["x", "y", "z", "radius", "azimuth", "elevation", "shift"];
const damp = THREE.MathUtils.damp;

/**
 * Turns the rig (goal pose, current pose) into an actual camera every frame:
 * damping, hero drift, pointer parallax, narrow-screen fitting and the sideways view shift.
 * It also starts the scripted moves when the store changes (reveal, focus, leave focus, go home).
 */
export default function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const drift = useRef(0);

  useEffect(() => {
    return useStore.subscribe((s, prev) => {
      if (s.revealed && !prev.revealed) flyTo(HERO_POSE, 3.8, "power3.out");
      if (s.mode === prev.mode && s.focus === prev.focus) return;
      if (s.mode === "focus" && s.focus) flyTo(focusPose(s.focus), 2.3);
      else if (prev.mode === "focus" && s.mode === "explore" && prev.focus) flyTo(overviewPose(prev.focus.island), 2.0);
      else if (s.mode === "hero" && (prev.mode === "explore" || prev.mode === "focus")) flyTo(HERO_POSE, 2.6);
      else if (s.mode === "explore" && prev.mode === "hero") relaxShift();
    });
  }, []);

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.1);
    const st = useStore.getState();
    const t = state.clock.elapsedTime;
    const g = rig.goal;
    const c = rig.cur;

    // inertia after a drag
    if (st.mode === "explore") {
      if (!rig.dragging) {
        g.x += rig.vx * dt;
        g.z += rig.vz * dt;
        const k = Math.exp(-4.2 * dt);
        rig.vx *= k;
        rig.vz *= k;
        if (Math.abs(rig.vx) + Math.abs(rig.vz) < 0.02) rig.vx = rig.vz = 0;
      }
      clampGoal();
    }

    for (const k of KEYS) c[k] = damp(c[k], g[k], rig.lambda, dt);
    rig.px = damp(rig.px, rig.tpx, 3, dt);
    rig.py = damp(rig.py, rig.tpy, 3, dt);
    drift.current = damp(drift.current, st.mode === "hero" ? 1 : 0, 1.6, dt);

    const motion = st.reducedMotion ? 0 : 1;
    const d = motion * drift.current;
    const par = (st.mode === "focus" ? 0.3 : 1) * (st.coarse ? 0 : 1) * motion;
    const az = c.azimuth + d * (Math.sin(t * 0.11) * 0.085 + Math.sin(t * 0.047 + 2) * 0.03) - rig.px * 0.035 * par;
    const el = c.elevation + d * Math.sin(t * 0.08 + 1) * 0.018 + rig.py * 0.022 * par;

    // portrait screens need more distance to fit the city; the sideways shift only makes sense on wide screens
    const aspect = size.width / size.height;
    const fit = aspect >= 1.4 ? 1 : Math.min(2.3, 1.4 / aspect);
    const radius = c.radius * fit + d * Math.sin(t * 0.06) * 1.6;
    const shift = c.shift * Math.min(1, Math.max(0, (aspect - 0.9) / 0.6));

    const ce = Math.cos(el);
    camera.position.set(c.x + Math.sin(az) * ce * radius, c.y + Math.sin(el) * radius, c.z + Math.cos(az) * ce * radius);
    camera.lookAt(c.x, c.y, c.z);
    camera.setViewOffset(size.width, size.height, shift * size.width, 0, size.width, size.height);
  }, -10);

  return null;
}
