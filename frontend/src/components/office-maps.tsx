"use client";

import React, { useId, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { Clock, ExternalLink, MapPin, Navigation, Phone, Search } from "lucide-react";
import { OFFICES, PHONES, mapEmbedUrl, mapOpenUrl, directionsUrl } from "@/lib/offices";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Offices as one large map with a city switcher. The info panel (address, desk
 * phone, hours, directions search) and the map crossfade together when the city
 * changes; the map sits on a shimmer so it never shows an empty frame while loading.
 */
export default function OfficeMaps() {
  const uid = useId();
  const [index, setIndex] = useState(0);
  const [from, setFrom] = useState("");
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const office = OFFICES[index];
  const phone = PHONES.find((p) => p.city === office.city);

  const go = (e: React.FormEvent) => {
    e.preventDefault();
    window.open(directionsUrl(office, from.trim()), "_blank", "noopener,noreferrer");
  };

  return (
    <MotionConfig reducedMotion="user">
      <section aria-labelledby={`${uid}-title`} className="mt-16">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-ocean">Visit us</p>
            <h2
              id={`${uid}-title`}
              data-anim="heading"
              className="[perspective:800px] mt-1 font-display text-3xl font-black tracking-tight text-brand-navy sm:text-4xl"
            >
              Our {OFFICES.length > 1 ? "offices" : "office"}
            </h2>
          </div>

          {OFFICES.length > 1 && (
            <div role="tablist" aria-label="Choose an office" className="inline-flex self-start rounded-full border border-slate-200 bg-white p-1 shadow-sm sm:self-auto">
              {OFFICES.map((o, i) => {
                const active = i === index;
                return (
                  <button
                    key={o.city}
                    type="button"
                    role="tab"
                    id={`${uid}-tab-${i}`}
                    aria-selected={active}
                    aria-controls={`${uid}-panel`}
                    onClick={() => setIndex(i)}
                    className={cn(
                      "relative min-h-11 rounded-full px-5 text-sm font-bold transition-colors active:scale-[0.97]",
                      active ? "text-white" : "text-slate-600 hover:text-brand-navy"
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId={`${uid}-pill`}
                        aria-hidden="true"
                        className="absolute inset-0 rounded-full bg-brand-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className="relative">{o.city}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div
          id={`${uid}-panel`}
          role={OFFICES.length > 1 ? "tabpanel" : undefined}
          aria-labelledby={OFFICES.length > 1 ? `${uid}-tab-${index}` : undefined}
          className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_60px_-36px_rgba(6,43,73,0.45)] lg:grid-cols-12"
        >
          {/* Info panel */}
          <div className="relative flex flex-col bg-brand-navy p-6 text-white sm:p-8 lg:col-span-5">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={office.city}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="flex flex-1 flex-col"
              >
                <p className="font-display text-4xl font-black tracking-[-0.03em] sm:text-5xl">{office.city}</p>
                <dl className="mt-6 space-y-4 text-[15px] leading-6">
                  <div className="flex gap-3">
                    <dt className="sr-only">Address</dt>
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-sky" aria-hidden="true" />
                    <dd className="text-slate-200">{office.address}</dd>
                  </div>
                  {phone && (
                    <div className="flex gap-3">
                      <dt className="sr-only">Phone</dt>
                      <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brand-sky" aria-hidden="true" />
                      <dd>
                        <a href={`tel:${phone.tel}`} className="sa-underline font-semibold text-white">
                          {phone.display}
                        </a>
                      </dd>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <dt className="sr-only">Hours</dt>
                    <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand-sky" aria-hidden="true" />
                    <dd className="text-slate-200">9 AM to 9 PM, Monday to Sunday</dd>
                  </div>
                </dl>

                <form onSubmit={go} className="mt-auto pt-8">
                  <label htmlFor={`${uid}-from`} className="block text-xs font-semibold text-slate-300">
                    Where are you starting from?
                  </label>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <div className="relative min-w-0 flex-1">
                      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                      <input
                        id={`${uid}-from`}
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        placeholder={office.city === "Bengaluru" ? "e.g. Silk Board" : "e.g. Ameerpet Metro"}
                        autoComplete="street-address"
                        className="min-h-11 w-full rounded-xl border border-white/15 bg-white/10 pl-10 pr-3 text-base text-white placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-sky sm:text-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-brand-sky px-5 text-sm font-bold text-brand-navy transition hover:-translate-y-0.5 hover:bg-white active:translate-y-0 active:scale-[0.98]"
                    >
                      <Navigation className="h-4 w-4" aria-hidden="true" /> Get directions
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">Leave it empty to start from your current location.</p>
                  <a
                    href={mapOpenUrl(office)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sa-underline mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-sky"
                  >
                    Open in Google Maps <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </form>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Map */}
          <div className="relative min-h-[20rem] bg-slate-100 sm:min-h-[26rem] lg:col-span-7 lg:min-h-[32rem]">
            {!loaded[office.city] && <div aria-hidden="true" className="sa-shimmer absolute inset-0" />}
            <AnimatePresence initial={false}>
              <motion.iframe
                key={office.city}
                title={`Map of the Spirit Adventures ${office.city} office`}
                src={mapEmbedUrl(office)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                onLoad={() => setLoaded((l) => ({ ...l, [office.city]: true }))}
                initial={{ opacity: 0 }}
                animate={{ opacity: loaded[office.city] ? 1 : 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="absolute inset-0 h-full w-full border-0 [filter:saturate(0.92)_contrast(1.03)]"
              />
            </AnimatePresence>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
