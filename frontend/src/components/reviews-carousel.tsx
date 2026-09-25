"use client";

import React from "react";
import Image from "next/image";
import { Star, CheckCircle, ExternalLink, Quote, Sparkles, MapPin } from "lucide-react";
import { Review } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ReviewsCarouselProps {
  reviews: Review[];
}

export default function ReviewsCarousel({ reviews }: ReviewsCarouselProps) {
  if (!reviews || reviews.length === 0) return null;

  // Split reviews into two tracks for rich dual-row infinite sliding
  const half = Math.ceil(reviews.length / 2);
  const row1 = reviews.slice(0, half);
  const row2 = reviews.slice(half);

  // Duplicate for seamless infinite loop
  const marqueeList1 = [...row1, ...row1, ...row1, ...row1];
  const marqueeList2 = [...row2, ...row2, ...row2, ...row2];

  return (
    <section className="py-12 sm:py-16 bg-slate-50/70 border-y border-slate-200/70 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-brand-ocean/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Compact Trust & Google Rating Bento Card */}
          <div className="lg:col-span-4 flex flex-col justify-between bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-sky/10 to-transparent rounded-bl-full pointer-events-none" />

            <div>
              {/* Badge */}
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/80 mb-4 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Google Verified Reviews</span>
              </div>

              <h2 className="font-display font-black text-2xl sm:text-3xl text-brand-navy uppercase tracking-tight leading-tight">
                Loved by 500+ Adventurers
              </h2>
              
              <p className="mt-2 text-slate-600 text-xs sm:text-sm leading-relaxed">
                Real stories from travelers who conquered mountain peaks, coastal cliffs, and white water rapids with us.
              </p>

              {/* Google Super Rating Display */}
              <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center p-2 shadow-2xs flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="w-full h-full">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-display font-black text-lg text-brand-navy">5.0 / 5.0</span>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500">120+ Verified Ratings on Google</p>
                </div>
              </div>
            </div>

            {/* Direct Google Action */}
            <a
              href="https://maps.app.goo.gl/4N6qZD9KAyb6pBA19"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl bg-brand-navy hover:bg-brand-ocean text-white text-xs font-bold transition shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>View Google Reviews</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Right Column: Trending Infinite Dual-Track Horizontal Marquee */}
          <div className="lg:col-span-8 relative overflow-hidden rounded-3xl py-1">
            {/* Gradient Edge Masks for High-End Fade Effect */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent z-20" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent z-20" />

            {/* Track 1: Moving Left */}
            <div className="animate-marquee-left flex space-x-4 mb-4">
              {marqueeList1.map((review, idx) => (
                <ReviewCardCompact key={`row1-${review.id}-${idx}`} review={review} />
              ))}
            </div>

            {/* Track 2: Moving Right */}
            <div className="animate-marquee-right flex space-x-4">
              {marqueeList2.map((review, idx) => (
                <ReviewCardCompact key={`row2-${review.id}-${idx}`} review={review} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function ReviewCardCompact({ review }: { review: Review }) {
  return (
    <div className="w-[320px] sm:w-[350px] flex-shrink-0 bg-white/90 hover:bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 hover:border-brand-sky/60 shadow-2xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 backdrop-blur-xs flex flex-col justify-between">
      <div>
        {/* Top: Stars + Trip Title Badge */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex text-amber-400">
            {[...Array(review.rating || 5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>

          {review.trip_title && (
            <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-brand-light text-brand-ocean text-[10px] font-bold uppercase tracking-wider border border-brand-sky/20 truncate max-w-[160px]">
              <MapPin className="w-2.5 h-2.5 text-brand-ocean flex-shrink-0" />
              <span className="truncate">{review.trip_title}</span>
            </div>
          )}
        </div>

        {/* Review snippet */}
        <p className="text-slate-700 text-xs sm:text-[13px] leading-relaxed line-clamp-3 font-normal">
          &ldquo;{review.review_text}&rdquo;
        </p>
      </div>

      {/* Footer: User Details */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2.5 min-w-0">
          {review.avatar_url ? (
            <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-brand-sky/30">
              <Image
                src={review.avatar_url}
                alt={review.traveler_name}
                fill
                sizes="32px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-brand-ocean text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
              {review.traveler_name.charAt(0)}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h4 className="font-display font-bold text-xs text-brand-navy truncate">
              {review.traveler_name}
            </h4>
            <p className="text-[10px] text-slate-500 truncate">
              {review.traveler_location || "Hyderabad"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70">
          <CheckCircle className="w-3 h-3 text-emerald-600" />
          <span>Verified</span>
        </div>
      </div>
    </div>
  );
}
