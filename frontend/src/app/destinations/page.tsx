import React from "react";
import { Metadata } from "next";
import DestinationCard from "@/components/destination-card";
import { getDestinations } from "@/lib/api";
import PageHero from "@/components/page-hero";

export const metadata: Metadata = {
  alternates: { canonical: "/destinations" },
  title: "South India & Himalaya Trip Destinations | Spirit Adventures",
  description:
    "Trips to Coorg, Gokarna, Ooty, Wayanad, Munnar, Hampi, Goa and Pondicherry, plus Manali, Kashmir, Ladakh and Meghalaya. Group departures from Bengaluru, Hyderabad and Chennai.",
};

export default async function DestinationsPage() {
  const destinations = await getDestinations();

  return (
    <div className="min-h-dvh bg-white pb-20">
      <PageHero
        eyebrow="Sacred Lands & Wild Trails"
        title="Explore Destinations"
        subtitle={<>From the high alpine passes of the Himalayas to the dramatic basalt cliffs of the Western Ghats and coastal trails.</>}
        image="https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341327/spirit_adventures/shorts/coorg_mist_poster.jpg"
        crumbs={[{ label: "Destinations" }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div data-anim="stagger" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => (
            <DestinationCard key={dest.id} destination={dest} />
          ))}
        </div>
      </div>
    </div>
  );
}
