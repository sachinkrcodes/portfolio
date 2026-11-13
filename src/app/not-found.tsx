import type { Metadata } from "next";
import Link from "next/link";
import { profile } from "@/data/content";

// Next.js already adds <meta name="robots" content="noindex"> to every 404 page, so only the title is set here.
export const metadata: Metadata = { title: "Page not found" };

/** Shown for any address that is not on this site. */
export default function NotFound() {
  return (
    <main className="grid h-dvh place-items-center overflow-y-auto px-6 py-10">
      <div className="glass flex max-w-xl flex-col items-center gap-5 px-8 py-12 text-center">
        <p className="label text-accent">404</p>
        <h1 className="font-display text-4xl leading-tight font-extrabold sm:text-5xl">This page is not in the city.</h1>
        <p className="text-mute">The link may be old, or it has a typo. The whole portfolio is a single page, and it is one step away.</p>
        <Link href="/" className="btn glass glass-accent label px-7 py-4">
          Back to {profile.name}
        </Link>
      </div>
    </main>
  );
}
