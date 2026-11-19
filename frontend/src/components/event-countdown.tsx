"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";

function parts(ms: number) {
  const s = Math.floor(ms / 1000);
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

/** One digit that rolls up when it changes. */
function Digit({ value }: { value: string }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.62em] overflow-hidden align-top">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 text-center"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Unit({ n, label, pad = 2 }: { n: number; label: string; pad?: number }) {
  const str = String(n).padStart(pad, "0");
  return (
    <div className="flex flex-col items-center">
      <span className="font-display text-5xl font-black leading-none tabular-nums tracking-tight sm:text-7xl lg:text-8xl">
        {Array.from(str).map((c, i) => (
          <Digit key={`${str.length}-${i}`} value={c} />
        ))}
      </span>
      <span className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">{label}</span>
    </div>
  );
}

/**
 * Large live countdown to the end of an event or offer (end of that day, local time).
 * Digits roll as they change; reduced motion swaps them without movement.
 * Renders nothing before hydration or once the date has passed.
 */
export default function EventCountdown({ until, label }: { until: string; label: string }) {
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

  return (
    <MotionConfig reducedMotion="user">
      <div role="timer" aria-label={`${label} ${d} days ${h} hours ${m} minutes`}>
        <p className="text-center text-xs font-bold uppercase tracking-[0.22em] text-white/70" aria-hidden="true">
          {label}
        </p>
        <div className="mt-4 flex items-start justify-center gap-4 sm:gap-8" aria-hidden="true">
          <Unit n={d} label="Days" pad={d > 99 ? 3 : 2} />
          <span className="font-display text-5xl font-black leading-none text-white/30 sm:text-7xl lg:text-8xl">:</span>
          <Unit n={h} label="Hours" />
          <span className="font-display text-5xl font-black leading-none text-white/30 sm:text-7xl lg:text-8xl">:</span>
          <Unit n={m} label="Mins" />
          <span className="hidden font-display text-5xl font-black leading-none text-white/30 sm:inline sm:text-7xl lg:text-8xl">:</span>
          <div className="hidden sm:block">
            <Unit n={s} label="Secs" />
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
