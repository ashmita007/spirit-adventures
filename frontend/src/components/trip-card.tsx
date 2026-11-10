"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTilt } from "@/components/motion/use-tilt";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, Star, Clock, MapPin, ArrowRight, Sparkles } from "lucide-react";
import { Trip } from "@/lib/types";
import { formatCurrency, cn } from "@/lib/utils";

interface TripCardProps {
  trip: Trip;
  priority?: boolean;
}

const FALLBACK_COVER =
  "https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341325/spirit_adventures/shorts/dandeli_rafting_poster.jpg";

const LOCAL_VIDEO_MAP: Record<string, string> = {
  "dandeli-river-rafting-jungle-expedition": "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341176/spirit_adventures/shorts/dandeli_rafting.mp4",
  "gokarna-beach-cliff-trek": "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341208/spirit_adventures/shorts/gokarna_beach.mp4",
  "coorg-tadiandamol-coffee-trail": "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341227/spirit_adventures/shorts/coorg_mist.mp4",
  "chikmagalur-mullayanagiri-ridge-trek": "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341233/spirit_adventures/shorts/chikmagalur_peak.mp4",
  "ooty-nilgiri-pine-forest-expedition": "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341289/spirit_adventures/shorts/ooty_train.mp4",
  "wayanad-chembra-peak-waterfall-trail": "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341310/spirit_adventures/shorts/wayanad_waterfall.mp4",
  "leh-ladakh-motorcycle-odyssey": "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341157/spirit_adventures/hero/ladakh_bike.mp4",
  "kedarkantha-trek": "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341160/spirit_adventures/hero/mountain_trek.mp4",
  "hampta-pass-trek": "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341160/spirit_adventures/hero/mountain_trek.mp4",
  "kashmir-great-lakes-trek": "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341162/spirit_adventures/nature/waterfall.mp4",
  "spiti-valley-road-trip": "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341157/spirit_adventures/hero/ladakh_bike.mp4",
  "sandhan-valley-trek": "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341162/spirit_adventures/nature/waterfall.mp4",
};

const SAVED_KEY = "spirit_saved_trips";

function readSaved(): number[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
  } catch {
    return [];
  }
}

export default function TripCard({ trip, priority = false }: TripCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  useTilt(cardRef);

  const difficultyColors = {
    EASY: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    MODERATE: "bg-sky-50 text-sky-700 border-sky-200/80",
    CHALLENGING: "bg-amber-50 text-amber-700 border-amber-200/80",
    DIFFICULT: "bg-rose-50 text-rose-700 border-rose-200/80",
  };

  const difficultyClass = difficultyColors[trip.difficulty] || difficultyColors.MODERATE;
  const videoSrc = trip.hero_video_url || LOCAL_VIDEO_MAP[trip.slug];
  const cover = trip.cover_image || FALLBACK_COVER;

  useEffect(() => {
    setIsLiked(readSaved().includes(trip.id));
  }, [trip.id]);

  // Video preview only while a mouse hovers the card: one video decoding at a
  // time keeps scrolling smooth. Touch devices just show the photo.
  useEffect(() => {
    const el = cardRef.current;
    if (!el || !videoSrc) return;
    const canHover =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover) return;
    const enter = () => setHovering(true);
    const leave = () => {
      setHovering(false);
      setVideoReady(false);
    };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
    };
  }, [videoSrc]);

  const router = useRouter();

  const handleCardClick = (e: React.MouseEvent) => {
    // If user clicked heart button or any interactive element, do not trigger card push
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) return;
    router.push(`/trips/${trip.slug}`);
  };

  const toggleSaved = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const saved = new Set(readSaved());
    if (saved.has(trip.id)) saved.delete(trip.id);
    else saved.add(trip.id);
    localStorage.setItem(SAVED_KEY, JSON.stringify([...saved]));
    setIsLiked(saved.has(trip.id));
  };

  return (
    <article
      ref={cardRef}
      onClick={handleCardClick}
      className="group relative bg-white rounded-3xl overflow-hidden border border-slate-200/70 shadow-xs hover:shadow-2xl hover:shadow-brand-navy/10 hover:border-brand-sky/40 transition-[box-shadow,border-color] duration-300 flex flex-col h-full cursor-pointer select-none"
    >
      {/* Moving light glare (driven by useTilt) */}
      <div data-tilt-glare aria-hidden className="pointer-events-none absolute inset-0 z-30 opacity-0 rounded-3xl" />

      {/* Top Media Container Link */}
      <Link
        href={`/trips/${trip.slug}`}
        aria-label={`View ${trip.title}`}
        className={cn("block relative aspect-[16/10] w-full overflow-hidden bg-slate-900 z-10", !imgLoaded && "sa-shimmer")}
      >
        <Image
          src={cover}
          alt={trip.title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 70vw, (max-width: 1024px) 50vw, 33vw"
          onLoad={() => setImgLoaded(true)}
          className={cn(
            "object-cover object-center pointer-events-none transition-[opacity,transform] duration-700 ease-out group-hover:scale-[1.08]",
            imgLoaded ? "opacity-100" : "opacity-0"
          )}
        />

        {videoSrc && hovering && (
          <video
            ref={videoRef}
            src={videoSrc}
            muted
            loop
            playsInline
            autoPlay
            preload="auto"
            aria-hidden="true"
            onPlaying={() => setVideoReady(true)}
            className={cn(
              "absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-[opacity,transform] duration-700 ease-out group-hover:scale-[1.08]",
              videoReady ? "opacity-100" : "opacity-0"
            )}
          />
        )}

        {/* Top Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30 pointer-events-none" />

        {/* Badges on Top */}
        <div className="absolute top-3.5 left-3.5 right-14 flex items-center z-10 pointer-events-none">
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
            {trip.is_bestseller && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-brand-ocean text-white text-[10px] font-extrabold shadow-md">
                <Sparkles className="w-2.5 h-2.5" aria-hidden />
                <span>Bestseller</span>
              </span>
            )}
            {trip.category_name && (
              <span className="px-2.5 py-1 rounded-full bg-white text-brand-navy text-[10px] font-bold shadow-sm">
                {trip.category_name}
              </span>
            )}
          </div>
        </div>

        {/* Destination Chip on Bottom Left of Image */}
        <div className="absolute bottom-3 left-3 flex items-center space-x-1.5 bg-black/50 px-2.5 py-1 rounded-full text-white text-xs font-semibold shadow-xs pointer-events-none">
          <MapPin className="w-3.5 h-3.5 text-brand-sky" aria-hidden />
          <span>{trip.destination_name || "Wilderness"}</span>
        </div>
      </Link>

      {/* Save button sits above the card link */}
      <button
        type="button"
        onClick={toggleSaved}
        aria-pressed={isLiked}
        aria-label={isLiked ? `Remove ${trip.title} from saved` : `Save ${trip.title}`}
        className="absolute top-2.5 right-2.5 z-40 w-10 h-10 rounded-full bg-black/40 text-white hover:bg-white hover:text-rose-500 flex items-center justify-center transition duration-200 active:scale-90 shadow-sm cursor-pointer"
      >
        <Heart className={cn("w-4 h-4 transition-transform", isLiked && "fill-rose-500 text-rose-500 scale-110")} />
      </button>

      {/* Card Content Body */}
      <div className="p-5 sm:p-6 flex flex-col flex-grow justify-between z-10">
        <div>
          {/* Metadata Row: Duration, Difficulty & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2.5">
            <div className="flex items-center space-x-2 font-medium">
              <span className="inline-flex items-center space-x-1 text-slate-600 font-semibold">
                <Clock className="w-3.5 h-3.5 text-brand-ocean" />
                <span>{trip.duration_label}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border", difficultyClass)}>
                {trip.difficulty}
              </span>
            </div>

            {trip.rating && trip.reviews_count ? (
              <div
                className="flex items-center space-x-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 text-amber-700 font-bold text-xs"
                aria-label={`Rated ${trip.rating} out of 5 from ${trip.reviews_count} reviews`}
              >
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                <span>{trip.rating}</span>
              </div>
            ) : null}
          </div>

          {/* Title */}
          <h3 className="font-display font-extrabold text-base sm:text-lg text-brand-navy leading-snug line-clamp-2 group-hover:text-brand-ocean transition-colors duration-200">
            <Link
              href={`/trips/${trip.slug}`}
              className="hover:text-brand-ocean focus-visible:outline-none transition-colors"
            >
              {trip.title}
            </Link>
          </h3>

          {/* Short Description */}
          <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed font-normal">
            {trip.short_description}
          </p>
        </div>

        {/* Pricing & CTA Footer */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold text-slate-600">Starting from</span>
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

          <Link
            href={`/trips/${trip.slug}`}
            className="inline-flex items-center space-x-1 px-4 py-2 rounded-full bg-brand-light group-hover:bg-brand-ocean group-hover:text-white text-brand-ocean font-bold text-xs tracking-wide transition duration-200 shadow-2xs group-hover:shadow-md"
          >
            <span>Explore</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}
