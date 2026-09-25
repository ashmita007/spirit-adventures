import React from "react";
import { Metadata } from "next";
import DestinationCard from "@/components/destination-card";
import { getDestinations } from "@/lib/api";

export const metadata: Metadata = {
  title: "Destinations & Regions | Spirit Adventures",
  description: "Explore majestic mountains and wilderness landscapes of Uttarakhand, Himachal, Kashmir, Ladakh, Maharashtra, and Karnataka.",
};

export default async function DestinationsPage() {
  const destinations = await getDestinations();

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="bg-brand-light border-b border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-brand-ocean block mb-2">
            Sacred Lands & Wild Trails
          </span>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-brand-navy uppercase tracking-tight">
            Explore Destinations
          </h1>
          <p className="mt-3 text-slate-600 text-sm sm:text-base max-w-2xl">
            From the high alpine passes of the Himalayas to the dramatic basalt cliffs of the Western Ghats and coastal trails.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => (
            <DestinationCard key={dest.id} destination={dest} />
          ))}
        </div>
      </div>
    </div>
  );
}
