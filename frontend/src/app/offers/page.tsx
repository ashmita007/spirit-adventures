import type { Metadata } from "next";
import Link from "next/link";
import { Gift } from "lucide-react";
import { getPromotions } from "@/lib/api";
import OfferCard from "@/components/offer-card";
import PageHero from "@/components/page-hero";

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
  const title = theme.active === "CHRISTMAS" ? "Christmas Events & Offers" : theme.active === "NEWYEAR" ? "New Year Events & Offers" : "Events & Offers";

  return (
    <div className="bg-white">
      <PageHero
        eyebrow={theme.active === "NONE" ? "Limited time" : theme.active === "CHRISTMAS" ? "Christmas specials" : "New Year specials"}
        title={title}
        subtitle="Limited-time prices and group departures, updated by our team."
        image={items[0]?.image_url || "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1600&q=80"}
        crumbs={[{ label: "Offers" }]}
      />
      <div className="mx-auto max-w-7xl space-y-14 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
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
        {[{ label: "Offers", list: offers }, { label: "Upcoming events", list: events }].map(
          (group) =>
            group.list.length > 0 && (
              <section key={group.label}>
                <h2 className="mb-6 font-display text-2xl font-black uppercase tracking-tight text-brand-navy sm:text-3xl">{group.label}</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {group.list.map((o, i) => (
                    <OfferCard key={o.id} offer={o} priority={i < 3} />
                  ))}
                </div>
              </section>
            )
        )}
      </div>
    </div>
  );
}
