"use client";

import { useEffect, useState } from "react";

/** "HH:MM" in the given time zone, ticking every second. Empty on the server so nothing mismatches. */
export function useLiveTime(timeZone: string) {
  const [now, setNow] = useState("");
  useEffect(() => {
    const f = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone });
    const tick = () => setNow(f.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [timeZone]);
  return now;
}
