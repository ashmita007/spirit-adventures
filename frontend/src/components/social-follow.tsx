import React from "react";
import Image from "next/image";
import { ArrowUpRight, Instagram, Play, Youtube } from "lucide-react";
import type { GalleryImage } from "@/lib/types";
import type { SocialLinks } from "@/lib/social";
import { Small } from "@/components/mix-heading";

/**
 * "Follow the trail": Instagram and YouTube as two large cards built from real trip
 * photos. Instagram has a slowly turning gradient ring; YouTube a pulsing play button.
 * Cards rise in sequence (data-anim="stagger"); photos zoom 1.03 on hover.
 */
export default function SocialFollow({ photos, film, social }: { photos: GalleryImage[]; film?: GalleryImage; social: SocialLinks }) {
  const pics = photos.filter((p) => p.image_url);
  if (pics.length < 3) return null;
  const grid = pics.slice(0, 3);
  // The film card wants a full-bleed photograph (trip posters carry their own frame).
  const filmPhoto = film ?? pics[3] ?? pics[0];

  return (
    <section aria-labelledby="follow-title" className="bg-brand-light py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-4 sm:mb-12 lg:grid-cols-12 lg:items-end">
          <h2
            id="follow-title"
            data-anim="heading"
            className="[perspective:800px] font-display text-3xl font-black uppercase tracking-tight text-brand-navy sm:text-5xl lg:col-span-7"
          >
            Follow <Small>the</Small> trail
          </h2>
          <p className="max-w-md text-[15px] leading-7 text-slate-600 lg:col-span-5 lg:justify-self-end">
            Reels, photos and trip films from our batches, posted as we travel.
          </p>
        </div>

        <div data-anim="stagger" className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Instagram */}
          <a
            href={social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative isolate overflow-hidden rounded-[28px] p-[2px] transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-0"
          >
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 -z-10 -ml-[100%] -mt-[100%] aspect-square w-[200%] animate-[spin_8s_linear_infinite] motion-reduce:animate-none [background:conic-gradient(from_0deg,#f58529,#dd2a7b,#8134af,#515bd4,#f58529)]"
            />
            <div className="flex h-full flex-col rounded-[26px] bg-white p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl text-white [background:linear-gradient(45deg,#f58529,#dd2a7b,#8134af)]">
                    <Instagram className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-display text-lg font-black text-brand-navy">Instagram</span>
                    <span className="block text-xs font-semibold text-slate-500">Reels and photos from every batch</span>
                  </span>
                </span>
                <span className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-brand-navy px-4 text-sm font-bold text-white transition group-hover:bg-[#dd2a7b]">
                  Follow <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-6 sm:gap-3">
                {grid.map((p, i) => (
                  <div key={`${p.id}`} className="relative aspect-[4/5] overflow-hidden rounded-xl bg-slate-100 sm:rounded-2xl">
                    <Image
                      src={p.image_url}
                      alt={p.location ? `${p.title}, ${p.location}` : p.title}
                      fill
                      sizes="(max-width: 1024px) 33vw, 16vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      style={{ transitionDelay: `${i * 60}ms` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </a>

          {/* YouTube */}
          <a
            href={social.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex min-h-[20rem] flex-col justify-end overflow-hidden rounded-[28px] bg-brand-navy p-5 text-white transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-0 sm:p-8"
          >
            <Image
              src={filmPhoto.image_url}
              alt={filmPhoto.location ? `${filmPhoto.title}, ${filmPhoto.location}` : filmPhoto.title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
            <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />
            <span aria-hidden="true" className="absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center">
              <span className="absolute h-20 w-20 rounded-full bg-[#ff0033]/40 motion-safe:animate-ping" />
              <span className="relative grid h-16 w-16 place-items-center rounded-full bg-[#ff0033] shadow-[0_10px_30px_-6px_rgba(255,0,51,0.7)] transition-transform duration-300 group-hover:scale-110">
                <Play className="ml-1 h-7 w-7 fill-white" />
              </span>
            </span>
            <span className="relative flex items-end justify-between gap-4">
              <span>
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/80">
                  <Youtube className="h-4 w-4 text-[#ff0033]" aria-hidden="true" /> YouTube
                </span>
                <span className="mt-1 block font-display text-2xl font-black uppercase leading-tight sm:text-3xl">
                  Trip films <Small>and</Small> guides
                </span>
              </span>
              <span className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-bold text-brand-navy transition group-hover:bg-[#ff0033] group-hover:text-white">
                Watch <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" aria-hidden="true" />
              </span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
