"use client";

import { memo, useEffect, useState, type RefObject } from "react";
import type Lenis from "lenis";
import { about, islands, miniProjects, profile, projects, skillsHead } from "@/data/content";
import { goTo3D } from "@/lib/lite-mode";
import { usePageScroll } from "@/lib/useSmoothScroll";
import { useStore } from "@/store/useStore";
import { BuildingBody } from "../ui/Building";
import { ProjectBody, ResearchBody } from "../ui/CaseStudy";
import { ContactBody } from "../ui/Contact";
import { MiniProjectList } from "../ui/MiniProjects";
import { AboutBody, CertificationList, EducationList, WorkHistory } from "../ui/Profile";
import { SkillsBody } from "../ui/Skills";
import SlideMenu, { type MenuItem } from "../ui/SlideMenu";
import SoundToggle, { useSoundOn } from "../ui/SoundToggle";
import { sound } from "@/lib/sound";
import { useLiveTime } from "../ui/useLiveTime";

/**
 * Which menu item each section of the page belongs to (Research counts as Projects, Education as Experience).
 * Keep it in the order the sections are on the page: the last one whose top has passed the reading line wins.
 */
const SECTION_TO_MENU: Record<string, string> = {
  about: "about",
  projects: "projects",
  research: "projects",
  skills: "skills",
  experience: "experience",
  education: "experience",
  building: "building",
  contact: "contact",
};

const section = "mx-auto w-full max-w-5xl scroll-mt-24 px-4 py-14 sm:px-8 sm:py-24";
const card = "glass glass-panel p-5 sm:p-10";

function Head({ index, title, blurb }: { index?: string; title: string; blurb?: string }) {
  return (
    <div className="mb-8 sm:mb-12">
      {index && <p className="sec-title">{index}</p>}
      <h2 className="display mt-3 text-[clamp(2rem,5vw,3.7rem)] leading-[0.98]">{title}</h2>
      {blurb && <p className="mt-4 max-w-2xl text-[1.05rem] leading-relaxed text-fog/80">{blurb}</p>}
    </div>
  );
}

function ArrowDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 3v10M4 9l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2v8M4.5 7 8 10.5 11.5 7M3 13h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The city and the local time. The time is the only thing on the page that changes by itself,
 * so it lives in its own small component: when it ticks, nothing else on the page is touched.
 */
function Place() {
  const time = useLiveTime(profile.location.timeZone);
  return (
    <p className="label mt-12 text-mute">
      {profile.location.city}, {profile.location.country}
      {time && <span className="ml-3 tabular-nums">{time}</span>}
    </p>
  );
}

/**
 * The sticky top bar. It owns the one piece of state that changes while you scroll (which menu item is current),
 * so scrolling re-draws only this small bar and never the long page under it.
 */
function LiteHeader({ smooth }: { smooth: RefObject<Lenis | null> }) {
  const can3D = useStore((s) => s.webgl2);
  const soundOn = useSoundOn();
  const [current, setCurrent] = useState("home");
  const link = "label rounded-full px-2.5 py-2 text-fog/80 transition-colors hover:bg-white/10 hover:text-white lg:px-3.5";

  // which section is on screen, for the menu
  useEffect(() => {
    let raf = 0;
    const calc = () => {
      raf = 0;
      const line = window.innerHeight * 0.35;
      let cur = "home";
      for (const [id, item] of Object.entries(SECTION_TO_MENU)) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) cur = item;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = "contact";
      setCurrent(cur);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(calc);
    };
    calc();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const menu: MenuItem[] = [
    { id: "home", label: "Home", href: "#top", current: current === "home" },
    { id: "about", label: "About", href: "#about", current: current === "about" },
    { id: "projects", label: "Projects", href: "#projects", current: current === "projects" },
    { id: "skills", label: "Skills", href: "#skills", current: current === "skills" },
    { id: "experience", label: "Experience", href: "#experience", current: current === "experience" },
    { id: "building", label: islands.building.title, href: "#building", current: current === "building" },
    { id: "contact", label: "Contact", href: "#contact", current: current === "contact" },
  ];

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-4">
      <div className="glass mx-auto flex max-w-5xl items-center justify-between gap-3 py-1.5 pl-5 pr-1.5">
        <a href="#top" className="display flex items-center gap-2.5 whitespace-nowrap text-[1.05rem]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" width={30} height={30} className="h-[30px] w-[30px]" />
          {profile.name}
        </a>
        <nav aria-label="Sections" className="flex items-center">
          <a className={`${link} hidden md:block`} href="#about">
            About
          </a>
          <a className={`${link} hidden md:block`} href="#projects">
            Projects
          </a>
          <a className={`${link} hidden lg:block`} href="#skills">
            Skills
          </a>
          <a className={`${link} hidden md:block`} href="#experience">
            Experience
          </a>
          <a className={`${link} hidden md:block`} href="#contact">
            Contact
          </a>
          <a className={`${link} !text-accent`} href={profile.resumeUrl} download>
            Resume
          </a>
          <SoundToggle className={`${link} hidden items-center md:flex`} />
          {can3D && (
            <button type="button" className={`${link} hidden md:block`} onClick={goTo3D} title="Switch to the 3D city">
              3D
            </button>
          )}
          <SlideMenu
            items={menu}
            triggerClass={`${link} ml-1 flex items-center gap-2.5 !bg-white/10 !text-white hover:!bg-white/20`}
            onOpenChange={(open) => (open ? smooth.current?.stop() : smooth.current?.start())}
            links={[
              { label: "Resume (PDF)", href: profile.resumeUrl, download: true },
              { label: "GitHub", href: profile.github, external: true },
              { label: "LinkedIn", href: profile.linkedin, external: true },
              { label: "Email", href: `mailto:${profile.email}` },
            ]}
            actions={[
              ...(can3D ? [{ label: "Switch to the 3D city", onClick: goTo3D }] : []),
              ...(sound.supported ? [{ label: soundOn ? "Sound: on" : "Sound: off", onClick: () => sound.toggle() }] : []),
            ]}
          />
        </nav>
      </div>
    </header>
  );
}

/**
 * The long page itself. It has no props and no state, and `memo` keeps React from ever walking it again after the first draw:
 * the case studies are hundreds of elements, and a phone should not redo them on every menu change or clock tick.
 */
const LiteMain = memo(function LiteMain() {
  return (
    <main id="top" className="pb-[calc(var(--dock)+24px)]">
      <section className="mx-auto flex min-h-[72svh] w-full max-w-5xl flex-col justify-end px-4 pb-[calc(var(--dock)+1rem)] pt-16 sm:px-8 sm:pb-24">
        <p className="glass label mb-7 inline-flex w-fit items-center gap-2.5 px-4 py-2 text-fog/90">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent pulse-dot" />
          {profile.openTo}
        </p>
        <h1 className="display max-w-4xl text-[clamp(2.6rem,min(8vw,15vh),6.4rem)] leading-[0.94]">
          {profile.headline.split(" ").map((w, i) => (
            <span key={i} className="mr-[0.22em] inline-block whitespace-nowrap">
              {w}
            </span>
          ))}
        </h1>
        <p className="mt-8 text-lg text-fog/85">
          <span className="block">{profile.role}</span>
          <span className="mt-1.5 block font-medium text-accent">{profile.stack.join(" - ")}</span>
        </p>
        <div className="mt-9 flex flex-wrap gap-3 sm:gap-4">
          <a href="#projects" className="btn glass glass-accent label flex items-center gap-3 px-7 py-4">
            View projects
            <ArrowDown />
          </a>
          <a href={profile.resumeUrl} download className="btn glass label flex items-center gap-3 px-7 py-4 text-fog">
            Download resume
            <DownloadIcon />
          </a>
        </div>
        <Place />
      </section>

      <section id="about" className={section}>
        <Head index={about.kicker} title={about.title} />
        <div className={card}>
          <div className="max-w-3xl">
            <AboutBody links={false} statsClass="grid-cols-2 sm:grid-cols-4" />
          </div>
        </div>
      </section>

      <section id="projects" className={section}>
        <Head index={`${islands.projects.index} of 04`} title={islands.projects.title} blurb={islands.projects.blurb} />
        <h3 className="sec-title mb-5">Major projects</h3>
        <div className="space-y-8 sm:space-y-12">
          {projects.map((p) => (
            <article key={p.id} id={p.id} className={`${card} scroll-mt-24`}>
              <div className="max-w-3xl">
                <ProjectBody p={p} level={3} statsClass="grid-cols-2 sm:grid-cols-4" />
              </div>
            </article>
          ))}
        </div>
        {miniProjects.length > 0 && (
          <div className="mt-12 sm:mt-16">
            <h3 className="sec-title mb-5">Minor projects</h3>
            <MiniProjectList level={4} variant="glass" className="grid gap-6 md:grid-cols-2" />
          </div>
        )}
      </section>

      <section id="research" className={section}>
        <Head index={`${islands.research.index} of 04`} title={islands.research.title} blurb={islands.research.blurb} />
        <article className={card}>
          <div className="max-w-3xl">
            <ResearchBody level={3} statsClass="grid-cols-2" />
          </div>
        </article>
      </section>

      <section id="skills" className={section}>
        <Head index={skillsHead.kicker} title={skillsHead.title} />
        <div className={card}>
          <SkillsBody wide />
        </div>
      </section>

      <section id="experience" className={section}>
        <Head index={`${islands.experience.index} of 04`} title={islands.experience.title} blurb={islands.experience.blurb} />
        <div className={card}>
          <div className="max-w-3xl">
            <WorkHistory level={3} />
          </div>
        </div>
      </section>

      <section id="education" className={section}>
        <Head title="Education and certifications" />
        <div className={`${card} grid gap-12 md:grid-cols-2`}>
          <div>
            <h3 className="sec-title mb-5">Education</h3>
            <EducationList />
          </div>
          <div>
            <h3 className="sec-title mb-5">Training and certifications</h3>
            <CertificationList />
          </div>
        </div>
      </section>

      <section id="building" className={section}>
        <Head index={`${islands.building.index} of 04`} title={islands.building.title} blurb={islands.building.blurb} />
        <div className={card}>
          <div className="max-w-3xl">
            <BuildingBody flush />
          </div>
        </div>
      </section>

      <section id="contact" className={`${section} pb-10 sm:pb-16`}>
        <p className="sec-title">Contact</p>
        <h2 className="display mt-3 max-w-4xl text-balance text-[clamp(2.4rem,6vw,5.2rem)] leading-[0.95]">Got a role or idea? Let&rsquo;s talk.</h2>
        <div className={`${card} mt-10 sm:mt-12`}>
          <div className="max-w-2xl">
            <ContactBody />
          </div>
        </div>
      </section>
    </main>
  );
});

/**
 * The fast 2D version: same content, normal scrolling page, no WebGL.
 * Shown on phones (always), low-power devices, browsers without WebGL2, or when the visitor picks it.
 * The case studies here are the same components the 3D panel uses, and each has an anchor
 * (#blood-bank-finder, #research, #skills ...) that matches the deep links of the 3D city.
 * Built so that scrolling costs almost nothing: the top bar is the only part that changes while you scroll (LiteHeader),
 * the long page is memoized (LiteMain), the clock is its own component (Place), and touch screens get flat glass instead of blur (globals.css).
 */
export default function LiteSite() {
  // smooth wheel scrolling (Lenis) for a mouse; touch screens keep their own native scrolling. Off for reduced motion.
  const smooth = usePageScroll();

  // a link like /#blood-bank-finder should land on that case study (the page is drawn after load, so the browser cannot do it)
  useEffect(() => {
    let id = window.location.hash.replace(/^#\/?/, "");
    try {
      id = decodeURIComponent(id);
    } catch {
      /* keep the raw text */
    }
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({ block: "start", behavior: "instant" });
  }, []);

  return (
    <div className="grain relative isolate min-h-screen text-fog">
      <div className="lite-sky" aria-hidden="true" />
      <LiteHeader smooth={smooth} />
      <LiteMain />
    </div>
  );
}
