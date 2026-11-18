import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Gift, ArrowUpRight } from "lucide-react";
import type { Promotion } from "@/lib/api";
import { cn, formatCurrency } from "@/lib/utils";
import { whatsappUrl } from "@/lib/whatsapp";
import OfferCountdown from "@/components/offer-countdown";

function niceDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function target(offer: Promotion) {
  if (offer.trip_slug) return { href: `/trips/${offer.trip_slug}`, external: false };
  return {
    href: whatsappUrl(`Hi Spirit Adventures, I'm interested in "${offer.title}". Please share details.`),
    external: true,
  };
}

function savePct(o: Promotion) {
  return o.price && o.original_price && o.original_price > o.price
    ? Math.round(((o.original_price - o.price) / o.original_price) * 100)
    : 0;
}

const FESTIVE_RING: Record<Promotion["festival"], string> = {
  NONE: "ring-1 ring-inset ring-white/10",
  CHRISTMAS: "ring-1 ring-inset ring-red-300/40",
  NEWYEAR: "ring-1 ring-inset ring-amber-200/45",
};

/**
 * Event/offer card. `feature` = big image-led card (first slot); `compact` = the rest.
 * Mobile first: whole card is the tap target, CTA is 44px+, text sits on the image so
 * phones see the offer without scrolling inside the card.
 */
export default function OfferCard({
  offer,
  variant = "compact",
  priority = false,
}: {
  offer: Promotion;
  variant?: "feature" | "compact";
  priority?: boolean;
}) {
  const t = target(offer);
  const pct = savePct(offer);
  const badge = offer.badge || (pct ? `${pct}% off` : "");
  const countdownTo = offer.kind === "EVENT" ? offer.event_date : offer.ends_on;
  const feature = variant === "feature";
  const Wrapper = ({ children, className }: { children: React.ReactNode; className: string }) =>
    t.external ? (
      <a href={t.href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>
    ) : (
      <Link href={t.href} className={className}>{children}</Link>
    );

  return (
    <Wrapper
      className={cn(
        "group relative isolate flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-brand-navy text-white",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_18px_40px_-22px_rgba(11,23,54,0.65)]",
        "transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]",
        "hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_28px_60px_-24px_rgba(2,132,199,0.45)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sky focus-visible:ring-offset-2",
        FESTIVE_RING[offer.festival],
        feature ? "min-h-[26rem] sm:min-h-[30rem]" : "min-h-[22rem] lg:min-h-[17rem]"
      )}
    >
      {/* Photo */}
      <div className="absolute inset-0 -z-10">
        {offer.image_url ? (
          <Image
            src={offer.image_url}
            alt=""
            fill
            priority={priority}
            sizes={feature ? "(max-width: 640px) 88vw, (max-width: 1024px) 90vw, 58vw" : "(max-width: 640px) 80vw, (max-width: 1024px) 45vw, 30vw"}
            className="object-cover transition duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_20%_0%,#1e3a8a_0%,#0b1736_70%)]">
            <Gift className="absolute right-6 top-6 h-14 w-14 text-white/10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07102a] via-[#07102a]/55 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/35 to-transparent" />
      </div>

      {/* Top row */}
      <div className="flex items-start justify-between gap-2 p-4 sm:p-5">
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] ring-1 ring-inset ring-white/20 backdrop-blur-md">
            {offer.festival === "CHRISTMAS" ? "🎄 " : offer.festival === "NEWYEAR" ? "🎉 " : ""}
            {offer.kind === "EVENT" ? "Event" : "Offer"}
          </span>
          {badge && (
            <span className="sa-festive-accent rounded-full bg-gradient-to-r from-rose-500 to-orange-400 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] shadow-lg shadow-rose-900/30">
              {badge}
            </span>
          )}
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-inset ring-white/20 backdrop-blur-md transition duration-500 group-hover:rotate-45 group-hover:bg-white group-hover:text-brand-navy">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      {/* Copy */}
      <div className="mt-auto p-4 pt-0 sm:p-6 sm:pt-0">
        {countdownTo && (
          <div className="mb-3">
            <OfferCountdown until={countdownTo} label={offer.kind === "EVENT" ? "Starts in" : "Ends in"} tone="dark" />
          </div>
        )}
        {(offer.event_date || offer.location) && (
          <div className="mb-2 flex flex-wrap gap-x-3 gap-y-1 text-[12px] font-semibold text-sky-100/80">
            {offer.event_date && (
              <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {niceDate(offer.event_date)}</span>
            )}
            {offer.location && (
              <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {offer.location}</span>
            )}
          </div>
        )}
        <h3
          className={cn(
            "font-display font-black leading-[1.08] tracking-[-0.025em] text-balance",
            feature ? "text-[1.7rem] sm:text-4xl" : "text-xl"
          )}
        >
          {offer.title}
        </h3>
        {offer.description && (
          <p className={cn("mt-2 text-sm leading-relaxed text-slate-200/85", feature ? "line-clamp-3 sm:max-w-md" : "line-clamp-2")}>
            {offer.description}
          </p>
        )}

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-white/10 pt-4">
          <div className="min-w-0">
            {offer.price ? (
              <>
                {offer.original_price && offer.original_price > offer.price && (
                  <span className="block text-xs tabular-nums text-slate-300/70 line-through">{formatCurrency(offer.original_price)}</span>
                )}
                <span className={cn("font-display font-black tabular-nums tracking-tight", feature ? "text-3xl" : "text-2xl")}>
                  {formatCurrency(offer.price)}
                </span>
                <span className="ml-1 text-[11px] font-semibold text-slate-300/80">/ person</span>
              </>
            ) : (
              <span className="text-sm font-semibold text-slate-200/80">{offer.trip_title || "Ask us for the price"}</span>
            )}
          </div>
          <span className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-white px-5 text-[11px] font-black uppercase tracking-[0.12em] text-brand-navy shadow-[inset_0_-2px_0_rgba(0,0,0,0.08)] transition group-hover:bg-brand-sky group-hover:text-white">
            {offer.cta_label || (t.external ? "Enquire" : "Book now")}
          </span>
        </div>
      </div>
    </Wrapper>
  );
}
