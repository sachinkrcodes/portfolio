"use client";

import { Fragment, useEffect, useRef } from "react";
import { about, islands, miniProjects, projects, skillsHead, type IslandId } from "@/data/content";
import { usePanelScroll } from "@/lib/useSmoothScroll";
import { useStore } from "@/store/useStore";
import { BuildingBody } from "./Building";
import { ProjectBody, ResearchBody, Section, StatusChip } from "./CaseStudy";
import { ContactBody } from "./Contact";
import { MiniProjectList } from "./MiniProjects";
import { AboutBody, ExperienceBody } from "./Profile";
import { SkillsBody } from "./Skills";

const subs = projects.map((p) => p.id);

/* ------------------------------------------------------------------ small icons */
function Arrow({ dir, className = "" }: { dir: "left" | "right"; className?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path d={dir === "left" ? "M13 8H3M7 4 3 8l4 4" : "M3 8h10M9 4l4 4-4 4"} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Rise({ i, children, className = "" }: { i: number; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rise ${className}`} style={{ ["--i" as string]: i }}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ island level views */

function IslandDetail({ id }: { id: IslandId }) {
  const focusOn = useStore((s) => s.focusOn);
  const m = islands[id];
  return (
    <>
      <Rise i={0}>
        <p className="sec-title">{m.index} of 04</p>
        <h2 className="display mt-4 text-[clamp(2.1rem,3.5vw,3.3rem)] leading-[0.97]">{m.title}</h2>
      </Rise>
      <Rise i={1}>
        <p className="mt-4 text-[1.05rem] leading-relaxed text-fog/85">{m.blurb}</p>
      </Rise>

      {id === "projects" && (
        <Rise i={2}>
          <h3 className="sec-title mb-4 mt-8">Major projects</h3>
          <ul className="space-y-3">
            {projects.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => focusOn({ island: "projects", sub: p.id })}
                  className="tile group flex w-full items-center justify-between gap-4 text-left transition-colors hover:bg-white/10"
                  data-cursor="Open"
                >
                  <span>
                    <span className="meta block">{p.kind}</span>
                    <span className="display mt-1 block text-[1.35rem] leading-tight">{p.name}</span>
                    {p.status && (
                      <span className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
                        <StatusChip status={p.status} />
                        {p.when && <span className="meta">{p.when}</span>}
                      </span>
                    )}
                  </span>
                  <Arrow dir="right" className="shrink-0 text-accent transition-transform group-hover:translate-x-1" />
                </button>
              </li>
            ))}
          </ul>
        </Rise>
      )}

      {id === "projects" && miniProjects.length > 0 && (
        <Rise i={3}>
          <Section title="Minor projects" level={3}>
            <MiniProjectList level={4} />
          </Section>
        </Rise>
      )}

      {id === "experience" && <ExperienceBody rise start={2} />}

      {id === "building" && <BuildingBody rise start={2} onOpen={(sub) => focusOn({ island: "projects", sub })} />}
    </>
  );
}

/** About has no island: the camera pulls back to the whole city and this opens beside it. */
function AboutDetail() {
  return (
    <>
      <Rise i={0}>
        <p className="sec-title">{about.kicker}</p>
        <h2 className="display mt-4 text-balance text-[clamp(2.1rem,3.5vw,3.3rem)] leading-[0.97]">{about.title}</h2>
      </Rise>
      <div className="mt-6">
        <AboutBody rise start={1} />
      </div>
    </>
  );
}

/** Skills has no island either: the same wide shot, with the two skill columns beside it. */
function SkillsDetail() {
  return (
    <>
      <Rise i={0}>
        <p className="sec-title">{skillsHead.kicker}</p>
        <h2 className="display mt-4 text-balance text-[clamp(2.1rem,3.5vw,3.3rem)] leading-[0.97]">{skillsHead.title}</h2>
      </Rise>
      <div className="mt-6">
        <SkillsBody rise start={1} />
      </div>
    </>
  );
}

/** Contact has no island either: the whole city stays in view and the form opens beside it. */
function ContactDetail() {
  return (
    <>
      <Rise i={0}>
        <p className="sec-title">Contact</p>
        <h2 className="display mt-4 text-balance text-[clamp(2.1rem,3.5vw,3.3rem)] leading-[0.97]">Let&apos;s talk.</h2>
      </Rise>
      <div className="mt-6">
        <ContactBody rise start={1} />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ the panel */

/**
 * The liquid glass panel that opens when the camera has flown in on an island or a project.
 * On a project it is the full case study (Problem, What I built, Tech, Highlights, Links) with
 * previous and next buttons (or the arrow keys) that fly the camera from project to project.
 */
export default function FocusPanel() {
  const mode = useStore((s) => s.mode);
  const focus = useStore((s) => s.focus);
  const clearFocus = useStore((s) => s.clearFocus);
  const focusOn = useStore((s) => s.focusOn);
  const open = mode === "focus" && !!focus;
  const key = focus ? `${focus.island}:${focus.sub ?? ""}` : "none";
  const idx = focus?.sub ? subs.indexOf(focus.sub) : -1;
  const next = idx >= 0 ? projects[(idx + 1) % projects.length] : null;

  const scroller = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLButtonElement>(null);
  // smooth wheel scrolling inside the panel while it is open (off for reduced motion)
  const smooth = usePanelScroll(scroller, inner, open);

  const go = (d: number) => {
    if (idx < 0) return;
    focusOn({ island: "projects", sub: subs[(idx + d + subs.length) % subs.length] });
  };

  // new content starts at the top
  useEffect(() => {
    if (smooth.current) smooth.current.scrollTo(0, { immediate: true, force: true });
    else scroller.current?.scrollTo({ top: 0 });
  }, [key, smooth]);

  // keyboard users land on the panel when it opens
  useEffect(() => {
    if (open) back.current?.focus({ preventScroll: true });
  }, [open]);

  // arrow keys move between projects
  useEffect(() => {
    if (!open || idx < 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, idx]);

  return (
    <aside
      inert={!open}
      aria-hidden={!open}
      aria-label="Details"
      className="glass glass-panel fixed bottom-[calc(var(--dock)+2px)] right-3 top-[72px] z-30 flex w-[min(520px,calc(100vw-24px))] flex-col overflow-hidden sm:right-5 sm:top-[84px]"
      style={{
        transition: "transform .8s var(--ease), opacity .55s",
        transform: open ? "none" : "translateX(48px) scale(0.97)",
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
      }}
    >
      <div className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-6 sm:pt-5">
        <button ref={back} type="button" onClick={clearFocus} className="chip group gap-2 px-3.5 py-2 transition-colors hover:bg-white/15 hover:text-white" data-cursor="Back">
          <Arrow dir="left" className="transition-transform group-hover:-translate-x-0.5" />
          Back to the city
          <span className="kbd">Esc</span>
        </button>

        {idx >= 0 && (
          <div className="flex items-center gap-1" role="group" aria-label="Switch project">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous project"
              className="chip grid h-9 w-9 place-items-center !p-0 transition-colors hover:bg-white/15 hover:text-white"
              data-cursor="Prev"
            >
              <Arrow dir="left" />
            </button>
            <span className="meta min-w-12 text-center tabular-nums" aria-live="polite">
              {idx + 1} of {subs.length}
            </span>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next project"
              className="chip grid h-9 w-9 place-items-center !p-0 transition-colors hover:bg-white/15 hover:text-white"
              data-cursor="Next"
            >
              <Arrow dir="right" />
            </button>
          </div>
        )}
      </div>

      <div
        ref={scroller}
        className="scroll-glass min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-8 pt-6 sm:px-7"
        style={{ maskImage: "linear-gradient(to bottom, transparent 0, #000 18px, #000 calc(100% - 26px), transparent 100%)" }}
      >
        <div ref={inner}>
          {open && focus && (
            <Fragment key={key}>
              {focus.sub && projects[idx] ? (
                <>
                  <ProjectBody p={projects[idx]} rise />
                  {next && (
                    <div className="rise mt-10" style={{ ["--i" as string]: 9 }}>
                      <button
                        type="button"
                        onClick={() => go(1)}
                        className="tile group flex w-full items-center justify-between gap-4 text-left transition-colors hover:bg-white/10"
                        data-cursor="Next"
                      >
                        <span>
                          <span className="meta block">Next project</span>
                          <span className="display mt-1 block text-[1.3rem] leading-tight">{next.name}</span>
                        </span>
                        <Arrow dir="right" className="shrink-0 text-accent transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  )}
                </>
              ) : focus.island === "about" ? (
                <AboutDetail />
              ) : focus.island === "skills" ? (
                <SkillsDetail />
              ) : focus.island === "contact" ? (
                <ContactDetail />
              ) : focus.island === "research" ? (
                <ResearchBody rise />
              ) : (
                <IslandDetail id={focus.island} />
              )}
            </Fragment>
          )}
        </div>
      </div>
    </aside>
  );
}
