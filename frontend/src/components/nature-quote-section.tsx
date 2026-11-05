"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Compass, Sparkles } from "lucide-react";

export default function NatureQuoteSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);

  const posterUrl = "https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341314/spirit_adventures/hero/maldives_travel_poster.jpg";
  const videoUrl = "https://res.cloudinary.com/xvxaicfe/video/upload/w_1280,c_limit,q_auto:good,vc_h264,br_1500k/v1790341162/spirit_adventures/nature/waterfall.mp4";

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (inView && videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
  }, [inView]);

  return (
    <section ref={sectionRef} className="relative h-[65vh] sm:h-[75vh] w-full flex items-center justify-center overflow-hidden bg-brand-navy select-none">
      {/* Parallax media layer (taller than the section so it can drift) */}
      <div data-parallax="0.12" className="absolute -inset-y-[12%] inset-x-0 z-0 will-change-transform">
      <Image
        src={posterUrl}
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Cinematic Looping video with subtle zoom - mounted only when scrolled into view */}
      {inView && (
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-80 scale-105"
        />
      )}
      </div>

      {/* Atmospheric Vignette & Contrast Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/60 to-black/70 z-10" />
      <div className="absolute inset-0 bg-radial-vignette opacity-80 z-10 pointer-events-none" />

      {/* Storytelling Quote Overlay */}
      <div className="relative z-20 max-w-4xl mx-auto px-6 text-center text-white flex flex-col items-center">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-brand-sky text-xs font-bold uppercase tracking-[0.25em] shadow-lg mb-6" data-anim="fade-up">
          <Compass className="w-3.5 h-3.5 text-brand-sky" />
          <span>Wilderness Philosophy</span>
        </div>

        <h2 data-anim="heading" className="[perspective:800px] font-display font-black text-3xl sm:text-5xl md:text-7xl uppercase tracking-tight leading-[1.1] text-balance drop-shadow-2xl">
          &ldquo;The Mountain Calls.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-sky-300 to-white">
            The Journey Begins.&rdquo;
          </span>
        </h2>

        <p data-anim="scrub-words" className="mt-5 text-sm sm:text-base md:text-lg text-slate-100 max-w-xl mx-auto font-light leading-relaxed tracking-wide drop-shadow">
          Step beyond the noisy edge of city life. Discover stillness, alpine scale, and the ancient healing rhythm of the wild.
        </p>
      </div>
    </section>
  );
}
