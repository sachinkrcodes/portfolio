import { createElement, type ReactNode } from "react";
import { cloudWork, deployments, inProgress, joinList, learning, projectLinks, sigmax } from "@/data/content";
import { ArrowUpRight, Blocks, Bullets, Section, StatusChip } from "./CaseStudy";

/**
 * What the "Cloud Lab" island opens (the 3D panel) and what the 2D page shows in its Cloud Lab section.
 * Everything comes from src/data/content.ts:
 *  - "In progress": every project or minor project with `status: "building"` (when it started, what works today, what is left).
 *    It is left out when nothing is in progress. Finish a project (status "done") and it leaves this list by itself.
 *  - "Where my apps run": every project with a `runsOn` line, with its live link
 *  - "Cloud and DevOps work": `cloudWork`
 *  - "Learning now": `learning`
 *  - "SigmaX": what it covers and when the program projects are due
 * The panel draws the heading above it. In the 3D panel `onOpen` flies to the case study; on the 2D page the buttons are links to the card.
 */

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const chipLink = "chip gap-2 px-4 py-2.5 transition-colors hover:bg-white/15";

export function BuildingBody({ rise = false, start = 0, onOpen, flush = false }: { rise?: boolean; start?: number; onOpen?: (id: string) => void; flush?: boolean }) {
  const blocks: ReactNode[] = [];
  // the first block has no hairline above it (the heading is already above); `flush` also drops the space (inside a card that has its own padding)
  const block = (key: string, title: string, children: ReactNode) => {
    const first = blocks.length === 0;
    blocks.push(
      <Section key={key} title={title} level={3} first={first} flush={first && flush}>
        {children}
      </Section>,
    );
  };

  if (inProgress.length > 0) {
    block(
      "ip",
      "In progress",
      <ul className="space-y-4">
        {inProgress.map((p) => (
          <li key={p.id} className="tile">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <StatusChip status="building" />
              {p.when && <span className="meta">{p.when}</span>}
            </div>
            {createElement("h4", { className: "display mt-3 text-[1.25rem] leading-tight" }, p.name)}
            <dl className="mt-3 space-y-3 text-[0.95rem] leading-relaxed text-fog/85">
              {p.progress && (
                <div>
                  <dt className="meta">Works today</dt>
                  <dd className="mt-1">{p.progress}</dd>
                </div>
              )}
              {p.next && (
                <div>
                  <dt className="meta">Still to do</dt>
                  <dd className="mt-1">{p.next}</dd>
                </div>
              )}
            </dl>
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tech">
              {p.stack.map((t) => (
                <li key={t} className="chip">
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-3">
              {onOpen ? (
                p.kind === "project" && (
                  <button type="button" onClick={() => onOpen(p.id)} className={`${chipLink} chip-accent`} data-cursor="Open">
                    Open case study
                    <Arrow />
                  </button>
                )
              ) : (
                <a href={`#${p.id}`} className={`${chipLink} chip-accent`}>
                  See the project
                  <Arrow />
                </a>
              )}
              {projectLinks(p)
                .filter((l) => l.label !== "README and run steps")
                .map((l) => (
                  <a key={l.label} href={l.href} target="_blank" rel="noreferrer" data-cursor="Open" className={chipLink}>
                    {l.label}
                    <ArrowUpRight />
                  </a>
                ))}
            </div>
          </li>
        ))}
      </ul>,
    );
  }

  if (deployments.length > 0) {
    block(
      "run",
      "Where my apps run",
      <ul className="space-y-3">
        {deployments.map((d) => (
          <li key={d.id} className="tile flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <div className="min-w-0">
              <p className="display text-[1.15rem] leading-tight">{d.name}</p>
              <p className="meta mt-1 leading-snug">{d.runsOn}</p>
            </div>
            {d.liveUrl && (
              <a href={d.liveUrl} target="_blank" rel="noreferrer" data-cursor="Open" className={`${chipLink} chip-accent shrink-0`}>
                Live demo
                <ArrowUpRight />
              </a>
            )}
          </li>
        ))}
      </ul>,
    );
  }

  if (cloudWork.length > 0) block("work", "Cloud and DevOps work", <Bullets items={cloudWork} />);

  block(
    "ln",
    "Learning now",
    <ul className="flex flex-wrap gap-2">
      {learning.map((t) => (
        <li key={t} className="chip chip-accent">
          {t}
        </li>
      ))}
    </ul>,
  );

  block(
    "sx",
    "SigmaX",
    <div className="tile">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="chip chip-accent">{sigmax.status}</span>
        <span className="meta">{sigmax.when}</span>
      </div>
      <p className="display mt-3 text-[1.2rem] leading-tight">{sigmax.title}</p>
      <p className="meta mt-1">{sigmax.issuer}</p>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-fog/85">Covers {sigmax.covers}.</p>
      {sigmax.programProjects.length > 0 && (
        <p className="mt-3 text-[0.95rem] leading-relaxed text-fog/85">
          Program projects due {sigmax.projectsDue}: {joinList(sigmax.programProjects)}.
        </p>
      )}
    </div>,
  );

  return (
    <Blocks rise={rise} start={start}>
      {blocks}
    </Blocks>
  );
}
