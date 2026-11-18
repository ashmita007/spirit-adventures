import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Promotion, FestiveTheme } from "@/lib/api";
import OfferCard from "@/components/offer-card";

const HEADINGS: Record<FestiveTheme, { kicker: string; title: string }> = {
  CHRISTMAS: { kicker: "🎄 Christmas specials", title: "Festive Events & Offers" },
  NEWYEAR: { kicker: "🎉 New Year specials", title: "New Year Events & Offers" },
  NONE: { kicker: "Limited time", title: "Events & Offers" },
};

/** Home page row of live events/offers. Renders nothing when the owner has none live. */
export default function OffersSection({ offers, theme }: { offers: Promotion[]; theme: FestiveTheme }) {
  if (!offers.length) return null;
  const h = HEADINGS[theme] ?? HEADINGS.NONE;
  const shown = offers.slice(0, 6);
  return (
    <section className="relative bg-slate-50 py-12 sm:py-20" aria-labelledby="offers-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between sm:mb-10 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.2em] text-brand-ocean">{h.kicker}</p>
            <h2 id="offers-heading" className="font-display text-3xl font-black uppercase tracking-tight text-brand-navy sm:text-5xl">
              {h.title}
            </h2>
          </div>
          {offers.length > 0 && (
            <Link href="/offers" className="mt-4 hidden items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-brand-ocean transition hover:text-brand-navy sm:mt-0 sm:inline-flex">
              See all offers <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-8 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
          {shown.map((o, i) => (
            <div key={o.id} className="w-[84%] shrink-0 snap-start sm:w-full">
              <OfferCard offer={o} priority={i < 2} />
            </div>
          ))}
        </div>
        <Link href="/offers" className="mt-4 inline-flex h-11 items-center rounded-full bg-brand-navy px-5 text-xs font-bold uppercase tracking-wide text-white sm:hidden">
          All offers
        </Link>
      </div>
    </section>
  );
}
