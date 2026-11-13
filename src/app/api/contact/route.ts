import { profile } from "@/data/content";
import { validateContact, type ContactReply, type ContactValues } from "@/lib/contact";

/**
 * POST /api/contact: the contact form's server side.
 *
 *  1. Basic request checks: JSON only, small body, same-site Origin.
 *  2. A hidden "_gotcha" field that people never fill in: if a bot filled it, pretend it worked and send nothing.
 *  3. A per-IP rate limit (5 messages per 10 minutes). It lives in this server's memory, so on serverless hosting it is
 *     best effort per instance. It stops a script hammering one instance; use a real store (Upstash, Vercel Firewall) if you ever need more.
 *  4. The same validation the browser runs (src/lib/contact.ts), because browser checks can be skipped.
 *  5. Send through a mail provider chosen by environment variables (README, "Contact form"):
 *       RESEND_API_KEY (+ optional CONTACT_TO_EMAIL, CONTACT_FROM)   -> Resend
 *       FORMSPREE_ID                                                -> Formspree
 *     With neither set the route answers 503 "not_configured" and the form tells the visitor to use email.
 *
 * Secrets stay on the server: nothing here is NEXT_PUBLIC_.
 * RESEND_API_URL and FORMSPREE_URL are only for testing (point them at a fake server); leave them unset in real life.
 */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const MAX_BODY_BYTES = 10_000;
const hits = new Map<string, number[]>();

function tooMany(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  // keep the map small on a long-running server
  if (hits.size > 2000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  }
  return false;
}

function reply(body: ContactReply, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** A browser always sends Origin on a cross-site POST. If it is there, it must be this site. */
function sameSite(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // curl, server to server, some privacy settings
  try {
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

type SendResult = "sent" | "not_configured" | "failed";

async function sendMail(v: ContactValues): Promise<SendResult> {
  const text = `New message from your portfolio\n\nName: ${v.name}\nEmail: ${v.email}\n\n${v.message}\n`;

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const res = await fetch(process.env.RESEND_API_URL ?? "https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        // "onboarding@resend.dev" works without a domain, but Resend then only delivers to the email of your Resend account.
        from: process.env.CONTACT_FROM ?? "Portfolio <onboarding@resend.dev>",
        to: [process.env.CONTACT_TO_EMAIL ?? profile.email],
        reply_to: v.email,
        subject: `Portfolio message from ${v.name}`,
        text,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) console.error(`[contact] Resend answered ${res.status}`);
    return res.ok ? "sent" : "failed";
  }

  const formspreeId = process.env.FORMSPREE_ID;
  if (formspreeId) {
    const res = await fetch(process.env.FORMSPREE_URL ?? `https://formspree.io/f/${encodeURIComponent(formspreeId)}`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ name: v.name, email: v.email, message: v.message }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) console.error(`[contact] Formspree answered ${res.status}`);
    return res.ok ? "sent" : "failed";
  }

  return "not_configured";
}

export async function POST(req: Request) {
  if (!sameSite(req)) return reply({ ok: false, error: "forbidden" }, 403);
  if (!(req.headers.get("content-type") ?? "").includes("application/json")) return reply({ ok: false, error: "bad_request" }, 415);

  let raw: unknown;
  try {
    const text = await req.text();
    if (text.length > MAX_BODY_BYTES) return reply({ ok: false, error: "bad_request" }, 413);
    raw = JSON.parse(text);
  } catch {
    return reply({ ok: false, error: "bad_request" }, 400);
  }

  // honeypot: real visitors never see this field
  const trap = raw && typeof raw === "object" ? (raw as Record<string, unknown>)._gotcha : undefined;
  if (typeof trap === "string" && trap.trim() !== "") return reply({ ok: true });

  if (tooMany(clientIp(req))) return reply({ ok: false, error: "rate_limited" }, 429);

  const checked = validateContact(raw);
  if (!checked.ok) return reply({ ok: false, errors: checked.errors, error: "bad_request" }, 400);

  try {
    const result = await sendMail(checked.value);
    if (result === "sent") return reply({ ok: true });
    if (result === "not_configured") return reply({ ok: false, error: "not_configured" }, 503);
    return reply({ ok: false, error: "send_failed" }, 502);
  } catch (e) {
    console.error("[contact] send error:", e instanceof Error ? e.name : "unknown");
    return reply({ ok: false, error: "send_failed" }, 502);
  }
}
