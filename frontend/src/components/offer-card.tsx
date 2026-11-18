import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Gift, ArrowRight } from "lucide-react";
import type { Promotion } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { whatsappUrl } from "@/lib/whatsapp";

function niceDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function OfferCard({ offer, priority = false }: { offer: Promotion; priority?: boolean }) {
  const href = offer.trip_slug ? `/trips/${offer.trip_slug}` : null;
  const enquire = whatsappUrl(`Hi Spirit Adventures, I'm interested in "${offer.title}". Please share details.`);
  const saving =
    offer.price && offer.original_price && offer.original_price > offer.price
      ? Math.round(((offer.original_price - offer.price) / offer.original_price) * 100)
      : 0;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        {offer.image_url ? (
          <Image
            src={offer.image_url}
            alt={offer.title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <Gift className="absolute inset-0 m-auto h-10 w-10 text-slate-300" />
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-brand-navy shadow">
            {offer.kind === "EVENT" ? "Event" : "Offer"}
          </span>
          {(offer.badge || saving > 0) && (
            <span className="sa-festive-accent rounded-full bg-rose-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow">
              {offer.badge || `${saving}% off`}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {(offer.event_date || offer.location) && (
          <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
            {offer.event_date && (
              <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {niceDate(offer.event_date)}</span>
            )}
            {offer.location && (
              <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {offer.location}</span>
            )}
          </div>
        )}
        <h3 className="font-display text-lg font-black leading-snug text-brand-navy">{offer.title}</h3>
        {offer.description && <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm text-slate-600">{offer.description}</p>}
        {offer.ends_on && <p className="mt-2 text-xs font-semibold text-rose-600">Offer ends {niceDate(offer.ends_on)}</p>}

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            {offer.price ? (
              <>
                {offer.original_price && offer.original_price > offer.price && (
                  <span className="block text-xs text-slate-400 line-through">{formatCurrency(offer.original_price)}</span>
                )}
                <span className="font-display text-xl font-black text-brand-navy">{formatCurrency(offer.price)}</span>
                <span className="text-xs text-slate-500"> / person</span>
              </>
            ) : null}
          </div>
          {href ? (
            <Link href={href} className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-brand-navy px-5 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-brand-ocean active:scale-95">
              {offer.cta_label || "Book now"} <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <a href={enquire} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-brand-navy px-5 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-brand-ocean active:scale-95">
              {offer.cta_label || "Enquire"} <ArrowRight className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
