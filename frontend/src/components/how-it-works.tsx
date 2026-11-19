"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const CDN = "https://res.cloudinary.com/xvxaicfe/image/upload/w_1600,c_limit,f_auto,q_auto";

const STEPS = [
  {
    title: "Pick a trip and a date",
    body: "Filter by weekend getaways, treks, water sports or couple trips, then choose a batch date that suits you.",
    photo: `${CDN}/v1790341328/spirit_adventures/shorts/chikmagalur_peak_poster.jpg`,
    alt: "Trekkers on the Chikmagalur ridge",
  },
  {
    title: "Book on WhatsApp",
    body: "Send us the trip name. A planner confirms your seat, pickup point and what to pack, usually the same day.",
    photo: `${CDN}/v1790341329/spirit_adventures/shorts/ooty_train_poster.jpg`,
    alt: "The Nilgiri toy train on the way to Ooty",
  },
  {
    title: "Travel with your trip captain",
    body: "Your captain meets the group at pickup and handles transport, stays and timings until you are home.",
    photo: `${CDN}/v1790341326/spirit_adventures/shorts/gokarna_beach_poster.jpg`,
    alt: "A Spirit Adventures group on the beach at Gokarna",
  },
];

/**
 * "How a trip works" as pinned chapters (desktop): the section is two screens tall,
 * its inner frame sticks while the three steps pass; the step nearest the middle of
 * the screen is lit and the picture beside it crossfades to that step's photograph.
 * Phones get the steps stacked, each with its own photograph, no pinning.
 */
export default function HowItWorks() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const els = stepRefs.current.filter(Boolean) as HTMLLIElement[];
    if (!els.length || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step));
        }),
      { rootMargin: "-45% 0px -45% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section aria-labelledby="how-title" className="relative bg-white py-14 sm:py-24 lg:py-0">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 lg:grid lg:min-h-[200svh] lg:grid-cols-12 lg:gap-12">
        {/* Steps */}
        <div className="lg:col-span-5 lg:py-[24svh]">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-ocean">How a trip works</p>
          <h2
            id="how-title"
            data-anim="heading"
            className="[perspective:800px] mt-1 font-display text-3xl font-black uppercase tracking-tight text-brand-navy sm:text-5xl"
          >
            Three steps to the trail
          </h2>

          <ol data-anim="stagger" className="mt-8 space-y-8 lg:mt-12 lg:space-y-[18svh]">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                data-step={i}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
                className={cn(
                  "relative border-l-2 pl-5 transition-colors duration-500 lg:pl-6",
                  i === active ? "border-brand-ocean" : "border-slate-200"
                )}
              >
                <span
                  className={cn(
                    "font-display text-sm font-black tabular-nums transition-colors duration-500",
                    i === active ? "text-brand-ocean" : "text-slate-400"
                  )}
                >
                  0{i + 1}
                </span>
                <h3
                  className={cn(
                    "mt-1 font-display text-xl font-bold leading-snug transition-colors duration-500 sm:text-2xl",
                    i === active ? "text-brand-navy" : "text-slate-500 lg:text-slate-400"
                  )}
                >
                  {s.title}
                </h3>
                <p className="mt-2 max-w-md text-[15px] leading-7 text-slate-600">{s.body}</p>

                {/* Phone: each step carries its own photograph */}
                <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 lg:hidden">
                  <Image src={s.photo} alt={s.alt} fill sizes="100vw" className="object-cover" />
                </div>
              </li>
            ))}
          </ol>

          <Link
            href="/trips"
            className="mt-10 inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-navy px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-brand-ocean active:translate-y-0 active:scale-[0.98] lg:mb-[24svh]"
          >
            Find your trip <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Desktop: one pinned frame that changes with the lit step */}
        <div className="hidden lg:col-span-7 lg:block">
          <div className="sticky top-0 flex h-[100svh] items-center pb-12 pt-36">
            <div className="relative h-full max-h-[44rem] w-full overflow-hidden rounded-3xl bg-slate-100 shadow-[0_30px_70px_-40px_rgba(6,43,73,0.6)]">
              <AnimatePresence initial={false}>
                <motion.div
                  key={active}
                  className="absolute inset-0"
                  initial={reduce ? false : { opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Image src={STEPS[active].photo} alt={STEPS[active].alt} fill sizes="58vw" className="object-cover" />
                </motion.div>
              </AnimatePresence>
              <div aria-hidden="true" className="absolute bottom-5 left-5 flex gap-1.5">
                {STEPS.map((_, i) => (
                  <span
                    key={i}
                    className={cn("h-1.5 rounded-full bg-white/90 transition-all duration-500", i === active ? "w-8" : "w-1.5 bg-white/50")}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
