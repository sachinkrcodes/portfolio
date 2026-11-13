"use client";

import Lenis from "lenis";
import { useEffect, useRef, type RefObject } from "react";
import { useStore } from "@/store/useStore";

/**
 * Smooth scrolling with Lenis. It is switched off for visitors who ask their system for less motion,
 * and it never touches touch scrolling (phones keep their native, already smooth, scrolling).
 */

/** The 2D page: smooth wheel scrolling for the window, and in-page links (#about ...) glide to their section. */
export function usePageScroll(offset = -88): RefObject<Lenis | null> {
  const ref = useRef<Lenis | null>(null);
  useEffect(() => {
    if (useStore.getState().reducedMotion) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.1, smoothWheel: true });
    ref.current = lenis;

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href^='#']") as HTMLAnchorElement | null;
      const hash = a?.getAttribute("href") ?? "";
      if (!a || hash.length < 2) return;
      const id = decodeURIComponent(hash.slice(1));
      const el = id === "top" ? null : document.getElementById(id);
      if (id !== "top" && !el) return;
      e.preventDefault();
      lenis.scrollTo(el ?? 0, { offset: el ? offset : 0, duration: 1.2, force: true });
      history.replaceState(null, "", hash);
    };
    document.addEventListener("click", onClick);

    // While Lenis glides it ignores the browser's own scroll events and keeps pulling the page to its old target, so a jump the browser makes
    // in the meantime would be dragged back. Stopping and starting Lenis resets it to where the page is now, which hands the page to the browser.
    // 1) A key that scrolls by itself (Home, End, Page Down, Space, arrows): cancel the glide before the browser moves the page.
    const release = () => {
      lenis.stop();
      lenis.start();
    };
    const SCROLL_KEYS = ["Home", "End", "PageUp", "PageDown", "ArrowUp", "ArrowDown", " "];
    const onKey = (e: KeyboardEvent) => {
      if (lenis.isStopped || lenis.isScrolling !== "smooth" || e.defaultPrevented || !SCROLL_KEYS.includes(e.key)) return;
      if ((e.target as Element | null)?.closest?.("input, textarea, select, [contenteditable]")) return;
      release();
    };
    window.addEventListener("keydown", onKey);
    // 2) Anything else (find in page, dragging the scrollbar): the page is somewhere other than where Lenis put it.
    const onMoved = () => {
      if (lenis.isStopped || lenis.isScrolling !== "smooth") return;
      if (Math.abs(window.scrollY - lenis.animatedScroll) >= 4) release();
    };
    window.addEventListener("scroll", onMoved, { passive: true });

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onMoved);
      lenis.destroy();
      ref.current = null;
    };
  }, [offset]);
  return ref;
}

/** A scrolling panel (the glass panel in the 3D city): smooth wheel scrolling inside it while it is open. */
export function usePanelScroll(wrapper: RefObject<HTMLElement | null>, content: RefObject<HTMLElement | null>, active: boolean): RefObject<Lenis | null> {
  const ref = useRef<Lenis | null>(null);
  useEffect(() => {
    const w = wrapper.current;
    const c = content.current;
    if (!active || !w || !c || useStore.getState().reducedMotion) return;
    const lenis = new Lenis({ wrapper: w, content: c, eventsTarget: w, autoRaf: true, lerp: 0.12, smoothWheel: true });
    ref.current = lenis;
    return () => {
      lenis.destroy();
      ref.current = null;
    };
  }, [active, wrapper, content]);
  return ref;
}
