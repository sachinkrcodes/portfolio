import { createElement, type ReactNode } from "react";
import { projectLinks, research, type Project } from "@/data/content";
import Shots from "./Shots";

/**
 * The case study layout, shared by the glass panel in the 3D city and the 2D page, so both always say the same thing.
 * Sections: Screenshots, Problem, What I built, Tech, Highlights, Where it stands (projects in progress), Links.
 * Everything comes from src/data/content.ts.
 * It only uses flat pieces (.chip, .tile, .hair), because it sits inside a glass surface.
 */

/** "In progress" or "Completed", for a project or a minor project. Shows nothing when the project has no status. */
export function StatusChip({ status }: { status?: "done" | "building" }) {
  if (status === "building") return <span className="chip chip-accent">In progress</span>;
  if (status === "done") return <span className="chip">Completed</span>;
  return null;
}

export function ArrowUpRight() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M4 10 10 4M5 4h5v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3 text-[0.95rem] leading-relaxed text-fog/80">
      {items.map((t) => (
        <li key={t} className="flex gap-3">
          <span className="mt-[0.62em] h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden="true" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

export function Stats({ stats, className }: { stats: { value: string; label: string }[]; className: string }) {
  return (
    <div className={`grid gap-3 ${className}`}>
      {stats.map((s) => (
        <div key={s.label} className="tile">
          <p className="display text-[clamp(1.6rem,2.3vw,2.2rem)] leading-none">{s.value}</p>
          <p className="meta mt-2 leading-snug">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * A titled block with a hairline above it. `first` drops the hairline (for the first block under a page heading).
 * `flush` also drops the space above it (for the first block inside a card that has its own padding).
 */
export function Section({ title, level, first = false, flush = false, children }: { title: string; level: 3 | 4; first?: boolean; flush?: boolean; children: ReactNode }) {
  return (
    <section className={flush ? "" : first ? "mt-8" : "mt-9"}>
      {!first && <div className="hair mb-5" aria-hidden="true" />}
      {createElement(`h${level}`, { className: "sec-title mb-4" }, title)}
      {children}
    </section>
  );
}

/** Wraps each block so the panel can reveal them one after another (`start` continues the count after a heading). */
export function Blocks({ rise, start = 0, children }: { rise: boolean; start?: number; children: ReactNode[] }) {
  return (
    <>
      {children.map((c, i) => (
        <div key={i} className={rise ? "rise" : undefined} style={rise ? ({ ["--i" as string]: i + start } as React.CSSProperties) : undefined}>
          {c}
        </div>
      ))}
    </>
  );
}

interface BodyProps {
  /** heading level of the case study title (sections go one level deeper) */
  level?: 2 | 3;
  /** reveal the blocks one after another (used by the panel) */
  rise?: boolean;
  /** grid for the stat tiles */
  statsClass?: string;
}

export function ProjectBody({ p, level = 2, rise = false, statsClass = "grid-cols-2" }: BodyProps & { p: Project }) {
  const sub = (level + 1) as 3 | 4;
  const where = p.progress || p.next;
  return (
    <Blocks rise={rise}>
      {[
        <p key="k" className="flex flex-wrap items-center gap-2">
          <span className="chip chip-accent">{p.kind}</span>
        </p>,
        <p key="w" className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <StatusChip status={p.status} />
          {p.when && <span className="meta">{p.when}</span>}
        </p>,
        createElement(`h${level}`, { key: "t", className: "display mt-5 text-[clamp(2rem,3.3vw,3.1rem)] leading-[0.98]" }, p.name),
        <p key="s" className="mt-4 text-[1.05rem] leading-relaxed text-fog/85">
          {p.summary}
        </p>,
        <div key="st" className="mt-7">
          <Stats stats={p.stats} className={statsClass} />
        </div>,
        p.shots?.length ? (
          <Section key="sh" title="Screenshots" level={sub}>
            <Shots shots={p.shots} name={p.name} />
          </Section>
        ) : null,
        <Section key="p" title="Problem" level={sub}>
          <p className="text-[0.98rem] leading-relaxed text-fog/80">{p.problem}</p>
        </Section>,
        <Section key="b" title="What I built" level={sub}>
          <Bullets items={p.built} />
        </Section>,
        <Section key="te" title="Tech" level={sub}>
          <dl className="space-y-4">
            {p.tech.map((g) => (
              <div key={g.group}>
                <dt className="meta">{g.group}</dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {g.items.map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </Section>,
        <Section key="h" title="Highlights" level={sub}>
          <Bullets items={p.highlights} />
        </Section>,
        where ? (
          <Section key="wh" title="Where it stands" level={sub}>
            <dl className="space-y-4 text-[0.98rem] leading-relaxed text-fog/85">
              {p.progress && (
                <div>
                  <dt className="meta">Works today</dt>
                  <dd className="mt-1.5">{p.progress}</dd>
                </div>
              )}
              {p.next && (
                <div>
                  <dt className="meta">Still to do</dt>
                  <dd className="mt-1.5">{p.next}</dd>
                </div>
              )}
            </dl>
          </Section>
        ) : null,
        <Section key="l" title="Links" level={sub}>
          {p.liveNote && !p.liveUrl && <p className="mb-4 text-[0.95rem] leading-relaxed text-fog/80">{p.liveNote}</p>}
          <div className="flex flex-wrap gap-3">
            {projectLinks(p).map((l, i) => (
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
        </Section>,
      ].filter(Boolean) as ReactNode[]}
    </Blocks>
  );
}

export function ResearchBody({ level = 2, rise = false, statsClass = "grid-cols-2" }: BodyProps) {
  const sub = (level + 1) as 3 | 4;
  return (
    <Blocks rise={rise}>
      {[
        <p key="k" className="flex flex-wrap gap-2">
          <span className="chip chip-accent">{research.kind}</span>
          <span className="chip chip-accent">{research.status}</span>
        </p>,
        createElement(`h${level}`, { key: "t", className: "display mt-5 text-[clamp(1.6rem,2.5vw,2.3rem)] leading-[1.02]" }, research.title),
        <p key="s" className="mt-4 text-[1.05rem] leading-relaxed text-fog/85">
          {research.role}.
        </p>,
        <div key="st" className="mt-7">
          <Stats stats={research.stats} className={statsClass} />
        </div>,
        <Section key="p" title="Problem" level={sub}>
          <p className="text-[0.98rem] leading-relaxed text-fog/80">{research.problem}</p>
        </Section>,
        <Section key="a" title="What we are doing" level={sub}>
          <Bullets items={research.approach} />
        </Section>,
        <Section key="sc" title="Cost areas in scope" level={sub}>
          <div className="flex flex-wrap gap-2">
            {research.scope.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>
        </Section>,
        <Section key="o" title="Where it stands" level={sub}>
          <p className="text-[0.98rem] leading-relaxed text-fog/80">{research.outcome}</p>
        </Section>,
      ]}
    </Blocks>
  );
}
