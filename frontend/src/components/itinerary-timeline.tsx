"use client";

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { MotionConfig, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, BedDouble, Info, Mountain, Route, Utensils } from "lucide-react";
import type { TripItinerary } from "@/lib/types";
import { cn } from "@/lib/utils";
import { parseDayPlan, smartCase, stripDayPrefix, stripTrailingEmoji, type PlanItem } from "@/lib/readable-text";

const EASE = [0.16, 1, 0.3, 1] as const;

const FACT_ICONS: Record<string, React.ElementType> = {
  Altitude: Mountain,
  Distance: Route,
  Meals: Utensils,
  Stay: BedDouble,
};

type Day = {
  num: number;
  anchor: string;
  title: string;
  plan: PlanItem[];
  facts: [string, string][];
};

function facts(day: TripItinerary): [string, string][] {
  return [
    day.altitude && ["Altitude", day.altitude],
    day.distance && ["Distance", day.distance],
    day.meals && ["Meals", day.meals],
    day.stay_type && ["Stay", day.stay_type],
  ].filter(Boolean) as [string, string][];
}

const stepVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

/**
 * Day-by-day plan, written as numbered steps.
 * - A sticky day stepper on top shows where you are and jumps to any day.
 * - Each day lists its stops in order on a vertical route line; group labels
 *   ("Places covered"), notes and excluded extras are set apart from the steps.
 * - "Next: Day N" at the end of a day walks the plan one day at a time.
 * All days stay in the DOM (readable and indexable); motion respects reduced motion.
 */
export default function ItineraryTimeline({ days }: { days: TripItinerary[] }) {
  const uid = useId().replace(/:/g, "");
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const dayRefs = useRef<(HTMLLIElement | null)[]>([]);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const railRef = useRef<HTMLDivElement>(null);
  // While a jump is scrolling, ignore the days passed on the way.
  const jumping = useRef<number | null>(null);

  const model: Day[] = useMemo(
    () =>
      days.map((d, i) => {
        const num = d.day_number || i + 1;
        return {
          num,
          anchor: `${uid}-day-${i}`,
          title: smartCase(stripTrailingEmoji(stripDayPrefix(d.title || ""))) || `Day ${num}`,
          plan: parseDayPlan(d.description || ""),
          facts: facts(d),
        };
      }),
    [days, uid]
  );

  // Track the day nearest the middle of the screen.
  useEffect(() => {
    const els = dayRefs.current.filter(Boolean) as HTMLLIElement[];
    if (!els.length || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (jumping.current !== null) return;
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [model.length]);

  // Keep the active chip visible inside the horizontal stepper without moving the page.
  useEffect(() => {
    const rail = railRef.current;
    const chip = chipRefs.current[active];
    if (!rail || !chip) return;
    const left = chip.offsetLeft - rail.clientWidth / 2 + chip.clientWidth / 2;
    rail.scrollTo({ left: Math.max(0, left), behavior: reduce ? "auto" : "smooth" });
  }, [active, reduce]);

  const goTo = useCallback(
    (i: number) => {
      const el = dayRefs.current[i];
      if (!el) return;
      setActive(i);
      if (jumping.current !== null) window.clearTimeout(jumping.current);
      const release = () => {
        if (jumping.current !== null) window.clearTimeout(jumping.current);
        jumping.current = null;
        window.removeEventListener("scrollend", release);
      };
      window.addEventListener("scrollend", release, { once: true });
      jumping.current = window.setTimeout(release, 1200); // fallback where scrollend is unsupported
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    },
    [reduce]
  );

  useEffect(
    () => () => {
      if (jumping.current !== null) window.clearTimeout(jumping.current);
    },
    []
  );

  // Sit the sticky stepper just under the fixed site header, whatever its height.
  const [stickyTop, setStickyTop] = useState(72);
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("body header");
    if (!header) return;
    // The header can move (festive banner dismissed) as well as resize, so re-read it
    // on resize and scroll, at most once per frame.
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setStickyTop(Math.max(0, Math.round(header.getBoundingClientRect().bottom)) + 8));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(header);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, []);

  const progress = model.length > 1 ? active / (model.length - 1) : 1;

  return (
    <MotionConfig reducedMotion="user">
      {/* Day stepper */}
      {model.length > 1 && (
        <nav
          aria-label="Days of this trip"
          style={{ top: stickyTop }}
          className="sticky z-20 -mx-4 mb-6 border-y border-slate-200/80 bg-white/90 px-4 py-2.5 backdrop-blur-md sm:mx-0 sm:rounded-2xl sm:border sm:px-3 sm:shadow-[0_8px_30px_-18px_rgba(6,43,73,0.35)]"
        >
          <div ref={railRef} className="relative overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <ol className="relative flex min-w-max items-center gap-1">
              {model.map((d, i) => {
                const isActive = i === active;
                const done = i < active;
                return (
                  <li key={d.anchor} className="flex items-center">
                    {i > 0 && (
                      <span aria-hidden="true" className="relative mx-1 h-[2px] w-5 overflow-hidden rounded-full bg-slate-200 sm:w-8">
                        <motion.span
                          className="absolute inset-0 origin-left bg-brand-ocean"
                          initial={false}
                          animate={{ scaleX: i <= active ? 1 : 0 }}
                          transition={{ duration: 0.35, ease: EASE }}
                        />
                      </span>
                    )}
                    <button
                      ref={(el) => {
                        chipRefs.current[i] = el;
                      }}
                      type="button"
                      onClick={() => goTo(i)}
                      aria-current={isActive ? "step" : undefined}
                      aria-label={`Day ${d.num}: ${d.title}`}
                      className={cn(
                        "relative flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-bold transition-colors active:scale-[0.97]",
                        isActive ? "text-white" : done ? "text-brand-ocean hover:bg-sky-50" : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      {isActive && (
                        <motion.span
                          layoutId={`${uid}-chip`}
                          aria-hidden="true"
                          className="absolute inset-0 rounded-full bg-brand-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_6px_16px_-6px_rgba(6,43,73,0.6)]"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        />
                      )}
                      <span
                        className={cn(
                          "relative grid h-6 w-6 place-items-center rounded-full text-[11px] tabular-nums",
                          isActive ? "bg-white/15" : done ? "bg-sky-100" : "bg-slate-100"
                        )}
                      >
                        {d.num}
                      </span>
                      <span className="relative max-w-[11rem] truncate">{isActive ? d.title : `Day ${d.num}`}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
          <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px] overflow-hidden sm:inset-x-4 sm:rounded-full">
            <motion.span
              className="block h-full origin-left bg-gradient-to-r from-brand-sky to-brand-ocean"
              initial={false}
              animate={{ scaleX: progress }}
              transition={{ duration: 0.45, ease: EASE }}
            />
          </span>
        </nav>
      )}

      <ol className="space-y-6 sm:space-y-8">
        {model.map((d, i) => {
          const next = model[i + 1];
          const stepCount = d.plan.filter((p) => p.kind === "step").length;
          let stepNo = 0;
          return (
            <li
              key={d.anchor}
              id={d.anchor}
              data-index={i}
              ref={(el) => {
                dayRefs.current[i] = el;
              }}
              style={{ scrollMarginTop: stickyTop + 72 }}
            >
              <motion.article
                {...(reduce
                  ? { initial: false, animate: { opacity: 1, y: 0 } }
                  : { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } })}
                viewport={{ once: true, margin: "0px 0px -60px 0px" }}
                transition={{ duration: 0.5, ease: EASE }}
                aria-labelledby={`${d.anchor}-title`}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_20px_44px_-30px_rgba(6,43,73,0.45)]"
              >
                {/* Day header */}
                <header className="relative flex gap-4 border-b border-slate-100 bg-gradient-to-br from-brand-light via-white to-white p-4 sm:gap-5 sm:p-6">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-navy text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_10px_22px_-10px_rgba(6,43,73,0.7)] sm:h-16 sm:w-16">
                    <span className="text-center leading-none">
                      <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-brand-sky">Day</span>
                      <span className="mt-0.5 block font-display text-2xl font-black tabular-nums sm:text-[1.7rem]">
                        {String(d.num).padStart(2, "0")}
                      </span>
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 id={`${d.anchor}-title`} className="font-display text-lg font-bold leading-snug tracking-[-0.01em] text-brand-navy sm:text-xl">
                      {d.title}
                    </h3>
                    {stepCount > 0 && (
                      <p className="mt-0.5 text-sm text-slate-500">
                        {stepCount} {stepCount === 1 ? "step" : "steps"}
                      </p>
                    )}
                    {d.facts.length > 0 && (
                      <dl className="mt-3 flex flex-wrap gap-2">
                        {d.facts.map(([k, v]) => {
                          const Icon = FACT_ICONS[k];
                          return (
                            <div
                              key={k}
                              className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs text-slate-600 ring-1 ring-inset ring-slate-200"
                            >
                              {Icon && <Icon className="h-3.5 w-3.5 text-brand-ocean" aria-hidden="true" />}
                              <dt className="font-medium text-slate-500">{k}</dt>
                              <dd className="font-semibold text-slate-800">{v}</dd>
                            </div>
                          );
                        })}
                      </dl>
                    )}
                  </div>
                </header>

                {/* Steps */}
                {d.plan.length > 0 && (
                  <motion.ol
                    {...(reduce ? { initial: false, animate: "show" } : { initial: "hidden", whileInView: "show" })}
                    viewport={{ once: true, margin: "0px 0px -40px 0px" }}
                    variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } }}
                    className="relative px-4 py-5 sm:px-6 sm:py-6"
                  >
                    {d.plan.map((item, j) => {
                      const key = `${d.anchor}-${j}`;
                      if (item.kind === "group") {
                        return (
                          <motion.li
                            key={key}
                            variants={stepVariants}
                            className="pb-2 pl-14 pt-3 text-[11px] font-extrabold uppercase tracking-[0.16em] text-brand-ocean first:pt-0 sm:pl-[60px]"
                          >
                            {item.label}
                          </motion.li>
                        );
                      }
                      if (item.kind === "note") {
                        return (
                          <motion.li key={key} variants={stepVariants} className="py-1.5 pl-14 sm:pl-[60px]">
                            <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-sm leading-6 text-amber-900 ring-1 ring-inset ring-amber-200/70">
                              <Info className="mt-1 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                              <span>
                                <span className="font-semibold">Note: </span>
                                {item.label}
                              </span>
                            </p>
                          </motion.li>
                        );
                      }
                      if (item.kind === "summary") {
                        return (
                          <motion.li key={key} variants={stepVariants} className="py-2 pl-14 sm:pl-[60px]">
                            <p className="max-w-[62ch] text-[15px] leading-7 text-slate-600">{item.label}</p>
                          </motion.li>
                        );
                      }
                      stepNo += 1;
                      const isLast = stepNo === stepCount;
                      return (
                        <motion.li key={key} variants={stepVariants} className="group relative flex gap-3 sm:gap-4">
                          {/* Route line to the next step */}
                          {!isLast && (
                            <motion.span
                              aria-hidden="true"
                              variants={{ hidden: { scaleY: 0 }, show: { scaleY: 1, transition: { duration: 0.45, ease: EASE, delay: 0.15 } } }}
                              className="absolute bottom-0 left-[17px] top-10 w-[2px] origin-top rounded-full bg-gradient-to-b from-brand-sky to-sky-200"
                            />
                          )}
                          <motion.span
                            aria-hidden="true"
                            variants={{ hidden: { scale: 0.4, opacity: 0 }, show: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 520, damping: 26 } } }}
                            className={cn(
                              "relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full text-base ring-4 ring-white group-hover:ring-sky-50",
                              item.icon ? "bg-sky-50" : "bg-brand-navy text-xs font-bold text-white tabular-nums",
                              item.excluded && "opacity-60 grayscale"
                            )}
                          >
                            {item.icon || stepNo}
                          </motion.span>
                          <div className={cn("min-w-0 flex-1 rounded-xl px-2 py-1 transition-colors group-hover:bg-slate-50", isLast ? "mb-0" : "mb-1.5")}>
                            <span className="block text-[11px] font-semibold leading-4 tabular-nums text-slate-400">Step {stepNo}</span>
                            <p className={cn("text-[15px] font-medium leading-6 text-slate-800 sm:text-base", item.excluded && "text-slate-500")}>
                              {item.label}
                              {item.excluded && (
                                <span className="ml-2 inline-flex rounded-full bg-slate-100 px-2 py-0.5 align-middle text-[11px] font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
                                  Not included
                                </span>
                              )}
                            </p>
                          </div>
                        </motion.li>
                      );
                    })}
                  </motion.ol>
                )}

                {next && (
                  <div className="border-t border-slate-100 px-4 py-3 sm:px-6">
                    <button
                      type="button"
                      onClick={() => goTo(i + 1)}
                      className="group/next flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-2 text-left text-sm font-semibold text-brand-navy transition hover:bg-slate-50 active:scale-[0.99]"
                    >
                      <span className="min-w-0 truncate">
                        <span className="text-slate-500">Next: Day {next.num} · </span>
                        {next.title}
                      </span>
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-navy text-white transition-transform duration-300 group-hover/next:translate-y-0.5">
                        <ArrowDown className="h-4 w-4" aria-hidden="true" />
                      </span>
                    </button>
                  </div>
                )}
              </motion.article>
            </li>
          );
        })}
      </ol>
    </MotionConfig>
  );
}
