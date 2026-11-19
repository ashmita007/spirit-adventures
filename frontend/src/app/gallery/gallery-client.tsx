"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LayoutGroup, MotionConfig, motion } from "framer-motion";
import { ArrowUpRight, Maximize2 } from "lucide-react";
import { GalleryImage } from "@/lib/types";
import { cn } from "@/lib/utils";
import Lightbox from "@/components/lightbox";

interface GalleryClientProps {
  initialImages: GalleryImage[];
}

const ALL = "All";
const STEP = 24;
const EASE = [0.16, 1, 0.3, 1] as const;
// Repeating tile shapes give the masonry columns their uneven rhythm.
const SHAPES = ["aspect-[4/5]", "aspect-square", "aspect-[3/4]", "aspect-[4/3]", "aspect-[4/5]", "aspect-[2/3]"];

/** Column count for the current width (2 / 3 / 4), measured after mount. */
function useColumns() {
  const [cols, setCols] = useState(2);
  useEffect(() => {
    const lg = window.matchMedia("(min-width: 1024px)");
    const md = window.matchMedia("(min-width: 768px)");
    const update = () => setCols(lg.matches ? 4 : md.matches ? 3 : 2);
    update();
    lg.addEventListener("change", update);
    md.addEventListener("change", update);
    return () => {
      lg.removeEventListener("change", update);
      md.removeEventListener("change", update);
    };
  }, []);
  return cols;
}

/**
 * Gallery: every curated photo plus every trip photo, in masonry columns.
 * Filters are built from the photos' own categories. Photos load in batches of 24:
 * the next batch arrives when the end of the grid scrolls into view (a button
 * does the same for keyboard users). Each tile develops from grey to colour as it
 * enters; trip photos link to their trip.
 */
export default function GalleryClient({ initialImages }: GalleryClientProps) {
  const [selected, setSelected] = useState(ALL);
  const [count, setCount] = useState(STEP);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const cols = useColumns();

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    initialImages.forEach((img) => img.category && counts.set(img.category, (counts.get(img.category) || 0) + 1));
    return [ALL, ...[...counts.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c)];
  }, [initialImages]);

  const filtered = useMemo(
    () => (selected === ALL ? initialImages : initialImages.filter((img) => img.category === selected)),
    [initialImages, selected]
  );
  const shown = filtered.slice(0, count);
  // Photo i always goes to column i % cols, so loading more never reshuffles what is on screen.
  const columns = Array.from({ length: cols }, (_, c) => shown.map((img, i) => ({ img, i })).filter(({ i }) => i % cols === c));
  const left = filtered.length - shown.length;

  // Load the next batch as the end of the grid approaches.
  useEffect(() => {
    const el = sentinel.current;
    if (!el || left <= 0 || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => entries[0]?.isIntersecting && setCount((c) => c + STEP),
      { rootMargin: "600px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [left]);

  const choose = (cat: string) => {
    setSelected(cat);
    setCount(STEP);
  };

  const lightboxImages = filtered.map((img) => ({
    url: img.image_url,
    title: img.title,
    caption: [img.location, img.caption].filter(Boolean).join(", "),
  }));

  return (
    <MotionConfig reducedMotion="user">
      <div>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 sm:mb-8">
          <p className="text-sm font-semibold text-slate-500">
            <span className="font-display text-2xl font-black text-brand-navy">{filtered.length}</span> photos
            {selected !== ALL && <> in {selected}</>}
          </p>
        </div>

        <LayoutGroup id="gallery-filter">
          <div
            role="tablist"
            aria-label="Filter photos"
            className="no-scrollbar -mx-4 mb-6 flex snap-x items-center gap-2 overflow-x-auto px-4 py-2 sm:mx-0 sm:mb-8 sm:flex-wrap sm:px-0"
          >
            {categories.map((cat) => {
              const active = selected === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => choose(cat)}
                  className={cn(
                    "relative min-h-11 flex-shrink-0 snap-start rounded-full border px-5 text-xs font-semibold uppercase tracking-wide transition-colors active:scale-[0.97]",
                    active ? "border-brand-navy text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="gallery-pill"
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full bg-brand-navy"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative">{cat}</span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>

        {/* Masonry: fixed columns; keyed by filter so a new filter starts clean */}
        <div key={selected} className="flex items-start gap-2.5 sm:gap-4">
          {columns.map((col, c) => (
            <div key={c} className="flex min-w-0 flex-1 flex-col gap-2.5 sm:gap-4">
              {col.map(({ img, i: idx }) => (
                <motion.figure
                  key={`${img.id}`}
                  initial={{ opacity: 0, y: 32, filter: "saturate(0) brightness(0.9)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "saturate(1) brightness(1)" }}
                  // The huge top margin counts anything already scrolled past as seen,
                  // so a fast scroll never leaves a tile hidden above the screen.
                  viewport={{ once: true, margin: "100000px 0px -8% 0px" }}
                  transition={{ duration: 0.9, ease: EASE, delay: c * 0.06 }}
                  className={cn(
                    "group relative overflow-hidden rounded-xl bg-slate-200 shadow-sm transition-shadow duration-300 hover:shadow-xl sm:rounded-2xl",
                    SHAPES[idx % SHAPES.length]
                  )}
                >
              <button
                type="button"
                aria-label={`Open photo: ${img.title}`}
                onClick={() => setLightboxIndex(idx)}
                className="absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-sky"
              >
                <Image
                  src={img.image_url}
                  alt={img.location ? `${img.title}, ${img.location}` : img.title}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              </button>
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/75 via-black/10 to-transparent p-3 opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 group-hover:opacity-100 sm:p-4">
                <span className="self-end rounded-full bg-white/20 p-2 text-white backdrop-blur-sm">
                  <Maximize2 className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-sky">{img.category}</span>
                  <p className="mt-0.5 font-display text-sm font-bold leading-tight text-white sm:text-base">{img.title}</p>
                  {img.trip_slug && (
                    <Link
                      href={`/trips/${img.trip_slug}`}
                      className="pointer-events-auto mt-2 inline-flex min-h-9 items-center gap-1 rounded-full bg-white px-3 text-xs font-bold text-brand-navy transition hover:bg-brand-sky"
                    >
                      View trip <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </div>
                </motion.figure>
              ))}
            </div>
          ))}
        </div>

        {left > 0 && (
          <div ref={sentinel} className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setCount((c) => c + STEP)}
              className="inline-flex min-h-11 items-center rounded-full border border-slate-300 bg-white px-6 text-sm font-bold text-brand-navy transition hover:-translate-y-0.5 hover:border-brand-navy active:translate-y-0 active:scale-[0.98]"
            >
              Show more photos ({left} left)
            </button>
          </div>
        )}

        {lightboxIndex !== null && (
          <Lightbox
            images={lightboxImages}
            currentIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNext={() => setLightboxIndex((prev) => (prev! + 1) % lightboxImages.length)}
            onPrev={() => setLightboxIndex((prev) => (prev! - 1 + lightboxImages.length) % lightboxImages.length)}
          />
        )}
      </div>
    </MotionConfig>
  );
}
