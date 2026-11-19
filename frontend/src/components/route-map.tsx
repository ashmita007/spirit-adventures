"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, MotionValue, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { Destination } from "@/lib/types";
import { Small } from "@/components/mix-heading";
import { cn } from "@/lib/utils";

type LatLng = [number, number];

const HUBS: { name: string; at: LatLng }[] = [
  { name: "Hyderabad", at: [17.385, 78.487] },
  { name: "Bengaluru", at: [12.972, 77.595] },
  { name: "Chennai", at: [13.083, 80.271] },
];

/** Approximate centres for the places we run trips to, by destination slug. */
const PLACES: Record<string, LatLng> = {
  kashmir: [34.08, 74.8],
  gokarna: [14.55, 74.32],
  dandeli: [15.27, 74.62],
  coorg: [12.42, 75.74],
  chikmagalur: [13.32, 75.77],
  ooty: [11.41, 76.7],
  wayanad: [11.69, 76.13],
  hampi: [15.34, 76.46],
  munnar: [10.09, 77.06],
  goa: [15.3, 74.12],
  lonavala: [18.75, 73.41],
  pondicherry: [11.94, 79.81],
  manali: [32.24, 77.19],
  darjeeling: [27.04, 88.26],
  kerala: [9.93, 76.27],
  meghalaya: [25.57, 91.88],
  kodaikanal: [10.24, 77.49],
  shimla: [31.1, 77.17],
};

// Equirectangular projection of India's bounding box into the SVG.
const W = 600;
const H = 660;
const BOUNDS = { minLat: 8, maxLat: 36, minLng: 68, maxLng: 94 };
const project = ([lat, lng]: LatLng) => ({
  x: ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * W,
  y: ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * H,
});
const dist = (a: LatLng, b: LatLng) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/** A curved route that draws itself as the section scrolls into place. */
function Route({ d, progress, i, active }: { d: string; progress: MotionValue<number>; i: number; active: boolean }) {
  const start = Math.min(0.5, i * 0.03);
  const length = useTransform(progress, [start, start + 0.45], [0, 1]);
  return (
    <motion.path
      d={d}
      fill="none"
      strokeLinecap="round"
      strokeDasharray="1 0"
      style={{ pathLength: length }}
      className={cn("transition-[stroke,stroke-width] duration-300", active ? "stroke-amber-300 [stroke-width:3]" : "stroke-brand-sky/60 [stroke-width:1.5]")}
    />
  );
}

/**
 * Where we travel: our three home cities glow; a route curves from the nearest city to
 * every destination, drawing as the map scrolls into view. Pointing at a place (or its
 * name in the list) lights its route. Places link to their destination pages.
 * Reduced motion: routes drawn in full from the start.
 */
export default function RouteMap({ destinations }: { destinations: Destination[] }) {
  const ref = useRef<HTMLElement>(null);
  // Applied after mount so the first client render matches the server's markup.
  const prefersReduced = useReducedMotion();
  const [reduce, setReduce] = useState(false);
  useEffect(() => setReduce(Boolean(prefersReduced)), [prefersReduced]);
  const [hover, setHover] = useState<string | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const full = useTransform(scrollYProgress, () => 1);
  const progress = reduce ? full : scrollYProgress;

  const routes = useMemo(
    () =>
      destinations
        .filter((d) => PLACES[d.slug])
        .map((d) => {
          const at = PLACES[d.slug];
          const hub = HUBS.reduce((best, h) => (dist(h.at, at) < dist(best.at, at) ? h : best), HUBS[0]);
          const a = project(hub.at);
          const b = project(at);
          // Bend each route sideways by a fifth of its length.
          const mx = (a.x + b.x) / 2 - (b.y - a.y) * 0.2;
          const my = (a.y + b.y) / 2 + (b.x - a.x) * 0.2;
          return { dest: d, hub: hub.name, p: b, d: `M${a.x.toFixed(1)},${a.y.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}` };
        }),
    [destinations]
  );
  if (routes.length < 3) return null;

  const byHub = HUBS.map((h) => ({ hub: h.name, list: routes.filter((r) => r.hub === h.name) })).filter((g) => g.list.length);

  return (
    <section ref={ref} aria-labelledby="route-title" className="overflow-hidden rounded-[32px] bg-brand-navy text-white">
      <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-12 lg:gap-10 lg:p-12">
        <div className="lg:col-span-5">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-sky">{routes.length} places from 3 cities</p>
          <h2 id="route-title" data-anim="heading" data-no-drift className="[perspective:800px] mt-1 font-display text-3xl font-black uppercase tracking-tight sm:text-5xl">
            Where <Small>we</Small> go
          </h2>
          <p className="mt-3 max-w-md text-[15px] leading-7 text-slate-300">
            Every trip starts from Hyderabad, Bengaluru or Chennai. Point at a place to see its route.
          </p>
          <div className="mt-6 space-y-5">
            {byHub.map((g) => (
              <div key={g.hub}>
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-300">
                  <span className="h-2 w-2 rounded-full bg-amber-300" aria-hidden="true" /> From {g.hub}
                </p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {g.list.map((r) => (
                    <li key={r.dest.slug}>
                      <Link
                        href={`/destinations/${r.dest.slug}`}
                        onPointerEnter={() => setHover(r.dest.slug)}
                        onPointerLeave={() => setHover(null)}
                        onFocus={() => setHover(r.dest.slug)}
                        onBlur={() => setHover(null)}
                        className={cn(
                          "inline-flex min-h-9 items-center rounded-full border px-3 text-xs font-semibold transition",
                          hover === r.dest.slug ? "border-amber-300 bg-amber-300 text-brand-navy" : "border-white/15 bg-white/5 text-white hover:border-white/40"
                        )}
                      >
                        {r.dest.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7">
          <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-[34rem]" role="img" aria-label="Map of our trip routes across India">
            {/* Faint grid for a sense of place */}
            {Array.from({ length: 8 }, (_, i) => (
              <line key={`h${i}`} x1="0" x2={W} y1={(H / 8) * i} y2={(H / 8) * i} className="stroke-white/[0.05]" />
            ))}
            {Array.from({ length: 8 }, (_, i) => (
              <line key={`v${i}`} y1="0" y2={H} x1={(W / 8) * i} x2={(W / 8) * i} className="stroke-white/[0.05]" />
            ))}
            {routes.map((r, i) => (
              <Route key={r.dest.slug} d={r.d} progress={progress} i={i} active={hover === r.dest.slug} />
            ))}
            {routes.map((r) => (
              <Link key={r.dest.slug} href={`/destinations/${r.dest.slug}`} aria-label={r.dest.name}>
                <g
                  onPointerEnter={() => setHover(r.dest.slug)}
                  onPointerLeave={() => setHover(null)}
                  className="cursor-pointer"
                >
                  <circle cx={r.p.x} cy={r.p.y} r="14" fill="transparent" />
                  <circle cx={r.p.x} cy={r.p.y} r={hover === r.dest.slug ? 7 : 4.5} className={cn("transition-all duration-300", hover === r.dest.slug ? "fill-amber-300" : "fill-white")} />
                  {hover === r.dest.slug && (
                    <text x={r.p.x + 12} y={r.p.y + 5} className="fill-white font-display text-[18px] font-black uppercase">
                      {r.dest.name}
                    </text>
                  )}
                </g>
              </Link>
            ))}
            {HUBS.map((h) => {
              const p = project(h.at);
              return (
                <g key={h.name}>
                  <circle cx={p.x} cy={p.y} r="16" className="origin-center fill-amber-300/25 motion-safe:animate-ping [transform-box:fill-box]" />
                  <circle cx={p.x} cy={p.y} r="8" className="fill-amber-300 stroke-brand-navy [stroke-width:3]" />
                  <text
                    x={h.name === "Chennai" ? p.x + 14 : p.x - 14}
                    y={h.name === "Hyderabad" ? p.y - 14 : p.y + 26}
                    textAnchor={h.name === "Chennai" ? "start" : "end"}
                    className="fill-amber-300 font-display text-[15px] font-semibold"
                  >
                    {h.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </section>
  );
}
