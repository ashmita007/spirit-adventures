"use client";

import React, { useEffect, useRef } from "react";
import { animate, useReducedMotion } from "framer-motion";

/**
 * A number that counts up from 0 when `run` turns true (once). Renders the final
 * formatted value on the server and for reduced-motion visitors.
 */
export default function CountUp({ value, format, run = true }: { value: number; format: (n: number) => string; run?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !run || done.current || reduce) return;
    done.current = true;
    const controls = animate(0, value, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (n) => (el.textContent = format(Math.round(n))),
    });
    return () => controls.stop();
  }, [run, value, format, reduce]);

  return <span ref={ref}>{format(value)}</span>;
}
