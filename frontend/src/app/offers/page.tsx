import type { Metadata } from "next";
import Link from "next/link";
import { Gift } from "lucide-react";
import { getPromotions } from "@/lib/api";
import OfferCard from "@/components/offer-card";
import PageHero from "@/components/page-hero";
import { festivalLook } from "@/lib/festivals";

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

  return (
    <div className="bg-white">
      <PageHero
        eyebrow={look ? `${look.emoji} ${look.name} specials` : "Limited time"}
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
                <h2 data-anim="heading" className="[perspective:800px] mb-5 font-display text-2xl font-black tracking-[-0.03em] text-brand-navy sm:mb-7 sm:text-4xl">{group.label}</h2>
                <div data-anim="stagger" className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                  {group.list.map((o, i) => (
                    <div key={o.id} className={i === 0 && group.list.length > 2 ? "sm:col-span-2" : ""}>
                      <OfferCard offer={o} variant={i === 0 && group.list.length > 2 ? "feature" : "compact"} priority={i < 3} />
                    </div>
                  ))}
                </div>
              </section>
            )
        )}
      </div>
    </div>
  );
}
