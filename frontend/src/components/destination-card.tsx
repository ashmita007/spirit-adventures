"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Compass } from "lucide-react";
import { Destination } from "@/lib/types";

interface DestinationCardProps {
  destination: Destination;
}

export default function DestinationCard({ destination }: DestinationCardProps) {
  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className="group relative block aspect-[4/5] sm:aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
    >
      {/* Background Image */}
      <Image
        src={destination.cover_image}
        alt={destination.name}
        fill
        sizes="(max-width: 768px) 80vw, (max-width: 1200px) 33vw, 25vw"
        className="object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
      />

      {/* Atmospheric Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/30 to-black/20 group-hover:via-brand-navy/40 transition-colors duration-300" />

      {/* Content Overlay */}
      <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
        {/* Top Tag */}
        <div className="flex justify-between items-center">
          <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-semibold uppercase tracking-widest border border-white/20">
            {destination.trip_count ? `${destination.trip_count} Adventures` : "Explore"}
          </span>
          <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-white group-hover:text-brand-navy transition-colors">
            <Compass className="w-4 h-4" />
          </div>
        </div>

        {/* Bottom Title & Action */}
        <div>
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-brand-sky block mb-1">
            Region
          </span>
          <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-wide uppercase leading-tight">
            {destination.name}
          </h3>
          {destination.subtitle && (
            <p className="text-xs text-slate-300 mt-1 line-clamp-1 font-light">
              {destination.subtitle}
            </p>
          )}

          <div className="mt-4 inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-white group-hover:text-brand-sky transition-colors">
            <span>Explore Adventures</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
