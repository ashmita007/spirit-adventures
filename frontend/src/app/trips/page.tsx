import React, { Suspense } from "react";
import { Metadata } from "next";
import TripsExplorer from "@/components/trips-explorer";
import { getTrips, getDestinations, getCategories } from "@/lib/api";
import PageHero from "@/components/page-hero";

export const metadata: Metadata = {
  alternates: { canonical: "/trips" },
  title: "Weekend Trips & Tour Packages from Bengaluru | Spirit Adventures",
  description:
    "Weekend trips, treks and tour packages from Bengaluru, Hyderabad and Chennai: Coorg, Gokarna, Dandeli, Ooty, Wayanad, Munnar, Manali and more. Filter by place, days and price.",
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
    <div className="min-h-dvh bg-white pb-20">
      <PageHero
        eyebrow="All packages"
        title="Explore Packages & Adventures"
        subtitle={<>From snowy Himalayan ridge lines to deep Sahyadri canyons and coastal cliff walks. Filter by category, difficulty, destination, or search directly.</>}
        image="https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341328/spirit_adventures/shorts/chikmagalur_peak_poster.jpg"
        crumbs={[{ label: "Trips" }]}
      />

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
