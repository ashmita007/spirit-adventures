import { Users, Star, MapPin, Mountain } from "lucide-react";

/** Glass stats band that overlaps the bottom of the hero. Numbers count up (data-count). */
export default function TrustStrip({ tripCount, destinationCount }: { tripCount: number; destinationCount: number }) {
  const stats = [
    { icon: Users, value: 500, suffix: "+", decimals: 0, label: "Happy adventurers" },
    { icon: Star, value: 5, suffix: "", decimals: 1, label: "Google rating" },
    { icon: Mountain, value: tripCount, suffix: "", decimals: 0, label: "Packages" },
    { icon: MapPin, value: destinationCount, suffix: "", decimals: 0, label: "Destinations" },
  ];
  return (
    <div className="relative z-30 -mt-14 sm:-mt-16 px-4 sm:px-6 lg:px-8">
      <div
        data-anim="stagger"
        className="mx-auto max-w-5xl grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-3xl border border-white/60 bg-slate-200/60 shadow-2xl shadow-brand-navy/15"
      >
        {stats.map(({ icon: Icon, value, suffix, decimals, label }) => (
          <div key={label} className="flex items-center gap-3 bg-white/95 px-4 py-4 sm:px-6 sm:py-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-brand-ocean">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="font-display text-xl sm:text-2xl font-black text-brand-navy leading-none">
                <span data-count={value} data-count-decimals={decimals} data-count-suffix={suffix}>
                  {value.toFixed(decimals)}
                  {suffix}
                </span>
              </div>
              <div className="mt-1 text-[11px] sm:text-xs font-medium text-slate-500 truncate">{label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
