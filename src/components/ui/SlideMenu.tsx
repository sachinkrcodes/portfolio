"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * The slide-out menu, shared by the 3D city (buttons that fly the camera) and the 2D page (real in-page links).
 * A glass sheet slides in from the right over a dimmed page.
 * Keyboard: Esc closes it (before anything else sees the key), Tab stays inside it, focus goes to the first item
 * when it opens and back to the Menu button when it closes. The sheet is `inert` while closed.
 * The sheet is rendered in <body> (a portal): a glass bar uses backdrop-filter, and that would trap a `position: fixed` child inside it.
 */

export interface MenuItem {
  id: string;
  label: string;
  /** the section that is on screen right now */
  current?: boolean;
  /** 2D page: a real link to a section, so it also works in a new tab */
  href?: string;
  /** 3D city: what to do (fly the camera, open a panel) */
  onSelect?: () => void;
}

export interface MenuLink {
  label: string;
  href: string;
  download?: boolean;
  external?: boolean;
}

interface Props {
  items: MenuItem[];
  links?: MenuLink[];
  /** extra actions at the bottom (switch between 2D and 3D) */
  actions?: { label: string; onClick: () => void }[];
  /** the 2D page pauses smooth scrolling while the menu is open */
  onOpenChange?: (open: boolean) => void;
  /** cannot be opened (3D: before the intro has finished) */
  disabled?: boolean;
  triggerClass?: string;
}

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="menu-arrow shrink-0">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SlideMenu({ items, links = [], actions = [], onOpenChange, disabled = false, triggerClass = "" }: Props) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const onChange = useRef(onOpenChange);
  onChange.current = onOpenChange;

  useEffect(() => setReady(true), []);

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) trigger.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    onChange.current?.(open);
  }, [open]);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  // while open: Esc closes, Tab cycles inside the sheet
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        e.preventDefault();
        close(true);
        return;
      }
      if (e.key !== "Tab") return;
      const els = sheet.current ? Array.from(sheet.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")) : [];
      if (!els.length) return;
      const firstEl = els[0];
      const lastEl = els[els.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (!active || !sheet.current?.contains(active)) {
        e.preventDefault();
        firstEl.focus();
      } else if (e.shiftKey && active === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && active === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    window.addEventListener("keydown", onKey, true);
    const t = window.setTimeout(() => sheet.current?.querySelector<HTMLElement>("[data-first]")?.focus({ preventScroll: true }), 80);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.clearTimeout(t);
    };
  }, [open, close]);

  const choose = (it: MenuItem) => {
    close(false);
    it.onSelect?.();
  };

  const row = "menu-item group";

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className={triggerClass}
        aria-label="Menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        data-cursor="Menu"
      >
        <span className="hidden sm:inline" aria-hidden="true">
          Menu
        </span>
        <span className="menu-icon" aria-hidden="true">
          <i />
          <i />
        </span>
      </button>

      {ready &&
        createPortal(
          <>
            <div className="menu-scrim" data-open={open ? "1" : "0"} onClick={() => close(true)} aria-hidden="true" />
            <div
              ref={sheet}
              id={panelId}
              role="dialog"
              aria-modal="true"
              aria-label="Site menu"
              inert={!open}
              data-open={open ? "1" : "0"}
              data-lenis-prevent
              className="menu-sheet glass glass-panel"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="sec-title">Menu</p>
                <button type="button" onClick={() => close(true)} className="chip group gap-2 px-3.5 py-2 transition-colors hover:bg-white/15 hover:text-white" data-cursor="Close">
                  Close
                  <span className="kbd">Esc</span>
                </button>
              </div>

              {/* grows to push the links to the bottom on a tall screen, never shrinks below its content (a short screen scrolls the sheet instead) */}
              <nav aria-label="Menu pages" className="mt-5 shrink-0 grow">
                <ul>
                  {items.map((it, i) => {
                    const style = { ["--i" as string]: i } as React.CSSProperties;
                    const body = (
                      <>
                        <span className="flex items-baseline gap-4">
                          <span className="meta tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                          <span className="display text-[clamp(1.9rem,4.2vw,2.5rem)] leading-none">{it.label}</span>
                        </span>
                        <ArrowIcon />
                      </>
                    );
                    return (
                      <li key={it.id}>
                        {it.href ? (
                          <a
                            href={it.href}
                            className={row}
                            style={style}
                            aria-current={it.current ? "true" : undefined}
                            data-first={i === 0 ? "" : undefined}
                            data-cursor="Go"
                            onClick={() => close(false)}
                          >
                            {body}
                          </a>
                        ) : (
                          <button
                            type="button"
                            className={`${row} w-full text-left`}
                            style={style}
                            aria-current={it.current ? "true" : undefined}
                            data-first={i === 0 ? "" : undefined}
                            data-cursor="Go"
                            onClick={() => choose(it)}
                          >
                            {body}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="hair my-5" />
              <ul className="flex flex-wrap gap-2" aria-label="Links">
                {links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="chip min-h-11 px-4 py-2.5 transition-colors hover:bg-white/15 hover:text-white"
                      {...(l.external ? { target: "_blank", rel: "noreferrer" } : {})}
                      {...(l.download ? { download: true } : {})}
                      data-cursor="Open"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
                {actions.map((a) => (
                  <li key={a.label}>
                    <button
                      type="button"
                      className="chip min-h-11 px-4 py-2.5 transition-colors hover:bg-white/15 hover:text-white"
                      onClick={() => {
                        close(false);
                        a.onClick();
                      }}
                    >
                      {a.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
