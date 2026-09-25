import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Compass, Mountain, MapPin } from "lucide-react";
import { getDestinationBySlug, getTrips } from "@/lib/api";
import TripCard from "@/components/trip-card";

interface DestinationPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: DestinationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) {
    return { title: "Destination Not Found | Spirit Adventures" };
  }
  return {
    title: `${destination.name} Adventures & Treks | Spirit Adventures`,
    description: destination.description,
    openGraph: {
      title: `${destination.name} - Spirit Adventures`,
      description: destination.description,
      images: [{ url: destination.cover_image }],
    },
  };
}

export default async function DestinationDetailPage({ params }: DestinationPageProps) {
  const { slug } = await params;
  const [destination, trips] = await Promise.all([
    getDestinationBySlug(slug),
    getTrips({ destination: slug }),
  ]);

  if (!destination) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      <div className="relative h-[50vh] sm:h-[60vh] w-full bg-brand-navy overflow-hidden">
        {(destination.hero_image || destination.cover_image).endsWith(".mp4") ? (
          <video
            src={destination.hero_image || destination.cover_image}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover object-center scale-105"
          />
        ) : (
          <Image
            src={destination.hero_image || destination.cover_image}
            alt={destination.name}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/50 to-black/50 pointer-events-none" />

        {/* Back Link */}
        <div className="absolute top-20 left-0 right-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/destinations"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>All Destinations</span>
            </Link>
          </div>
        </div>

        {/* Bottom Title */}
        <div className="absolute bottom-8 left-0 right-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-brand-sky block mb-2">
              Region Spotlight
            </span>
            <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight">
              {destination.name}
            </h1>
            {destination.subtitle && (
              <p className="text-slate-200 text-sm sm:text-base mt-1 max-w-xl">
                {destination.subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Description & Adventures Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mb-12">
          <h2 className="font-display font-bold text-xl text-brand-navy uppercase tracking-wide mb-3">
            About {destination.name}
          </h2>
          <p className="text-slate-700 text-base leading-relaxed">
            {destination.description}
          </p>
        </div>

        {/* Adventures in this region */}
        <div className="pt-8 border-t border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-ocean block">Available Journeys</span>
              <h3 className="font-display font-black text-2xl text-brand-navy uppercase tracking-tight">
                Trips in {destination.name} ({trips.length})
              </h3>
            </div>
          </div>

          {trips.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-brand-light rounded-3xl">
              <Compass className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600 text-sm">New itineraries for {destination.name} are being scheduled soon.</p>
              <Link
                href="/contact"
                className="mt-4 inline-block text-xs font-bold uppercase tracking-wider text-brand-ocean hover:underline"
              >
                Request a custom expedition →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
