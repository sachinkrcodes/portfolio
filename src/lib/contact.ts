/**
 * Contact form rules. One file used twice: the form in the browser (to help the visitor) and the
 * /api/contact route on the server (the real check, because anything from a browser can be faked).
 */

export const LIMITS = { nameMin: 2, nameMax: 80, emailMax: 254, messageMin: 10, messageMax: 2000 } as const;

export type ContactField = "name" | "email" | "message";
export type ContactErrors = Partial<Record<ContactField, string>>;
export interface ContactValues {
  name: string;
  email: string;
  message: string;
}

// Something@something.tld with no spaces. Good enough to catch typos; the mail provider does the strict check.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Control characters are never wanted. A single-line field also loses line breaks (no header tricks in a subject line). */
function tidy(value: unknown, multiline: boolean): string {
  if (typeof value !== "string") return "";
  // eslint-disable-next-line no-control-regex
  const noControl = value.replace(multiline ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g, " ");
  return (multiline ? noControl.replace(/\r\n?/g, "\n") : noControl.replace(/\s+/g, " ")).trim();
}

export function validateContact(raw: unknown): { ok: true; value: ContactValues } | { ok: false; errors: ContactErrors } {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const value: ContactValues = { name: tidy(o.name, false), email: tidy(o.email, false), message: tidy(o.message, true) };
  const errors: ContactErrors = {};

  if (value.name.length < LIMITS.nameMin) errors.name = "Please tell me your name.";
  else if (value.name.length > LIMITS.nameMax) errors.name = `Please keep your name under ${LIMITS.nameMax} characters.`;

  if (!value.email) errors.email = "Please add your email so I can reply.";
  else if (value.email.length > LIMITS.emailMax || !EMAIL.test(value.email)) errors.email = "That email address does not look right.";

  if (value.message.length < LIMITS.messageMin) errors.message = `Please write a little more (at least ${LIMITS.messageMin} characters).`;
  else if (value.message.length > LIMITS.messageMax) errors.message = `Please keep it under ${LIMITS.messageMax} characters.`;

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value };
}

/** What /api/contact answers. */
export interface ContactReply {
  ok: boolean;
  errors?: ContactErrors;
  /** "not_configured" (no mail provider set up), "rate_limited", "send_failed", "bad_request", "forbidden" */
  error?: string;
}
