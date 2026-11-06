import React from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Compass, Heart, Mountain, Users, Trees, ArrowRight, MapPin, Calendar, Award, Sparkles } from "lucide-react";
import WhyUs from "@/components/why-us";
import PageHero from "@/components/page-hero";

export const metadata: Metadata = {
  alternates: { canonical: "/about" },
  title: "About Us | Spirit Adventures - Trusted Travel & Adventure Partner",
  description: "Established in 2022 with operational hubs in Hyderabad, Bengaluru, and Chennai. Curating weekend getaways, trekking expeditions, and group adventures across India.",
};

const SPECIALTIES = [
  { title: "Weekend Getaways", desc: "Handpicked 2-day nature escapes from Hyderabad, Bengaluru & Chennai to recharge from city routines." },
  { title: "Trekking Expeditions", desc: "Guided mountain trails from Western Ghats summits to high-altitude Himalayan passes." },
  { title: "Backpacking Trips", desc: "Immersive explorations through historic ruins, coastal cliff paths, and hidden rainforest trails." },
  { title: "Adventure Tours", desc: "White water river rafting in Dandeli, cliff jumping, cave exploration, and ocean kayaking." },
  { title: "Group Departures", desc: "Curated small-group journeys connecting solo travelers, friends, and adventure seekers." },
  { title: "Customized & Corporate", desc: "Bespoke itineraries, corporate team offsites, and private family holiday packages." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white pb-20">
      <PageHero
        eyebrow="Established 2022 • Hyderabad • Bengaluru • Chennai"
        title="Discover the Spirit of Adventure"
        subtitle={<>Welcome to Spirit Adventures, your trusted travel partner for unforgettable journeys across India. We create unique experiences combining adventure, nature, culture, and meaningful human connection.</>}
        image="https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1600&q=80"
        crumbs={[{ label: "About" }]}
        align="center"
      />

      {/* Story Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
            <Image
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80"
              alt="Spirit Adventures Team & Mountain Expeditions"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8 text-white">
              <span className="text-brand-sky font-bold text-xs uppercase tracking-widest">Our Journey</span>
              <h3 className="font-display font-black text-2xl uppercase mt-1">From Kashmir to Kanyakumari</h3>
              <p className="text-xs text-slate-300 mt-2 font-light">Operating across 40+ destinations with thousands of happy explorers.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-light text-brand-ocean text-xs font-bold uppercase tracking-widest border border-brand-sky/20">
              <Sparkles className="w-3.5 h-3.5 text-brand-ocean" />
              <span>Our Story & Mission</span>
            </div>

            <h2 className="font-display font-black text-3xl sm:text-4xl text-brand-navy uppercase tracking-tight">
              More Than Travel — Creating Lasting Memories
            </h2>

            <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
              Established in <strong className="text-brand-navy">2022</strong>, Spirit Adventures began with a clear mission: to make adventure travel accessible, authentic, and safe for every explorer.
            </p>

            <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
              Today, operating from our hubs in <strong className="text-brand-navy">Hyderabad, Bengaluru, and Chennai</strong>, we lead weekend getaways, trekking expeditions, and bespoke group journeys across the nation—from the emerald coffee hills of Coorg to the white water rapids of Dandeli, the ancient boulders of Hampi, and the snow-capped summits of the Himalayas.
            </p>

            <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
              We believe travel is about discovering new perspectives, forming genuine bonds, and creating stories that stay with you forever. Our trip captains ensure every journey is smooth, supportive, and unforgettable.
            </p>

            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-100">
              <div>
                <span className="font-display font-black text-2xl sm:text-3xl text-brand-ocean">2022</span>
                <p className="text-[11px] text-slate-500 font-semibold uppercase mt-0.5">Founded</p>
              </div>
              <div>
                <span className="font-display font-black text-2xl sm:text-3xl text-brand-ocean">40+</span>
                <p className="text-[11px] text-slate-500 font-semibold uppercase mt-0.5">Destinations</p>
              </div>
              <div>
                <span className="font-display font-black text-2xl sm:text-3xl text-brand-ocean">5.0 ★</span>
                <p className="text-[11px] text-slate-500 font-semibold uppercase mt-0.5">Verified Reviews</p>
              </div>
            </div>
          </div>
        </div>

        {/* Specialties Grid */}
        <div className="mt-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-ocean block mb-2">Curated Experiences</span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-brand-navy uppercase tracking-tight">
              Adventures Crafted for Every Explorer
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              From adrenaline-pumping rapids to quiet sunset cliff camps, we design expeditions tailored to your pace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SPECIALTIES.map((spec, i) => (
              <div key={i} className="p-6 rounded-2xl bg-brand-light border border-slate-200/60 shadow-xs hover:shadow-md transition">
                <span className="w-8 h-8 rounded-full bg-brand-ocean/10 text-brand-ocean flex items-center justify-center font-bold text-xs mb-4">
                  0{i + 1}
                </span>
                <h3 className="font-display font-bold text-lg text-brand-navy uppercase tracking-wide mb-2">
                  {spec.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {spec.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <WhyUs />

      {/* Call to action */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h3 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-brand-navy mb-4">
          Ready to Explore India Like Never Before?
        </h3>
        <p className="text-slate-600 text-sm max-w-md mx-auto mb-8">
          Join the Spirit Adventures community and embark on your next unforgettable journey today.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/trips"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-full bg-brand-navy hover:bg-brand-ocean text-white font-bold text-xs uppercase tracking-wider transition shadow-lg"
          >
            <span>Explore All Adventures</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-brand-navy font-bold text-xs uppercase tracking-wider transition shadow-xs"
          >
            <span>Talk to a Trip Captain</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
