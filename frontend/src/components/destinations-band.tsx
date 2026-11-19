"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Pause, Play } from "lucide-react";
import type { Destination } from "@/lib/types";

/**
 * A slow moving band of destination names, set large. Each name links to its
 * destination page. It pauses on hover/focus, has a pause button (motion over 5 s),
 * and rests completely for reduced-motion visitors.
 */
export default function DestinationsBand({ destinations }: { destinations: Destination[] }) {
  const [paused, setPaused] = useState(false);
  const list = destinations.filter((d) => d.name && d.slug).slice(0, 12);
  if (list.length < 3) return null;

  const row = (copy: number) =>
    list.map((d) => (
      <li key={`${copy}-${d.slug}`} className="flex items-center" aria-hidden={copy > 0 || undefined}>
        <Link
          href={`/destinations/${d.slug}`}
          tabIndex={copy > 0 ? -1 : undefined}
          className="group/dest px-5 font-display text-4xl font-black uppercase tracking-tight text-white/90 transition-colors hover:text-brand-sky sm:px-8 sm:text-6xl lg:text-7xl"
        >
          {d.name}
        </Link>
        <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-brand-sky sm:h-3 sm:w-3" />
      </li>
    ));

  return (
    <section aria-label="Destinations we travel to" className="relative overflow-hidden bg-brand-navy py-8 sm:py-12">
      <div className="group [&:hover_ul]:[animation-play-state:paused] [&:focus-within_ul]:[animation-play-state:paused]">
        <ul
          className="animate-marquee-left items-center motion-reduce:animate-none"
          style={{ animationDuration: "45s", animationPlayState: paused ? "paused" : undefined }}
        >
          {row(0)}
          {row(1)}
        </ul>
      </div>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? "Play destination names" : "Pause destination names"}
        className="absolute bottom-2 right-3 grid h-11 w-11 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white motion-reduce:hidden"
      >
        {paused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
      </button>
    </section>
  );
}
