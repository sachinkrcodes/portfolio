"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { profile } from "@/data/content";
import { goHome, openAbout, openContact, openIsland, switchMode, viewProjects } from "@/lib/actions";
import { useStore } from "@/store/useStore";
import { heroCopy } from "@/components/scene/registry";
import Magnetic from "./Magnetic";
import SlideMenu, { type MenuItem } from "./SlideMenu";
import SoundToggle, { useSoundOn } from "./SoundToggle";
import { sound } from "@/lib/sound";
import { useLiveTime } from "./useLiveTime";

/* ------------------------------------------------------------------ small pieces */

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
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

/** The slide-out menu for the 3D city: Home, About, Projects, Experience, Contact. The current place is marked. */
function CityMenu({ triggerClass }: { triggerClass: string }) {
  const mode = useStore((s) => s.mode);
  const place = useStore((s) => (s.mode === "focus" ? s.focus?.island : undefined));
  const revealed = useStore((s) => s.revealed);
  const soundOn = useSoundOn();
  const items: MenuItem[] = [
    { id: "home", label: "Home", current: mode === "hero", onSelect: goHome },
    { id: "about", label: "About", current: place === "about", onSelect: openAbout },
    { id: "projects", label: "Projects", current: place === "projects", onSelect: () => openIsland("projects") },
    { id: "experience", label: "Experience", current: place === "experience", onSelect: () => openIsland("experience") },
    { id: "contact", label: "Contact", current: place === "contact", onSelect: openContact },
  ];
  return (
    <SlideMenu
      items={items}
      disabled={!revealed}
      triggerClass={triggerClass}
      links={[
        { label: "Resume (PDF)", href: profile.resumeUrl, download: true },
        { label: "GitHub", href: profile.github, external: true },
        { label: "LinkedIn", href: profile.linkedin, external: true },
        { label: "Email", href: `mailto:${profile.email}` },
      ]}
      actions={[
        { label: "Switch to the 2D page", onClick: () => switchMode(true) },
        ...(sound.supported ? [{ label: soundOn ? "Sound: on" : "Sound: off", onClick: () => sound.toggle() }] : []),
      ]}
    />
  );
}

/** Top bar: where I am (with live local time) and the links that must always be reachable. */
function TopBar() {
  const time = useLiveTime(profile.location.timeZone);
  const [hh, mm] = time ? time.split(":") : ["", ""];
  const aboutOpen = useStore((s) => s.mode === "focus" && s.focus?.island === "about");
  const link = "label rounded-full px-2.5 py-2 text-fog/80 transition-colors hover:bg-white/10 hover:text-white lg:px-3.5";
  return (
    <header className="pointer-events-none fixed left-0 right-0 top-0 z-40 flex items-start justify-between gap-3 px-4 py-4 sm:px-7 sm:py-6">
      <div className="glass label flex items-center gap-3 px-4 py-2.5 text-fog/90">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent pulse-dot" />
        <span>
          {profile.location.city}
          <span className="hidden sm:inline">, {profile.location.country}</span>
        </span>
        <span className="tabular-nums text-mute">
          <span className="sr-only">Local time </span>
          {time ? (
            <>
              {hh}
              <span className="blink">:</span>
              {mm}
            </>
          ) : (
            "--:--"
          )}
        </span>
      </div>
      <nav aria-label="Quick links" className="glass pointer-events-auto flex items-center p-1.5">
        <button
          type="button"
          className={`${link} hidden md:block ${aboutOpen ? "!bg-white/10 !text-white" : ""}`}
          onClick={openAbout}
          aria-current={aboutOpen ? "true" : undefined}
        >
          About
        </button>
        <a className={`${link} hidden md:block`} href={profile.github} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a className={`${link} hidden md:block`} href={profile.linkedin} target="_blank" rel="noreferrer">
          LinkedIn
        </a>
        <a className={`${link} !text-accent`} href={profile.resumeUrl} download>
          Resume
        </a>
        <SoundToggle className={`${link} hidden items-center md:flex`} />
        <button type="button" className={`${link} hidden md:block`} onClick={() => switchMode(true)} title="Switch to the fast 2D version">
          2D
        </button>
        <CityMenu triggerClass={`${link} ml-1 flex items-center gap-2.5 !bg-white/10 !text-white hover:!bg-white/20 disabled:opacity-50`} />
      </nav>
    </header>
  );
}

/* ------------------------------------------------------------------ hero */

function Hero() {
  const mode = useStore((s) => s.mode);
  const uiReady = useStore((s) => s.uiReady);
  const box = useRef<HTMLDivElement>(null);
  const played = useRef(false);
  const words = profile.headline.split(" ");

  // tell the island labels where the text is, so none of them sits behind it
  useEffect(() => {
    heroCopy.el = box.current;
    return () => {
      heroCopy.el = null;
    };
  }, []);

  // split reveal: every word rises out of its own mask, then the rest fades up
  useEffect(() => {
    if (!uiReady || played.current || !box.current) return;
    played.current = true;
    const ctx = gsap.context(() => {
      const reduced = useStore.getState().reducedMotion;
      if (reduced) {
        gsap.set("[data-w], [data-up]", { clearProps: "all" });
        return;
      }
      gsap
        .timeline({ defaults: { ease: "power4.out" } })
        .fromTo("[data-w]", { yPercent: 115 }, { yPercent: 0, duration: 1.25, stagger: 0.07 }, 0.05)
        .fromTo("[data-up]", { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.1 }, 0.35);
    }, box);
    return () => ctx.revert();
  }, [uiReady]);

  const visible = mode === "hero";
  return (
    <section
      ref={box}
      aria-label="Introduction"
      aria-hidden={!visible}
      inert={!visible}
      className={`hero pointer-events-none fixed bottom-[calc(var(--dock)+clamp(20px,5vh,64px))] left-5 right-5 z-20 transition-[opacity,transform] duration-700 ease-out sm:left-[clamp(28px,4.5vw,80px)] sm:right-auto sm:max-w-[min(46vw,800px)] ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0 [&_*]:!pointer-events-none"
      }`}
    >
      {/* before the reveal everything is hidden (no flash of text) */}
      <div className={uiReady ? "" : "invisible"}>
        <p data-up className="hero-pill glass label mb-6 inline-flex items-center gap-2.5 px-4 py-2 text-fog/90">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent pulse-dot" />
          {profile.openTo}
        </p>
        <p className="hero-title display text-[clamp(2.5rem,5.3vw,6.6rem)] leading-[0.93] text-fog">
          {words.map((w, i) => (
            <span key={i} className="mr-[0.22em] inline-block overflow-hidden pb-[0.14em] align-bottom -mb-[0.14em]">
              <span data-w className="inline-block will-change-transform">
                {w}
              </span>
            </span>
          ))}
        </p>
        <p data-up className="hero-role mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 text-[clamp(0.9rem,1.1vw,1.15rem)] text-fog/85">
          <span>{profile.role}</span>
          <span className="hidden text-mute sm:inline" aria-hidden="true">
            |
          </span>
          <span className="w-full font-medium text-accent sm:w-auto">{profile.stack.join(" - ")}</span>
        </p>
        <div data-up className="hero-actions mt-9 flex flex-wrap items-center gap-4">
          <Magnetic>
            <button type="button" onClick={viewProjects} data-cursor="Go" className="btn glass glass-accent label group flex items-center gap-3 px-7 py-4">
              View projects
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                <ArrowIcon />
              </span>
            </button>
          </Magnetic>
          <Magnetic>
            <a href={profile.resumeUrl} download data-cursor="Resume" className="btn glass label flex items-center gap-3 px-7 py-4 text-fog">
              Download resume
              <DownloadIcon />
            </a>
          </Magnetic>
        </div>
        <p data-up className="hero-hint label mt-10 hidden items-center gap-4 text-mute md:flex" aria-hidden="true">
          <span className="relative block h-px w-12 overflow-hidden bg-white/15">
            <span className="absolute left-0 top-0 h-px w-4 animate-[hint_2s_ease-in-out_infinite] bg-accent" />
          </span>
          Scroll or drag to explore the city
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ explore hints */

function ExploreHud() {
  const mode = useStore((s) => s.mode);
  const visible = mode === "explore";
  return (
    <div
      aria-hidden={!visible}
      className={`pointer-events-none fixed bottom-[calc(var(--dock)+8px)] left-5 z-20 flex flex-wrap items-center gap-5 transition-opacity duration-500 sm:left-8 ${visible ? "opacity-100" : "opacity-0 [&_*]:!pointer-events-none"}`}
    >
      <button type="button" onClick={goHome} tabIndex={visible ? 0 : -1} className="btn glass label pointer-events-auto flex items-center gap-2 px-4 py-2.5 text-fog">
        <span aria-hidden="true">&larr;</span> Intro
      </button>
      <p className="label hidden text-mute sm:block">Drag to pan, scroll to zoom, click an island</p>
    </div>
  );
}

export default function Overlay() {
  return (
    <>
      <TopBar />
      <Hero />
      <ExploreHud />
    </>
  );
}
