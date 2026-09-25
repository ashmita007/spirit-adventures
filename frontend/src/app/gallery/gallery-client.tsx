"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Maximize2, Camera } from "lucide-react";
import { GalleryImage } from "@/lib/types";
import { cn } from "@/lib/utils";
import Lightbox from "@/components/lightbox";

interface GalleryClientProps {
  initialImages: GalleryImage[];
}

const CATEGORIES = ["All", "Mountains", "Camping", "Lakes", "Treks", "Sunrises"];

export default function GalleryClient({ initialImages }: GalleryClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredImages = selectedCategory === "All"
    ? initialImages
    : initialImages.filter((img) => img.category.toLowerCase() === selectedCategory.toLowerCase());

  const lightboxImages = filteredImages.map((img) => ({
    url: img.image_url,
    title: img.title,
    caption: `${img.location || ""} • ${img.caption || ""}`.trim(),
  }));

  return (
    <div>
      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-2 mb-8">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-sm border flex-shrink-0",
                isSelected
                  ? "bg-brand-navy text-white border-brand-navy shadow"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              )}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredImages.map((img, idx) => (
          <div
            key={img.id}
            onClick={() => setLightboxIndex(idx)}
            className="group relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <Image
              src={img.image_url}
              alt={img.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-5 flex flex-col justify-between">
              <div className="self-end p-2 rounded-full bg-white/20 backdrop-blur-sm text-white">
                <Maximize2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-brand-sky block">
                  {img.category}
                </span>
                <h4 className="font-display font-bold text-base text-white leading-tight mt-0.5">
                  {img.title}
                </h4>
                {img.location && (
                  <p className="text-xs text-slate-300 mt-0.5">{img.location}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNext={() => setLightboxIndex((prev) => (prev! + 1) % lightboxImages.length)}
          onPrev={() => setLightboxIndex((prev) => (prev! - 1 + lightboxImages.length) % lightboxImages.length)}
        />
      )}
    </div>
  );
}
