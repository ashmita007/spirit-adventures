"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Star, Clock, MapPin, Mountain, ArrowLeft, Check, X as XIcon, 
  Calendar, ShieldCheck, Backpack, HelpCircle, MessageCircle, Play, 
  ChevronDown, Heart, Share2, Compass, Film
} from "lucide-react";
import { Review, Trip } from "@/lib/types";
import TripCard from "@/components/trip-card";
import { formatCurrency, cn } from "@/lib/utils";
import EnquiryModal from "@/components/enquiry-modal";
import Lightbox from "@/components/lightbox";
import { VideoModal, VideoPlayer, isYouTubeUrl, extractYouTubeId } from "@/components/video-player";

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

const DESTINATION_YOUTUBE_VIDEOS: Record<string, string> = {
  coorg: "https://www.youtube.com/watch?v=uLc1QR3ofYQ",
  gokarna: "https://www.youtube.com/watch?v=7DF3LBAPeJY",
  dandeli: "https://www.youtube.com/watch?v=Xxuc_i1-Ytc",
  chikmagalur: "https://www.youtube.com/watch?v=l4nYZTanUeE",
  munnar: "https://www.youtube.com/watch?v=ti39UJYgc5s",
  hampi: "https://www.youtube.com/watch?v=ne4xe-NWcNQ",
  ooty: "https://www.youtube.com/watch?v=DZQPhfKbWc0",
  wayanad: "https://www.youtube.com/watch?v=l4TelPR_Mzg",
  goa: "https://www.youtube.com/watch?v=cBbS8Pi0obo",
  manali: "https://www.youtube.com/watch?v=o4bsfOUxJKU",
  kashmir: "https://www.youtube.com/watch?v=MHZpkHqB-U0",
  ladakh: "https://www.youtube.com/watch?v=G7a_tPbcELY",
  meghalaya: "https://www.youtube.com/watch?v=CsBmy8oJiLM",
  uttarakhand: "https://www.youtube.com/watch?v=xssNu8NOO1A",
  darjeeling: "https://www.youtube.com/watch?v=XYwP-QndGG0",
  lonavala: "https://www.youtube.com/watch?v=dw0LwI3HHRA",
  pondicherry: "https://www.youtube.com/watch?v=c4Nx7hCxOv8",
  kerala: "https://www.youtube.com/watch?v=ti39UJYgc5s",
};

const WHATSAPP = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+919666567551").replace(/\D/g, "");

export default function TripDetailClient({ trip, similar = [], reviews = [] }: TripDetailClientProps) {
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "itinerary" | "inclusions" | "gear" | "faqs">("overview");
  const [openDay, setOpenDay] = useState<number | null>(1);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const destKey = (trip.destination_slug || trip.destination?.slug || "").toLowerCase();
  
  // Resolve HD YouTube Video
  const youtubeVideoUrl =
    (trip.hero_video_url && isYouTubeUrl(trip.hero_video_url) ? trip.hero_video_url : null) ||
    DESTINATION_YOUTUBE_VIDEOS[destKey] ||
    "https://www.youtube.com/watch?v=uLc1QR3ofYQ";

  // Resolve background ambient loop (only MP4 direct files, never raw YouTube URLs)
  const bgRawVideo = trip.hero_video_url && !isYouTubeUrl(trip.hero_video_url)
    ? trip.hero_video_url
    : LOCAL_VIDEO_MAP[trip.slug] || DESTINATION_VIDEO_MAP[destKey];
  const bgVideoSrc = bgRawVideo && !isYouTubeUrl(bgRawVideo) ? bgRawVideo : null;

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
    <div className="min-h-screen bg-white">
      {/* 1. Full-Width Cinematic Header Banner */}
      <div className="relative h-[60vh] sm:h-[70vh] w-full bg-brand-navy overflow-hidden">
        {bgVideoSrc ? (
          <video
            ref={videoRef}
            src={bgVideoSrc}
            poster={trip.cover_image}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-cover object-center scale-105"
          />
        ) : (
          <Image
            src={trip.cover_image}
            alt={trip.title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/40 to-black/60 pointer-events-none" />

        {/* Back Link & Quick Actions */}
        <div className="absolute top-20 left-0 right-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <Link
              href="/trips"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>All Adventures</span>
            </Link>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setVideoModalOpen(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-rose-600/90 hover:bg-rose-600 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider transition shadow-lg active:scale-95 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span className="hidden sm:inline">Watch 4K Trailer</span>
                <span className="sm:hidden">4K Video</span>
              </button>

              <button
                onClick={() => setLightboxIndex(0)}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
              >
                <span>View Photos ({images.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Hero Info */}
        <div className="absolute bottom-8 left-0 right-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-brand-ocean text-white text-[11px] font-bold uppercase tracking-wider">
                {trip.destination_name || trip.destination?.name || "Himalayas"}
              </span>
              {trip.category_name && (
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider">
                  {trip.category_name}
                </span>
              )}
              <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-amber-400 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{trip.rating || 4.9} ({trip.reviews_count || 24} reviews)</span>
              </div>
            </div>

            <h1 data-anim="heading" className="[perspective:800px] font-display font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight leading-tight max-w-4xl text-balance">
              {trip.title}
            </h1>
          </div>
        </div>
      </div>

      {/* 2. Key Facts Strip */}
      <div className="bg-brand-light border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-brand-navy">
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-600 tracking-wider">Duration</span>
              <div className="font-display font-bold text-sm sm:text-base mt-0.5">{trip.duration_label}</div>
            </div>

            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-600 tracking-wider">Difficulty</span>
              <div className="font-display font-bold text-sm sm:text-base mt-0.5">{trip.difficulty}</div>
            </div>

            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-600 tracking-wider">Max Altitude</span>
              <div className="font-display font-bold text-sm sm:text-base mt-0.5">{trip.altitude || "12,500 ft"}</div>
            </div>

            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-600 tracking-wider">Trek Distance</span>
              <div className="font-display font-bold text-sm sm:text-base mt-0.5">{trip.trek_distance || "20 km"}</div>
            </div>

            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-600 tracking-wider">Best Season</span>
              <div className="font-display font-bold text-sm sm:text-base mt-0.5">{trip.best_season || "Dec - Apr"}</div>
            </div>

            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-600 tracking-wider">Price / Person</span>
              <div className="font-display font-black text-base sm:text-lg text-brand-ocean mt-0.5">
                {formatCurrency(trip.price)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Content & Sticky Booking Box */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-12">
            {/* Overview */}
            <section id="overview" className="space-y-4">
              <h2 className="font-display font-black text-2xl uppercase tracking-tight text-brand-navy">
                Overview & Experience
              </h2>
              <p className="text-slate-700 text-base leading-relaxed whitespace-pre-line font-normal">
                {trip.full_description || trip.short_description}
              </p>

              {/* Pickup & Drop Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 p-5 rounded-2xl bg-brand-light border border-slate-100">
                <div>
                  <span className="text-xs font-bold uppercase text-brand-ocean tracking-wider block">Pickup Point</span>
                  <p className="text-sm font-semibold text-brand-navy mt-1">{trip.pickup_location || "Dehradun / Base Camp"}</p>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase text-brand-ocean tracking-wider block">Drop Point</span>
                  <p className="text-sm font-semibold text-brand-navy mt-1">{trip.drop_location || "Dehradun / Base Camp"}</p>
                </div>
              </div>

              {/* 4K Video Spotlight */}
              {youtubeVideoUrl && (
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Film className="w-5 h-5 text-rose-500" />
                      <h3 className="font-display font-bold text-lg text-brand-navy uppercase tracking-wide">
                        4K HD Video Preview
                      </h3>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                      YouTube 1080p / 4K
                    </span>
                  </div>
                  <VideoPlayer
                    url={youtubeVideoUrl}
                    title={`${trip.title} 4K Drone & Trail Film`}
                    poster={trip.cover_image}
                  />
                </div>
              )}
            </section>

            {/* Itinerary */}
            {trip.itinerary_days && trip.itinerary_days.length > 0 && (
              <section id="itinerary" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-black text-2xl uppercase tracking-tight text-brand-navy">
                    Day-by-Day Itinerary
                  </h2>
                  <span className="text-xs font-semibold text-slate-600">
                    {trip.itinerary_days.length} Days Plan
                  </span>
                </div>

                <div className="space-y-4">
                  {trip.itinerary_days.map((day, idx) => {
                    const dayNum = day.day_number || idx + 1;
                    const isOpen = openDay === dayNum;
                    return (
                      <div
                        key={`${dayNum}-${idx}`}
                        className="border border-slate-200 rounded-2xl overflow-hidden transition-all duration-200"
                      >
                        <button
                          onClick={() => setOpenDay(isOpen ? null : dayNum)}
                          className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-slate-50 transition"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="w-8 h-8 rounded-xl bg-brand-navy text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                              D{dayNum}
                            </span>
                            <h3 className="font-display font-bold text-base text-brand-navy">
                              {day.title}
                            </h3>
                          </div>
                          <ChevronDown
                            className={cn("w-5 h-5 text-slate-400 transition-transform", isOpen && "rotate-180")}
                          />
                        </button>

                        {isOpen && (
                          <div className="px-5 pb-5 pt-2 text-sm text-slate-600 border-t border-slate-100 bg-slate-50/50 space-y-3">
                            <p className="leading-relaxed">{day.description}</p>
                            <div className="flex flex-wrap gap-4 pt-2 text-xs font-medium text-slate-500">
                              {day.altitude && <span>📍 Altitude: <strong className="text-slate-700">{day.altitude}</strong></span>}
                              {day.distance && <span>🚶 Distance: <strong className="text-slate-700">{day.distance}</strong></span>}
                              {day.meals && <span>🍲 Meals: <strong className="text-slate-700">{day.meals}</strong></span>}
                              {day.stay_type && <span>⛺ Stay: <strong className="text-slate-700">{day.stay_type}</strong></span>}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Inclusions & Exclusions */}
            <section id="inclusions" className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Inclusions */}
              <div className="bg-emerald-50/60 rounded-3xl p-6 border border-emerald-100">
                <h3 className="font-display font-bold text-lg text-emerald-900 mb-4 flex items-center space-x-2">
                  <Check className="w-5 h-5 text-emerald-600" />
                  <span>What&apos;s Included</span>
                </h3>
                <ul className="space-y-3 text-sm text-emerald-950">
                  {(trip.inclusions && trip.inclusions.length > 0
                    ? trip.inclusions
                    : [
                        "Certified mountain guides & safety team",
                        "High-altitude 4-season alpine tents",
                        "Nutritious mountain vegetarian meals",
                        "Forest permits & environmental fees",
                        "Medical kit & emergency oxygen cylinder"
                      ]
                  ).map((inc, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Exclusions */}
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200">
                <h3 className="font-display font-bold text-lg text-slate-800 mb-4 flex items-center space-x-2">
                  <XIcon className="w-5 h-5 text-rose-500" />
                  <span>What&apos;s Not Included</span>
                </h3>
                <ul className="space-y-3 text-sm text-slate-700">
                  {(trip.exclusions && trip.exclusions.length > 0
                    ? trip.exclusions
                    : [
                        "Transport to base camp (can be arranged)",
                        "Personal trekking gear & warm jackets",
                        "Backpack offloading fee",
                        "Personal emergency insurance"
                      ]
                  ).map((exc, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <XIcon className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                      <span>{exc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Things To Carry */}
            <section id="gear" className="space-y-4">
              <h2 className="font-display font-black text-2xl uppercase tracking-tight text-brand-navy flex items-center space-x-2">
                <Backpack className="w-6 h-6 text-brand-ocean" />
                <span>Things To Carry & Gear Checklist</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(trip.things_to_carry && trip.things_to_carry.length > 0
                  ? trip.things_to_carry
                  : [
                      "50-60L Rucksack with rain cover",
                      "High-ankle waterproof trekking shoes",
                      "3-layer thermal clothing & heavy jacket",
                      "Polarized sunglasses (UV protection)",
                      "Personal medical kit & reusable water bottles",
                      "Headlamp / Torch with extra batteries"
                    ]
                ).map((item, i) => (
                  <div key={i} className="flex items-center space-x-3 p-3.5 rounded-xl bg-brand-light/60 border border-slate-100 text-sm text-brand-navy">
                    <span className="w-2 h-2 rounded-full bg-brand-sky flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQs */}
            {trip.faqs && trip.faqs.length > 0 && (
              <section id="faqs" className="space-y-4">
                <h2 className="font-display font-black text-2xl uppercase tracking-tight text-brand-navy">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-3">
                  {trip.faqs.map((faq) => {
                    const isOpen = openFaq === faq.id;
                    return (
                      <div key={faq.id} className="border border-slate-200 rounded-2xl overflow-hidden">
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                          className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-brand-navy bg-white hover:bg-slate-50 transition"
                        >
                          <span>{faq.question}</span>
                          <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isOpen && "rotate-180")} />
                        </button>
                        {isOpen && (
                          <div className="p-4 pt-1 text-sm text-slate-600 bg-slate-50 border-t border-slate-100">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Sticky Booking & Enquiry Box */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-slate-600 block">Starting From</span>
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
                  className="w-full py-4 px-6 rounded-2xl bg-brand-ocean hover:bg-brand-ocean-light text-white font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.02]"
                >
                  Book This Adventure
                </button>

                <a
                  href={`https://wa.me/${WHATSAPP}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-2xl border border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-semibold text-xs uppercase tracking-wider transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Adventure Desk</span>
                </a>
              </div>

              <div className="border-t border-slate-100 pt-5 space-y-3 text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-brand-ocean" />
                  <span>Certified IMF Trek Leaders</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-brand-ocean" />
                  <span>Flexible Date Rescheduling</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mountain className="w-4 h-4 text-brand-ocean" />
                  <span>High-Altitude Safety Equipment Included</span>
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
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-sky-300">Traveller stories</span>
                <h2 data-anim="heading" className="[perspective:800px] mt-2 font-display font-black text-3xl sm:text-4xl uppercase tracking-tight">
                  Heard from the trail
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
                    <blockquote className="text-sm leading-relaxed text-sky-50/90">&ldquo;{r.review_text}&rdquo;</blockquote>
                  </div>
                  <figcaption className="mt-6 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-sky to-brand-ocean font-bold text-sm">
                      {r.traveler_name.charAt(0)}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold truncate">{r.traveler_name}</span>
                      <span className="block text-[11px] text-sky-100/60 truncate">
                        {[r.trip_title, r.travel_date].filter(Boolean).join(" · ") || r.traveler_location}
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
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-ocean">Keep exploring</span>
              <h2 data-anim="heading" className="[perspective:800px] mt-2 font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-brand-navy">
                Similar adventures
              </h2>
            </div>
            <Link href="/trips" className="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-brand-ocean hover:text-brand-navy transition">
              View all trips →
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
            <span className="text-[10px] font-medium text-sky-200">per person · {trip.duration_label}</span>
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
              className="h-11 px-5 rounded-xl bg-brand-ocean text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand-ocean/30 active:scale-95 transition"
            >
              Book Now
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

      {youtubeVideoUrl && (
        <VideoModal
          isOpen={videoModalOpen}
          onClose={() => setVideoModalOpen(false)}
          videoUrl={youtubeVideoUrl}
          title={`${trip.title} 4K Experience`}
          destinationName={trip.destination_name}
        />
      )}
    </div>
  );
}
