"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/** Pulls its child a little toward the pointer when the pointer is near. Does nothing on touch or reduced motion. */
export default function Magnetic({ children, strength = 0.3, className = "" }: { children: React.ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.55, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.55, ease: "power3.out" });
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      // the box moves with the transform, so measure from where it would sit at rest
      const cx = r.left + r.width / 2 - (gsap.getProperty(el, "x") as number);
      const cy = r.top + r.height / 2 - (gsap.getProperty(el, "y") as number);
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const reach = Math.max(r.width, r.height) * 0.9 + 36;
      if (Math.hypot(dx, dy) < reach) {
        xTo(dx * strength);
        yTo(dy * strength);
      } else {
        xTo(0);
        yTo(0);
      }
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [strength]);
  return (
    <div ref={ref} data-magnetic className={`pointer-events-auto inline-block ${className}`}>
      {children}
    </div>
  );
}
