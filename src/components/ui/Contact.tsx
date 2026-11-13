import { profile } from "@/data/content";
import { ArrowUpRight, Blocks } from "./CaseStudy";
import ContactForm from "./ContactForm";

/**
 * The contact block: a short line, the form, and the other ways to reach me.
 * Shared by the 3D panel and the 2D page (each draws its own heading above it). Flat pieces only, like the other bodies.
 */

const linkChip = "chip gap-2 px-4 py-2.5 transition-colors hover:bg-white/15";

export function ContactBody({ rise = false, start = 0 }: { rise?: boolean; start?: number }) {
  return (
    <Blocks rise={rise} start={start}>
      {[
        <div key="intro" className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <span className="chip chip-accent">{profile.openTo}</span>
          <p className="text-[1.02rem] leading-relaxed text-fog/85">A role, a project or a question: write here and it goes straight to my inbox.</p>
        </div>,
        <div key="form" className="mt-7">
          <ContactForm />
        </div>,
        <div key="other" className="mt-9">
          <p className="meta">Prefer another route?</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <a href={`mailto:${profile.email}`} className={linkChip} data-cursor="Email">
              {profile.email}
            </a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer" className={linkChip} data-cursor="Open">
              LinkedIn
              <ArrowUpRight />
            </a>
            <a href={profile.github} target="_blank" rel="noreferrer" className={linkChip} data-cursor="Open">
              GitHub
              <ArrowUpRight />
            </a>
            <a href={profile.resumeUrl} download className={linkChip} data-cursor="Resume">
              Resume (PDF)
            </a>
          </div>
        </div>,
      ]}
    </Blocks>
  );
}
