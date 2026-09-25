import React from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Compass, Heart, Mountain, Users, Trees, ArrowRight } from "lucide-react";
import WhyUs from "@/components/why-us";

export const metadata: Metadata = {
  title: "About Us & Ethos | Spirit Adventures",
  description: "Learn about the philosophy, certified guides, and leave-no-trace ethics behind Spirit Adventures.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      {/* Hero Header */}
      <div className="relative py-16 sm:py-24 bg-brand-navy text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-brand-sky block mb-3">
            Our Wilderness Ethos
          </span>
          <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight max-w-3xl mx-auto leading-tight">
            Rooted in Nature. Driven by Spirit.
          </h1>
          <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-xl mx-auto font-light leading-relaxed">
            We believe outdoor travel is an inward journey. Small groups, slow steps, and deep respect for the wild landscapes we traverse.
          </p>
        </div>
      </div>

      {/* Story Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80"
              alt="Himalayan ridge expedition"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-ocean">How it started</span>
            <h2 className="font-display font-black text-3xl text-brand-navy uppercase tracking-tight">
              Beyond Commercial Tourism
            </h2>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
              Spirit Adventures was born from a simple realization: the modern world has grown too loud, and commercial travel has become rushed and transactional.
            </p>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
              We design journeys that allow you to truly disconnect from digital chaos and reconnect with what is ancient and real—whether standing atop a snowy Himalayan summit at dawn or listening to waves crash against secluded Arabian cliffs.
            </p>

            <div className="pt-4 grid grid-cols-2 gap-4 border-t border-slate-100">
              <div>
                <span className="font-display font-black text-2xl text-brand-ocean">100%</span>
                <p className="text-xs text-slate-500 font-semibold uppercase mt-0.5">Leave No Trace</p>
              </div>
              <div>
                <span className="font-display font-black text-2xl text-brand-ocean">12 Max</span>
                <p className="text-xs text-slate-500 font-semibold uppercase mt-0.5">Group Size</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Us Component */}
      <WhyUs />

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h3 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-brand-navy mb-4">
          Ready to Walk the High Trails?
        </h3>
        <p className="text-slate-600 text-sm max-w-md mx-auto mb-8">
          Reach out to our mountain team today and discover our upcoming departures.
        </p>
        <Link
          href="/trips"
          className="inline-flex items-center space-x-2 px-8 py-4 rounded-full bg-brand-navy hover:bg-brand-ocean text-white font-bold text-xs uppercase tracking-wider transition shadow-lg"
        >
          <span>Explore All Adventures</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
