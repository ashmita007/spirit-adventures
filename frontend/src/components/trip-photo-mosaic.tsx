"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Expand } from "lucide-react";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

type Photo = { url: string; title: string };

/**
 * Asymmetric photo mosaic for a trip: one lead frame plus up to four smaller ones.
 * Entrance: each photo "develops" once as it enters (grayscale and slightly enlarged
 * to full colour at rest), staggered. Hover zooms the photo 1.03 inside its frame.
 * Every tile opens the lightbox at its index. No captions on the pictures.
 */
export default function TripPhotoMosaic({
  photos,
  tripTitle,
  onOpen,
}: {
  photos: Photo[];
  tripTitle: string;
  onOpen: (index: number) => void;
}) {
  const reduce = useReducedMotion();
  const shown = photos.slice(0, 5);
  if (shown.length < 3) return null;
  const extra = photos.length - shown.length;

  // Layout per count, so the grid never leaves a hole.
  const spans: string[] =
    shown.length === 5
      ? ["col-span-2 row-span-2 sm:col-span-2 sm:row-span-2", "", "", "", ""]
      : shown.length === 4
        ? ["col-span-2 row-span-2 sm:col-span-2 sm:row-span-2", "", "", "col-span-2 sm:col-span-2"]
        : ["col-span-2 row-span-2 sm:col-span-2 sm:row-span-2", "sm:row-span-2", "sm:row-span-2"];

  return (
    <motion.ul
      aria-label={`Photos from ${tripTitle}`}
      className="grid auto-rows-[7.5rem] grid-cols-2 gap-2 sm:auto-rows-[10rem] sm:grid-cols-4 sm:gap-3"
      {...(reduce ? { initial: false, animate: "show" } : { initial: "hidden", whileInView: "show" })}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      variants={{ show: { transition: { staggerChildren: 0.09 } } }}
    >
      {shown.map((p, i) => {
        const last = i === shown.length - 1 && extra > 0;
        return (
          <motion.li
            key={`${p.url}-${i}`}
            className={cn("relative", spans[i])}
            variants={{
              hidden: { opacity: 0, filter: "grayscale(1) brightness(1.08)", scale: 1.04 },
              show: {
                opacity: 1,
                filter: "grayscale(0) brightness(1)",
                scale: 1,
                transition: { duration: 0.9, ease: EASE },
              },
            }}
          >
            <button
              type="button"
              onClick={() => onOpen(i)}
              aria-label={last ? `Open photos, ${extra} more` : `Open photo ${i + 1} of ${photos.length}`}
              className="group absolute inset-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-inset ring-black/5 transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ocean focus-visible:ring-offset-2"
            >
              <Image
                src={p.url}
                alt={i === 0 ? tripTitle : ""}
                fill
                sizes={i === 0 ? "(max-width: 640px) 100vw, 50vw" : "(max-width: 640px) 50vw, 25vw"}
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <span
                aria-hidden="true"
                className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-black/35 text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                <Expand className="h-3.5 w-3.5" />
              </span>
              {last && (
                <span className="absolute inset-0 grid place-items-center bg-brand-navy/55 font-display text-2xl font-bold text-white backdrop-blur-[2px]">
                  +{extra}
                </span>
              )}
            </button>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}
