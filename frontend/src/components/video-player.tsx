"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

/**
 * Clean native HTML5 video player (zero iframe / tracking embeds).
 */
export function VideoPlayer({
  url,
  poster,
  title,
  autoPlay = false,
  className,
}: VideoPlayerProps) {
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

export function VideoModal({ isOpen }: VideoModalProps) {
  if (!isOpen) return null;
  return null;
}

export function WatchVideoButton() {
  return null;
}
