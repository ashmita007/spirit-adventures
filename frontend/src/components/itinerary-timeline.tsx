"use client";

import React, { useId, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useScroll, useSpring } from "framer-motion";
import { ChevronDown, Mountain, Route, Utensils, BedDouble, ChevronsUpDown } from "lucide-react";
import type { TripItinerary } from "@/lib/types";
import { cn } from "@/lib/utils";
import { smartCase, splitStops, stripDayPrefix, stripTrailingEmoji } from "@/lib/readable-text";

const EASE = [0.16, 1, 0.3, 1] as const;

const FACT_ICONS: Record<string, React.ElementType> = {
  Altitude: Mountain,
  Distance: Route,
  Meals: Utensils,
  Stay: BedDouble,
};

function facts(day: TripItinerary): [string, string][] {
  return [
    day.altitude && ["Altitude", day.altitude],
    day.distance && ["Distance", day.distance],
    day.meals && ["Meals", day.meals],
    day.stay_type && ["Stay", day.stay_type],
  ].filter(Boolean) as [string, string][];
}

/**
 * Day-by-day plan as an animated accordion timeline.
 * - Mobile first: each day is one big tap target (min 64px), content opens with a
 *   spring-eased height animation and its stops cascade in one after another.
 * - A progress rail fills as you scroll through the days; open days' markers glow.
 * - Day 1 starts open; "Expand all" opens every day. Respects reduced motion.
 */
export default function ItineraryTimeline({ days }: { days: TripItinerary[] }) {
  const uid = useId();
  const listRef = useRef<HTMLOListElement>(null);
  const [open, setOpen] = useState<Set<number>>(() => new Set([0]));
  const allOpen = open.size === days.length;

  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 75%", "end 60%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <MotionConfig reducedMotion="user">
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setOpen(allOpen ? new Set() : new Set(days.map((_, i) => i)))}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 text-xs font-bold text-brand-navy shadow-sm transition hover:border-brand-ocean active:scale-[0.97]"
        >
          <ChevronsUpDown className="h-3.5 w-3.5" />
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>

      <ol ref={listRef} className="relative space-y-3 sm:space-y-4">
        {/* Rail: faint track + scroll-linked fill */}
        <span aria-hidden="true" className="absolute bottom-6 left-[21px] top-6 w-[2px] rounded-full bg-slate-200 sm:left-[25px]" />
        <motion.span
          aria-hidden="true"
          style={{ scaleY: fill }}
          className="absolute bottom-6 left-[21px] top-6 w-[2px] origin-top rounded-full bg-gradient-to-b from-brand-sky via-brand-ocean to-brand-navy sm:left-[25px]"
        />

        {days.map((day, idx) => {
          const dayNum = day.day_number || idx + 1;
          const isOpen = open.has(idx);
          const title = smartCase(stripTrailingEmoji(stripDayPrefix(day.title || ""))) || `Day ${dayNum}`;
          const stops = splitStops(day.description || "");
          const f = facts(day);
          const panelId = `${uid}-day-${idx}`;
          const preview = [
            stops.length ? `${stops.length} stops` : "",
            ...f.filter(([k]) => k === "Meals" || k === "Stay").map(([, v]) => v),
          ].filter(Boolean).join(" · ");

          return (
            <motion.li
              key={`${dayNum}-${idx}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, ease: EASE, delay: Math.min(idx, 5) * 0.05 }}
              className="relative pl-14 sm:pl-16"
            >
              {/* Day marker */}
              <motion.span
                aria-hidden="true"
                animate={isOpen ? { scale: 1, backgroundColor: "#0b1736" } : { scale: 0.86, backgroundColor: "#ffffff" }}
                transition={{ type: "spring", stiffness: 420, damping: 26 }}
                className={cn(
                  "absolute left-0 top-3 z-10 grid h-11 w-11 place-items-center rounded-2xl text-sm font-black tabular-nums ring-4 ring-white sm:h-[52px] sm:w-[52px]",
                  isOpen ? "text-white shadow-[0_8px_24px_-6px_rgba(2,132,199,0.55)]" : "border border-slate-200 text-brand-navy"
                )}
              >
                {String(dayNum).padStart(2, "0")}
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0.6, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.6 }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                    className="absolute inset-0 rounded-2xl ring-2 ring-brand-sky"
                  />
                )}
              </motion.span>

              <div
                className={cn(
                  "overflow-hidden rounded-2xl border bg-white transition-[border-color,box-shadow] duration-300",
                  isOpen
                    ? "border-brand-ocean/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_18px_40px_-24px_rgba(11,23,54,0.45)]"
                    : "border-slate-200 shadow-sm hover:border-slate-300"
                )}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left sm:px-5 sm:py-4 active:bg-slate-50"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-extrabold uppercase tracking-[0.16em] text-brand-ocean">Day {dayNum}</span>
                    <span className="mt-0.5 block font-display text-[17px] font-bold leading-snug tracking-[-0.01em] text-brand-navy sm:text-lg">
                      {title}
                    </span>
                    <AnimatePresence initial={false}>
                      {!isOpen && preview && (
                        <motion.span
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="block truncate text-xs text-slate-500"
                        >
                          {preview}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 380, damping: 24 }}
                    className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors",
                      isOpen ? "bg-brand-navy text-white" : "bg-slate-100 text-slate-600"
                    )}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      key="panel"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ height: { duration: 0.45, ease: EASE }, opacity: { duration: 0.25 } }}
                    >
                      <motion.div
                        initial="hidden"
                        animate="show"
                        variants={{ show: { transition: { staggerChildren: 0.045, delayChildren: 0.08 } } }}
                        className="border-t border-slate-100 px-4 pb-5 pt-4 sm:px-5"
                      >
                        {stops.length > 0 ? (
                          <ul className="grid grid-cols-1 gap-x-6 gap-y-2.5 text-[15px] leading-6 text-slate-700 sm:grid-cols-2">
                            {stops.map((s, i) => (
                              <motion.li
                                key={i}
                                variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: EASE } } }}
                                className="flex items-start gap-2.5"
                              >
                                <span aria-hidden="true" className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-sky-50 text-[13px]">
                                  {s.icon || "•"}
                                </span>
                                <span>{s.label}</span>
                              </motion.li>
                            ))}
                          </ul>
                        ) : day.description ? (
                          <motion.p
                            variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }}
                            className="max-w-[68ch] whitespace-pre-line text-[16px] leading-7 text-slate-700"
                          >
                            {day.description}
                          </motion.p>
                        ) : null}

                        {f.length > 0 && (
                          <motion.dl
                            variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }}
                            className="mt-4 flex flex-wrap gap-2"
                          >
                            {f.map(([k, v]) => {
                              const Icon = FACT_ICONS[k];
                              return (
                                <div key={k} className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs text-slate-600 ring-1 ring-inset ring-slate-200">
                                  {Icon && <Icon className="h-3.5 w-3.5 text-brand-ocean" aria-hidden="true" />}
                                  <dt className="sr-only">{k}</dt>
                                  <dd className="font-semibold text-slate-800">{v}</dd>
                                </div>
                              );
                            })}
                          </motion.dl>
                        )}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </MotionConfig>
  );
}
