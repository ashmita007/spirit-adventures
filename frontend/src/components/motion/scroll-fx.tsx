"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { Flag, Footprints } from "lucide-react";

/**
 * Site-wide scroll effects, mounted once in the root layout.
 *
 * 1. Trail: a dotted trail on the right edge draws as the page scrolls; a hiker
 *    marker walks down it and reaches a flag at the end of the page.
 * 2. Speed: scroll velocity is written to `--sa-v` (0 to 1, eased back to 0) on
 *    <html>. CSS uses it to stretch photos slightly while scrolling fast.
 * 3. Headings: section headings drift sideways a little as they cross the screen
 *    (CSS `translate`, so it composes with their own entrance transforms).
 * 4. Trail words: the small words inside headlines play their trail animation as they
 *    enter view; each is told whether its headline sits on a dark or light ground.
 *
 * Reduced motion: no speed stretch, drift or trail animation; the page trail still shows progress.
 */
export default function ScrollFx() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [tall, setTall] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 });
  const hikerTop = useTransform(progress, (v) => `${v * 100}%`);

  // Show the trail only on pages that are at least two screens long.
  useEffect(() => {
    const check = () => setTall(document.documentElement.scrollHeight > window.innerHeight * 2);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, [pathname]);

  // Scroll speed to --sa-v.
  useEffect(() => {
    if (reduce) return;
    const root = document.documentElement;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let v = 0;
    let raf = 0;
    const tick = () => {
      const now = performance.now();
      const y = window.scrollY;
      const speed = Math.abs(y - lastY) / Math.max(1, now - lastT); // px per ms
      lastY = y;
      lastT = now;
      const target = Math.min(1, speed / 4);
      v += (target - v) * (target > v ? 0.35 : 0.08);
      if (v < 0.01 && target < 0.01) v = 0;
      root.style.setProperty("--sa-v", v === 0 ? "0" : v.toFixed(3));
      raf = v === 0 ? 0 : requestAnimationFrame(tick);
    };
    const onScroll = () => {
      if (!raf) {
        lastT = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      root.style.removeProperty("--sa-v");
    };
  }, [reduce]);

  // Headings drift sideways across their pass through the screen.
  useEffect(() => {
    if (reduce) return;
    const heads = Array.from(document.querySelectorAll<HTMLElement>("main h2:not([data-no-drift])"));
    if (!heads.length) return;
    const visible = new Set<HTMLElement>();
    const io = new IntersectionObserver((entries) =>
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target as HTMLElement) : visible.delete(e.target as HTMLElement)))
    );
    heads.forEach((h) => io.observe(h));
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const amp = window.innerWidth < 768 ? 10 : 28;
      visible.forEach((h) => {
        const r = h.getBoundingClientRect();
        const p = (r.top + r.height / 2) / vh; // 1 at the bottom edge, 0 at the top
        const odd = heads.indexOf(h) % 2 === 1 ? -1 : 1;
        h.style.translate = `${((p - 0.5) * 2 * amp * odd).toFixed(1)}px 0`;
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      io.disconnect();
      heads.forEach((h) => (h.style.translate = ""));
    };
  }, [pathname, reduce]);

  // Trail words: dark or light ground (always), then hidden ("ready") and played ("in") in view.
  useEffect(() => {
    document.querySelectorAll<HTMLElement>("[data-sticker-word]").forEach((w) => {
      const [r, g, b] = (getComputedStyle(w.parentElement || w).color.match(/[\d.]+/g) || ["0", "0", "0"]).map(Number);
      w.dataset.ground = 0.2126 * r + 0.7152 * g + 0.0722 * b > 150 ? "dark" : "light";
    });
    if (reduce) return;
    const words = Array.from(document.querySelectorAll<HTMLElement>("[data-sticker-word]:not([data-sw])"));
    if (!words.length) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          el.dataset.sw = "in";
          io.unobserve(el);
        }),
      { rootMargin: "0px 0px -12% 0px" }
    );
    words.forEach((w) => {
      w.dataset.sw = "ready";
      io.observe(w);
    });
    return () => io.disconnect();
  }, [pathname, reduce]);

  if (!tall) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed right-1.5 top-[22vh] z-30 h-[46vh] w-6 sm:right-3 md:top-[24vh] md:h-[52vh]"
    >
      {/* Dotted trail ahead, solid trail walked */}
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 [background:repeating-linear-gradient(to_bottom,rgba(10,111,174,0.45)_0_3px,transparent_3px_8px)]" />
      <motion.span
        className="absolute left-1/2 top-0 h-full w-[2px] origin-top -translate-x-1/2 rounded-full bg-brand-ocean"
        style={{ scaleY: progress }}
      />
      <span className="absolute -bottom-2 left-1/2 grid h-5 w-5 -translate-x-1/2 place-items-center rounded-full bg-white text-brand-ocean shadow ring-1 ring-brand-ocean/30">
        <Flag className="h-3 w-3" />
      </span>
      <motion.span
        className="absolute left-1/2 grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand-ocean text-white shadow-[0_0_0_2px_#fff,0_4px_10px_-2px_rgba(2,20,40,0.5)]"
        style={{ top: hikerTop }}
      >
        <Footprints className="h-3.5 w-3.5 rotate-180" />
      </motion.span>
    </div>
  );
}
