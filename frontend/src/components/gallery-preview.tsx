"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, Maximize2, Pause, Play } from "lucide-react";
import { GalleryImage } from "@/lib/types";
import Lightbox from "./lightbox";
import { Small } from "@/components/mix-heading";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const EASE = [0.16, 1, 0.3, 1] as const;
const SLIDE_MS = 4500;

/** One reel card. Same size everywhere, so both rows line up. */
function ReelCard({ img, onOpen }: { img: GalleryImage; onOpen: () => void }) {
  return (
    <li className="shrink-0 pr-3 sm:pr-5">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open photo: ${img.title}`}
        className="group relative block aspect-[4/5] w-40 overflow-hidden rounded-2xl bg-slate-800 ring-1 ring-white/10 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:ring-brand-sky/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sky sm:w-56 lg:w-64"
      >
        <Image
          src={img.image_url}
          alt={img.location ? `${img.title}, ${img.location}` : img.title}
          fill
          sizes="(max-width: 640px) 160px, 256px"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
        <span className="absolute inset-x-3 bottom-3 text-left">
          {img.location && (
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-brand-sky">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              <span className="truncate">{img.location}</span>
            </span>
          )}
          <span className="mt-0.5 line-clamp-1 font-display text-sm font-bold text-white">{img.title}</span>
        </span>
      </button>
    </li>
  );
}

/** Photos per reel row (each row is drawn twice for the seamless loop). */
const REEL_ROW = 14;

/**
 * "Moments from the wild" on the home page, from real uploaded photos (curated gallery
 * plus every trip photo).
 *
 * Scroll moments: the showcase grows from a framed card to the full width as it
 * scrolls up the screen; the two traveller reels run in opposite directions, speed up
 * with the scroll and turn round when you scroll back up. Hovering a reel pauses it.
 * Reduced motion: no growth, the reels become swipeable rows.
 */
export default function GalleryPreview({ images }: { images: GalleryImage[] }) {
  const root = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const photos = useMemo(() => images.filter((i) => i.image_url), [images]);
  // Each reel row is drawn twice for the seamless loop, so cap it: the gallery page has the rest.
  const half = Math.min(REEL_ROW, Math.ceil(photos.length / 2));
  const rowA = photos.slice(0, Math.max(half, 6));
  const rowB = photos.slice(half, half + REEL_ROW).length >= 6 ? photos.slice(half, half + REEL_ROW) : [...photos].reverse().slice(0, REEL_ROW);
  const showcase = photos.slice(0, 8);
  const current = showcase[activeIndex] ?? showcase[0];

  useEffect(() => {
    if (!isPlaying || showcase.length < 2) return;
    const t = window.setInterval(() => setActiveIndex((i) => (i + 1) % showcase.length), SLIDE_MS);
    return () => window.clearInterval(t);
  }, [isPlaying, showcase.length]);

  useGSAP(
    () => {
      const node = root.current;
      if (!node) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Showcase grows from a framed card to its full width while it rises.
        const frame = node.querySelector("[data-showcase]");
        if (frame) {
          gsap.fromTo(
            frame,
            { clipPath: "inset(4% 7% 4% 7% round 32px)" },
            {
              clipPath: "inset(0% 0% 0% 0% round 24px)",
              ease: "none",
              scrollTrigger: { trigger: frame, start: "top 95%", end: "top 35%", scrub: 0.6 },
            }
          );
        }

        // Reels: endless loops whose speed and direction follow the scroll.
        const loops = Array.from(node.querySelectorAll<HTMLElement>("[data-reel]")).map((track) => {
          const dir = track.dataset.reel === "right" ? 1 : -1;
          const tween = gsap.fromTo(
            track,
            { xPercent: dir === -1 ? 0 : -50 },
            { xPercent: dir === -1 ? -50 : 0, duration: 60, ease: "none", repeat: -1 }
          );
          const row = track.parentElement!;
          const pause = () => gsap.to(tween, { timeScale: 0, duration: 0.5, overwrite: true });
          const play = () => gsap.to(tween, { timeScale: 1, duration: 0.6, overwrite: true });
          row.addEventListener("mouseenter", pause);
          row.addEventListener("mouseleave", play);
          row.addEventListener("focusin", pause);
          row.addEventListener("focusout", play);
          return { tween, row, pause, play };
        });

        let hovered = false;
        const onEnter = () => (hovered = true);
        const onLeave = () => (hovered = false);
        loops.forEach(({ row }) => {
          row.addEventListener("mouseenter", onEnter);
          row.addEventListener("mouseleave", onLeave);
        });

        ScrollTrigger.create({
          trigger: node,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            if (hovered) return;
            const boost = gsap.utils.clamp(1, 6, 1 + Math.abs(self.getVelocity()) / 400);
            const sign = self.direction === -1 ? -1 : 1;
            loops.forEach(({ tween }) => {
              gsap.killTweensOf(tween);
              gsap
                .timeline()
                .to(tween, { timeScale: boost * sign, duration: 0.2 })
                .to(tween, { timeScale: sign, duration: 1.2, ease: "power2.out" });
            });
          },
        });

        return () =>
          loops.forEach(({ row, pause, play }) => {
            row.removeEventListener("mouseenter", pause);
            row.removeEventListener("mouseleave", play);
            row.removeEventListener("focusin", pause);
            row.removeEventListener("focusout", play);
            row.removeEventListener("mouseenter", onEnter);
            row.removeEventListener("mouseleave", onLeave);
          });
      });
    },
    { scope: root, dependencies: [photos.length] }
  );

  if (photos.length === 0) return null;

  const lightboxImages = photos.map((img) => ({
    url: img.image_url,
    title: img.title,
    caption: [img.location, img.caption].filter(Boolean).join(", "),
  }));
  const open = (img: GalleryImage) => setLightboxIndex(Math.max(0, photos.indexOf(img)));

  const reel = (list: GalleryImage[], dir: "left" | "right", label: string) => (
    <div
      className="overflow-hidden py-2 motion-reduce:overflow-x-auto motion-reduce:[scrollbar-width:none] [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]"
      aria-label={label}
    >
      <ul data-reel={dir} className="flex w-max will-change-transform">
        {[0, 1].map((copy) =>
          list.map((img) => (
            <ReelCard key={`${copy}-${img.id}`} img={img} onOpen={() => open(img)} />
          ))
        )}
      </ul>
    </div>
  );

  return (
    <MotionConfig reducedMotion="user">
      <section ref={root} aria-labelledby="moments-title" className="relative overflow-hidden bg-slate-900 py-16 text-white sm:py-28">
        <div aria-hidden="true" className="pointer-events-none absolute right-1/3 top-0 h-96 w-96 rounded-full bg-brand-ocean/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-5 sm:mb-10 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-sky">{photos.length} photos from our trips</p>
              <h2
                id="moments-title"
                data-anim="heading"
                className="[perspective:800px] mt-1 font-display text-3xl font-black uppercase tracking-tight sm:text-5xl"
              >
                Moments <Small>from the</Small> wild
              </h2>
            </div>
            <Link
              href="/gallery"
              className="group inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-white/20 bg-white/10 px-5 text-xs font-bold uppercase tracking-wide transition hover:-translate-y-0.5 hover:bg-white/20 active:translate-y-0 active:scale-[0.98] md:self-auto"
            >
              View full gallery <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>

          {current && (
            <div data-showcase className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-slate-950 sm:aspect-[16/9] lg:aspect-[21/9]">
              <AnimatePresence initial={false}>
                <motion.div
                  key={current.image_url}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.1, ease: EASE }}
                >
                  <Image src={current.image_url} alt={current.title} fill sizes="100vw" className="object-cover" />
                </motion.div>
              </AnimatePresence>
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/30" />

              <div className="absolute right-4 top-4 flex gap-2 sm:right-6 sm:top-6">
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/50 transition hover:bg-black/80 active:scale-90"
                >
                  {isPlaying ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4 fill-white" aria-hidden="true" />}
                </button>
                <button
                  type="button"
                  onClick={() => open(current)}
                  aria-label="View photo full screen"
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/15 transition hover:bg-white/30 active:scale-90"
                >
                  <Maximize2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="absolute inset-x-4 bottom-4 flex flex-col gap-4 sm:inset-x-6 sm:bottom-6 sm:flex-row sm:items-end sm:justify-between">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={current.image_url}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="max-w-2xl"
                  >
                    {current.location && (
                      <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-brand-sky">
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {current.location}
                      </p>
                    )}
                    <h3 className="font-display text-2xl font-black leading-tight sm:text-4xl">{current.title}</h3>
                    {current.trip_slug && (
                      <Link
                        href={`/trips/${current.trip_slug}`}
                        className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-bold text-brand-navy transition hover:bg-brand-sky active:scale-[0.97]"
                      >
                        View this trip <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    )}
                  </motion.div>
                </AnimatePresence>
                {showcase.length > 1 && (
                  <div className="flex items-center gap-3 self-end">
                    <span className="font-mono text-xs font-bold text-slate-300">
                      {activeIndex + 1} / {showcase.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveIndex((i) => (i - 1 + showcase.length) % showcase.length)}
                      aria-label="Previous photo"
                      className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 transition hover:bg-white/20 active:scale-90"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveIndex((i) => (i + 1) % showcase.length)}
                      aria-label="Next photo"
                      className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 transition hover:bg-white/20 active:scale-90"
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
              {isPlaying && showcase.length > 1 && (
                <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
                  <div key={activeIndex} className="h-full origin-left bg-brand-sky motion-safe:animate-[progress_4.5s_linear]" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Traveller reels: full width, edge-faded, pause on hover */}
        <div className="relative mt-12 space-y-3 sm:mt-16 sm:space-y-5">
          <p className="mx-auto max-w-7xl px-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400 sm:px-6 lg:px-8">
            Traveller reel
          </p>
          {reel(rowA, "left", "Traveller photos, row one")}
          {reel(rowB, "right", "Traveller photos, row two")}
        </div>

        {lightboxIndex !== null && (
          <Lightbox
            images={lightboxImages}
            currentIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNext={() => setLightboxIndex((p) => (p! + 1) % lightboxImages.length)}
            onPrev={() => setLightboxIndex((p) => (p! - 1 + lightboxImages.length) % lightboxImages.length)}
          />
        )}
      </section>
    </MotionConfig>
  );
}
