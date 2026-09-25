"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Heart, 
  Share2, 
  X, 
  Sparkles, 
  MapPin, 
  Compass, 
  Flame, 
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdventureShort {
  id: string;
  title: string;
  location: string;
  state: string;
  region: "South India" | "Himalayas" | "Western Ghats";
  videoUrl: string;
  posterUrl: string;
  likes: number;
  views: string;
  tripSlug: string;
  badge: string;
  duration: string;
}

export const ADVENTURE_SHORTS: AdventureShort[] = [
  {
    id: "dandeli-rafting",
    title: "Kali River Grade 3 White Water Rafting",
    location: "Dandeli, Karnataka",
    state: "Karnataka",
    region: "South India",
    videoUrl: "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341176/spirit_adventures/shorts/dandeli_rafting.mp4",
    posterUrl: "https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341325/spirit_adventures/shorts/dandeli_rafting_poster.jpg",
    likes: 3420,
    views: "48K",
    tripSlug: "dandeli-river-rafting-jungle-expedition",
    badge: "🌊 Water Sports",
    duration: "2D / 1N"
  },
  {
    id: "gokarna-beach",
    title: "Golden Hour Cliff Trek & Stargazing Camp",
    location: "Gokarna, Karnataka",
    state: "Karnataka",
    region: "South India",
    videoUrl: "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341208/spirit_adventures/shorts/gokarna_beach.mp4",
    posterUrl: "https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341326/spirit_adventures/shorts/gokarna_beach_poster.jpg",
    likes: 4890,
    views: "62K",
    tripSlug: "gokarna-beach-cliff-trek",
    badge: "🌅 Beach & Cliff",
    duration: "3D / 2N"
  },
  {
    id: "coorg-mist",
    title: "Misty Coffee Trails & Tadiandamol Summit",
    location: "Coorg (Kodagu), Karnataka",
    state: "Karnataka",
    region: "South India",
    videoUrl: "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341227/spirit_adventures/shorts/coorg_mist.mp4",
    posterUrl: "https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341327/spirit_adventures/shorts/coorg_mist_poster.jpg",
    likes: 2980,
    views: "39K",
    tripSlug: "coorg-tadiandamol-coffee-trail",
    badge: "☕ Rainforest & Mist",
    duration: "2D / 1N"
  },
  {
    id: "chikmagalur-peak",
    title: "Above the Clouds at Mullayanagiri Peak",
    location: "Chikmagalur, Karnataka",
    state: "Karnataka",
    region: "South India",
    videoUrl: "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341233/spirit_adventures/shorts/chikmagalur_peak.mp4",
    posterUrl: "https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341328/spirit_adventures/shorts/chikmagalur_peak_poster.jpg",
    likes: 5120,
    views: "71K",
    tripSlug: "chikmagalur-mullayanagiri-ridge-trek",
    badge: "⛰ Highest Peak",
    duration: "2D / 1N"
  },
  {
    id: "wayanad-waterfall",
    title: "Chembra Heart Lake & Cascading Waterfalls",
    location: "Wayanad, Kerala",
    state: "Kerala",
    region: "South India",
    videoUrl: "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341310/spirit_adventures/shorts/wayanad_waterfall.mp4",
    posterUrl: "https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341330/spirit_adventures/shorts/wayanad_waterfall_poster.jpg",
    likes: 4180,
    views: "54K",
    tripSlug: "wayanad-chembra-peak-waterfall-trail",
    badge: "💚 Kerala Wilds",
    duration: "3D / 2N"
  },
  {
    id: "ooty-train",
    title: "Nilgiri Mountain Train & Pine Forests",
    location: "Ooty, Tamil Nadu",
    state: "Tamil Nadu",
    region: "South India",
    videoUrl: "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341289/spirit_adventures/shorts/ooty_train.mp4",
    posterUrl: "https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341329/spirit_adventures/shorts/ooty_train_poster.jpg",
    likes: 3870,
    views: "44K",
    tripSlug: "ooty-nilgiri-pine-forest-expedition",
    badge: "🚂 Heritage Nilgiris",
    duration: "3D / 2N"
  }
];

export default function AdventureReelsSection() {
  const [activeShort, setActiveShort] = useState<AdventureShort | null>(null);
  const [likedShorts, setLikedShorts] = useState<Record<string, boolean>>({});
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const modalVideoRef = useRef<HTMLVideoElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const toggleLike = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLikedShorts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenReel = (item: AdventureShort) => {
    setActiveShort(item);
    setIsPlaying(true);
  };

  const handleCloseReel = () => {
    setActiveShort(null);
  };

  const handleNextReel = () => {
    if (!activeShort) return;
    const currentIndex = ADVENTURE_SHORTS.findIndex((s) => s.id === activeShort.id);
    const nextIndex = (currentIndex + 1) % ADVENTURE_SHORTS.length;
    setActiveShort(ADVENTURE_SHORTS[nextIndex]);
  };

  const handlePrevReel = () => {
    if (!activeShort) return;
    const currentIndex = ADVENTURE_SHORTS.findIndex((s) => s.id === activeShort.id);
    const prevIndex = (currentIndex - 1 + ADVENTURE_SHORTS.length) % ADVENTURE_SHORTS.length;
    setActiveShort(ADVENTURE_SHORTS[prevIndex]);
  };

  const scrollHorizontally = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="py-12 sm:py-20 bg-slate-950 text-white relative overflow-hidden border-t border-b border-white/5">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-ocean/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Flame className="w-3.5 h-3.5" />
              <span>Trending Shorts & Stories</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight uppercase">
              South India & Himalayan <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-sky-300 to-cyan-200">Reels</span>
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
              Immersive quick shorts from our real expeditions across Gokarna, Dandeli, Coorg, Chikmagalur, Ooty & Wayanad.
            </p>
          </div>

          {/* Desktop Navigation Arrows */}
          <div className="hidden sm:flex items-center space-x-3 mt-4 md:mt-0">
            <button
              onClick={() => scrollHorizontally("left")}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-all"
              aria-label="Previous reels"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => scrollHorizontally("right")}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-all"
              aria-label="Next reels"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* 1. Mobile-First Quick Story Circles */}
        <div className="flex items-center space-x-4 overflow-x-auto pb-4 scrollbar-none snap-x mb-8 sm:mb-12">
          {ADVENTURE_SHORTS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleOpenReel(item)}
              className="flex-shrink-0 flex flex-col items-center space-y-1.5 focus:outline-none group snap-start"
            >
              <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-cyan-400 group-hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden p-0.5 bg-slate-950">
                  <div className="relative w-full h-full rounded-full overflow-hidden">
                    <Image
                      src={item.posterUrl}
                      alt={item.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 p-1 bg-brand-ocean rounded-full text-white shadow-md">
                  <Play className="w-2.5 h-2.5 fill-current" />
                </div>
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-200 group-hover:text-cyan-300 max-w-[72px] truncate text-center">
                {item.location.split(",")[0]}
              </span>
            </button>
          ))}
        </div>

        {/* 2. Vertical Shorts Card Carousel (9:16 aspect ratio) */}
        <div 
          ref={scrollContainerRef}
          className="flex space-x-4 sm:space-x-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory"
        >
          {ADVENTURE_SHORTS.map((item) => {
            const isLiked = !!likedShorts[item.id];
            return (
              <div
                key={item.id}
                onClick={() => handleOpenReel(item)}
                className="flex-shrink-0 w-[240px] sm:w-[280px] aspect-[9/16] rounded-2xl overflow-hidden relative group cursor-pointer border border-white/10 shadow-2xl snap-start bg-slate-900 transition-all duration-300 hover:scale-[1.02]"
              >
                {/* Looping video preview */}
                <video
                  src={item.videoUrl}
                  poster={item.posterUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Subtle dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 pointer-events-none" />

                {/* Top Badge & Views */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/15">
                    {item.badge}
                  </span>
                  <span className="text-[11px] font-semibold text-white/90 drop-shadow flex items-center space-x-1">
                    <Play className="w-3 h-3 fill-current text-white/80" />
                    <span>{item.views}</span>
                  </span>
                </div>

                {/* Bottom Content & Meta */}
                <div className="absolute bottom-3 left-3 right-3 z-10">
                  <div className="flex items-center space-x-1 text-cyan-300 text-[11px] font-semibold mb-1">
                    <MapPin className="w-3 h-3" />
                    <span>{item.location}</span>
                  </div>
                  <h3 className="font-bold text-sm text-white line-clamp-2 leading-snug drop-shadow-md">
                    {item.title}
                  </h3>

                  {/* Actions Bar */}
                  <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center justify-between">
                    <span className="text-[11px] text-slate-300 font-medium">
                      ⏱ {item.duration}
                    </span>
                    <button
                      onClick={(e) => toggleLike(item.id, e)}
                      className="flex items-center space-x-1 text-xs font-semibold hover:scale-110 transition-transform"
                    >
                      <Heart
                        className={cn(
                          "w-4 h-4 transition-colors",
                          isLiked ? "fill-rose-500 text-rose-500" : "text-white"
                        )}
                      />
                      <span className="text-white text-[11px]">
                        {item.likes + (isLiked ? 1 : 0)}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Center Play Icon on Hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[1px]">
                  <div className="w-12 h-12 rounded-full bg-brand-ocean/90 text-white flex items-center justify-center shadow-xl scale-90 group-hover:scale-100 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Immersive Full-Screen Shorts Modal */}
      {activeShort && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-0 sm:p-4 animate-fade-in">
          {/* Close Button */}
          <button
            onClick={handleCloseReel}
            className="absolute top-4 right-4 z-50 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md border border-white/20"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Desktop Next/Prev Arrow Controls */}
          <button
            onClick={handlePrevReel}
            className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center backdrop-blur-md border border-white/20 transition-all hover:scale-110"
            aria-label="Previous reel"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNextReel}
            className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center backdrop-blur-md border border-white/20 transition-all hover:scale-110"
            aria-label="Next reel"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Vertical Reel Container */}
          <div className="relative w-full sm:max-w-[420px] h-full sm:h-[88vh] sm:rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl flex flex-col justify-between">
            {/* Reel Video Player */}
            <video
              ref={modalVideoRef}
              src={activeShort.videoUrl}
              poster={activeShort.posterUrl}
              autoPlay
              muted={isMuted}
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover z-0"
              onClick={() => {
                if (modalVideoRef.current) {
                  if (isPlaying) {
                    modalVideoRef.current.pause();
                    setIsPlaying(false);
                  } else {
                    modalVideoRef.current.play();
                    setIsPlaying(true);
                  }
                }
              }}
            />

            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/60 pointer-events-none z-10" />

            {/* Top Reel Bar */}
            <div className="relative z-20 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-white border border-white/10">
                  {activeShort.badge}
                </span>
                <span className="text-xs text-slate-200 font-medium">📍 {activeShort.location}</span>
              </div>

              {/* Sound Toggle */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/20 flex items-center justify-center"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>

            {/* Right Side Social Floating Bar */}
            <div className="absolute right-4 bottom-28 z-20 flex flex-col items-center space-y-4">
              <button
                onClick={() => toggleLike(activeShort.id)}
                className="flex flex-col items-center group"
              >
                <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Heart
                    className={cn(
                      "w-6 h-6",
                      likedShorts[activeShort.id] ? "fill-rose-500 text-rose-500" : "text-white"
                    )}
                  />
                </div>
                <span className="text-xs font-bold text-white mt-1">
                  {activeShort.likes + (likedShorts[activeShort.id] ? 1 : 0)}
                </span>
              </button>

              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: activeShort.title,
                      url: window.location.href,
                    }).catch(() => {});
                  }
                }}
                className="flex flex-col items-center group"
              >
                <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Share2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-bold text-white mt-1">Share</span>
              </button>
            </div>

            {/* Bottom Trip Info & Booking CTA */}
            <div className="relative z-20 p-5 space-y-3">
              <h3 className="text-lg font-bold text-white leading-snug drop-shadow-md">
                {activeShort.title}
              </h3>
              <p className="text-xs text-slate-200 line-clamp-2 font-light">
                Discover the raw beauty of {activeShort.location}. Certified guides, local stays, and safety gear included.
              </p>

              <div className="flex items-center space-x-3 pt-2">
                <Link
                  href={`/trips/${activeShort.tripSlug}`}
                  onClick={handleCloseReel}
                  className="flex-1 py-3 px-4 rounded-xl bg-brand-ocean hover:bg-brand-ocean-light text-white font-bold text-sm text-center shadow-lg transition-all active:scale-95"
                >
                  View Trip Details
                </Link>

                <Link
                  href="/contact"
                  onClick={handleCloseReel}
                  className="py-3 px-4 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white font-bold text-sm text-center transition-all active:scale-95"
                >
                  Inquire Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
