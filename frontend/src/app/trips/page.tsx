import React, { Suspense } from "react";
import { Metadata } from "next";
import TripsExplorer from "@/components/trips-explorer";
import { getTrips, getDestinations, getCategories } from "@/lib/api";

export const metadata: Metadata = {
  title: "Explore Packages & Expeditions | Spirit Adventures",
  description:
    "Browse our handpicked Himalayan treks, snow summits, alpine lakes, camping, and weekend nature expeditions with live backend filtering.",
};

interface TripsPageProps {
  searchParams: Promise<{
    category?: string;
    destination?: string;
    difficulty?: string;
    search?: string;
  }>;
}

export default async function TripsPage({ searchParams }: TripsPageProps) {
  const resolvedParams = await searchParams;
  const { category, destination, difficulty, search } = resolvedParams;

  const [trips, destinations, categories] = await Promise.all([
    getTrips({
      category,
      destination,
      difficulty,
      search,
    }),
    getDestinations(),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      {/* Header Banner */}
      <div className="bg-brand-light border-b border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-brand-ocean block mb-2">
            Curated Expeditions
          </span>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-brand-navy uppercase tracking-tight">
            Explore Packages & Adventures
          </h1>
          <p className="mt-3 text-slate-600 text-sm sm:text-base max-w-2xl">
            From snowy Himalayan ridge lines to deep Sahyadri canyons and coastal cliff walks. Filter by category, difficulty, destination, or search directly.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <Suspense
          fallback={
            <div className="w-full py-16 flex justify-center items-center">
              <div className="w-8 h-8 border-4 border-brand-ocean border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <TripsExplorer
            initialTrips={trips}
            destinations={destinations}
            categories={categories}
            initialCategory={category}
            initialDestination={destination}
            initialDifficulty={difficulty}
            initialSearch={search}
          />
        </Suspense>
      </div>
    </div>
  );
}
