"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { profile } from "@/data/content";
import { useStore } from "@/store/useStore";

/**
 * Minimal loader: a big counter that tracks real readiness (shaders compiled, first frames drawn),
 * then a wipe that lifts away to reveal the city. The camera starts moving in as the wipe starts,
 * and the hero text animates in when it ends.
 */
export default function Loader() {
  const [gone, setGone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const edge = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t0 = performance.now();
    let p = 0;
    let last = t0;
    let raf = 0;
    let finished = false;

    const finish = () => {
      finished = true;
      const st = useStore.getState();
      if (st.reducedMotion) {
        st.beginReveal();
        st.finishReveal();
        setGone(true);
        return;
      }
      const tl = gsap.timeline({
        onComplete: () => {
          useStore.getState().finishReveal();
          setGone(true);
        },
      });
      tl.to(num.current, { yPercent: -30, opacity: 0, duration: 0.5, ease: "power3.in" }, 0)
        .to(label.current, { opacity: 0, duration: 0.3 }, 0)
        .add(() => useStore.getState().beginReveal(), 0.25)
        .fromTo(root.current, { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.15, ease: "power4.inOut" }, 0.25)
        .fromTo(edge.current, { top: "100%" }, { top: "0%", duration: 1.15, ease: "power4.inOut" }, 0.25)
        .to(edge.current, { opacity: 0, duration: 0.2 }, ">-0.1");
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (finished) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const el = (now - t0) / 1000;
      const st = useStore.getState();
      const minTime = st.reducedMotion ? 0.3 : 1.7;
      if (st.ready && el >= minTime) {
        p = Math.min(100, p + dt * 110);
      } else {
        const creep = 90 * (1 - Math.exp(-el / 1.5));
        p += (creep - p) * (1 - Math.exp(-dt * 5));
      }
      if (num.current) num.current.textContent = String(Math.floor(p)).padStart(3, "0");
      if (bar.current) bar.current.style.transform = `scaleX(${p / 100})`;
      if (p >= 100) {
        cancelAnimationFrame(raf);
        window.setTimeout(finish, 180);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (gone) return null;

  return (
    <div ref={root} className="loader fixed inset-0 z-[100] bg-ink text-fog" role="status" aria-live="polite" aria-label="Loading the portfolio">
      <div ref={label} className="label absolute left-6 right-6 top-6 flex justify-between text-mute sm:left-10 sm:right-10 sm:top-9">
        <span>{profile.name}</span>
        <span>Portfolio / Cloud City</span>
      </div>
      <div className="absolute bottom-10 left-6 sm:bottom-12 sm:left-10">
        <span ref={num} className="display block text-[clamp(6rem,24vw,22rem)] leading-[0.8] tabular-nums">
          000
        </span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10">
        <div ref={bar} className="h-full origin-left bg-accent" style={{ transform: "scaleX(0)" }} />
      </div>
      <div ref={edge} className="pointer-events-none absolute left-0 right-0 h-[2px] bg-accent shadow-[0_0_24px_4px_color-mix(in_srgb,var(--c-cyan)_55%,transparent)]" style={{ top: "100%" }} />
    </div>
  );
}
