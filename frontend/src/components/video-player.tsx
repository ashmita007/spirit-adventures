"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Play, X, Sparkles, Volume2, Maximize2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Extracts 11-character YouTube video ID from any format:
 * - https://www.youtube.com/watch?v=ID
 * - https://youtu.be/ID
 * - https://www.youtube.com/embed/ID
 * - https://www.youtube.com/shorts/ID
 * - Plain 11-char ID
 */
export function extractYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  const str = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) return str;
  const match = str.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i
  );
  return match ? match[1] : null;
}

export function isYouTubeUrl(url?: string | null): boolean {
  return extractYouTubeId(url) !== null;
}

interface VideoPlayerProps {
  url: string;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
  className?: string;
  showControls?: boolean;
}

/**
 * Universal HD Video Player:
 * Supports YouTube 1080p/4K HD embed and direct HTML5 (.mp4/.webm) videos with automatic detection.
 */
export function VideoPlayer({
  url,
  poster,
  title,
  autoPlay = false,
  className,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const ytId = extractYouTubeId(url);

  if (ytId) {
    const embedSrc = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=${
      isPlaying ? 1 : 0
    }&rel=0&modestbranding=1&enablejsapi=1&vq=hd1080&playsinline=1`;

    if (!isPlaying) {
      const fallbackPoster =
        poster || `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
      return (
        <div
          className={cn(
            "relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 group cursor-pointer border border-white/10 shadow-2xl",
            className
          )}
          onClick={() => setIsPlaying(true)}
        >
          <Image
            src={fallbackPoster}
            alt={title || "Video thumbnail"}
            fill
            sizes="(max-width: 1280px) 100vw, 1200px"
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 group-hover:bg-black/40 transition-colors" />

          {/* 4K Badge */}
          <div className="absolute top-4 left-4 z-10 flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span>YouTube 4K HD</span>
          </div>

          {/* Center Play Button */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-rose-600 group-active:scale-95 transition-all duration-300">
              <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-white ml-1" />
            </div>
          </div>

          {title && (
            <div className="absolute bottom-4 left-4 right-4 z-10 text-white">
              <p className="font-display font-bold text-sm sm:text-base line-clamp-1 drop-shadow">
                {title}
              </p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        className={cn(
          "relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-white/10 shadow-2xl",
          className
        )}
      >
        <iframe
          src={embedSrc}
          title={title || "YouTube video player"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    );
  }

  // Fallback to HTML5 Video for mp4/webm
  return (
    <div
      className={cn(
        "relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-white/10 shadow-2xl",
        className
      )}
    >
      <video
        src={url}
        poster={poster}
        controls
        autoPlay={autoPlay}
        playsInline
        className="w-full h-full object-cover"
      />
    </div>
  );
}

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
  destinationName?: string;
}

/**
 * Cinema Theater Video Modal:
 * Displays YouTube or MP4 videos in a theater backdrop overlay.
 */
export function VideoModal({
  isOpen,
  onClose,
  videoUrl,
  title,
  destinationName,
}: VideoModalProps) {
  const ytId = extractYouTubeId(videoUrl);

  // Close on Escape key & lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !videoUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-5xl bg-slate-950 rounded-3xl overflow-hidden border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.8)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span>4K CINEMA TOUR</span>
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-sm sm:text-base line-clamp-1">
                {title || (destinationName ? `${destinationName} 4K Experience` : "Adventure Video")}
              </h3>
              {destinationName && (
                <span className="text-xs text-slate-400">
                  📍 {destinationName} &bull; Spirit Adventures
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close video"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Area */}
        <div className="relative aspect-video w-full bg-black">
          {ytId ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1&vq=hd1080&playsinline=1`}
              title={title || "YouTube HD video player"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          ) : (
            <video
              src={videoUrl}
              autoPlay
              controls
              playsInline
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-900/80 text-xs text-slate-400 border-t border-white/5">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-brand-sky" />
            <span>Streamed in Ultra High Definition 1080p / 4K</span>
          </div>
          {ytId && (
            <a
              href={`https://www.youtube.com/watch?v=${ytId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-slate-400 hover:text-white transition"
            >
              <span>Watch on YouTube</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

interface WatchVideoButtonProps {
  videoUrl: string;
  title?: string;
  destinationName?: string;
  className?: string;
  variant?: "pill" | "glass" | "badge";
}

/**
 * Click-to-play button that triggers the HD Video Modal.
 */
export function WatchVideoButton({
  videoUrl,
  title,
  destinationName,
  className,
  variant = "glass",
}: WatchVideoButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  if (!videoUrl) return null;

  return (
    <>
      {variant === "glass" && (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className={cn(
            "group inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/25 text-white text-xs font-bold tracking-wider uppercase transition-all duration-200 active:scale-95 shadow-lg hover:shadow-rose-500/20 cursor-pointer",
            className
          )}
        >
          <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
            <Play className="w-2.5 h-2.5 fill-white ml-0.5" />
          </div>
          <span>Watch 4K Video</span>
        </button>
      )}

      {variant === "pill" && (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className={cn(
            "inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold tracking-wider transition-all duration-200 active:scale-95 shadow-xl hover:shadow-rose-600/30 cursor-pointer",
            className
          )}
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Play 4K Drone Tour</span>
        </button>
      )}

      {variant === "badge" && (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className={cn(
            "inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md text-white text-xs font-semibold transition active:scale-90 border border-white/20 shadow-md cursor-pointer",
            className
          )}
        >
          <Play className="w-3 h-3 fill-rose-500 text-rose-500" />
          <span>4K Tour</span>
        </button>
      )}

      <VideoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        videoUrl={videoUrl}
        title={title}
        destinationName={destinationName}
      />
    </>
  );
}
