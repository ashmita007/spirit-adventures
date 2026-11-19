"use client";

import React, { useEffect, useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const TONES = {
  white: "bg-white text-brand-navy",
  sky: "bg-brand-sky text-brand-navy",
  sun: "bg-amber-300 text-brand-navy",
  coral: "bg-rose-400 text-white",
} as const;

/**
 * Reduced-motion preference, applied only after mount. The server cannot know it,
 * so the first client render must match the server's markup to hydrate cleanly.
 */
function useReducedAfterMount() {
  const prefers = useReducedMotion();
  const [reduce, setReduce] = useState(false);
  useEffect(() => setReduce(Boolean(prefers)), [prefers]);
  return reduce;
}

/**
 * A die-cut sticker: thick white edge, slight tilt, soft drop shadow.
 * It pops in when it enters view, bobs gently, straightens and lifts on hover,
 * and can be dragged around (it springs back home when let go).
 * Reduced motion: shown flat in place, no bob, pop or drag.
 */
export function Sticker({
  children,
  tone = "white",
  rotate = -6,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof TONES;
  rotate?: number;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedAfterMount();
  const sticker = (
    <span
      className={cn(
        "inline-flex select-none items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 font-display text-xs font-black uppercase tracking-wide shadow-[0_0_0_3px_#fff,0_10px_20px_-8px_rgba(2,20,40,0.6)] sm:text-sm",
        TONES[tone]
      )}
    >
      {children}
    </span>
  );

  if (reduce) {
    return (
      <span className={cn("inline-block", className)} style={{ transform: `rotate(${rotate}deg)` }}>
        {sticker}
      </span>
    );
  }

  return (
    <motion.span
      className={cn("inline-block cursor-grab touch-none active:cursor-grabbing", className)}
      initial={{ opacity: 0, scale: 0.4, rotate: rotate - 25 }}
      whileInView={{ opacity: 1, scale: 1, rotate }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ type: "spring", stiffness: 260, damping: 14, delay }}
      whileHover={{ scale: 1.1, rotate: 0 }}
      whileTap={{ scale: 0.95 }}
      drag
      dragSnapToOrigin
      dragElastic={0.6}
      dragTransition={{ bounceStiffness: 300, bounceDamping: 14 }}
    >
      <motion.span
        className="inline-block"
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 3.2 + (Math.abs(rotate) % 3) * 0.4, repeat: Infinity, ease: "easeInOut", delay: delay + 0.6 }}
      >
        {sticker}
      </motion.span>
    </motion.span>
  );
}

/**
 * A round sticker button: its label runs round the edge and slowly spins,
 * an arrow sits in the middle. Floats like the stickers; presses on click.
 */
export function SpinSticker({ href, label, className }: { href: string; label: string; className?: string }) {
  const id = useId().replace(/:/g, "");
  const reduce = useReducedAfterMount();
  const text = `${label} • ${label} • `;
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cn(
        "group relative grid h-28 w-28 place-items-center rounded-full bg-amber-300 text-brand-navy shadow-[0_0_0_4px_#fff,0_18px_30px_-12px_rgba(2,20,40,0.7)] sm:h-32 sm:w-32",
        className
      )}
      initial={reduce ? false : { opacity: 0, scale: 0.4, rotate: -40 }}
      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 220, damping: 13, delay: 0.3 }}
      whileHover={reduce ? undefined : { scale: 1.08 }}
      whileTap={reduce ? undefined : { scale: 0.94 }}
    >
      <svg
        viewBox="0 0 100 100"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full animate-[spin_14s_linear_infinite] motion-reduce:animate-none group-hover:[animation-duration:5s]"
      >
        <defs>
          <path id={`${id}-ring`} d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
        </defs>
        <text className="fill-current font-display text-[9px] font-black uppercase">
          {/* Stretch the label to exactly one lap of the ring (2π × 38) so it never overlaps */}
          <textPath href={`#${id}-ring`} textLength={238} lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </svg>
      <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-navy text-white transition-transform duration-300 group-hover:rotate-45">
        <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
      </span>
    </motion.a>
  );
}
