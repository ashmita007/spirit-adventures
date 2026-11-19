"use client";

import React, { useId, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from "framer-motion";
import { ArrowRight, CalendarDays, MapPin, Mountain } from "lucide-react";
import TripCard from "@/components/trip-card";
import type { Trip } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Small } from "@/components/mix-heading";

const EASE = [0.16, 1, 0.3, 1] as const;
const ALL = "All";
const DIFFICULTY: Record<Trip["difficulty"], string> = {
  EASY: "Easy",
  MODERATE: "Moderate",
  CHALLENGING: "Challenging",
  DIFFICULT: "Difficult",
};

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

/** One large package: photo beside the facts on desktop, stacked on phones. */
function FeaturedTrip({ trip }: { trip: Trip }) {
  const place = trip.destination_name || trip.destination?.name;
  const saving = trip.original_price && trip.original_price > trip.price ? trip.original_price : null;
  return (
    <Link
      href={`/trips/${trip.slug}`}
      className="group grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_60px_-40px_rgba(6,43,73,0.55)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_70px_-36px_rgba(6,43,73,0.6)] active:translate-y-0 lg:grid-cols-12"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 sm:aspect-[16/9] lg:col-span-7 lg:aspect-auto lg:min-h-[26rem]">
        <Image
          src={trip.cover_image}
          alt={trip.title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 58vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        {trip.is_bestseller && (
          <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-navy shadow-sm">
            Bestseller
          </span>
        )}
      </div>
      <div className="flex flex-col p-5 sm:p-8 lg:col-span-5">
        {place && (
          <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-brand-ocean">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {place}
          </p>
        )}
        <h3 className="mt-2 font-display text-xl font-black leading-tight text-brand-navy transition-colors group-hover:text-brand-ocean sm:text-2xl">
          {trip.title}
        </h3>
        <p className="mt-3 line-clamp-3 text-[15px] leading-6 text-slate-600">{trip.short_description}</p>
        <dl className="mt-5 flex flex-wrap gap-2 text-xs">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 ring-1 ring-inset ring-slate-200">
            <CalendarDays className="h-3.5 w-3.5 text-brand-ocean" aria-hidden="true" />
            <dt className="sr-only">Duration</dt>
            <dd className="font-semibold text-slate-800">{trip.duration_label || `${trip.duration_days}D ${trip.duration_nights}N`}</dd>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 ring-1 ring-inset ring-slate-200">
            <Mountain className="h-3.5 w-3.5 text-brand-ocean" aria-hidden="true" />
            <dt className="sr-only">Difficulty</dt>
            <dd className="font-semibold text-slate-800">{DIFFICULTY[trip.difficulty]}</dd>
          </div>
        </dl>
        <div className="mt-6 flex items-end justify-between gap-4 border-t border-slate-100 pt-5 lg:mt-auto">
          <div>
            <p className="text-xs text-slate-500">From</p>
            <p className="font-display text-3xl font-black tracking-tight text-brand-navy">
              {inr(trip.price)}
              {saving && <span className="ml-2 align-middle text-sm font-semibold text-slate-400 line-through">{inr(saving)}</span>}
            </p>
            <p className="text-xs text-slate-500">per person</p>
          </div>
          <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-navy px-5 text-sm font-bold text-white transition-colors group-hover:bg-brand-ocean">
            View trip <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/**
 * Home packages: category tabs with a sliding pill, one featured package, then a grid
 * (a swipe row on phones). Switching a tab crossfades the featured package and lets
 * the grid re-flow with layout animation.
 */
export default function HomePackages({ trips, total }: { trips: Trip[]; total: number }) {
  const uid = useId();
  const tabs = useMemo(() => {
    const counts = new Map<string, number>();
    trips.forEach((t) => {
      const c = t.category_name || t.category?.name;
      if (c) counts.set(c, (counts.get(c) || 0) + 1);
    });
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([c]) => c);
    return top.length > 1 ? [ALL, ...top] : [];
  }, [trips]);
  const [tab, setTab] = useState(ALL);

  const list = useMemo(
    () => (tab === ALL ? trips : trips.filter((t) => (t.category_name || t.category?.name) === tab)),
    [trips, tab]
  );
  const tabSlug = tab === ALL ? "" : list[0]?.category_slug || list[0]?.category?.slug || "";
  const [featured, ...rest] = list;
  const grid = rest.slice(0, 6);

  if (!featured) return null;

  return (
    <MotionConfig reducedMotion="user">
      <section aria-labelledby={`${uid}-title`} className="relative bg-white py-12 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-5 sm:mb-10 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-ocean">{total} trips running</p>
              <h2
                id={`${uid}-title`}
                data-anim="heading"
                className="[perspective:800px] mt-1 font-display text-3xl font-black uppercase tracking-tight text-brand-navy sm:text-5xl"
              >
                Pick <Small>your next</Small> trip
              </h2>
            </div>

            {tabs.length > 0 && (
              <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
                <div role="tablist" aria-label="Filter packages" className="inline-flex gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
                  {tabs.map((t) => {
                    const active = t === tab;
                    return (
                      <button
                        key={t}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setTab(t)}
                        className={cn(
                          "relative min-h-11 whitespace-nowrap rounded-full px-4 text-sm font-bold transition-colors active:scale-[0.97]",
                          active ? "text-white" : "text-slate-600 hover:text-brand-navy"
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId={`${uid}-pill`}
                            aria-hidden="true"
                            className="absolute inset-0 rounded-full bg-brand-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                            transition={{ type: "spring", stiffness: 420, damping: 34 }}
                          />
                        )}
                        <span className="relative">{t}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div data-anim="clip">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${tab}-${featured.id}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <FeaturedTrip trip={featured} />
            </motion.div>
          </AnimatePresence>
          </div>

          {grid.length > 0 && (
            <LayoutGroup id={`${uid}-grid`}>
              <motion.ul
                layout
                data-anim="stagger"
                className="-mx-4 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-3 [scrollbar-width:none] sm:mx-0 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden"
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {grid.map((trip) => (
                    <motion.li
                      key={trip.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      className="w-[84%] shrink-0 snap-start sm:w-full"
                    >
                      <TripCard trip={trip} />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>
            </LayoutGroup>
          )}

          <div className="mt-6 flex items-center justify-between gap-4 sm:mt-10 sm:justify-center">
            <span className="text-xs font-semibold text-slate-500 sm:hidden">Swipe for more</span>
            <Link
              href={tabSlug ? `/trips?category=${encodeURIComponent(tabSlug)}` : "/trips"}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-navy px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-brand-ocean active:translate-y-0 active:scale-[0.98]"
            >
              {tabSlug ? `See all ${tab} trips` : `See all ${total} trips`} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
