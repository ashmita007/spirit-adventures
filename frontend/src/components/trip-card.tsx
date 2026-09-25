"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Star, Clock, MapPin, ArrowRight, Sparkles } from "lucide-react";
import { Trip } from "@/lib/types";
import { formatCurrency, cn } from "@/lib/utils";

interface TripCardProps {
  trip: Trip;
  priority?: boolean;
}

const LOCAL_VIDEO_MAP: Record<string, string> = {
  "dandeli-river-rafting-jungle-expedition": "/videos/shorts/dandeli_rafting.mp4",
  "gokarna-beach-cliff-trek": "/videos/shorts/gokarna_beach.mp4",
  "coorg-tadiandamol-coffee-trail": "/videos/shorts/coorg_mist.mp4",
  "chikmagalur-mullayanagiri-ridge-trek": "/videos/shorts/chikmagalur_peak.mp4",
  "ooty-nilgiri-pine-forest-expedition": "/videos/shorts/ooty_train.mp4",
  "wayanad-chembra-peak-waterfall-trail": "/videos/shorts/wayanad_waterfall.mp4",
  "leh-ladakh-motorcycle-odyssey": "/videos/hero/ladakh_bike.mp4",
  "kedarkantha-trek": "/videos/hero/mountain_trek.mp4",
  "hampta-pass-trek": "/videos/hero/mountain_trek.mp4",
  "kashmir-great-lakes-trek": "/videos/nature/waterfall.mp4",
  "spiti-valley-road-trip": "/videos/hero/ladakh_bike.mp4",
  "sandhan-valley-trek": "/videos/nature/waterfall.mp4",
};

export default function TripCard({ trip, priority = false }: TripCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const difficultyColors = {
    EASY: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    MODERATE: "bg-sky-50 text-sky-700 border-sky-200/80",
    CHALLENGING: "bg-amber-50 text-amber-700 border-amber-200/80",
    DIFFICULT: "bg-rose-50 text-rose-700 border-rose-200/80",
  };

  const difficultyClass = difficultyColors[trip.difficulty] || difficultyColors.MODERATE;
  const videoSrc = trip.hero_video_url || LOCAL_VIDEO_MAP[trip.slug];

  return (
    <Link
      href={`/trips/${trip.slug}`}
      className="group relative bg-white rounded-3xl overflow-hidden border border-slate-200/70 shadow-xs hover:shadow-xl hover:border-brand-sky/40 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full cursor-pointer"
    >
      {/* Top Media Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
        {videoSrc ? (
          <video
            src={videoSrc}
            poster={trip.cover_image}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
          />
        ) : (
          <Image
            src={trip.cover_image}
            alt={trip.title}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
          />
        )}

        {/* Top Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30 pointer-events-none" />

        {/* Badges on Top */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
            {trip.is_bestseller && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-brand-ocean text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md backdrop-blur-md">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Bestseller</span>
              </span>
            )}
            {trip.category_name && (
              <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-brand-navy text-[10px] font-bold uppercase tracking-wider shadow-sm">
                {trip.category_name}
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            aria-label="Save adventure"
            className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-white hover:text-rose-500 flex items-center justify-center transition-all duration-200 active:scale-90 shadow-sm"
          >
            <Heart className={cn("w-4 h-4 transition-transform", isLiked && "fill-rose-500 text-rose-500 scale-110")} />
          </button>
        </div>

        {/* Destination Chip on Bottom Left of Image */}
        <div className="absolute bottom-3 left-3 flex items-center space-x-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-xs font-semibold shadow-xs">
          <MapPin className="w-3.5 h-3.5 text-brand-sky" />
          <span>{trip.destination_name || "Wilderness"}</span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 sm:p-6 flex flex-col flex-grow justify-between">
        <div>
          {/* Metadata Row: Duration, Difficulty & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2.5">
            <div className="flex items-center space-x-2 font-medium">
              <span className="inline-flex items-center space-x-1 text-slate-600 font-semibold">
                <Clock className="w-3.5 h-3.5 text-brand-ocean" />
                <span>{trip.duration_label}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider", difficultyClass)}>
                {trip.difficulty}
              </span>
            </div>

            <div className="flex items-center space-x-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 text-amber-700 font-bold text-xs">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{trip.rating || 5.0}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-display font-extrabold text-base sm:text-lg text-brand-navy leading-snug line-clamp-2 group-hover:text-brand-ocean transition-colors duration-200">
            {trip.title}
          </h3>

          {/* Short Description */}
          <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed font-normal">
            {trip.short_description}
          </p>
        </div>

        {/* Pricing & CTA Footer */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-600">Starting from</span>
            <div className="flex items-baseline space-x-2">
              <span className="font-display font-black text-xl text-brand-navy">
                {formatCurrency(trip.price)}
              </span>
              {trip.original_price && (
                <span className="text-xs text-slate-600 line-through font-medium">
                  {formatCurrency(trip.original_price)}
                </span>
              )}
            </div>
          </div>

          <div
            className="inline-flex items-center space-x-1 px-4 py-2 rounded-full bg-brand-light group-hover:bg-brand-ocean group-hover:text-white text-brand-ocean font-bold text-xs tracking-wider transition-all duration-200 shadow-2xs group-hover:shadow-md"
          >
            <span>Explore</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
