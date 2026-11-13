"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useStore } from "@/store/useStore";
import { BOUNDS } from "./constants";
import { pickAt } from "./picking";
import { rig, takeControl } from "./rig";

const tmp = new THREE.Vector3();

/**
 * Pointer, wheel, pinch and keyboard for the 3D world.
 *  - drag pans the camera over the city (with inertia), wheel and pinch zoom
 *  - a click (pointer moved less than 5px) picks an island or a project and flies in
 *  - hover is a raycast every third frame, never on touch screens
 */
export default function Interaction() {
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const ndc = useRef(new THREE.Vector2());
  const inside = useRef(false);
  const frame = useRef(0);

  useEffect(() => {
    const el = gl.domElement;
    el.style.touchAction = "none";
    const pts = new Map<number, { x: number; y: number }>();
    let down = false;
    let dragging = false;
    let sx = 0;
    let sy = 0;
    let lx = 0;
    let ly = 0;
    let lt = 0;
    let travelled = 0;
    let pinch = 0;

    const setNdc = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      ndc.current.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    };

    /** world units per CSS pixel at the point the camera looks at */
    const unitsPerPixel = () => {
      const d = camera.position.distanceTo(tmp.set(rig.cur.x, rig.cur.y, rig.cur.z));
      return (2 * d * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)) / el.getBoundingClientRect().height;
    };

    /** drag the ground under the cursor */
    const pan = (dx: number, dy: number, dt: number) => {
      const u = unitsPerPixel();
      const az = rig.cur.azimuth;
      const rx = Math.cos(az);
      const rz = -Math.sin(az);
      const fx = -Math.sin(az);
      const fz = -Math.cos(az);
      const k = u / Math.max(0.35, Math.sin(rig.cur.elevation));
      const wx = -rx * dx * u + fx * dy * k;
      const wz = -rz * dx * u + fz * dy * k;
      rig.goal.x += wx;
      rig.goal.z += wz;
      const vmax = 90;
      rig.vx = THREE.MathUtils.clamp(THREE.MathUtils.lerp(rig.vx, wx / dt, 0.4), -vmax, vmax);
      rig.vz = THREE.MathUtils.clamp(THREE.MathUtils.lerp(rig.vz, wz / dt, 0.4), -vmax, vmax);
    };

    const zoomBy = (factor: number) => {
      const st = useStore.getState();
      if (st.mode === "loading" || st.mode === "focus") return;
      if (st.mode === "hero") st.setMode("explore");
      takeControl();
      rig.goal.radius = THREE.MathUtils.clamp(rig.goal.radius * factor, BOUNDS.minR, BOUNDS.maxR);
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (useStore.getState().mode === "loading") return;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* not fatal */
      }
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 1) {
        down = true;
        dragging = false;
        sx = lx = e.clientX;
        sy = ly = e.clientY;
        lt = e.timeStamp;
        travelled = 0;
        rig.vx = rig.vz = 0;
      } else if (pts.size === 2) {
        const [a, b] = [...pts.values()];
        pinch = Math.hypot(a.x - b.x, a.y - b.y);
        dragging = true;
        rig.dragging = true;
      }
    };

    const onMove = (e: PointerEvent) => {
      setNdc(e);
      inside.current = true;
      rig.tpx = ndc.current.x;
      rig.tpy = ndc.current.y;
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const st = useStore.getState();

      if (pts.size >= 2) {
        const [a, b] = [...pts.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch > 0 && d > 0) zoomBy(pinch / d);
        pinch = d;
        return;
      }
      if (!down) return;

      const dx = e.clientX - lx;
      const dy = e.clientY - ly;
      lx = e.clientX;
      ly = e.clientY;
      travelled = Math.hypot(e.clientX - sx, e.clientY - sy);

      if (!dragging && travelled > 5 && st.mode !== "focus") {
        if (st.mode === "hero") st.setMode("explore");
        dragging = true;
        rig.dragging = true;
        takeControl();
        st.setHover(null);
      }
      if (dragging && st.mode === "explore") pan(dx, dy, Math.max(0.004, (e.timeStamp - lt) / 1000));
      lt = e.timeStamp;
    };

    const onUp = (e: PointerEvent) => {
      if (!pts.has(e.pointerId)) return;
      const single = pts.size === 1;
      pts.delete(e.pointerId);
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* not fatal */
      }
      if (pts.size > 0) return;
      rig.dragging = false;
      if (e.type === "pointerup" && down && single && !dragging && travelled <= 5) {
        setNdc(e);
        const hit = pickAt(ndc.current, camera);
        if (hit) useStore.getState().focusOn(hit);
      }
      // paused before letting go: no fling
      if (e.timeStamp - lt > 90) rig.vx = rig.vz = 0;
      down = false;
      dragging = false;
    };

    const onLeave = () => {
      inside.current = false;
      rig.tpx = rig.tpy = 0;
      useStore.getState().setHover(null);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
      const dy = THREE.MathUtils.clamp(e.deltaY * unit, -140, 140);
      zoomBy(Math.exp(dy * 0.0018));
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") useStore.getState().clearFocus();
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [gl, camera]);

  useFrame(() => {
    if (++frame.current % 3 !== 0) return;
    const st = useStore.getState();
    if (st.coarse || (st.mode !== "hero" && st.mode !== "explore")) return;
    if (!inside.current || rig.dragging) {
      st.setHover(null);
      return;
    }
    st.setHover(pickAt(ndc.current, camera));
  });

  return null;
}
