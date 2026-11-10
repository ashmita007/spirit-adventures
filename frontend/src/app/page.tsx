import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Compass, Flame } from "lucide-react";
import VideoHero from "@/components/video-hero";
import TripCard from "@/components/trip-card";
import NatureQuoteSection from "@/components/nature-quote-section";
import WhyUs from "@/components/why-us";
import ReviewsCarousel from "@/components/reviews-carousel";
import GalleryPreview from "@/components/gallery-preview";
import { getTrips, getReviews, getGallery, getDestinations } from "@/lib/api";
import TrustStrip from "@/components/trust-strip";

export default async function HomePage() {
  const [allTrips, reviews, galleryImages, destinations] = await Promise.all([
    getTrips(),
    getReviews(true),
    getGallery(),
    getDestinations(),
  ]);
  // Only count destinations that actually have trips
  const destinationCount = new Set(allTrips.map((t) => t.destination_name).filter(Boolean)).size || destinations.length;

  // Display 6 recent packages on the home page
  const recentTrips = allTrips.slice(0, 6);

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* 1. Cinematic Hero with Search Bar */}
      <VideoHero />
      <TrustStrip tripCount={allTrips.length} destinationCount={destinationCount} />

      {/* 2. Recent Packages & Expeditions Grid */}
      <section className="py-12 sm:py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-14">
            <div>

              <h2 data-anim="heading" className="[perspective:800px] font-display font-black text-3xl sm:text-5xl text-brand-navy uppercase tracking-tight">
                Recent Packages & Adventures
              </h2>
            </div>

            <Link
              href="/trips"
              className="hidden sm:inline-flex mt-4 sm:mt-0 items-center space-x-2 text-xs font-extrabold uppercase tracking-wide text-brand-ocean hover:text-brand-navy transition group"
            >
              <span className="whitespace-nowrap">Explore all packages</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile-First Grid (1 col on mobile, 2 on tablet, 3 on desktop) - 6 packages */}
          {/* Phones: swipeable row with a peek of the next card. Tablet/desktop: grid */}
          <div
            data-anim="stagger"
            className="-mx-4 px-4 flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-3 scroll-px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-8 sm:overflow-visible"
          >
            {recentTrips.map((trip, idx) => (
              <div key={trip.id} className="w-[84%] shrink-0 snap-start sm:w-full">
                <TripCard trip={trip} priority={idx < 2} />
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between sm:hidden">
            <span className="text-xs font-semibold text-slate-500">Swipe for more</span>
            <Link href="/trips" className="inline-flex h-11 items-center rounded-full bg-brand-navy px-5 text-xs font-bold uppercase tracking-wide text-white active:scale-95 transition">
              All {allTrips.length} trips
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Nature Experience Section: Full-Width Visual Storytelling */}
      <NatureQuoteSection />

      {/* 4. Why Spirit Adventures */}
      <WhyUs />

      {/* 5. Traveler Stories */}
      <ReviewsCarousel reviews={reviews} />

      {/* 6. Nature Gallery Preview */}
      <GalleryPreview images={galleryImages} />

      {/* 7. Final CTA Section: RHYTHM IN NAVY */}
      <section className="py-16 sm:py-32 bg-brand-navy text-white relative overflow-hidden">
        {/* Deep ambient glowing orbs */}
        <div data-parallax="0.35" className="absolute -top-32 -right-32 w-[32rem] h-[32rem] bg-brand-ocean/25 rounded-full blur-3xl pointer-events-none will-change-transform [transform:translateZ(0)]" />
        <div data-parallax="-0.3" className="absolute -bottom-32 -left-32 w-[32rem] h-[32rem] bg-brand-sky/20 rounded-full blur-3xl pointer-events-none will-change-transform [transform:translateZ(0)]" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center z-10">

          <h2 data-anim="heading" className="[perspective:800px] font-display font-black text-3xl sm:text-5xl md:text-6xl uppercase tracking-tight leading-[1.08]">
            Leave the Noise Behind. <br />
            <span>
              Your Mountain Awaits.
            </span>
          </h2>

          <p data-anim="fade-up" className="mt-5 text-slate-300 text-sm sm:text-base md:text-lg max-w-xl mx-auto font-light leading-relaxed">
            Himalayan summits, beach camps or river rafting: our certified trip captains lead every batch.
          </p>

          <div data-anim="fade-up" className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              data-magnetic
              href="/trips"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-9 py-4 rounded-full bg-brand-ocean hover:bg-brand-ocean-light text-white font-bold text-sm uppercase tracking-wide transition duration-300 shadow-xl hover:shadow-cyan-500/25 hover:scale-[1.03] active:scale-[0.98]"
            >
              <span>Explore All Trips</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              data-magnetic
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-9 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm uppercase tracking-wide transition duration-300 border border-white/25 hover:scale-[1.03] active:scale-[0.98]"
            >
              <Compass className="w-4 h-4 text-brand-sky" />
              <span>Talk to an Expert</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
