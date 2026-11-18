import { createElement } from "react";
import { miniProjects, projectLinks, type MiniProject } from "@/data/content";
import { ArrowUpRight, Bullets, StatusChip } from "./CaseStudy";

/**
 * Cards for the smaller projects (`miniProjects` in src/data/content.ts). Shared by the 3D panel and the 2D page.
 * Works for any number of projects: add one to the list and it appears here, in the 2D page and in the screen reader copy.
 *  - variant "tile": flat, for inside the glass panel (glass cannot blur glass)
 *  - variant "glass": its own glass card, for the 2D page
 * Each card has its own id, so /#tic-tac-toe lands on it in the 2D page.
 */

function MiniCard({ m, level, variant }: { m: MiniProject; level: 3 | 4 | 5; variant: "tile" | "glass" }) {
  const links = projectLinks(m);
  return (
    <li id={m.id} className={`${variant === "glass" ? "glass glass-panel p-5 sm:p-7" : "tile"} scroll-mt-24 flex flex-col`}>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <StatusChip status={m.status} />
        {m.when && <span className="meta">{m.when}</span>}
      </p>
      <p className="meta mt-3">{m.kind}</p>
      {createElement(`h${level}`, { className: "display mt-1.5 text-[1.35rem] leading-tight" }, m.name)}
      <p className="mt-3 text-[0.95rem] leading-relaxed text-fog/85">{m.summary}</p>
      <div className="mt-4">
        <Bullets items={m.points} />
      </div>
      {(m.progress || m.next) && (
        <dl className="mt-4 space-y-3 text-[0.95rem] leading-relaxed text-fog/85">
          {m.progress && (
            <div>
              <dt className="meta">Works today</dt>
              <dd className="mt-1">{m.progress}</dd>
            </div>
          )}
          {m.next && (
            <div>
              <dt className="meta">Still to do</dt>
              <dd className="mt-1">{m.next}</dd>
            </div>
          )}
        </dl>
      )}
      <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tech">
        {m.stack.map((t) => (
          <li key={t} className="chip">
            {t}
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap gap-3">
        {links.map((l, i) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noreferrer"
            data-cursor="Open"
            className={`chip gap-2 px-4 py-2.5 transition-colors hover:bg-white/15 ${i === 0 ? "chip-accent" : ""}`}
          >
            {l.label}
            <ArrowUpRight />
          </a>
        ))}
      </div>
    </li>
  );
}

export function MiniProjectList({ level = 4, variant = "tile", className = "space-y-4" }: { level?: 3 | 4 | 5; variant?: "tile" | "glass"; className?: string }) {
  if (miniProjects.length === 0) return null;
  return (
    <ul className={className}>
      {miniProjects.map((m) => (
        <MiniCard key={m.id} m={m} level={level} variant={variant} />
      ))}
    </ul>
  );
}
