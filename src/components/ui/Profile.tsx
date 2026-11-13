import { createElement } from "react";
import { about, certifications, education, jobs, learning, profile, sigmax, skills } from "@/data/content";
import { ArrowUpRight, Blocks, Bullets, Section, Stats } from "./CaseStudy";

/**
 * About, work history, education and certifications. Shared by the glass panel in the 3D city and the 2D page,
 * so both always say the same thing. Everything comes from src/data/content.ts.
 * Like CaseStudy.tsx it only uses flat pieces (.chip, .tile, .hair), because it sits inside a glass surface.
 * These bodies have no page title: the panel and the 2D page each draw their own heading above them.
 */

function DownloadIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2v8M4.5 7 8 10.5 11.5 7M3 13h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Dot() {
  return <span className="mt-[0.62em] h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden="true" />;
}

const linkChip = "chip gap-2 px-4 py-2.5 transition-colors hover:bg-white/15";

/* ------------------------------------------------------------------ about */

interface AboutProps {
  rise?: boolean;
  /** how many blocks are already drawn above, so the staggered reveal carries on from there */
  start?: number;
  /** grid for the four fact tiles */
  statsClass?: string;
  /** grid for the skill groups */
  skillsClass?: string;
  /** show the resume, GitHub, LinkedIn and email chips (the 2D page has them in its header and contact section) */
  links?: boolean;
}

/** The story, four facts, the skills by group, what I am learning, spoken languages and links. */
export function AboutBody({ rise = false, start = 0, statsClass = "grid-cols-2", skillsClass = "", links = true }: AboutProps) {
  const blocks = [
    <div key="story" className="space-y-4 text-[1.02rem] leading-relaxed text-fog/85">
      {about.story.map((p) => (
        <p key={p}>{p}</p>
      ))}
    </div>,
    <div key="facts" className="mt-8">
      <Stats stats={about.facts} className={statsClass} />
    </div>,
    <Section key="skills" title="Skills" level={3}>
      <dl className={`grid gap-x-10 gap-y-5 ${skillsClass}`}>
        {skills.map((g) => (
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
    <Section key="learning" title="Currently learning" level={3}>
      <ul className="flex flex-wrap gap-2">
        {learning.map((t) => (
          <li key={t} className="chip chip-accent">
            {t}
          </li>
        ))}
      </ul>
    </Section>,
    <Section key="spoken" title="Spoken languages" level={3}>
      <p className="text-[0.98rem] text-fog/80">{about.spoken}</p>
    </Section>,
  ];

  if (links) {
    blocks.push(
      <Section key="links" title="Get in touch" level={3}>
        <div className="flex flex-wrap gap-3">
          <a href={profile.resumeUrl} download data-cursor="Resume" className={`${linkChip} chip-accent`}>
            Download resume
            <DownloadIcon />
          </a>
          <a href={profile.github} target="_blank" rel="noreferrer" data-cursor="Open" className={linkChip}>
            GitHub
            <ArrowUpRight />
          </a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer" data-cursor="Open" className={linkChip}>
            LinkedIn
            <ArrowUpRight />
          </a>
          <a href={`mailto:${profile.email}`} data-cursor="Email" className={linkChip}>
            {profile.email}
          </a>
        </div>
      </Section>,
    );
  }

  return (
    <Blocks rise={rise} start={start}>
      {blocks}
    </Blocks>
  );
}

/* ------------------------------------------------------------------ experience */

/** The timeline: one entry per role, newest first, on a thin cyan to blue line. `level` is the heading level of the job titles. */
export function WorkHistory({ level = 4 }: { level?: 3 | 4 }) {
  return (
    <ol className="tl" aria-label="Work history, newest first">
      {jobs.map((j) => (
        <li key={j.id} className="tl-item">
          <span className="tl-dot" aria-hidden="true" />
          <p className="meta">
            {j.start} to {j.end}
          </p>
          {createElement(`h${level}`, { className: "display mt-1.5 text-[1.4rem] leading-tight" }, j.title)}
          <p className="mt-1 text-[0.98rem] leading-snug text-fog/80">
            {j.company}, {j.place}
          </p>
          <p className="mt-3 text-[0.98rem] leading-relaxed text-fog/90">{j.summary}</p>
          <div className="mt-4">
            <Bullets items={j.highlights} />
          </div>
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tools and skills used">
            {j.skills.map((s) => (
              <li key={s} className="chip">
                {s}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}

export function EducationList() {
  return (
    <ul className="space-y-3">
      {education.map((e) => (
        <li key={e.school} className="tile">
          <p className="meta">{e.when}</p>
          <p className="display mt-1.5 text-[1.3rem] leading-tight">{e.school}</p>
          <p className="mt-1 text-[0.95rem] leading-snug text-fog/80">{e.degree}</p>
          <p className="meta mt-1.5">{e.place}</p>
          {e.note && <p className="chip mt-3">{e.note}</p>}
        </li>
      ))}
    </ul>
  );
}

/** SigmaX first (marked in progress or completed; its unfinished projects are marked planned and the list hides when empty), then the certificates. */
export function CertificationList() {
  return (
    <div className="space-y-6">
      <div className="tile">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="chip chip-accent">{sigmax.status}</span>
          <span className="meta">{sigmax.when}</span>
        </div>
        <p className="display mt-3 text-[1.2rem] leading-tight">{sigmax.title}</p>
        <p className="meta mt-1">{sigmax.issuer}</p>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-fog/80">Covers {sigmax.covers}.</p>
        {sigmax.plannedProjects.length > 0 && (
          <>
            <p className="meta mt-4">Planned program projects, due {sigmax.projectsDue}</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {sigmax.plannedProjects.map((p) => (
                <li key={p} className="chip">
                  {p}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <ul className="space-y-4 text-[0.95rem] leading-snug text-fog/85">
        {certifications.map((c) => (
          <li key={c.name} className="flex gap-3">
            <Dot />
            <span>
              {c.name}
              <span className="meta mt-1 block">
                {c.issuer}, {c.when}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** What the Experience island opens: work history, education, certifications (the panel draws the heading above). */
export function ExperienceBody({ rise = false, start = 0 }: { rise?: boolean; start?: number }) {
  return (
    <Blocks rise={rise} start={start}>
      {[
        <Section key="w" title="Work history" level={3} first>
          <WorkHistory />
        </Section>,
        <Section key="e" title="Education" level={3}>
          <EducationList />
        </Section>,
        <Section key="c" title="Training and certifications" level={3}>
          <CertificationList />
        </Section>,
      ]}
    </Blocks>
  );
}
