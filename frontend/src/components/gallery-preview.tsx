"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, Maximize2, Sparkles, MapPin, Play, Pause, 
  ChevronLeft, ChevronRight, Camera, Users, Flame, Heart
} from "lucide-react";
import { GalleryImage } from "@/lib/types";
import Lightbox from "./lightbox";
import { cn } from "@/lib/utils";

interface GalleryPreviewProps {
  images: GalleryImage[];
}

// Default high-res client adventure moments to ensure a rich carousel if database has few
const CLIENT_COMMUNITY_PHOTOS: GalleryImage[] = [
  {
    id: 101,
    title: "Gokarna Beach Cliff Sunset Crew",
    category: "Beach & Cliffs",
    image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    caption: "Hyderabad weekend batch traversing Om beach cliffs",
    location: "Gokarna, Karnataka",
    is_featured: true
  },
  {
    id: 102,
    title: "Kedarkantha 12,500 ft Summit Team",
    category: "Summit Treks",
    image_url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
    caption: "Golden hour sunrise above Garhwal Himalaya snowline",
    location: "Kedarkantha Summit, Uttarakhand",
    is_featured: true
  },
  {
    id: 103,
    title: "Dandeli Kali River White Water Rapids",
    category: "Rafting & Water",
    image_url: "/videos/shorts/dandeli_rafting_poster.jpg",
    caption: "Conquering Grade 3 rapids with certified river marshals",
    location: "Dandeli, Karnataka",
    is_featured: true
  },
  {
    id: 104,
    title: "Coorg Tadiandamol Shola Ridge Walk",
    category: "Summit Treks",
    image_url: "/videos/shorts/coorg_mist_poster.jpg",
    caption: "Hiking through misty coffee estates and shola canopies",
    location: "Coorg, Karnataka",
    is_featured: true
  },
  {
    id: 105,
    title: "Starlit Campfire under Milky Way",
    category: "Camp & Bonfires",
    image_url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
    caption: "Acoustic music, warm bonfire, and stargazing",
    location: "Himachal Alpine Camp",
    is_featured: true
  },
  {
    id: 106,
    title: "Chikmagalur Mullayanagiri Cloud Walk",
    category: "Summit Treks",
    image_url: "/videos/shorts/chikmagalur_peak_poster.jpg",
    caption: "Walking above an ocean of clouds at sunrise",
    location: "Chikmagalur, Karnataka",
    is_featured: true
  },
  {
    id: 107,
    title: "Wayanad Chembra Heart Lake Trek",
    category: "Summit Treks",
    image_url: "/videos/shorts/wayanad_waterfall_poster.jpg",
    caption: "Naturally heart-shaped high altitude lake in Western Ghats",
    location: "Wayanad, Kerala",
    is_featured: true
  },
  {
    id: 108,
    title: "Kashmir Great Lakes Turquoise Reflection",
    category: "Summit Treks",
    image_url: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80",
    caption: "Pristine alpine lake meadows bordered by sharp peaks",
    location: "Kashmir Great Lakes",
    is_featured: true
  },
  {
    id: 109,
    title: "UNESCO Nilgiri Mountain Toy Train",
    category: "Beach & Cliffs",
    image_url: "/videos/shorts/ooty_train_poster.jpg",
    caption: "Scenic heritage railway journey through blue pine mountains",
    location: "Ooty, Tamil Nadu",
    is_featured: true
  },
  {
    id: 110,
    title: "Leh Ladakh Royal Enfield Highway Expedition",
    category: "Summit Treks",
    image_url: "/videos/hero/ladakh_bike_poster.jpg",
    caption: "Crossing Khardung La pass with backup support marshals",
    location: "Ladakh Trans-Himalayas",
    is_featured: true
  }
];

export default function GalleryPreview({ images }: GalleryPreviewProps) {
  // Combine database images with high-res client gallery items
  const allImages = images && images.length > 0 
    ? [...images, ...CLIENT_COMMUNITY_PHOTOS.filter(c => !images.some(i => i.title === c.title))]
    : CLIENT_COMMUNITY_PHOTOS;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredImages = selectedCategory === "All"
    ? allImages
    : allImages.filter(img => img.category?.toLowerCase().includes(selectedCategory.toLowerCase()));

  const displayList = filteredImages.length > 0 ? filteredImages : allImages;

  // Auto-changing images timer (every 4.5 seconds)
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % displayList.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPlaying, displayList.length]);

  const currentImage = displayList[activeIndex] || displayList[0];

  const lightboxImages = allImages.map((img) => ({
    url: img.image_url,
    title: img.title,
    caption: `${img.location || ""} ${img.caption ? `• ${img.caption}` : ""}`.trim(),
  }));

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % displayList.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + displayList.length) % displayList.length);
  };

  const openInLightbox = (imgUrl: string) => {
    const idx = allImages.findIndex(i => i.image_url === imgUrl);
    setLightboxIndex(idx !== -1 ? idx : 0);
  };

  const categories = ["All", "Summit Treks", "Beach & Cliffs", "Rafting & Water", "Camp & Bonfires"];

  return (
    <section className="py-20 sm:py-28 bg-slate-900 text-white relative overflow-hidden select-none">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-brand-ocean/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-brand-sky text-xs font-bold uppercase tracking-[0.2em] mb-3 border border-white/15 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live Client Photo Feed</span>
            </div>

            <h2 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight">
              Moments from the Wild
            </h2>
            <p className="mt-2 text-slate-300 text-sm sm:text-base max-w-xl font-light">
              Real unfiltered client pictures, summit highs, and cozy starry campfire memories from our weekly adventure batches.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/gallery"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition border border-white/20 shadow-xs group"
            >
              <span>View Full Gallery</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-6 scroll-smooth">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setActiveIndex(0);
              }}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 border",
                selectedCategory === cat
                  ? "bg-brand-ocean text-white border-brand-ocean shadow-md scale-[1.02]"
                  : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/15 hover:text-white"
              )}
            >
              {cat === "All" && "✨ "}
              {cat === "Summit Treks" && "🏔 "}
              {cat === "Beach & Cliffs" && "🌊 "}
              {cat === "Rafting & Water" && "🚣 "}
              {cat === "Camp & Bonfires" && "🏕 "}
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {/* 1. Spotlight Changing Showcase (Auto-Cycling with Crossfade) */}
        {currentImage && (
          <div className="relative w-full rounded-3xl overflow-hidden bg-slate-950 border border-white/15 shadow-2xl mb-12 aspect-[16/9] sm:aspect-[21/9] max-h-[520px]">
            {/* Background Image with smooth transition */}
            <Image
              key={currentImage.id}
              src={currentImage.image_url}
              alt={currentImage.title}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center animate-cinematic-zoom transition-opacity duration-1000"
            />

            {/* Dark Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40 pointer-events-none" />

            {/* Top Bar on Spotlight */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-brand-sky border border-white/15 shadow-md">
                  {currentImage.category || "Adventure"}
                </span>
                <span className="hidden sm:inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md text-[11px] font-bold text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Real Client Photo</span>
                </span>
              </div>

              {/* Autoplay Play/Pause Toggle & Expand Button */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  aria-label={isPlaying ? "Pause automatic slideshow" : "Play automatic slideshow"}
                  className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-transform active:scale-90"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                </button>

                <button
                  onClick={() => openInLightbox(currentImage.image_url)}
                  aria-label="View photo in full screen"
                  className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-transform active:scale-90"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bottom Content & Interactive Arrows */}
            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 z-10">
              <div className="max-w-2xl">
                {currentImage.location && (
                  <div className="flex items-center space-x-1.5 text-brand-sky text-xs font-semibold mb-1 drop-shadow">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{currentImage.location}</span>
                  </div>
                )}
                <h3 className="font-display font-black text-xl sm:text-3xl text-white leading-tight drop-shadow-lg">
                  {currentImage.title}
                </h3>
                {currentImage.caption && (
                  <p className="text-slate-200 text-xs sm:text-sm mt-1.5 line-clamp-2 font-light drop-shadow">
                    {currentImage.caption}
                  </p>
                )}
              </div>

              {/* Slideshow Progress & Prev/Next Controls */}
              <div className="flex items-center space-x-3 self-end sm:self-auto">
                <span className="text-xs font-mono font-bold text-slate-300">
                  {activeIndex + 1} / {displayList.length}
                </span>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={handlePrev}
                    aria-label="Previous photo"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-transform active:scale-90"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label="Next photo"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-transform active:scale-90"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Auto-advance animated progress bar at bottom */}
            {isPlaying && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                <div
                  key={activeIndex}
                  className="h-full bg-brand-sky transition-all duration-[4500ms] ease-linear w-full"
                  style={{
                    animation: "progress 4.5s linear infinite"
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* 2. Dual-Row Infinite Animated Client Photos Stream (Marquee) */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              ⚡ Infinite Traveler Reel (Hover to Pause)
            </span>
          </div>

          {/* Row 1: Sliding Left */}
          <div className="overflow-hidden relative py-2">
            <div className="animate-marquee-left flex space-x-4 sm:space-x-6">
              {[...allImages, ...allImages].map((img, idx) => (
                <div
                  key={`${img.id}-r1-${idx}`}
                  onClick={() => openInLightbox(img.image_url)}
                  className="group relative w-56 sm:w-72 aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer flex-shrink-0 border border-white/10 shadow-lg transition-all duration-300 hover:scale-105 hover:border-brand-sky/60 hover:shadow-cyan-500/20"
                >
                  <Image
                    src={img.image_url}
                    alt={img.title}
                    fill
                    sizes="300px"
                    className="object-cover object-center group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-60 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                    <span className="self-start text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-black/60 text-brand-sky backdrop-blur-xs border border-white/10">
                      {img.category}
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-white line-clamp-1">
                        {img.title}
                      </h4>
                      {img.location && (
                        <p className="text-[10px] text-slate-300 line-clamp-1">{img.location}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Sliding Right */}
          <div className="overflow-hidden relative py-2">
            <div className="animate-marquee-right flex space-x-4 sm:space-x-6">
              {[...allImages.slice().reverse(), ...allImages.slice().reverse()].map((img, idx) => (
                <div
                  key={`${img.id}-r2-${idx}`}
                  onClick={() => openInLightbox(img.image_url)}
                  className="group relative w-56 sm:w-72 aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer flex-shrink-0 border border-white/10 shadow-lg transition-all duration-300 hover:scale-105 hover:border-brand-sky/60 hover:shadow-cyan-500/20"
                >
                  <Image
                    src={img.image_url}
                    alt={img.title}
                    fill
                    sizes="300px"
                    className="object-cover object-center group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-60 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                    <span className="self-start text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-black/60 text-emerald-300 backdrop-blur-xs border border-white/10">
                      {img.location?.split(",")[0] || "Wilderness"}
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-white line-clamp-1">
                        {img.title}
                      </h4>
                      {img.caption && (
                        <p className="text-[10px] text-slate-300 line-clamp-1">{img.caption}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <Lightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNext={() => setLightboxIndex((prev) => (prev! + 1) % lightboxImages.length)}
          onPrev={() => setLightboxIndex((prev) => (prev! - 1 + lightboxImages.length) % lightboxImages.length)}
        />
      )}
    </section>
  );
}
