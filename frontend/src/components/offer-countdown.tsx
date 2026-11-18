"use client";

import React, { useEffect, useState } from "react";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

/**
 * Live "Ends in 2d 04:12:09" chip. Renders nothing on the server (no hydration
 * mismatch) and nothing once the moment has passed.
 */
export default function OfferCountdown({
  until,
  label,
  tone = "light",
}: {
  until: string; // ISO date; counts to the end of that day (local time)
  label: string;
  tone?: "light" | "dark";
}) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  if (now === null) return null;
  const end = new Date(`${until}T23:59:59`).getTime();
  if (Number.isNaN(end) || end <= now) return null;
  const { d, h, m, s } = parts(end - now);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tabular-nums tracking-tight " +
        (tone === "dark"
          ? "bg-white/10 text-white ring-1 ring-inset ring-white/15 sm:backdrop-blur-md"
          : "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100")
      }
      aria-label={`${label} ${d} days ${h} hours`}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
      </span>
      {label} {d > 0 && `${d}d `}
      {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  );
}
