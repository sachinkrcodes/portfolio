"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";

/**
 * Custom cursor: a dot that follows exactly and a ring that trails it.
 * The ring snaps onto magnetic buttons, grows over islands ("Open") and shows a label on [data-cursor] elements.
 * Only for devices with a real pointer; touch screens never see it.
 */
export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const html = document.documentElement;
    html.classList.add("has-cursor");

    const s = { tx: -200, ty: -200, x: -200, y: -200, w: 34, h: 34, tw: 34, th: 34, shown: false };
    let target: HTMLElement | null = null;
    let label = "";
    let islandHover = false;
    let raf = 0;
    let running = false;
    let last = 0;

    // The ring trails the pointer. The easing is measured in time, so it feels the same on 60, 120 and 144 Hz screens,
    // and the loop stops by itself when the ring has caught up (nothing runs while the pointer is still).
    const loop = (now: number) => {
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60;
      last = now;
      const kp = 1 - Math.pow(1 - 0.2, dt * 60);
      const ks = 1 - Math.pow(1 - 0.22, dt * 60);
      s.x += (s.tx - s.x) * kp;
      s.y += (s.ty - s.y) * kp;
      s.w += (s.tw - s.w) * ks;
      s.h += (s.th - s.h) * ks;
      const settled = Math.abs(s.tx - s.x) < 0.05 && Math.abs(s.ty - s.y) < 0.05 && Math.abs(s.tw - s.w) < 0.05 && Math.abs(s.th - s.h) < 0.05;
      if (settled) {
        s.x = s.tx;
        s.y = s.ty;
        s.w = s.tw;
        s.h = s.th;
      }
      if (ring.current) {
        ring.current.style.width = `${s.w.toFixed(1)}px`;
        ring.current.style.height = `${s.h.toFixed(1)}px`;
        ring.current.style.transform = `translate3d(${(s.x - s.w / 2).toFixed(1)}px, ${(s.y - s.h / 2).toFixed(1)}px, 0)`;
      }
      if (dot.current) dot.current.style.transform = `translate3d(${(s.tx - 3).toFixed(1)}px, ${(s.ty - 3).toFixed(1)}px, 0)`;
      if (settled) {
        running = false;
        last = 0;
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };

    const setLabel = (v: string) => {
      if (v === label) return;
      label = v;
      if (text.current) text.current.textContent = v;
    };

    const retarget = () => {
      let tw = 34;
      let th = 34;
      let l = "";
      if (target) {
        const mag = target.closest<HTMLElement>("[data-magnetic]");
        const r = (mag ?? target).getBoundingClientRect();
        if (mag) {
          tw = r.width + 14;
          th = r.height + 14;
          s.tx = r.left + r.width / 2;
          s.ty = r.top + r.height / 2;
        } else {
          tw = th = 54;
        }
        l = target.closest<HTMLElement>("[data-cursor]")?.dataset.cursor ?? "";
        if (mag) l = "";
      } else if (islandHover) {
        tw = th = 92;
        l = "Open";
      }
      s.tw = tw;
      s.th = th;
      setLabel(l);
      ring.current?.setAttribute("data-big", tw > 40 ? "1" : "0");
      ring.current?.setAttribute("data-island", islandHover && !target ? "1" : "0");
      kick();
    };

    const onMove = (e: PointerEvent) => {
      s.tx = e.clientX;
      s.ty = e.clientY;
      if (!s.shown) {
        s.shown = true;
        s.x = e.clientX;
        s.y = e.clientY;
        ring.current?.style.setProperty("opacity", "1");
        dot.current?.style.setProperty("opacity", "1");
      }
      const el = (e.target as Element | null)?.closest?.("[data-magnetic], a, button, [data-cursor]") as HTMLElement | null;
      target = el;
      retarget();
    };
    const onLeave = () => {
      s.shown = false;
      ring.current?.style.setProperty("opacity", "0");
      dot.current?.style.setProperty("opacity", "0");
    };

    // when the page changes under a pointer that is not moving (the panel swaps its content or slides away),
    // look again at what is under it, so the cursor never keeps a label for a button that is gone
    const timers: number[] = [];
    const repick = () => {
      if (!s.shown) return;
      const el = document.elementFromPoint(s.tx, s.ty)?.closest?.("[data-magnetic], a, button, [data-cursor]") as HTMLElement | null;
      if (el !== target) {
        target = el;
        retarget();
      }
    };

    const unsub = useStore.subscribe((st, prev) => {
      const h = !!st.hover && st.mode !== "focus";
      if (h !== islandHover) {
        islandHover = h;
        retarget();
      }
      if (st.focus !== prev.focus || st.mode !== prev.mode) {
        timers.push(window.setTimeout(repick, 150), window.setTimeout(repick, 900));
      }
    });

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach((t) => window.clearTimeout(t));
      unsub();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      html.classList.remove("has-cursor");
    };
  }, []);

  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden="true" data-big="0" data-island="0" style={{ opacity: 0 }}>
        <span ref={text} />
      </div>
      <div ref={dot} className="cursor-dot" aria-hidden="true" style={{ opacity: 0 }} />
    </>
  );
}
