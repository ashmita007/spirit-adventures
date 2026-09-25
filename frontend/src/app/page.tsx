import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Compass, Flame } from "lucide-react";
import VideoHero from "@/components/video-hero";
import TripCard from "@/components/trip-card";
import NatureQuoteSection from "@/components/nature-quote-section";
import WhyUs from "@/components/why-us";
import ReviewsCarousel from "@/components/reviews-carousel";
import GalleryPreview from "@/components/gallery-preview";
import { getTrips, getReviews, getGallery } from "@/lib/api";

export default async function HomePage() {
  const [allTrips, reviews, galleryImages] = await Promise.all([
    getTrips(),
    getReviews(true),
    getGallery(),
  ]);

  // Display 6 recent packages on the home page
  const recentTrips = allTrips.slice(0, 6);

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* 1. Cinematic Hero with Search Bar */}
      <VideoHero />

      {/* 2. Recent Packages & Expeditions Grid */}
      <section className="py-16 sm:py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-14">
            <div>
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-light text-brand-ocean text-xs font-bold uppercase tracking-[0.2em] mb-3 border border-brand-sky/30 shadow-2xs">
                <Flame className="w-3.5 h-3.5 text-brand-ocean" />
                <span>Handpicked Expeditions</span>
              </div>

              <h2 className="font-display font-black text-3xl sm:text-5xl text-brand-navy uppercase tracking-tight">
                Recent Packages & Adventures
              </h2>
            </div>

            <Link
              href="/trips"
              className="mt-4 sm:mt-0 inline-flex items-center space-x-2 text-xs font-extrabold uppercase tracking-wider text-brand-ocean hover:text-brand-navy transition group"
            >
              <span>Explore All Packages</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile-First Grid (1 col on mobile, 2 on tablet, 3 on desktop) - 6 packages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {recentTrips.map((trip, idx) => (
              <div key={trip.id} className="w-full">
                <TripCard trip={trip} priority={idx < 2} />
              </div>
            ))}
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
      <section className="py-24 sm:py-32 bg-brand-navy text-white relative overflow-hidden">
        {/* Deep ambient glowing orbs */}
        <div className="absolute -top-32 -right-32 w-[32rem] h-[32rem] bg-brand-ocean/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-[32rem] h-[32rem] bg-brand-sky/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center z-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-brand-sky text-xs font-bold uppercase tracking-widest mb-6 border border-white/15 shadow-lg">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready for the Wild?</span>
          </div>

          <h2 className="font-display font-black text-3xl sm:text-5xl md:text-6xl uppercase tracking-tight leading-[1.08]">
            Leave the Noise Behind. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-sky-300 to-white">
              Your Mountain Awaits.
            </span>
          </h2>

          <p className="mt-5 text-slate-300 text-sm sm:text-base md:text-lg max-w-xl mx-auto font-light leading-relaxed">
            Whether you seek high Himalayan summits, starry beachside camps, or rapid river rafting—our certified captains are ready to guide you.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/trips"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-9 py-4 rounded-full bg-brand-ocean hover:bg-brand-ocean-light text-white font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-xl hover:shadow-cyan-500/25 hover:scale-[1.03] active:scale-[0.98]"
            >
              <span>Explore All Trips</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-9 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm uppercase tracking-wider transition-all duration-300 border border-white/25 hover:scale-[1.03] active:scale-[0.98] backdrop-blur-md"
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
