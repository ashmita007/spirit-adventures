"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface LightboxProps {
  images: { url: string; caption?: string; title?: string }[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function Lightbox({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: LightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrev]);

  if (currentIndex < 0 || currentIndex >= images.length) return null;

  const currentImage = images[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close Lightbox"
        className="absolute top-5 right-5 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Prev Button */}
      {images.length > 1 && (
        <button
          onClick={onPrev}
          aria-label="Previous image"
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Main Image View */}
      <div className="relative max-w-5xl max-h-[85vh] w-full h-full flex flex-col items-center justify-center">
        <div className="relative w-full h-[75vh] flex items-center justify-center">
          <Image
            src={currentImage.url}
            alt={currentImage.title || currentImage.caption || "Nature Adventure"}
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />
        </div>

        {/* Caption */}
        {(currentImage.title || currentImage.caption) && (
          <div className="mt-4 text-center text-white max-w-xl">
            {currentImage.title && (
              <h4 className="font-bold text-base font-display">{currentImage.title}</h4>
            )}
            {currentImage.caption && (
              <p className="text-xs text-slate-300 mt-0.5">{currentImage.caption}</p>
            )}
          </div>
        )}

        {/* Counter */}
        <div className="absolute bottom-2 right-4 text-xs font-mono text-slate-400">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Next Button */}
      {images.length > 1 && (
        <button
          onClick={onNext}
          aria-label="Next image"
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
