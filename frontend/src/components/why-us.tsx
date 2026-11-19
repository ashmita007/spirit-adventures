import React from "react";
import Image from "next/image";
import { Award, Compass, HeartHandshake, Mountain, ShieldCheck } from "lucide-react";

const PHOTO_RAFTING =
  "https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341325/spirit_adventures/shorts/dandeli_rafting_poster.jpg";
const PHOTO_COORG =
  "https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341327/spirit_adventures/shorts/coorg_mist_poster.jpg";

const TILE = "rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]";

function Point({
  icon: Icon,
  title,
  children,
  className = "",
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`${TILE} flex flex-col ${className}`}>
      <Icon className="h-6 w-6 text-brand-ocean" aria-hidden="true" />
      <h3 className="mt-5 font-display text-lg font-bold leading-snug text-brand-navy">{title}</h3>
      <p className="mt-2 text-[15px] leading-6 text-slate-600">{children}</p>
    </div>
  );
}

/**
 * "Why travel with us" as an asymmetric bento: two real trip photographs set
 * between the points, one large type figure for group size, one dark safety tile.
 * Tiles rise in sequence (data-anim="stagger"); photos zoom 1.03 inside their frame on hover.
 */
export default function WhyUs() {
  return (
    <section aria-labelledby="why-us-title" className="relative border-t border-slate-200/60 bg-slate-50 py-14 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-4 sm:mb-12 lg:grid-cols-12 lg:items-end">
          <h2
            id="why-us-title"
            data-anim="heading"
            className="[perspective:800px] font-display text-3xl font-black uppercase tracking-tight text-brand-navy sm:text-5xl lg:col-span-7"
          >
            Why travel with us
          </h2>
          <p data-anim="fade-up" className="max-w-md text-[15px] leading-7 text-slate-600 sm:text-base lg:col-span-5 lg:justify-self-end">
            We don&apos;t run crowded tour buses. We run small groups, put safety first and respect the places we visit.
          </p>
        </div>

        <div data-anim="stagger" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-12 lg:auto-rows-[minmax(14rem,auto)]">
          {/* Lead photograph */}
          <div className="group relative col-span-2 aspect-[4/3] overflow-hidden rounded-3xl bg-slate-200 lg:col-span-6 lg:row-span-2 lg:aspect-auto">
            <Image
              src={PHOTO_RAFTING}
              alt="A Spirit Adventures group rafting on the Kali river in Dandeli"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          </div>

          {/* Group size, set large */}
          <div className={`${TILE} col-span-2 flex flex-col justify-between gap-6 lg:col-span-6`}>
            <p className="font-display text-[4.5rem] font-black leading-none tracking-[-0.04em] text-brand-navy sm:text-[6rem]">
              12–14
            </p>
            <div className="max-w-md">
              <h3 className="font-display text-lg font-bold text-brand-navy">Travellers per batch, never more</h3>
              <p className="mt-2 text-[15px] leading-6 text-slate-600">
                Small groups keep the trail safe, the impact low and the people you travel with close.
              </p>
            </div>
          </div>

          <Point icon={Award} title="Certified expedition leaders" className="col-span-2 sm:col-span-1 lg:col-span-3">
            IMF certified guides and Wilderness First Responders with high-altitude experience.
          </Point>

          {/* Safety, the one dark tile */}
          <div className="col-span-2 flex flex-col rounded-3xl bg-brand-navy p-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] sm:col-span-1 sm:p-7 lg:col-span-3">
            <ShieldCheck className="h-6 w-6 text-brand-sky" aria-hidden="true" />
            <h3 className="mt-5 font-display text-lg font-bold leading-snug">Medical and safety protocols</h3>
            <p className="mt-2 text-[15px] leading-6 text-slate-300">
              Oxygen cylinders, pulse oximeters, satellite communication and fixed acclimatisation days.
            </p>
          </div>

          <Point icon={Compass} title="Local trail captains" className="col-span-2 sm:col-span-1 lg:col-span-3">
            Captains from the region who know the quieter waterfalls, stargazing ridges and village life.
          </Point>

          <div className="group relative col-span-2 aspect-[4/3] overflow-hidden rounded-3xl bg-slate-200 sm:col-span-1 sm:aspect-auto sm:min-h-[14rem] lg:col-span-3">
            <Image
              src={PHOTO_COORG}
              alt="Morning mist over the Coorg hills"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          </div>

          <Point icon={Mountain} title="Routes off the usual path" className="col-span-2 sm:col-span-1 lg:col-span-3">
            Trails we have walked ourselves, picked for quiet and views, away from crowded stops.
          </Point>

          <Point icon={HeartHandshake} title="One person before the trip" className="col-span-2 sm:col-span-1 lg:col-span-3">
            Fitness prep, packing list, gear rental and pickup, all through one person you can call.
          </Point>
        </div>
      </div>
    </section>
  );
}
