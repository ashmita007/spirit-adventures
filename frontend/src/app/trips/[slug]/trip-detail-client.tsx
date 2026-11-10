"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Star, Clock, MapPin, Mountain, ArrowLeft, Check, X as XIcon, 
  Calendar, ShieldCheck, Backpack, HelpCircle, MessageCircle, Play, 
  ChevronDown, Heart, Share2, Compass
} from "lucide-react";
import { Review, Trip } from "@/lib/types";
import TripCard from "@/components/trip-card";
import { formatCurrency, cn } from "@/lib/utils";
import { smartCase, stripDayPrefix, stripTrailingEmoji, stripLeadingEmoji, splitStops } from "@/lib/readable-text";
import EnquiryModal from "@/components/enquiry-modal";
import Lightbox from "@/components/lightbox";
import { isVideoUrl, useDeferredVideo } from "@/lib/media";
import { tripDrop, tripFaqs, tripPickup, tripSeason } from "@/lib/trip-faqs";

interface TripDetailClientProps {
  trip: Trip;
  similar?: Trip[];
  reviews?: Review[];
}

const LOCAL_VIDEO_MAP: Record<string, string> = {
  "dandeli-river-rafting-jungle-expedition": "https://res.cloudinary.com/xvxaicfe/video/upload/w_1280,c_limit,q_auto:good,vc_h264,br_1500k/v1790341176/spirit_adventures/shorts/dandeli_rafting.mp4",
  "gokarna-beach-cliff-trek": "https://res.cloudinary.com/xvxaicfe/video/upload/w_1280,c_limit,q_auto:good,vc_h264,br_1500k/v1790341208/spirit_adventures/shorts/gokarna_beach.mp4",
  "coorg-tadiandamol-coffee-trail": "https://res.cloudinary.com/xvxaicfe/video/upload/w_1280,c_limit,q_auto:good,vc_h264,br_1500k/v1790341227/spirit_adventures/shorts/coorg_mist.mp4",
  "chikmagalur-mullayanagiri-ridge-trek": "https://res.cloudinary.com/xvxaicfe/video/upload/w_1280,c_limit,q_auto:good,vc_h264,br_1500k/v1790341233/spirit_adventures/shorts/chikmagalur_peak.mp4",
  "ooty-nilgiri-pine-forest-expedition": "https://res.cloudinary.com/xvxaicfe/video/upload/w_1280,c_limit,q_auto:good,vc_h264,br_1500k/v1790341289/spirit_adventures/shorts/ooty_train.mp4",
  "wayanad-chembra-peak-waterfall-trail": "https://res.cloudinary.com/xvxaicfe/video/upload/w_1280,c_limit,q_auto:good,vc_h264,br_1500k/v1790341310/spirit_adventures/shorts/wayanad_waterfall.mp4",
  "leh-ladakh-motorcycle-odyssey": "https://res.cloudinary.com/xvxaicfe/video/upload/w_1280,c_limit,q_auto:good,vc_h264,br_1500k/v1790341157/spirit_adventures/hero/ladakh_bike.mp4",
  "kedarkantha-trek": "https://res.cloudinary.com/xvxaicfe/video/upload/w_1280,c_limit,q_auto:good,vc_h264,br_1500k/v1790341160/spirit_adventures/hero/mountain_trek.mp4",
  "hampta-pass-trek": "https://res.cloudinary.com/xvxaicfe/video/upload/w_1280,c_limit,q_auto:good,vc_h264,br_1500k/v1790341160/spirit_adventures/hero/mountain_trek.mp4",
  "kashmir-great-lakes-trek": "https://res.cloudinary.com/xvxaicfe/video/upload/w_1280,c_limit,q_auto:good,vc_h264,br_1500k/v1790341162/spirit_adventures/nature/waterfall.mp4",
  "spiti-valley-road-trip": "https://res.cloudinary.com/xvxaicfe/video/upload/w_1280,c_limit,q_auto:good,vc_h264,br_1500k/v1790341157/spirit_adventures/hero/ladakh_bike.mp4",
  "sandhan-valley-trek": "https://res.cloudinary.com/xvxaicfe/video/upload/w_1280,c_limit,q_auto:good,vc_h264,br_1500k/v1790341162/spirit_adventures/nature/waterfall.mp4",
};

const DESTINATION_VIDEO_MAP: Record<string, string> = {
  coorg: "https://res.cloudinary.com/xvxaicfe/video/upload/w_1280,c_limit,q_auto:good,vc_h264,br_1500k/v1790341227/spirit_adventures/shorts/coorg_mist.mp4",
  dandeli: "https://res.cloudinary.com/xvxaicfe/video/upload/w_1280,c_limit,q_auto:good,vc_h264,br_1500k/v1790341176/spirit_adventures/shorts/dandeli_rafting.mp4",
  gokarna: "https://res.cloudinary.com/xvxaicfe/video/upload/w_1280,c_limit,q_auto:good,vc_h264,br_1500k/v1790341208/spirit_adventures/shorts/gokarna_beach.mp4",
  chikmagalur: "https://res.cloudinary.com/xvxaicfe/video/upload/w_1280,c_limit,q_auto:good,vc_h264,br_1500k/v1790341233/spirit_adventures/shorts/chikmagalur_peak.mp4",
  ooty: "https://res.cloudinary.com/xvxaicfe/video/upload/w_1280,c_limit,q_auto:good,vc_h264,br_1500k/v1790341289/spirit_adventures/shorts/ooty_train.mp4",
  wayanad: "https://res.cloudinary.com/xvxaicfe/video/upload/w_1280,c_limit,q_auto:good,vc_h264,br_1500k/v1790341310/spirit_adventures/shorts/wayanad_waterfall.mp4",
  kashmir: "https://res.cloudinary.com/xvxaicfe/video/upload/w_1280,c_limit,q_auto:good,vc_h264,br_1500k/v1790341162/spirit_adventures/nature/waterfall.mp4",
  manali: "https://res.cloudinary.com/xvxaicfe/video/upload/w_1280,c_limit,q_auto:good,vc_h264,br_1500k/v1790341160/spirit_adventures/hero/mountain_trek.mp4",
};

const WHATSAPP = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+919666567551").replace(/\D/g, "");

/**
 * The Trip model ships placeholder defaults ("Dehradun / Base Camp", "Dec - Apr").
 * Showing them on Ooty or Gokarna packages misleads travellers, so they count as
 * "not set" unless the trip is actually in Uttarakhand.
 */


export default function TripDetailClient({ trip, similar = [], reviews = [] }: TripDetailClientProps) {
  const pickup = tripPickup(trip);
  const drop = tripDrop(trip);
  const season = tripSeason(trip);
  const faqs = tripFaqs(trip);
  const hasRating = Boolean(trip.rating && trip.reviews_count && trip.reviews_count > 0);
  const difficultyLabel = trip.difficulty ? trip.difficulty.charAt(0) + trip.difficulty.slice(1).toLowerCase() : "";
  const keyFacts: { label: string; value: string; highlight?: boolean }[] = [
    { label: "Duration", value: trip.duration_label },
    { label: "Difficulty", value: difficultyLabel },
    { label: "Max Altitude", value: trip.altitude?.trim() || "" },
    { label: "Trek Distance", value: trip.trek_distance?.trim() || "" },
    { label: "Best Season", value: season },
    { label: "Price / Person", value: formatCurrency(trip.price), highlight: true },
  ].filter((f) => f.value);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "itinerary" | "inclusions" | "gear" | "faqs">("overview");
  const inclusions = trip.inclusions ?? [];
  const exclusions = trip.exclusions ?? [];
  const thingsToCarry = trip.things_to_carry ?? [];
  const sectionLinks = [
    { id: "overview", label: "About" },
    ...(trip.itinerary_days?.length ? [{ id: "itinerary", label: "Day by day" }] : []),
    ...(inclusions.length || exclusions.length ? [{ id: "inclusions", label: "Price covers" }] : []),
    ...(thingsToCarry.length ? [{ id: "gear", label: "What to pack" }] : []),
    ...(faqs.length ? [{ id: "faqs", label: "Questions" }] : []),
  ];
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const destKey = (trip.destination_slug || trip.destination?.slug || "").toLowerCase();

  // Background loop: the trip's own uploaded video (any Cloudinary upload, incl. phone .mov),
  // else the built-in clip for this trip or destination. YouTube links are skipped.
  const bgRawVideo = isVideoUrl(trip.hero_video_url)
    ? trip.hero_video_url
    : LOCAL_VIDEO_MAP[trip.slug] || DESTINATION_VIDEO_MAP[destKey];
  // Mounted after page load, sized for the device (720p phone / 1080p big screens), skipped on Data Saver / 2G
  const bgVideoSrc = useDeferredVideo(isVideoUrl(bgRawVideo) ? bgRawVideo : null);

  React.useEffect(() => {
    if (videoRef.current && bgVideoSrc) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
  }, [bgVideoSrc]);

  const images = (trip.gallery_images && trip.gallery_images.length > 0)
    ? trip.gallery_images.map((g) => ({ url: g.image_url, caption: g.caption, title: trip.title }))
    : [{ url: trip.cover_image, caption: trip.title, title: trip.title }];

  const whatsappMessage = encodeURIComponent(
    `Hi Spirit Adventures! I'm interested in the ${trip.title} (${trip.duration_label}). Can you share upcoming batch dates?`
  );

  return (
    <div className="min-h-dvh bg-white">
      {/* 1. Full-Width Cinematic Header Banner */}
      <div className="relative h-[60dvh] sm:h-[70dvh] w-full bg-brand-navy overflow-hidden">
        {/* Cover image is always the first paint (LCP); the video fades in over it once loaded */}
        <Image
          src={trip.cover_image}
          alt={trip.title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {bgVideoSrc && (
          <video
            ref={videoRef}
            key={bgVideoSrc}
            src={bgVideoSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover object-center scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/40 to-black/60 pointer-events-none" />

        {/* Back Link & Quick Actions */}
        <div className="absolute top-20 left-0 right-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <Link
              href="/trips"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white text-sm font-semibold transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="whitespace-nowrap">All trips</span>
            </Link>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setLightboxIndex(0)}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-sm font-semibold transition cursor-pointer"
              >
                <span>Photos ({images.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Hero Info */}
        <div className="absolute bottom-8 left-0 right-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-brand-ocean text-white text-[11px] font-bold">
                {trip.destination_name || trip.destination?.name || "Himalayas"}
              </span>
              {trip.category_name && (
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-bold">
                  {trip.category_name}
                </span>
              )}
              {hasRating && (
                <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-amber-400 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" aria-hidden="true" />
                  <span>{trip.rating} ({trip.reviews_count} {trip.reviews_count === 1 ? "review" : "reviews"})</span>
                </div>
              )}
            </div>

            <h1 data-anim="heading" className="[perspective:800px] font-display font-bold text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1] max-w-4xl text-balance drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
              {smartCase(trip.title)}
            </h1>
          </div>
        </div>
      </div>

      {/* 2. Key Facts Strip */}
      <div className="bg-brand-light border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <dl className={`grid ${keyFacts.length === 3 ? "grid-cols-3" : "grid-cols-2"} sm:grid-cols-3 lg:flex lg:flex-wrap gap-x-4 gap-y-4 lg:gap-x-14 text-brand-navy`}>
            {keyFacts.map((fact) => (
              <div key={fact.label} className="min-w-0">
                <dt className="block text-xs font-medium text-slate-500">{fact.label}</dt>
                <dd
                  className={cn(
                    "font-display mt-0.5 break-words",
                    fact.highlight
                      ? "font-black text-base sm:text-lg text-brand-ocean"
                      : "font-bold text-sm sm:text-base"
                  )}
                >
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Jump to a section */}
      <nav aria-label="On this page" className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex gap-1 overflow-x-auto py-2 -mx-1 text-sm font-semibold text-slate-600 [scrollbar-width:none]">
            {sectionLinks.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="block whitespace-nowrap rounded-full px-3.5 py-2 hover:bg-slate-100 hover:text-brand-navy transition">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* 3. Main Content & Sticky Booking Box */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-14 [&>section]:scroll-mt-28">
            {/* Overview */}
            <section id="overview" className="space-y-4">
              <h2 className="font-display font-bold text-2xl sm:text-[1.7rem] tracking-tight text-brand-navy">
                About this trip
              </h2>
              <p className="max-w-[68ch] text-slate-700 text-[17px] leading-8 whitespace-pre-line">
                {trip.full_description || trip.short_description}
              </p>

              {/* Pickup & Drop Details: only shown when the trip has real points */}
              {(pickup || drop) && (
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 p-5 rounded-2xl bg-brand-light border border-slate-100">
                  {pickup && (
                    <div>
                      <dt className="text-xs font-semibold text-slate-500">Pickup point</dt>
                      <dd className="text-base font-semibold text-brand-navy mt-1">{pickup}</dd>
                    </div>
                  )}
                  {drop && (
                    <div>
                      <dt className="text-xs font-semibold text-slate-500">Drop point</dt>
                      <dd className="text-base font-semibold text-brand-navy mt-1">{drop}</dd>
                    </div>
                  )}
                </dl>
              )}
            </section>

            {/* Itinerary */}
            {trip.itinerary_days && trip.itinerary_days.length > 0 && (
              <section id="itinerary" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-2xl sm:text-[1.7rem] tracking-tight text-brand-navy">
                    Day-by-day plan
                  </h2>
                  <span className="text-xs font-semibold text-slate-600">
                    {trip.itinerary_days.length} {trip.itinerary_days.length === 1 ? "day" : "days"}
                  </span>
                </div>

                <ol className="relative border-l-2 border-slate-200 ml-4 space-y-8">
                  {trip.itinerary_days.map((day, idx) => {
                    const dayNum = day.day_number || idx + 1;
                    const facts = [
                      day.altitude && ["Altitude", day.altitude],
                      day.distance && ["Distance", day.distance],
                      day.meals && ["Meals", day.meals],
                      day.stay_type && ["Stay", day.stay_type],
                    ].filter(Boolean) as [string, string][];
                    const stops = splitStops(day.description || "");
                    return (
                      <li key={`${dayNum}-${idx}`} className="relative pl-8">
                        <span className="absolute -left-[17px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-brand-navy text-white text-xs font-bold ring-4 ring-white">
                          {dayNum}
                        </span>
                        <p className="text-xs font-semibold text-brand-ocean">Day {dayNum}</p>
                        <h3 className="mt-0.5 font-display font-bold text-lg text-brand-navy leading-snug">{smartCase(stripTrailingEmoji(stripDayPrefix(day.title || ""))) || `Day ${dayNum}`}</h3>
                        {stops.length > 0 ? (
                          <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-[15px] leading-6 text-slate-700">
                            {stops.map((s, i) => (
                              <li key={i} className="flex items-start gap-2.5">
                                <span aria-hidden="true" className="w-5 shrink-0 text-center">{s.icon || "•"}</span>
                                <span>{s.label}</span>
                              </li>
                            ))}
                          </ul>
                        ) : day.description ? (
                          <p className="mt-2 max-w-[68ch] text-[16px] leading-7 text-slate-700 whitespace-pre-line">{day.description}</p>
                        ) : null}
                        {facts.length > 0 && (
                          <dl className="mt-3 flex flex-wrap gap-2">
                            {facts.map(([k, v]) => (
                              <div key={k} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                                <dt className="inline">{k}: </dt>
                                <dd className="inline font-semibold text-slate-800">{v}</dd>
                              </div>
                            ))}
                          </dl>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </section>
            )}

            {/* Inclusions & Exclusions (only what the trip actually lists) */}
            {(inclusions.length > 0 || exclusions.length > 0) && (
              <section id="inclusions" className="space-y-5">
                <h2 className="font-display font-bold text-2xl sm:text-[1.7rem] tracking-tight text-brand-navy">What the price covers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {inclusions.length > 0 && (
                    <div className="rounded-2xl p-5 sm:p-6 border border-emerald-200 bg-emerald-50/50">
                      <h3 className="font-display font-bold text-lg text-emerald-900 mb-4">Included</h3>
                      <ul className="space-y-3 text-[15px] leading-6 text-slate-800">
                        {inclusions.map((inc, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <Check aria-hidden="true" className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-1" />
                            <span>{stripLeadingEmoji(inc)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {exclusions.length > 0 && (
                    <div className="rounded-2xl p-5 sm:p-6 border border-slate-200 bg-slate-50">
                      <h3 className="font-display font-bold text-lg text-slate-800 mb-4">Not included</h3>
                      <ul className="space-y-3 text-[15px] leading-6 text-slate-700">
                        {exclusions.map((exc, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <XIcon aria-hidden="true" className="w-4 h-4 text-rose-500 flex-shrink-0 mt-1" />
                            <span>{stripLeadingEmoji(exc)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Things to carry */}
            {thingsToCarry.length > 0 && (
              <section id="gear" className="space-y-5">
                <h2 className="font-display font-bold text-2xl sm:text-[1.7rem] tracking-tight text-brand-navy flex items-center gap-2.5">
                  <Backpack aria-hidden="true" className="w-6 h-6 text-brand-ocean" />
                  <span>What to pack</span>
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-[15px] leading-6 text-slate-800">
                  {thingsToCarry.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 border-b border-slate-100 pb-3">
                      <Check aria-hidden="true" className="w-4 h-4 text-brand-ocean flex-shrink-0 mt-1" />
                      <span>{stripLeadingEmoji(item)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* FAQs: native <details> so every answer is in the HTML for search engines and works by keyboard */}
            {faqs.length > 0 && (
              <section id="faqs" className="space-y-4">
                <h2 className="font-display font-bold text-2xl sm:text-[1.7rem] tracking-tight text-brand-navy">
                  {(trip.destination_name || trip.destination?.name) ? `${trip.destination_name || trip.destination?.name} trip questions` : "Questions & answers"}
                </h2>
                <div className="space-y-3">
                  {faqs.map((faq, i) => (
                    <details key={faq.id} open={i === 0} className="group border border-slate-200 rounded-2xl overflow-hidden">
                      <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-left font-semibold text-brand-navy bg-white hover:bg-slate-50 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-ocean">
                        <h3 className="text-[15px] sm:text-base font-semibold leading-snug">{faq.question}</h3>
                        <ChevronDown aria-hidden="true" className="w-4 h-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                      </summary>
                      <p className="px-4 sm:px-5 pb-5 pt-0 max-w-[68ch] text-[15px] leading-7 text-slate-700">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Sticky Booking & Enquiry Box */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
              <div>
                <span className="text-sm font-medium text-slate-500 block">From</span>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="font-display font-black text-3xl text-brand-navy">
                    {formatCurrency(trip.price)}
                  </span>
                  {trip.original_price && (
                    <span className="text-sm text-slate-600 line-through">
                      {formatCurrency(trip.original_price)}
                    </span>
                  )}
                  <span className="text-xs text-slate-600">/ person</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => setEnquiryOpen(true)}
                  className="w-full py-4 px-6 rounded-2xl bg-brand-ocean hover:bg-brand-ocean-light text-white font-bold text-base transition duration-300 shadow-lg shadow-brand-ocean/20 active:scale-[0.98]"
                >
                  Book this trip
                </button>

                <a
                  href={`https://wa.me/${WHATSAPP}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-2xl border border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-semibold text-sm transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="whitespace-nowrap">Chat on WhatsApp</span>
                </a>
              </div>

              <div className="border-t border-slate-100 pt-5 space-y-3 text-sm text-slate-600">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-brand-ocean" />
                  <span>Certified trek leaders</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-brand-ocean" />
                  <span>Change your date if plans shift</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mountain className="w-4 h-4 text-brand-ocean" />
                  <span>Safety equipment included</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Traveller stories */}
      {reviews.length > 0 && (
        <section className="relative overflow-hidden bg-brand-navy text-white py-16 sm:py-20 mt-8">
          <div aria-hidden className="absolute -top-32 -right-24 h-80 w-80 rounded-full bg-brand-sky/20 blur-3xl" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <div>
                <h2 data-anim="heading" className="[perspective:800px] mt-2 font-display font-bold text-3xl sm:text-4xl tracking-tight">
                  Traveller stories
                </h2>
              </div>
              {trip.rating ? (
                <div className="flex items-center gap-3">
                  <span className="font-display font-black text-4xl">{trip.rating}</span>
                  <div>
                    <div className="flex gap-0.5 text-amber-400" aria-label={`${trip.rating} out of 5`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    {trip.reviews_count ? <p className="text-xs text-sky-100/70 mt-1">{trip.reviews_count} reviews</p> : null}
                  </div>
                </div>
              ) : null}
            </div>
            <div data-anim="stagger" className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {reviews.map((r) => (
                <figure key={r.id} className="flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.06] p-6">
                  <div>
                    <div className="flex gap-0.5 text-amber-400 mb-4" aria-label={`${r.rating} out of 5`}>
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <blockquote className="text-[15px] leading-7 text-sky-50/90">&ldquo;{r.review_text}&rdquo;</blockquote>
                  </div>
                  <figcaption className="mt-6 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-sky to-brand-ocean font-bold text-sm">
                      {r.traveler_name.charAt(0)}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold truncate">{r.traveler_name}</span>
                      <span className="block text-[11px] text-sky-100/60 truncate">
                        {[r.trip_title, r.travel_date].filter(Boolean).join(", ") || r.traveler_location}
                      </span>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Similar adventures */}
      {similar.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <h2 data-anim="heading" className="[perspective:800px] mt-2 font-display font-bold text-3xl sm:text-4xl tracking-tight text-brand-navy">
                Similar adventures
              </h2>
            </div>
            <Link href="/trips" className="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-brand-ocean hover:text-brand-navy transition">
              View all trips
            </Link>
          </div>
          <div data-anim="stagger" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similar.map((t) => (
              <TripCard key={t.id} trip={t} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Booking Bar (replaces the bottom nav on trip pages) */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none">
        <div className="pointer-events-auto max-w-md mx-auto flex items-center justify-between gap-3 rounded-2xl bg-brand-navy/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-brand-navy/40 pl-4 pr-2 py-2">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-black text-lg text-white">{formatCurrency(trip.price)}</span>
              {trip.original_price && (
                <span className="text-[11px] text-slate-400 line-through">{formatCurrency(trip.original_price)}</span>
              )}
            </div>
            <span className="text-xs font-medium text-sky-200">per person · {trip.duration_label}</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/${WHATSAPP}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ask on WhatsApp"
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#25D366] text-white active:scale-95 transition"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
            <button
              onClick={() => setEnquiryOpen(true)}
              className="h-11 px-5 whitespace-nowrap rounded-xl bg-brand-ocean text-white font-bold text-sm shadow-lg shadow-brand-ocean/30 active:scale-95 transition"
            >
              Book now
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox & Enquiry Modals */}
      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNext={() => setLightboxIndex((prev) => (prev! + 1) % images.length)}
          onPrev={() => setLightboxIndex((prev) => (prev! - 1 + images.length) % images.length)}
        />
      )}

      <EnquiryModal
        isOpen={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        selectedTrip={trip}
      />
    </div>
  );
}
