"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Promotion, FestiveTheme } from "@/lib/api";
import { cn } from "@/lib/utils";
import OfferCard from "@/components/offer-card";

const COPY: Record<FestiveTheme, { kicker: string; title: React.ReactNode }> = {
  CHRISTMAS: {
    kicker: "🎄 Christmas at Spirit",
    title: <>Festive escapes, <span className="font-serif font-normal italic text-red-200">wrapped and ready.</span></>,
  },
  NEWYEAR: {
    kicker: "🎉 New Year at Spirit",
    title: <>Ring in the year <span className="font-serif font-normal italic text-amber-200">somewhere wild.</span></>,
  },
  NONE: {
    kicker: "Limited time",
    title: <>Events & offers <span className="font-serif font-normal italic text-slate-400">worth packing for.</span></>,
  },
};

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/**
 * Home page events & offers. Mobile: swipeable snap row (first card wider) with a
 * live position bar. Desktop: asymmetric grid, feature card spans two rows.
 * Festive themes get a dark, glowing stage; otherwise a light one. Hidden when empty.
 */
export default function OffersSection({ offers, theme }: { offers: Promotion[]; theme: FestiveTheme }) {
  const rail = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const festive = theme !== "NONE";
  // During a festival its own offers lead; otherwise keep the owner's order.
  const ordered = festive ? [...offers].sort((a, b) => Number(b.festival === theme) - Number(a.festival === theme)) : offers;
  const shown = ordered.slice(0, 5);
  const copy = COPY[theme] ?? COPY.NONE;

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      setProgress(max > 0 ? el.scrollLeft / max : 0);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  if (!shown.length) return null;
  const [lead, ...rest] = shown;

  return (
    <section
      aria-labelledby="offers-heading"
      className={cn("relative isolate overflow-hidden py-14 sm:py-24", festive ? "bg-[#07102a] text-white" : "bg-[#f6f7f9] text-brand-navy")}
    >
      {/* Atmosphere */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {festive && (
          <>
            <div
              className={cn(
                "absolute -left-24 -top-24 h-80 w-80 rounded-full blur-3xl sm:h-[32rem] sm:w-[32rem]",
                theme === "CHRISTMAS" ? "bg-red-600/25" : "bg-amber-400/20"
              )}
            />
            <div
              className={cn(
                "absolute -bottom-32 right-0 h-80 w-80 rounded-full blur-3xl sm:h-[28rem] sm:w-[28rem]",
                theme === "CHRISTMAS" ? "bg-emerald-500/20" : "bg-fuchsia-500/20"
              )}
            />
          </>
        )}
        <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay" style={{ backgroundImage: GRAIN }} />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-7 flex items-end justify-between gap-4 sm:mb-12">
          <div className="max-w-2xl">
            <p data-anim="fade-up" className={cn("mb-3 text-[11px] font-extrabold uppercase tracking-[0.22em]", festive ? "text-sky-200/80" : "text-brand-ocean")}>
              {copy.kicker}
            </p>
            <h2 id="offers-heading" data-anim="heading" className="[perspective:800px] font-display text-[2rem] font-black leading-[1.05] tracking-[-0.035em] text-balance sm:text-5xl lg:text-6xl">
              {copy.title}
            </h2>
          </div>
          <Link
            href="/offers"
            className={cn(
              "hidden shrink-0 items-center gap-2 rounded-full px-5 py-3 text-xs font-extrabold uppercase tracking-[0.12em] transition active:scale-[0.97] sm:inline-flex",
              festive ? "bg-white/10 ring-1 ring-inset ring-white/15 hover:bg-white/15" : "bg-white shadow-sm ring-1 ring-slate-200 hover:ring-slate-300"
            )}
          >
            All offers <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Mobile rail → desktop asymmetric grid */}
        <div
          ref={rail}
          data-anim="stagger"
          className={cn(
            "-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 no-scrollbar scroll-px-4",
            "md:mx-0 md:grid md:snap-none md:gap-5 md:overflow-visible md:px-0 md:pb-0",
            rest.length === 0 && "md:grid-cols-1",
            rest.length === 1 && "md:grid-cols-[1.4fr_1fr]",
            rest.length === 2 && "md:grid-cols-[1.35fr_1fr] md:grid-rows-2",
            rest.length >= 3 && "md:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr] lg:grid-rows-2"
          )}
        >
          <div
            className={cn(
              "w-[88%] shrink-0 snap-start md:w-auto",
              rest.length === 2 && "md:row-span-2",
              rest.length >= 3 && "md:col-span-2 lg:col-span-1 lg:row-span-2"
            )}
          >
            <OfferCard offer={lead} variant="feature" priority />
          </div>
          {rest.map((o, i) => (
            <div key={o.id} className={cn("w-[78%] shrink-0 snap-start md:w-auto", rest.length === 3 && i === 2 && "lg:col-span-2")}>
              <OfferCard offer={o} priority={i < 1} />
            </div>
          ))}
        </div>

        {/* Mobile: position bar + CTA */}
        <div className="mt-5 flex items-center gap-4 md:hidden">
          {shown.length > 1 && (
            <div className={cn("relative h-1 flex-1 overflow-hidden rounded-full", festive ? "bg-white/10" : "bg-slate-200")} aria-hidden="true">
              <div
                className={cn("absolute inset-y-0 left-0 rounded-full transition-[width] duration-200", festive ? "bg-white" : "bg-brand-navy")}
                style={{ width: `${Math.max(1 / shown.length, progress) * 100}%` }}
              />
            </div>
          )}
          <Link
            href="/offers"
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-5 text-xs font-black uppercase tracking-[0.12em] active:scale-[0.97]",
              festive ? "bg-white text-brand-navy" : "bg-brand-navy text-white"
            )}
          >
            All {offers.length > shown.length ? offers.length : ""} offers <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
