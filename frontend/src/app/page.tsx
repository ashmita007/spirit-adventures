import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Compass, Flame } from "lucide-react";
import VideoHero from "@/components/video-hero";
import HomePackages from "@/components/home-packages";
import HowItWorks from "@/components/how-it-works";
import DestinationsBand from "@/components/destinations-band";
import NatureQuoteSection from "@/components/nature-quote-section";
import WhyUs from "@/components/why-us";
import ReviewsCarousel from "@/components/reviews-carousel";
import GalleryPreview from "@/components/gallery-preview";
import { getTrips, getReviews, getGallery, getDestinations, getPromotions, getTripPhotos, getSiteContent } from "@/lib/api";
import { socialLinks } from "@/lib/social";
import type { HomeSectionKey } from "@/lib/types";
import OffersSection from "@/components/offers-section";
import TrustStrip from "@/components/trust-strip";
import OfficeMaps from "@/components/office-maps";
import { SpinSticker, Sticker } from "@/components/floating-sticker";
import { whatsappUrl } from "@/lib/whatsapp";
import ScrollStack from "@/components/motion/scroll-stack";
import SocialFollow from "@/components/social-follow";
import { Small } from "@/components/mix-heading";

export default async function HomePage() {
  const [allTrips, reviews, galleryImages, destinations, promotions, tripPhotos, content] = await Promise.all([
    getTrips(),
    getReviews(true),
    getGallery(),
    getDestinations(),
    getPromotions(),
    getTripPhotos(),
    getSiteContent(),
  ]);
  // Owner HQ → Landing page: hidden sections, and trips picked to lead the packages.
  const hidden = new Set<HomeSectionKey>(content.hidden_sections);
  const show = (key: HomeSectionKey) => !hidden.has(key);
  const picked = new Map(content.home_trip_ids.map((id, i) => [id, i]));
  const homeTrips = picked.size
    ? [...allTrips].sort((a, b) => (picked.get(a.id) ?? Infinity) - (picked.get(b.id) ?? Infinity))
    : allTrips;
  // Curated gallery photos first, then every trip photo not already in it.
  const galleryUrls = new Set(galleryImages.map((g) => g.image_url));
  const momentPhotos = [...galleryImages, ...tripPhotos.filter((t) => !galleryUrls.has(t.image_url))];
  // Social cards prefer trip photos not already leading the showcase above.
  const tripOnly = tripPhotos.slice(8);
  const socialPhotos = tripOnly.length >= 4 ? tripOnly : momentPhotos;
  // Only count destinations that actually have trips
  const destinationCount = new Set(allTrips.map((t) => t.destination_name).filter(Boolean)).size || destinations.length;


  return (
    <div className="flex flex-col w-full overflow-x-clip">
      {/* 1. Cinematic Hero with Search Bar */}
      <VideoHero words={content.hero_words} subtitle={content.hero_subtitle} videos={content.hero_videos} />
      <TrustStrip tripCount={allTrips.length} destinationCount={destinationCount} />

      <ScrollStack>
        {/* Events & offers from Owner HQ (hidden when none are live) */}
        {show("offers") && <OffersSection offers={promotions.items} theme={promotions.theme.active} />}

        {/* 2. Packages: category tabs, one featured trip, then the grid */}
        {show("packages") && <HomePackages trips={homeTrips} total={allTrips.length} />}

        {/* Moving band of destination names */}
        {show("destinations") && <DestinationsBand destinations={destinations} />}

        {/* How a trip works: pinned chapters on desktop, stacked steps on phones */}
        {show("how") && <HowItWorks />}

        {/* 3. Nature Experience Section: Full-Width Visual Storytelling */}
        {show("quote") && <NatureQuoteSection image={content.quote_image_url || undefined} />}

        {/* 4. Why Spirit Adventures */}
        {show("why") && <WhyUs />}

        {/* 5. Traveler Stories */}
        {show("reviews") && <ReviewsCarousel reviews={reviews} />}

        {/* 6. Nature Gallery Preview */}
        {show("gallery") && <GalleryPreview images={momentPhotos} />}

        {/* Office map(s) with directions */}
        {show("maps") && (
          <div className="bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
              <OfficeMaps />
            </div>
          </div>
        )}

        {show("social") && (
          <SocialFollow photos={socialPhotos} film={galleryImages.find((g) => g.image_url)} social={socialLinks(content)} />
        )}

        {/* 7. Final CTA Section: RHYTHM IN NAVY */}
        <section className="py-16 sm:py-32 bg-brand-navy text-white relative overflow-hidden">
          {content.cta_image_url && (
            <>
              <Image src={content.cta_image_url} alt="" aria-hidden="true" fill sizes="100vw" className="object-cover" />
              <div className="absolute inset-0 bg-brand-navy/75" aria-hidden="true" />
            </>
          )}
          {/* Deep ambient glowing orbs */}
          <div data-parallax="0.35" className="absolute -top-32 -right-32 w-[32rem] h-[32rem] bg-brand-ocean/25 rounded-full blur-3xl pointer-events-none will-change-transform [transform:translateZ(0)]" />
          <div data-parallax="-0.3" className="absolute -bottom-32 -left-32 w-[32rem] h-[32rem] bg-brand-sky/20 rounded-full blur-3xl pointer-events-none will-change-transform [transform:translateZ(0)]" />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center z-10">
            <SpinSticker
              href={whatsappUrl("Hi Spirit Adventures, can you help me plan a trip?")}
              label="Plan my trip"
              className="absolute -right-36 -top-4 hidden xl:grid"
            />
            <div className="mb-6 flex flex-wrap justify-center gap-x-3 gap-y-3">
              <Sticker tone="coral" rotate={-5}>🎒 Small groups</Sticker>
              <Sticker tone="sky" rotate={4} delay={0.1}>📍 Hyderabad · Bengaluru · Chennai</Sticker>
            </div>

            <h2 data-anim="heading" className="[perspective:800px] font-display font-black text-3xl sm:text-5xl md:text-6xl uppercase tracking-tight leading-[1.08]">
              Leave <Small>the noise</Small> behind.
              <br />
              <span>
                Your mountain <Small>awaits.</Small>
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
      </ScrollStack>
    </div>
  );
}
