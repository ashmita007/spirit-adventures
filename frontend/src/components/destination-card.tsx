"use client";

import React, { useRef, useState } from "react";
import { useTilt } from "@/components/motion/use-tilt";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Compass, Play } from "lucide-react";
import { Destination } from "@/lib/types";
import { VideoModal } from "@/components/video-player";

interface DestinationCardProps {
  destination: Destination;
}

const FALLBACK_COVER =
  "https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341327/spirit_adventures/shorts/coorg_mist_poster.jpg";

export default function DestinationCard({ destination }: DestinationCardProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  useTilt(ref, 6);
  const count = destination.trip_count || 0;

  const handleVideoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setVideoModalOpen(true);
  };

  return (
    <>
      <Link
        ref={ref}
        href={`/destinations/${destination.slug}`}
        className={cn(
          "group relative block aspect-[4/5] sm:aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-brand-navy/20 transition-shadow duration-300",
          !loaded && "sa-shimmer"
        )}
      >
        {/* Background Image */}
        <Image
          src={destination.cover_image || destination.hero_image || FALLBACK_COVER}
          alt={destination.name}
          fill
          onLoad={() => setLoaded(true)}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={cn(
            "object-cover object-center group-hover:scale-110 transition-[transform,opacity] duration-700 ease-out",
            loaded ? "opacity-100" : "opacity-0"
          )}
        />
        <div data-tilt-glare aria-hidden className="pointer-events-none absolute inset-0 z-20 opacity-0" />

        {/* Atmospheric Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/30 to-black/20 group-hover:via-brand-navy/40 transition-colors duration-300" />

        {/* Content Overlay */}
        <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
          {/* Top Tag & 4K Video Trigger */}
          <div className="flex justify-between items-center">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-semibold uppercase tracking-widest border border-white/20">
              {count ? `${count} ${count === 1 ? "Adventure" : "Adventures"}` : "Explore"}
            </span>

            {destination.video_url ? (
              <button
                type="button"
                onClick={handleVideoClick}
                aria-label={`Watch 4K Tour of ${destination.name}`}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-600/90 hover:bg-rose-600 text-white text-[11px] font-bold tracking-wider uppercase transition shadow-md active:scale-90 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>4K Tour</span>
              </button>
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-brand-navy transition-colors">
                <Compass className="w-4 h-4 transition-transform duration-700 group-hover:rotate-180" aria-hidden />
              </div>
            )}
          </div>

          {/* Bottom Title & Action */}
          <div>
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-brand-sky block mb-1">
              Region
            </span>
            <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-wide uppercase leading-tight">
              {destination.name}
            </h3>
            {destination.subtitle && (
              <p className="text-xs text-slate-300 mt-1 line-clamp-1 font-light">
                {destination.subtitle}
              </p>
            )}

            <div className="mt-4 inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-white group-hover:text-brand-sky transition-colors">
              <span>Explore Adventures</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>
        </div>
      </Link>

      {destination.video_url && (
        <VideoModal
          isOpen={videoModalOpen}
          onClose={() => setVideoModalOpen(false)}
          videoUrl={destination.video_url}
          title={`${destination.name} 4K Drone Tour`}
          destinationName={destination.name}
        />
      )}
    </>
  );
}
