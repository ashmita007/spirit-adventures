"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Compass, Search, Sparkles, X, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDeferredVideo } from "@/lib/media";

interface VideoHeroProps {
  onPlanTripClick?: () => void;
}

interface HeroScene {
  id: number;
  video8kUrl: string;
  videoUrl: string;
  posterUrl: string;
}

const HERO_SCENES: HeroScene[] = [
  {
    id: 1,
    video8kUrl: "https://res.cloudinary.com/xvxaicfe/video/upload/w_1280,c_limit,q_auto:good,vc_h264,br_1500k/v1790341135/spirit_adventures/hero/rhythms_of_india.mp4",
    videoUrl: "https://res.cloudinary.com/xvxaicfe/video/upload/w_1280,c_limit,q_auto:good,vc_h264,br_1500k/v1790341135/spirit_adventures/hero/rhythms_of_india.mp4",
    posterUrl: "https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341312/spirit_adventures/hero/rhythms_of_india_poster.jpg",
  },
  {
    id: 2,
    video8kUrl: "https://res.cloudinary.com/xvxaicfe/video/upload/w_1280,c_limit,q_auto:good,vc_h264,br_1500k/v1790341146/spirit_adventures/hero/maldives_travel.mp4",
    videoUrl: "https://res.cloudinary.com/xvxaicfe/video/upload/w_1280,c_limit,q_auto:good,vc_h264,br_1500k/v1790341146/spirit_adventures/hero/maldives_travel.mp4",
    posterUrl: "https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341314/spirit_adventures/hero/maldives_travel_poster.jpg",
  },
  {
    id: 3,
    video8kUrl: "https://res.cloudinary.com/xvxaicfe/video/upload/w_1280,c_limit,q_auto:good,vc_h264,br_1500k/v1790341154/spirit_adventures/hero/kerala_cinematic.mp4",
    videoUrl: "https://res.cloudinary.com/xvxaicfe/video/upload/w_1280,c_limit,q_auto:good,vc_h264,br_1500k/v1790341154/spirit_adventures/hero/kerala_cinematic.mp4",
    posterUrl: "https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341323/spirit_adventures/hero/kerala_cinematic_poster.jpg",
  },
];

const POPULAR_DESTINATIONS = [
  { name: "Coorg", slug: "coorg", count: "5 trips", state: "Karnataka" },
  { name: "Gokarna", slug: "gokarna", count: "5 trips", state: "Karnataka" },
  { name: "Dandeli", slug: "dandeli", count: "6 trips", state: "Karnataka" },
  { name: "Munnar", slug: "munnar", count: "3 trips", state: "Kerala" },
  { name: "Chikmagalur", slug: "chikmagalur", count: "3 trips", state: "Karnataka" },
  { name: "Ooty", slug: "ooty", count: "8 trips", state: "Tamil Nadu" },
  { name: "Hampi", slug: "hampi", count: "2 trips", state: "Karnataka" },
  { name: "Wayanad", slug: "wayanad", count: "2 trips", state: "Kerala" },
  { name: "Manali", slug: "manali", count: "3 trips", state: "Himachal" },
  { name: "Kashmir", slug: "kashmir", count: "1 trip", state: "J&K" },
  { name: "Goa", slug: "goa", count: "1 trip", state: "Goa" },
  { name: "Meghalaya", slug: "meghalaya", count: "1 trip", state: "Northeast" },
];

const POPULAR_TAGS = ["Coorg", "Gokarna", "Dandeli", "Munnar", "Chikmagalur", "Ooty", "Manali"];

const POSTER_WIDTHS = [640, 960, 1280, 1920];

/** Ask Cloudinary for a resized image: ".../upload/f_auto,q_auto/..." -> ".../upload/w_960,c_limit,f_auto,q_auto/...". */
function cloudinaryWidth(url: string, width: number) {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/w_${width},c_limit,`);
}

export default function VideoHero({ onPlanTripClick }: VideoHeroProps) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Auto-cycle through scenes every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSceneIndex((prev) => (prev + 1) % HERO_SCENES.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Close suggestions if clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsFocused(false);
    if (searchQuery.trim()) {
      router.push(`/trips?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/trips");
    }
  };

  const handleDestinationClick = (destSlug: string) => {
    setIsFocused(false);
    router.push(`/trips?destination=${destSlug}`);
  };

  const handleQuickTagClick = (tag: string) => {
    setIsFocused(false);
    router.push(`/trips?search=${encodeURIComponent(tag)}`);
  };

  const matchingDestinations = searchQuery.trim()
    ? POPULAR_DESTINATIONS.filter(
        (d) =>
          d.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
          d.state.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
    : POPULAR_DESTINATIONS.slice(0, 6);

  return (
    <section data-anim="hero" aria-label="Spirit Adventures" className="relative min-h-[92dvh] sm:min-h-dvh w-full flex items-center justify-center overflow-hidden bg-brand-navy select-none">
      {/* 1. Full-Screen Clean Video Background with Instant Poster & Smooth Playback */}
      <div data-hero-bg className="absolute inset-0 z-0 overflow-hidden pointer-events-none will-change-transform">
        {HERO_SCENES.map((scene, idx) => {
          const isActive = idx === currentSceneIndex;

          return (
            <div
              key={scene.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                isActive ? "opacity-100 z-10" : "opacity-0 z-0"
              )}
            >
              {/* Poster: only the current and next slide are fetched (hidden slides
                  still download because they sit inside the viewport), sized to the screen */}
              {(isActive || idx === (currentSceneIndex + 1) % HERO_SCENES.length) && (
                <img
                  src={cloudinaryWidth(scene.posterUrl, 1280)}
                  srcSet={POSTER_WIDTHS.map((w) => `${cloudinaryWidth(scene.posterUrl, w)} ${w}w`).join(", ")}
                  sizes="100vw"
                  alt=""
                  aria-hidden="true"
                  decoding="async"
                  fetchPriority={idx === 0 ? "high" : "low"}
                  className="absolute inset-0 w-full h-full object-cover object-center scale-105"
                  loading={idx === 0 ? "eager" : "lazy"}
                />
              )}

              {/* Ultra-Fast Web Stream Video (loaded only for active & next scene) */}
              {isActive && (
                <HeroVideo
                  url={scene.videoUrl}
                  poster={cloudinaryWidth(scene.posterUrl, 1280)}
                  onReady={() => setIsLoaded(true)}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* 2. Atmospheric Dark Vignette & Gradient Overlays */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-brand-navy via-brand-navy/40 to-black/60 pointer-events-none" />
      <div className="absolute inset-0 z-10 bg-radial-vignette opacity-75 pointer-events-none" />

      {/* 3. Mobile-First Hero Content */}
      <div data-hero-content className="relative z-20 w-full max-w-4xl mx-auto px-4 sm:px-6 text-center pt-24 pb-16 sm:py-32 flex flex-col items-center [perspective:900px]">
        {/* Sleek Pill Badge */}

        {/* Impactful Heading */}
        <h1 data-hero-item="title" className="font-display font-black text-[2.6rem] sm:text-5xl md:text-7xl lg:text-8xl tracking-tight text-white uppercase leading-[1.08] drop-shadow-2xl text-balance">
          FIND YOUR NEXT <br />
          <span className="text-brand-sky">
            ADVENTURE
          </span>
        </h1>

        {/* Concise Subtitle */}
        <p data-hero-item className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-slate-200/90 max-w-xl font-normal leading-relaxed text-balance drop-shadow">
          High-altitude Himalayan passes, South Indian river rafting, and Western Ghats jungle treks with certified expedition leaders.
        </p>

        {/* 4. Responsive Search Bar for Mobile & Desktop with Destination Suggestions */}
        <div data-hero-item ref={searchContainerRef} className="relative w-full max-w-xl mt-6 sm:mt-8">
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center bg-white/95 rounded-full p-1.5 sm:p-2 shadow-2xl border border-white/40 focus-within:ring-2 focus-within:ring-brand-sky focus-within:bg-white transition duration-300 z-30"
          >
            <div className="pl-3 sm:pl-4 text-slate-400">
              <Search className="w-5 h-5 text-brand-ocean" />
            </div>

            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsFocused(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsFocused(true);
              }}
              placeholder="Search treks, rafting, places…"
              aria-label="Search adventures"
              className="w-full min-w-0 bg-transparent px-3 py-3 sm:py-2 text-base sm:text-sm text-brand-navy placeholder:text-slate-400 focus:outline-none font-medium"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="p-2.5 text-slate-400 hover:text-slate-600 rounded-full mr-1 transition cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              className="flex-shrink-0 inline-flex items-center space-x-1.5 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-brand-ocean hover:bg-brand-navy text-white text-xs sm:text-sm font-bold tracking-wide transition duration-200 shadow-md active:scale-95 cursor-pointer"
            >
              <span>Search</span>
              <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
            </button>
          </form>

          {/* Destination Autocomplete Suggestions Dropdown */}
          {isFocused && matchingDestinations.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950/95 backdrop-blur-xl border border-white/15 rounded-3xl p-3 shadow-2xl z-40 text-left animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 flex items-center justify-between">
                <span>Destinations & Regions</span>
                <span className="text-brand-sky">Direct Match</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
                {matchingDestinations.map((dest) => (
                  <button
                    key={dest.slug}
                    type="button"
                    onClick={() => handleDestinationClick(dest.slug)}
                    className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/10 text-white transition text-left cursor-pointer group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-xl bg-brand-ocean/30 text-brand-sky flex items-center justify-center">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-display font-bold text-xs sm:text-sm text-white group-hover:text-brand-sky transition">
                          {dest.name}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {dest.state}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                      {dest.count}
                    </span>
                  </button>
                ))}
              </div>

              {searchQuery.trim() && (
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="w-full mt-2 pt-2 border-t border-white/10 text-center text-xs text-brand-sky font-semibold py-1.5 hover:text-white transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <span>Search all adventures for &ldquo;{searchQuery}&rdquo;</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Quick Trending Tags */}
          <div className="mt-3 -mx-4 px-4 min-w-0 flex items-center gap-2 overflow-x-auto no-scrollbar sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center">
            <span className="shrink-0 text-[11px] text-slate-300 font-medium mr-1">Trending:</span>
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleQuickTagClick(tag)}
                className="shrink-0 text-xs sm:text-[11px] px-3.5 py-2 sm:px-2.5 sm:py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-sky-200 border border-white/15 transition hover:text-white cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile-First Action Buttons */}
        <div data-hero-item className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center gap-3 w-full max-w-md sm:max-w-none sm:w-auto">
          <Link
            data-magnetic
            href="/trips"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 sm:py-3.5 rounded-full bg-brand-ocean hover:bg-brand-ocean-light text-white font-semibold text-xs sm:text-sm tracking-wide shadow-xl hover:shadow-cyan-500/25 transition duration-300 active:scale-[0.98]"
          >
            <span>Explore All Trips</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            data-magnetic
            href="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 sm:py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold text-xs sm:text-sm tracking-wide transition duration-300 active:scale-[0.98]"
          >
            <Compass className="w-4 h-4 text-brand-sky" />
            <span>Custom Plan</span>
          </Link>
        </div>

        {/* Minimalist Scene Indicators */}
        <div data-hero-item className="mt-8 sm:mt-10 flex items-center justify-center space-x-2 sm:space-x-3">
          {HERO_SCENES.map((_, idx) => {
            const isActive = idx === currentSceneIndex;
            return (
              <button
                key={idx}
                onClick={() => setCurrentSceneIndex(idx)}
                aria-label={`Switch to video background ${idx + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition duration-500",
                  isActive
                    ? "w-8 sm:w-10 bg-brand-sky shadow-md shadow-sky-400/50"
                    : "w-2.5 sm:w-3 bg-white/30 hover:bg-white/60"
                )}
              />
            );
          })}
        </div>
      </div>
      {/* Scroll cue */}
      <div aria-hidden className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 hidden sm:flex flex-col items-center gap-2 text-white/60 text-[10px] font-semibold">
        <span>Scroll</span>
        <span className="relative h-10 w-px overflow-hidden bg-white/25">
          <span className="absolute inset-x-0 top-0 h-1/2 bg-brand-sky animate-[sa-scroll-cue_1.8s_ease-in-out_infinite]" />
        </span>
      </div>
    </section>
  );
}

/** Background video for the active scene: mounted after page load, phone-sized on phones, skipped on Data Saver. */
function HeroVideo({ url, poster, onReady }: { url: string; poster: string; onReady: () => void }) {
  const src = useDeferredVideo(url);
  if (!src) return null;
  return (
    <video
      key={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      onCanPlay={onReady}
      className="absolute inset-0 w-full h-full object-cover object-center scale-105"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
