"use client";

/**
 * "Meet the team" on the About page. Members come from Owner HQ → Team.
 *
 * Structure: leaders as two large cards (bio clamped, "Read more" expands it);
 * the crew grouped by job: the sales desk (with a call button parsed from the
 * role text) and trip organisers (with their trips-completed count).
 *
 * Motion (GSAP, skipped for reduced-motion visitors): heading words rise once;
 * each card rises as it enters while its photo develops from grey to colour.
 * Hover (CSS): card lifts 2px, photo zooms 1.03, the info panel slides up.
 * Nothing moves with the scroll position. Content is never hidden by CSS alone.
 */
import React, { useId, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ChevronDown, Instagram, Linkedin, MapPin, Phone } from "lucide-react";
import type { TeamMember } from "@/lib/types";
import { cn } from "@/lib/utils";
import { parseTeamRole } from "@/lib/readable-text";
import { SpinSticker, Sticker } from "@/components/floating-sticker";
import { whatsappUrl } from "@/lib/whatsapp";
import { SPOTLIGHT, trackSpotlight } from "@/components/motion/spotlight";
import { Small } from "@/components/mix-heading";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const cityName = (c?: string) => (c ? c.trim().replace(/\b([a-z])/g, (x) => x.toUpperCase()) : "");

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function Socials({ m }: { m: TeamMember }) {
  if (!m.instagram_url && !m.linkedin_url) return null;
  const cls =
    "inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-brand-navy hover:text-white active:scale-95";
  return (
    <div className="flex gap-2">
      {m.instagram_url && (
        <a href={m.instagram_url} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on Instagram`} className={cls}>
          <Instagram className="h-4 w-4" />
        </a>
      )}
      {m.linkedin_url && (
        <a href={m.linkedin_url} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on LinkedIn`} className={cls}>
          <Linkedin className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}

function Photo({ m, sizes, className }: { m: TeamMember; sizes: string; className?: string }) {
  return m.photo_url ? (
    <Image src={m.photo_url} alt={`${m.name}, ${m.role}`} fill sizes={sizes} className={cn("object-cover", className)} />
  ) : (
    <div className={cn("absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-ocean to-brand-navy", className)}>
      <span className="font-display text-6xl font-black text-white/90">{initials(m.name)}</span>
    </div>
  );
}

function LeadCard({ m }: { m: TeamMember }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const { title } = parseTeamRole(m.role);
  const long = (m.bio || "").length > 220;
  return (
    <article
      data-team-card
      onPointerMove={trackSpotlight}
      className="group relative grid overflow-hidden rounded-[28px] bg-white p-2 text-brand-navy shadow-[0_30px_60px_-30px_rgba(2,20,40,0.7)] transition-transform duration-300 hover:-translate-y-0.5 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
    >
      <span aria-hidden="true" className={SPOTLIGHT} />
      <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-brand-light sm:aspect-auto sm:min-h-[26rem]">
        <div data-team-photo className="absolute inset-0">
          <Photo m={m} sizes="(min-width:1024px) 25vw, (min-width:640px) 45vw, 100vw" className="transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
        </div>
      </div>
      <div className="flex flex-col gap-3 p-4 pt-5 sm:p-7">
        <span data-team-line className="text-xs font-bold uppercase tracking-[0.2em] text-brand-ocean">{title}</span>
        <h3 data-team-line className="font-display text-3xl font-black uppercase leading-none">{m.name}</h3>
        {m.bio && (
          <div data-team-line>
            <p id={`${id}-bio`} className={cn("text-[15px] leading-7 text-slate-600", !open && long && "line-clamp-4")}>
              {m.bio}
            </p>
            {long && (
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`${id}-bio`}
                onClick={() => setOpen((o) => !o)}
                className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-brand-ocean transition hover:text-brand-navy"
              >
                {open ? "Show less" : "Read more"}
                <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", open && "rotate-180")} aria-hidden="true" />
              </button>
            )}
          </div>
        )}
        <div data-team-line className="mt-auto flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-600">
          {m.city && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-brand-ocean" aria-hidden="true" /> {cityName(m.city)}
            </span>
          )}
          {m.experience && <span className="rounded-full bg-brand-light px-2.5 py-1 font-semibold text-brand-navy">{m.experience}</span>}
          <Socials m={m} />
        </div>
      </div>
    </article>
  );
}

function CrewCard({ m }: { m: TeamMember }) {
  const { title, phone } = parseTeamRole(m.role);
  const city = cityName(m.city);
  return (
    <article
      data-team-card
      onPointerMove={trackSpotlight}
      className="group relative flex flex-col rounded-3xl bg-white p-1.5 shadow-[0_20px_40px_-24px_rgba(2,20,40,0.7)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_50px_-24px_rgba(2,20,40,0.8)] sm:p-2"
    >
      <span aria-hidden="true" className={SPOTLIGHT} />
      <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-brand-light">
        <div data-team-photo className="absolute inset-0">
          <Photo m={m} sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw" className="transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
        </div>
        {m.experience && (
          <span data-team-meta className="absolute left-2.5 top-2.5 -rotate-6 rounded-full bg-amber-300 px-2.5 py-1 font-display text-[11px] font-black uppercase text-brand-navy shadow-[0_0_0_2px_#fff,0_6px_12px_-4px_rgba(2,20,40,0.5)] transition-transform duration-300 group-hover:rotate-0 group-hover:scale-110">
            {m.experience.replace(/\s*trips?\s*completed/i, " trips")}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-2 pb-2 pt-3 sm:px-3">
        <h4 className="font-display text-base font-black uppercase leading-tight text-brand-navy sm:text-lg">{m.name}</h4>
        <p data-team-meta className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-brand-ocean">{title}</p>
        {city && (
          <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {city}
          </p>
        )}
        {(phone || m.instagram_url || m.linkedin_url) && (
          <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
            {phone && (
              <a
                href={`tel:${phone.tel}`}
                aria-label={`Call ${m.name} on ${phone.display}`}
                className="inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full bg-brand-navy px-3 text-xs font-bold text-white transition hover:bg-brand-ocean active:scale-[0.97] sm:px-4 sm:text-sm"
              >
                <Phone className="h-4 w-4" aria-hidden="true" /> {phone.display}
              </a>
            )}
            <Socials m={m} />
          </div>
        )}
      </div>
    </article>
  );
}

function CrewGroup({ label, people }: { label: string; people: TeamMember[] }) {
  if (people.length === 0) return null;
  return (
    <div>
      <div data-team-group className="relative mb-4 flex items-baseline justify-between gap-4 pb-3 sm:mb-6">
        <span data-team-rule aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px origin-left bg-white/20" />
        <h3 className="font-display text-xl font-black uppercase tracking-tight text-white sm:text-2xl">{label}</h3>
        <span className="text-sm font-semibold text-white/60">{people.length}</span>
      </div>
      <div data-team-grid className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {people.map((m) => (
          <CrewCard key={m.id} m={m} />
        ))}
      </div>
    </div>
  );
}

export default function TeamSection({ members }: { members: TeamMember[] }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const node = root.current;
      if (!node || members.length === 0) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const head = node.querySelector("[data-team-head]");
        // Ridge settles down from above as the section arrives.
        gsap.from(node.querySelector("[data-team-ridge]"), {
          yPercent: -60,
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: { trigger: node, start: "top 85%", once: true },
        });
        // Heading words rise out of a blur, one after another.
        // Filters get explicit end values: GSAP cannot interpolate towards "none".
        gsap.fromTo(node.querySelectorAll("[data-team-word]"), { yPercent: 110, opacity: 0, filter: "blur(10px)" }, {
          yPercent: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1,
          ease: "expo.out",
          stagger: 0.07,
          clearProps: "filter",
          scrollTrigger: { trigger: head, start: "top 85%", once: true },
        });
        // Group labels: the rule draws left to right, the label slides in.
        node.querySelectorAll<HTMLElement>("[data-team-group]").forEach((g) => {
          gsap
            .timeline({ scrollTrigger: { trigger: g, start: "top 88%", once: true } })
            .from(g.querySelector("[data-team-rule]"), { scaleX: 0, duration: 1.1, ease: "expo.inOut" })
            .from(g.querySelectorAll("h3, span:not([data-team-rule])"), { x: -16, opacity: 0, duration: 0.6, ease: "expo.out", stagger: 0.08 }, "<0.2");
        });
        // Cards: a mask opens upward from the bottom edge while the card rises,
        // the photo develops from grey and the text follows.
        ScrollTrigger.batch(node.querySelectorAll<HTMLElement>("[data-team-card]"), {
          start: "top 90%",
          once: true,
          onEnter: (cards) =>
            cards.forEach((card, i) => {
              gsap
                .timeline({ delay: i * 0.09 })
                .from(card, {
                  clipPath: "inset(100% 0% 0% 0% round 24px)",
                  y: 48,
                  duration: 1.1,
                  ease: "expo.out",
                  clearProps: "clipPath,transform",
                })
                .fromTo(
                  card.querySelector("[data-team-photo]"),
                  { scale: 1.18, filter: "saturate(0) brightness(0.9)" },
                  { scale: 1, filter: "saturate(1) brightness(1)", duration: 1.4, ease: "expo.out", clearProps: "transform,filter" },
                  "<"
                )
                .fromTo(
                  card.querySelectorAll("[data-team-line], [data-team-meta], h4"),
                  { y: 14, opacity: 0, filter: "blur(6px)" },
                  { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.7, ease: "expo.out", stagger: 0.05, clearProps: "transform,opacity,filter" },
                  "<0.35"
                );
            }),
        });
      });
    },
    { scope: root, dependencies: [members.length] }
  );

  if (members.length === 0) return null;

  const leads = members.filter((m) => m.is_lead);
  const crew = members.filter((m) => !m.is_lead);
  const sales = crew.filter((m) => /sales|desk|support|planner/i.test(m.role));
  const organisers = crew.filter((m) => !sales.includes(m));
  // Big words with the small connecting words in amber: THE PEOPLE *behind every* TRIP.
  const heading: { text: string; small?: boolean }[] = [
    { text: "The" },
    { text: "people" },
    { text: "behind every", small: true },
    { text: "trip" },
  ];
  const cities = [...new Set(members.map((m) => cityName(m.city)).filter(Boolean))].slice(0, 3);

  return (
    <section
      ref={root}
      aria-labelledby="team-heading"
      className="relative isolate overflow-hidden bg-gradient-to-b from-brand-ocean via-brand-navy-light to-brand-navy pb-16 pt-24 sm:pb-24 sm:pt-36"
    >
      {/* Mountain ridge cut into the top edge, in the colour of the section above */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        data-team-ridge
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-14 w-full text-white sm:h-24"
      >
        <path
          fill="currentColor"
          d="M0 0h1440v38l-70 34-64-40-92 62-78-48-60 30-104-66-86 58-58-26-96 70-82-52-66 34-110-72-90 60-62-30-88 54-76-46-70 40-92-64-80 50-48-20L0 74z"
        />
      </svg>
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-24 -z-10 h-96 w-96 rounded-full bg-brand-sky/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 bottom-0 -z-10 h-96 w-96 rounded-full bg-brand-ocean/30 blur-3xl" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div data-team-head className="mb-10 grid gap-4 sm:mb-14 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-sky">Meet the team</p>
            <h2 id="team-heading" className="mt-2 font-display text-3xl font-black uppercase tracking-tight text-white sm:text-5xl">
              {heading.map((w, i) => (
                <span key={i} className={cn("inline-block overflow-hidden pb-1", w.small ? "align-middle" : "align-bottom")}>
                  <span data-team-word className="inline-block">
                    {w.small ? <Small>{w.text}</Small> : w.text}
                    {i < heading.length - 1 && !w.small ? "\u00A0" : ""}
                  </span>
                </span>
              ))}
            </h2>
            {/* Stickers: drag them about, they spring back */}
            <div className="mt-6 flex flex-wrap gap-x-3 gap-y-4">
              <Sticker tone="sky" rotate={-6}>🏔 Since 2022</Sticker>
              <Sticker tone="sun" rotate={4} delay={0.08}>⭐ 50+ destinations</Sticker>
              <Sticker rotate={-3} delay={0.16}>🎒 {members.length} people</Sticker>
              {cities.length > 0 && (
                <Sticker tone="coral" rotate={5} delay={0.24}>📍 {cities.join(" · ")}</Sticker>
              )}
            </div>
          </div>
          <div className="flex items-end justify-between gap-4 lg:col-span-5 lg:flex-col lg:items-end lg:justify-self-end">
            <p className="max-w-md text-[15px] leading-7 text-white/75 lg:text-right">
              Trip captains, planners and the folks who pick up your call at midnight before a trek.
            </p>
            <SpinSticker
              href={whatsappUrl("Hi Spirit Adventures, I'd like to talk to your team about a trip.")}
              label="Talk to our team"
              className="shrink-0"
            />
          </div>
        </div>

        {leads.length > 0 && (
          <div className="mb-14 grid gap-5 sm:mb-20 lg:grid-cols-2">
            {leads.map((m) => (
              <LeadCard key={m.id} m={m} />
            ))}
          </div>
        )}

        <div className="space-y-12 sm:space-y-16">
          <CrewGroup label="Sales desk" people={sales} />
          <CrewGroup label="Trip organisers" people={organisers} />
        </div>
      </div>
    </section>
  );
}
