import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Gift, MessageCircle } from "lucide-react";
import { getPromotions } from "@/lib/api";
import OfferCard from "@/components/offer-card";
import PageHero from "@/components/page-hero";
import { festivalLook } from "@/lib/festivals";
import EventCountdown from "@/components/event-countdown";
import { whatsappUrl } from "@/lib/whatsapp";
import { formatCurrency } from "@/lib/utils";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Events & Offers | Spirit Adventures",
  description: "Current trip offers, festive specials and upcoming group events from Spirit Adventures.",
  alternates: { canonical: "/offers" },
};

export default async function OffersPage() {
  const { items, theme } = await getPromotions();
  const events = items.filter((i) => i.kind === "EVENT");
  const offers = items.filter((i) => i.kind === "OFFER");
  const look = festivalLook(theme.active);
  const title = look ? `${look.name} Events & Offers` : "Events & Offers";
  // The soonest end date among live items drives the big countdown.
  const today = new Date().toISOString().slice(0, 10);
  const endsOn = items
    .map((i) => (i.kind === "EVENT" ? i.event_date : i.ends_on))
    .filter((d): d is string => Boolean(d) && (d as string) >= today)
    .sort()[0];
  const prices = items.map((i) => i.price).filter((n): n is number => typeof n === "number" && n > 0);
  const fromPrice = prices.length ? Math.min(...prices) : null;

  return (
    <div className="bg-white">
      <PageHero
        eyebrow={look ? `${look.emoji} ${look.name} specials` : "Limited time"}
        title={title}
        subtitle="Limited-time prices and group departures, updated by our team."
        image={items[0]?.image_url || "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1600&q=80"}
        crumbs={[{ label: "Offers" }]}
      />
      {items.length > 0 && (
        <section
          aria-label={look ? `${look.name} countdown` : "Offer countdown"}
          className="relative isolate overflow-hidden bg-brand-navy py-12 text-white sm:py-16"
          style={look ? { background: look.stage.bg } : undefined}
        >
          {look && (
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full blur-3xl" style={{ background: look.stage.glowA }} />
              <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full blur-3xl" style={{ background: look.stage.glowB }} />
            </div>
          )}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {endsOn ? (
              <EventCountdown until={endsOn} label={look ? `${look.name} offers end in` : "Offers end in"} />
            ) : null}
            <p data-anim="fade-up" className="mt-6 text-center text-sm text-white/75 sm:text-base">
              {items.length} {items.length === 1 ? "trip" : "trips"} on offer
              {fromPrice ? <> · from <strong className="font-bold text-white">{formatCurrency(fromPrice)}</strong> per person</> : null}
            </p>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-7xl space-y-14 px-4 py-12 sm:space-y-20 sm:px-6 sm:py-16 lg:px-8">
        {items.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 py-16 text-center">
            <Gift className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="font-semibold text-brand-navy">No offers running right now.</p>
            <p className="mt-1 text-sm text-slate-500">Check back soon, or browse all our packages.</p>
            <Link href="/trips" className="mt-5 inline-flex h-11 items-center rounded-full bg-brand-navy px-6 text-xs font-bold uppercase tracking-wide text-white">
              Browse trips
            </Link>
          </div>
        )}
        {[{ label: look ? `${look.name} offers` : "Offers", list: offers }, { label: "Upcoming events", list: events }].map(
          (group) =>
            group.list.length > 0 && (
              <section key={group.label} aria-label={group.label}>
                <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
                  <h2 data-anim="heading" className="[perspective:800px] font-display text-3xl font-black tracking-[-0.03em] text-brand-navy sm:text-5xl">
                    {group.label}
                  </h2>
                  <span className="shrink-0 text-sm font-semibold text-slate-500">{group.list.length} live</span>
                </div>
                {/* Lead item full width, the rest in an even grid */}
                <div data-anim="fade-up">
                  <OfferCard offer={group.list[0]} variant="feature" priority />
                </div>
                {group.list.length > 1 && (
                  <div data-anim="stagger" className="mt-4 grid grid-cols-1 gap-4 sm:mt-6 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                    {group.list.slice(1).map((o, i) => (
                      <OfferCard key={o.id} offer={o} priority={i < 2} />
                    ))}
                  </div>
                )}
              </section>
            )
        )}

        {items.length > 0 && (
          <section
            aria-labelledby="offers-book"
            data-anim="fade-up"
            className="grid gap-6 rounded-3xl border border-slate-200 bg-brand-light p-6 sm:p-10 lg:grid-cols-12 lg:items-center"
          >
            <div className="lg:col-span-7">
              <h2 id="offers-book" className="font-display text-2xl font-black tracking-tight text-brand-navy sm:text-3xl">
                Lock an offer price on WhatsApp
              </h2>
              <ol className="mt-4 grid gap-3 text-[15px] leading-6 text-slate-700 sm:grid-cols-3">
                {["Send the offer name", "We confirm your seat and pickup", "Pay the advance to hold the price"].map((t, i) => (
                  <li key={t} className="flex gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-navy text-xs font-bold text-white">{i + 1}</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:justify-end">
              <a
                href={whatsappUrl(`Hi Spirit Adventures, I'd like to book one of your ${look ? look.name + " " : ""}offers.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-emerald-500 active:translate-y-0 active:scale-[0.98]"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> Book on WhatsApp
              </a>
              <Link
                href="/trips"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 text-sm font-bold text-brand-navy transition hover:-translate-y-0.5 hover:border-brand-navy active:translate-y-0 active:scale-[0.98]"
              >
                All trips <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
