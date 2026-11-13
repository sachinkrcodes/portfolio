"use client";

import { useId, useRef, useState } from "react";
import { profile } from "@/data/content";
import { LIMITS, validateContact, type ContactErrors, type ContactField, type ContactReply } from "@/lib/contact";

/**
 * The contact form (3D panel and 2D page). It checks every field while you type and again on send, then posts to
 * /api/contact, which checks everything again on the server. If sending is not possible (mail provider not set up,
 * offline, too many tries) it says so and offers a mailto link with your text already filled in, so a message is never lost.
 */

type Status = "idle" | "sending" | "sent" | "failed" | "offline" | "limited";

// What you typed survives closing the panel or switching 2D / 3D, until it is sent.
const draft: Record<ContactField, string> = { name: "", email: "", message: "" };

function ErrorLine({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="mt-2 flex items-start gap-2 text-[0.88rem] leading-snug text-fog">
      <svg className="mt-[0.2em] shrink-0 text-accent" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 4.6v4.2M8 11.2v.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <span>{children}</span>
    </p>
  );
}

export default function ContactForm() {
  const uid = useId();
  const id = (f: string) => `${uid}-${f}`;
  const [values, setValues] = useState<Record<ContactField, string>>({ ...draft });
  const [touched, setTouched] = useState<Partial<Record<ContactField, boolean>>>({});
  const [attempted, setAttempted] = useState(false);
  const [serverErrors, setServerErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const refs = { name: useRef<HTMLInputElement>(null), email: useRef<HTMLInputElement>(null), message: useRef<HTMLTextAreaElement>(null) };
  const trap = useRef<HTMLInputElement>(null);

  const check = validateContact(values);
  const found: ContactErrors = check.ok ? {} : check.errors;
  const shown = (f: ContactField) => ((touched[f] || attempted) && found[f]) || serverErrors[f] || undefined;

  const set = (f: ContactField, v: string) => {
    draft[f] = v;
    setValues((o) => ({ ...o, [f]: v }));
    if (serverErrors[f]) setServerErrors((o) => ({ ...o, [f]: undefined }));
    if (status === "failed" || status === "offline" || status === "limited") setStatus("idle");
  };

  const mailto = `mailto:${profile.email}?subject=${encodeURIComponent("Hello from your portfolio")}&body=${encodeURIComponent(values.message)}`;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setAttempted(true);
    if (!check.ok) {
      const first = (["name", "email", "message"] as const).find((f) => check.errors[f]);
      if (first) refs[first].current?.focus();
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...check.value, _gotcha: trap.current?.value ?? "" }),
      });
      let data: ContactReply | null = null;
      try {
        data = (await res.json()) as ContactReply;
      } catch {
        /* not JSON: treated as a failure below */
      }
      if (res.ok && data?.ok) {
        draft.name = draft.email = draft.message = "";
        setValues({ name: "", email: "", message: "" });
        setTouched({});
        setAttempted(false);
        setStatus("sent");
      } else if (res.status === 400 && data?.errors) {
        setServerErrors(data.errors);
        setStatus("idle");
        const first = (["name", "email", "message"] as const).find((f) => data?.errors?.[f]);
        if (first) refs[first].current?.focus();
      } else if (res.status === 429) setStatus("limited");
      else if (res.status === 503) setStatus("offline");
      else setStatus("failed");
    } catch {
      setStatus("failed");
    }
  }

  if (status === "sent") {
    return (
      <div className="tile" role="status">
        <p className="display text-[1.5rem] leading-tight">Message sent.</p>
        <p className="mt-2 text-[0.98rem] leading-relaxed text-fog/80">Thank you. I will reply to the email address you gave.</p>
        <button type="button" onClick={() => setStatus("idle")} className="chip mt-5 gap-2 px-4 py-2.5 transition-colors hover:bg-white/15" data-cursor="Again">
          Send another message
        </button>
      </div>
    );
  }

  const problem =
    status === "limited"
      ? "That was a lot of messages from this connection. Please wait a few minutes, or email me directly."
      : status === "offline"
        ? "The form is not connected right now. Please email me directly."
        : status === "failed"
          ? "The message could not be sent. Please try again, or email me directly."
          : null;

  const field = "field";
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5" aria-label="Contact form">
      <div>
        <label htmlFor={id("name")} className="label mb-2 block text-fog/90">
          Name
        </label>
        <input
          ref={refs.name}
          id={id("name")}
          name="name"
          type="text"
          autoComplete="name"
          maxLength={LIMITS.nameMax}
          placeholder="Your name"
          className={field}
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          onBlur={() => setTouched((o) => ({ ...o, name: true }))}
          aria-required="true"
          aria-invalid={shown("name") ? true : undefined}
          aria-describedby={shown("name") ? id("name-err") : undefined}
        />
        {shown("name") && <ErrorLine id={id("name-err")}>{shown("name")}</ErrorLine>}
      </div>

      <div>
        <label htmlFor={id("email")} className="label mb-2 block text-fog/90">
          Email
        </label>
        <input
          ref={refs.email}
          id={id("email")}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          maxLength={LIMITS.emailMax}
          placeholder="you@company.com"
          className={field}
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
          onBlur={() => setTouched((o) => ({ ...o, email: true }))}
          aria-required="true"
          aria-invalid={shown("email") ? true : undefined}
          aria-describedby={shown("email") ? id("email-err") : undefined}
        />
        {shown("email") && <ErrorLine id={id("email-err")}>{shown("email")}</ErrorLine>}
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <label htmlFor={id("message")} className="label block text-fog/90">
            Message
          </label>
          <span className="meta tabular-nums" aria-hidden="true">
            {values.message.length} / {LIMITS.messageMax}
          </span>
        </div>
        <textarea
          ref={refs.message}
          id={id("message")}
          name="message"
          rows={6}
          maxLength={LIMITS.messageMax}
          placeholder="A role, a project, a question..."
          className={field}
          data-lenis-prevent
          value={values.message}
          onChange={(e) => set("message", e.target.value)}
          onBlur={() => setTouched((o) => ({ ...o, message: true }))}
          aria-required="true"
          aria-invalid={shown("message") ? true : undefined}
          aria-describedby={shown("message") ? id("message-err") : undefined}
        />
        {shown("message") && <ErrorLine id={id("message-err")}>{shown("message")}</ErrorLine>}
      </div>

      {/* Spam trap: invisible to people, tempting to bots. Real visitors never fill it in. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>
        <label>
          Leave this field empty
          <input ref={trap} type="text" name="_gotcha" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">
        <button
          type="submit"
          disabled={status === "sending"}
          data-cursor="Send"
          className="btn glass glass-accent label flex items-center gap-3 px-7 py-3.5 disabled:pointer-events-none disabled:opacity-70"
        >
          {status === "sending" ? (
            <>
              Sending
              <span className="spin" aria-hidden="true" />
            </>
          ) : (
            <>
              Send message
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          )}
        </button>
        <p className="meta max-w-[22ch] leading-snug">I only use your details to reply.</p>
      </div>

      <div aria-live="polite" role="status" className="sr-only">
        {status === "sending" ? "Sending your message" : ""}
      </div>

      {problem && (
        <div role="alert" className="tile">
          <p className="text-[0.95rem] leading-relaxed text-fog/90">{problem}</p>
          <a href={mailto} className="chip chip-accent mt-3 gap-2 px-4 py-2.5 transition-colors hover:bg-white/15" data-cursor="Email">
            Email {profile.email}
          </a>
        </div>
      )}
    </form>
  );
}
