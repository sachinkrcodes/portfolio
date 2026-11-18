"use client";

import { useEffect } from "react";
import { islandOrder, miniProjects, projects, type IslandId } from "@/data/content";
import { useStore, type Target } from "@/store/useStore";

/** "#blood-bank-finder" or "#research" -> the place in the city it points to (or null). */
function targetFromHash(hash: string): Target | null {
  let id = hash.replace(/^#\/?/, "");
  try {
    id = decodeURIComponent(id);
  } catch {
    /* keep the raw text */
  }
  if (!id) return null;
  if (id === "about" || id === "skills" || id === "contact") return { island: id };
  // any case study in content.ts works, with or without a building on the island (no building: the camera shows the island)
  if (projects.some((p) => p.id === id)) return { island: "projects", sub: id };
  // a mini project has no close-up: open the Projects panel, where its card is listed
  if (miniProjects.some((m) => m.id === id)) return { island: "projects" };
  if ((islandOrder as readonly string[]).includes(id)) return { island: id as IslandId };
  return null;
}

/**
 * Keeps the address bar and the city in step, so every case study has a link you can share:
 *   open a project  -> the URL becomes /#blood-bank-finder
 *   open that link  -> the camera flies straight to that project once the intro is over
 * It uses replaceState, so it never adds extra entries to the back button history.
 * The same ids are anchors on the 2D page, so the links work there too.
 */
export default function DeepLink() {
  const uiReady = useStore((s) => s.uiReady);

  // address bar -> city (on arrival, and when the hash is changed by hand)
  useEffect(() => {
    if (!uiReady) return;
    const apply = () => {
      const t = targetFromHash(window.location.hash);
      const st = useStore.getState();
      if (t) st.focusOn(t);
      else if (st.mode === "focus") st.clearFocus();
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, [uiReady]);

  // city -> address bar
  useEffect(() => {
    if (!uiReady) return;
    return useStore.subscribe((s, prev) => {
      if (s.focus === prev.focus && s.mode === prev.mode) return;
      const want = s.mode === "focus" && s.focus ? `#${s.focus.sub ?? s.focus.island}` : "";
      if (window.location.hash === want || (want === "" && window.location.hash === "")) return;
      try {
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${want}`);
      } catch {
        /* some sandboxes block history changes: the city still works */
      }
    });
  }, [uiReady]);

  return null;
}
