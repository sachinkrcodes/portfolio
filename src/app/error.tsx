"use client";

import { useEffect } from "react";

/** Shown if something breaks while the page is running. The 2D version is a safe way back in. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid h-dvh place-items-center overflow-y-auto px-6 py-10">
      <div className="glass flex max-w-xl flex-col items-center gap-5 px-8 py-12 text-center" role="alert">
        <p className="label text-accent">Something went wrong</p>
        <h1 className="font-display text-4xl leading-tight font-extrabold sm:text-5xl">The city lost its signal.</h1>
        <p className="text-mute">This is a fault on the page, not on your side. Try again, or open the simple 2D version, which has the same content.</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={reset} className="btn glass glass-accent label px-7 py-4">
            Try again
          </button>
          <a href="/?mode=lite" className="btn glass label px-7 py-4">
            Open the 2D version
          </a>
        </div>
      </div>
    </main>
  );
}
