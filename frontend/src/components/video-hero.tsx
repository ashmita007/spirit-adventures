"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Compass, Search, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
    video8kUrl: "/videos/hero/rhythms_of_india.mp4",
    videoUrl: "/videos/hero/rhythms_of_india.mp4",
    posterUrl: "/videos/hero/rhythms_of_india_poster.jpg",
  },
  {
    id: 2,
    video8kUrl: "/videos/hero/maldives_travel.mp4",
    videoUrl: "/videos/hero/maldives_travel.mp4",
    posterUrl: "/videos/hero/maldives_travel_poster.jpg",
  },
  {
    id: 3,
    video8kUrl: "/videos/hero/kerala_cinematic.mp4",
    videoUrl: "/videos/hero/kerala_cinematic.mp4",
    posterUrl: "/videos/hero/kerala_cinematic_poster.jpg",
  },
];

const POPULAR_TAGS = ["Gokarna", "Dandeli", "Kedarkantha", "Coorg", "Ladakh"];

export default function VideoHero({ onPlanTripClick }: VideoHeroProps) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  // Auto-cycle through scenes every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSceneIndex((prev) => (prev + 1) % HERO_SCENES.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/trips?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/trips");
    }
  };

  const handleQuickTagClick = (tag: string) => {
    router.push(`/trips?search=${encodeURIComponent(tag)}`);
  };

  return (
    <div className="relative min-h-[92vh] sm:min-h-screen w-full flex items-center justify-center overflow-hidden bg-brand-navy select-none">
      {/* 1. Full-Screen Clean Video Background with Instant Poster & Smooth Playback */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {HERO_SCENES.map((scene, idx) => {
          const isActive = idx === currentSceneIndex;
          const isNext = idx === (currentSceneIndex + 1) % HERO_SCENES.length;

          return (
            <div
              key={scene.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                isActive ? "opacity-100 z-10" : "opacity-0 z-0"
              )}
            >
              {/* Instant High-Res Poster Image Background */}
              <img
                src={scene.posterUrl}
                alt="Adventure Scene"
                className="absolute inset-0 w-full h-full object-cover object-center scale-105"
                loading={idx === 0 ? "eager" : "lazy"}
              />

              {/* Ultra-Fast Web Stream Video (loaded only for active & next scene) */}
              {(isActive || isNext) && (
                <video
                  poster={scene.posterUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload={isActive ? "auto" : "metadata"}
                  onCanPlay={() => {
                    if (isActive) setIsLoaded(true);
                  }}
                  className="absolute inset-0 w-full h-full object-cover object-center animate-cinematic-zoom scale-105 transition-opacity duration-700"
                >
                  <source src={scene.videoUrl} type="video/mp4" />
                </video>
              )}
            </div>
          );
        })}
      </div>

      {/* 2. Atmospheric Dark Vignette & Gradient Overlays */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-brand-navy via-brand-navy/40 to-black/60 pointer-events-none" />
      <div className="absolute inset-0 z-10 bg-radial-vignette opacity-75 pointer-events-none" />

      {/* 3. Mobile-First Hero Content */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 text-center pt-24 pb-16 sm:py-32 flex flex-col items-center">
        {/* Sleek Pill Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 text-white text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] shadow-2xl animate-fade-in mb-4 sm:mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Himalayas & South India Expeditions</span>
        </div>

        {/* Impactful Heading */}
        <h1 className="font-display font-black text-3xl sm:text-5xl md:text-7xl lg:text-8xl tracking-tight text-white uppercase leading-[1.08] drop-shadow-2xl text-balance">
          FIND YOUR NEXT <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-sky-300 to-white">
            ADVENTURE
          </span>
        </h1>

        {/* Concise Subtitle */}
        <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-slate-200/90 max-w-xl font-normal leading-relaxed text-balance drop-shadow">
          High-altitude Himalayan passes, South Indian river rafting, and Western Ghats jungle treks with certified expedition leaders.
        </p>

        {/* 4. Responsive Search Bar for Mobile & Desktop */}
        <div className="w-full max-w-xl mt-6 sm:mt-8">
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center bg-white/95 backdrop-blur-xl rounded-full p-1.5 sm:p-2 shadow-2xl border border-white/40 focus-within:ring-2 focus-within:ring-brand-sky focus-within:bg-white transition-all duration-300"
          >
            <div className="pl-3 sm:pl-4 text-slate-400">
              <Search className="w-5 h-5 text-brand-ocean" />
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destination, trek name, rafting, snow..."
              className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-brand-navy placeholder:text-slate-400 focus:outline-none font-medium"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full mr-1 transition"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              className="flex-shrink-0 inline-flex items-center space-x-1.5 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-brand-ocean hover:bg-brand-navy text-white text-xs sm:text-sm font-bold tracking-wider transition-all duration-200 shadow-md active:scale-95"
            >
              <span>Search</span>
              <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
            </button>
          </form>

          {/* Quick Trending Tags */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <span className="text-[11px] text-slate-300 font-medium mr-1">Trending:</span>
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleQuickTagClick(tag)}
                className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-sky-200 border border-white/15 transition backdrop-blur-xs hover:text-white"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile-First Action Buttons */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center gap-3 w-full max-w-md sm:max-w-none sm:w-auto">
          <Link
            href="/trips"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 sm:py-3.5 rounded-full bg-brand-ocean hover:bg-brand-ocean-light text-white font-semibold text-xs sm:text-sm tracking-wide shadow-xl hover:shadow-cyan-500/25 transition-all duration-300 active:scale-[0.98]"
          >
            <span>Explore All Trips</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 sm:py-3.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white font-semibold text-xs sm:text-sm tracking-wide transition-all duration-300 active:scale-[0.98]"
          >
            <Compass className="w-4 h-4 text-brand-sky" />
            <span>Plan My Custom Trip</span>
          </Link>
        </div>

        {/* Minimalist Scene Indicators */}
        <div className="mt-8 sm:mt-10 flex items-center justify-center space-x-2 sm:space-x-3">
          {HERO_SCENES.map((_, idx) => {
            const isActive = idx === currentSceneIndex;
            return (
              <button
                key={idx}
                onClick={() => setCurrentSceneIndex(idx)}
                aria-label={`Switch to video background ${idx + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  isActive
                    ? "w-8 sm:w-10 bg-brand-sky shadow-md shadow-sky-400/50"
                    : "w-2.5 sm:w-3 bg-white/30 hover:bg-white/60"
                )}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
