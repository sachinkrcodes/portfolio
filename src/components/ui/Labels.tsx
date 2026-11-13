"use client";

import { islandOrder, islands, projects, type IslandId } from "@/data/content";
import { SUBS } from "@/components/scene/constants";
import { labelEls } from "@/components/scene/registry";
import { useStore } from "@/store/useStore";

const register = (key: string) => (el: HTMLElement | null) => {
  if (el) labelEls.set(key, el);
  else labelEls.delete(key);
};

/**
 * Floating labels above each island (and each project when the camera is close).
 * Their position is written every frame by LabelProjector. They are real buttons, so they work with
 * the keyboard and screen readers too.
 */
export default function Labels() {
  const mode = useStore((s) => s.mode);
  const hover = useStore((s) => s.hover);
  const focusOn = useStore((s) => s.focusOn);
  const setHover = useStore((s) => s.setHover);
  const shown = mode === "hero" || mode === "explore";

  return (
    <div className="city-labels pointer-events-none fixed inset-0 z-10 overflow-hidden" data-shown={shown ? "1" : "0"} data-mode={mode}>
      {islandOrder.map((id: IslandId) => {
        const m = islands[id];
        const active = hover?.island === id;
        return (
          <div key={id} ref={register(id)} className="city-label">
            <div className="city-label-inner">
              <button
                type="button"
                tabIndex={shown ? 0 : -1}
                data-active={active ? "1" : "0"}
                aria-label={`Open ${m.title}`}
                className="city-chip glass btn"
                onClick={() => focusOn({ island: id })}
                onPointerEnter={() => setHover({ island: id })}
                onPointerLeave={() => setHover(null)}
              >
                <span className="city-chip-index">{m.index}</span>
                <span>{m.title}</span>
              </button>
              <span className="city-stem" />
            </div>
          </div>
        );
      })}

      {Object.entries(SUBS).map(([sub, s]) => {
        const p = projects.find((x) => x.id === sub);
        return (
          <div key={sub} ref={register(`sub:${sub}`)} className="city-label city-label-sub">
            <div className="city-label-inner">
              <button
                type="button"
                tabIndex={shown ? 0 : -1}
                data-active={hover?.sub === sub ? "1" : "0"}
                aria-label={`Open ${p?.name ?? s.label}`}
                className="city-chip city-chip-sub glass btn"
                onClick={() => focusOn({ island: s.island, sub })}
                onPointerEnter={() => setHover({ island: s.island, sub })}
                onPointerLeave={() => setHover(null)}
              >
                {p?.name ?? s.label}
              </button>
              <span className="city-stem city-stem-sub" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
