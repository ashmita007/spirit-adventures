import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Compass, Flame } from "lucide-react";
import VideoHero from "@/components/video-hero";
import HomePackages from "@/components/home-packages";
import HowItWorks from "@/components/how-it-works";
import DestinationsBand from "@/components/destinations-band";
import NatureQuoteSection from "@/components/nature-quote-section";
import WhyUs from "@/components/why-us";
import ReviewsCarousel from "@/components/reviews-carousel";
import GalleryPreview from "@/components/gallery-preview";
import { getTrips, getReviews, getGallery, getDestinations, getPromotions } from "@/lib/api";
import OffersSection from "@/components/offers-section";
import TrustStrip from "@/components/trust-strip";
import OfficeMaps from "@/components/office-maps";

export default async function HomePage() {
  const [allTrips, reviews, galleryImages, destinations, promotions] = await Promise.all([
    getTrips(),
    getReviews(true),
    getGallery(),
    getDestinations(),
    getPromotions(),
  ]);
  // Only count destinations that actually have trips
  const destinationCount = new Set(allTrips.map((t) => t.destination_name).filter(Boolean)).size || destinations.length;


  return (
    <div className="flex flex-col w-full overflow-x-clip">
      {/* 1. Cinematic Hero with Search Bar */}
      <VideoHero />
      <TrustStrip tripCount={allTrips.length} destinationCount={destinationCount} />

      {/* Events & offers from Owner HQ (hidden when none are live) */}
      <OffersSection offers={promotions.items} theme={promotions.theme.active} />

      {/* 2. Packages: category tabs, one featured trip, then the grid */}
      <HomePackages trips={allTrips} total={allTrips.length} />

      {/* Moving band of destination names */}
      <DestinationsBand destinations={destinations} />

      {/* How a trip works: pinned chapters on desktop, stacked steps on phones */}
      <HowItWorks />

      {/* 3. Nature Experience Section: Full-Width Visual Storytelling */}
      <NatureQuoteSection />

      {/* 4. Why Spirit Adventures */}
      <WhyUs />

      {/* 5. Traveler Stories */}
      <ReviewsCarousel reviews={reviews} />

      {/* 6. Nature Gallery Preview */}
      <GalleryPreview images={galleryImages} />

      {/* Office map(s) with directions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <OfficeMaps />
      </div>

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
