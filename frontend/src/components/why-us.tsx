import React from "react";
import { ShieldCheck, Compass, Users, HeartHandshake, Mountain, Award, Sparkles } from "lucide-react";

export default function WhyUs() {
  const pillars = [
    {
      icon: Award,
      badge: "Expertise",
      title: "Certified Expedition Leaders",
      description: "IMF certified guides and Wilderness First Responders (WFR) with high-altitude experience.",
      gradient: "from-sky-500/10 to-sky-500/5",
      iconColor: "text-blue-600",
    },
    {
      icon: ShieldCheck,
      badge: "Safety 1st",
      title: "Medical & Safety Protocols",
      description: "Medical oxygen cylinders, automated pulse oximeters, satellite communication, and rigid acclimatization schedules.",
      gradient: "from-emerald-500/10 to-teal-500/10",
      iconColor: "text-emerald-600",
    },
    {
      icon: Users,
      badge: "Community",
      title: "Small-Group Experience",
      description: "Strictly limited to 12-14 adventurers per batch to maintain low environmental impact, safety, and close bonding.",
      gradient: "from-amber-500/10 to-orange-500/10",
      iconColor: "text-amber-600",
    },
    {
      icon: Compass,
      badge: "Authenticity",
      title: "Local Native Knowledge",
      description: "Local trail captains who know the quieter waterfalls, stargazing ridges and village culture.",
      gradient: "from-sky-500/10 to-cyan-500/10",
      iconColor: "text-sky-600",
    },
    {
      icon: Mountain,
      badge: "Routes",
      title: "Off-the-Beaten Path",
      description: "Routes we have walked ourselves, picked for quiet trails and views, away from the crowded tourist stops.",
      gradient: "from-teal-500/10 to-teal-500/5",
      iconColor: "text-teal-700",
    },
    {
      icon: HeartHandshake,
      badge: "Care",
      title: "1-on-1 Pre-Trip Support",
      description: "Help with fitness prep, packing lists, gear rental and round-trip pickup, one person to call for all of it.",
      gradient: "from-rose-500/10 to-rose-500/5",
      iconColor: "text-rose-600",
    },
  ];

  return (
    <section className="py-14 sm:py-28 bg-slate-50 border-t border-slate-200/60 relative overflow-hidden">
      {/* Background Subtle Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-ocean/5 rounded-full blur-3xl pointer-events-none will-change-transform [transform:translateZ(0)]" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-brand-sky/5 rounded-full blur-3xl pointer-events-none will-change-transform [transform:translateZ(0)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-16">

          <h2 data-anim="heading" className="[perspective:800px] font-display font-black text-3xl sm:text-5xl text-brand-navy uppercase tracking-tight">
            Why Travel With Us?
          </h2>

          <p data-anim="fade-up" className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed">
            We don&apos;t run crowded tour buses. We run small groups, put safety first and respect the places we visit.
          </p>
        </div>

        {/* 6 Core Value Cards Grid */}
        <div data-anim="stagger" className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="group relative bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xs hover:shadow-xl border border-slate-200/70 hover:border-brand-ocean/40 transition duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 sm:mb-6">
                    <div className={`w-10 h-10 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-gradient-to-br ${pillar.gradient} flex items-center justify-center ${pillar.iconColor} shadow-2xs group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2] transition-transform duration-500 group-hover:rotate-[-8deg]" aria-hidden />
                    </div>

                    <span className="hidden sm:inline text-[10px] font-extrabold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/60">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="font-display font-extrabold text-sm leading-snug sm:text-xl text-brand-navy mb-1.5 sm:mb-2.5 group-hover:text-brand-ocean transition-colors">
                    {pillar.title}
                  </h3>

                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-4 sm:line-clamp-none">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
