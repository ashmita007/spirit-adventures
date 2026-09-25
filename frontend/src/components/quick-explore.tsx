"use client";

import React from "react";
import Link from "next/link";
import { Mountain, Tent, Waves, Snowflake, Sun, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickExploreProps {
  activeCategory?: string;
  onSelectCategory?: (slug: string) => void;
  isFilterMode?: boolean;
}

export const CATEGORIES = [
  { name: "Treks", slug: "treks", emoji: "🏔", icon: Mountain },
  { name: "Camping", slug: "camping", emoji: "🏕", icon: Tent },
  { name: "Water", slug: "water", emoji: "🌊", icon: Waves },
  { name: "Snow", slug: "snow", emoji: "❄", icon: Snowflake },
  { name: "Weekend", slug: "weekend", emoji: "🌄", icon: Sun },
  { name: "Group Trips", slug: "group-trips", emoji: "🔥", icon: Users },
];

export default function QuickExplore({
  activeCategory,
  onSelectCategory,
  isFilterMode = false,
}: QuickExploreProps) {
  return (
    <section className="py-8 sm:py-10 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-ocean">Discover by style</span>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-brand-navy">What are you looking for?</h2>
          </div>
          {!isFilterMode && (
            <Link
              href="/trips"
              className="text-xs font-semibold uppercase tracking-wider text-brand-ocean hover:text-brand-navy transition inline-flex items-center space-x-1"
            >
              <span>View All Categories</span>
              <span>→</span>
            </Link>
          )}
        </div>

        {/* Horizontal Chips Scroller */}
        <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar py-2 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
          {isFilterMode && (
            <button
              onClick={() => onSelectCategory && onSelectCategory("")}
              className={cn(
                "flex-shrink-0 px-5 py-2.5 rounded-full text-xs font-semibold transition-all shadow-sm border",
                !activeCategory
                  ? "bg-brand-navy text-white border-brand-navy shadow"
                  : "bg-brand-light text-slate-700 border-slate-200 hover:bg-slate-100"
              )}
            >
              ✨ All Adventures
            </button>
          )}

          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.slug;

            if (isFilterMode && onSelectCategory) {
              return (
                <button
                  key={cat.slug}
                  onClick={() => onSelectCategory(isSelected ? "" : cat.slug)}
                  className={cn(
                    "flex-shrink-0 flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all shadow-sm border",
                    isSelected
                      ? "bg-brand-ocean text-white border-brand-ocean shadow-md scale-[1.02]"
                      : "bg-brand-light text-slate-700 border-slate-200 hover:border-brand-ocean hover:bg-white"
                  )}
                >
                  <span className="text-base leading-none">{cat.emoji}</span>
                  <span>{cat.name}</span>
                </button>
              );
            }

            return (
              <Link
                key={cat.slug}
                href={`/trips?category=${cat.slug}`}
                className="flex-shrink-0 flex items-center space-x-2 px-5 py-3 rounded-full text-xs font-semibold bg-brand-light text-brand-dark border border-slate-200/80 hover:border-brand-ocean hover:bg-white hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
              >
                <span className="text-base leading-none">{cat.emoji}</span>
                <span>{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
