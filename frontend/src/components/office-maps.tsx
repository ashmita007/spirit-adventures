"use client";

import React, { useId, useState } from "react";
import { MapPin, Navigation, Search, ExternalLink } from "lucide-react";
import { OFFICES, Office, mapEmbedUrl, mapOpenUrl, directionsUrl } from "@/lib/offices";

function OfficeCard({ office }: { office: Office }) {
  const [from, setFrom] = useState("");
  const id = useId();

  const go = (e: React.FormEvent) => {
    e.preventDefault();
    window.open(directionsUrl(office, from.trim()), "_blank", "noopener,noreferrer");
  };

  return (
    <article className="rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-lg shadow-slate-200/60 flex flex-col">
      <header className="bg-brand-navy text-white px-6 py-5 flex items-start gap-3">
        <span className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-5 h-5 text-brand-sky" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-brand-sky uppercase tracking-wide">{office.city} office</p>
          <p className="text-sm text-slate-200 leading-relaxed mt-1">{office.address}</p>
        </div>
      </header>

      <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-slate-100">
        <iframe
          title={`Map of the Spirit Adventures ${office.city} office`}
          src={mapEmbedUrl(office)}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>

      <form onSubmit={go} className="p-4 sm:p-5 space-y-3 border-t border-slate-100">
        <label htmlFor={id} className="block text-xs font-semibold text-slate-700">
          Search your starting point for directions
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              id={id}
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder={`e.g. ${office.city === "Bengaluru" ? "Silk Board" : "Ameerpet Metro"}, or leave empty for your location`}
              autoComplete="street-address"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-ocean focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-ocean hover:bg-brand-ocean-light text-white text-sm font-semibold whitespace-nowrap transition"
          >
            <Navigation className="w-4 h-4" aria-hidden="true" /> Directions
          </button>
        </div>
        <a
          href={mapOpenUrl(office)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-ocean hover:underline"
        >
          Open in Google Maps <ExternalLink className="w-3 h-3" aria-hidden="true" />
        </a>
      </form>
    </article>
  );
}

export default function OfficeMaps() {
  return (
    <section aria-labelledby="offices-title" className="mt-16">
      <div className="mb-6">
        <p className="text-[11px] font-semibold text-brand-ocean uppercase tracking-wide">Visit us</p>
        <h2 id="offices-title" className="font-display font-black text-2xl sm:text-3xl text-brand-navy tracking-tight mt-1">
          Our {OFFICES.length > 1 ? "offices" : "office"}
        </h2>
      </div>
      <div className={`grid gap-6 ${OFFICES.length > 1 ? "md:grid-cols-2" : "max-w-3xl"}`}>
        {OFFICES.map((o) => (
          <OfficeCard key={o.city} office={o} />
        ))}
      </div>
    </section>
  );
}
