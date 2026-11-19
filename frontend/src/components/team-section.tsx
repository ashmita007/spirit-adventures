"use client";

/**
 * "Meet the crew" on the About page. Members come from Owner HQ → Team.
 *
 * Motion (GSAP, skipped for reduced-motion visitors):
 *  - heading words rise in once
 *  - lead and crew cards rise as they enter, their photo develops from grey to colour,
 *    names and roles follow; nothing moves with the scroll position
 *  - hover: card lifts 2px, photo zooms 1.03 inside its frame
 * Content is never hidden by CSS, so the section stays readable if JS fails.
 */
import React, { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Instagram, Linkedin, MapPin, Mountain } from "lucide-react";
import type { TeamMember } from "@/lib/types";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function Socials({ m, dark = false }: { m: TeamMember; dark?: boolean }) {
  if (!m.instagram_url && !m.linkedin_url) return null;
  const cls = cn(
    "inline-flex h-8 w-8 items-center justify-center rounded-full border transition active:scale-95",
    dark ? "border-white/25 text-white hover:bg-white hover:text-brand-navy" : "border-slate-200 text-slate-600 hover:bg-brand-navy hover:text-white"
  );
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

export default function TeamSection({ members }: { members: TeamMember[] }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // No members -> the section isn't rendered, so there is nothing to animate
      const node = root.current;
      if (!node || members.length === 0) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const el = node;
        const develop = { scale: 1.12, filter: "saturate(0) brightness(0.85)", duration: 1.4, ease: "expo.out", clearProps: "filter" };

        // Heading words rise once
        gsap.from(el.querySelectorAll("[data-team-word]"), {
          yPercent: 110,
          opacity: 0,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.06,
          scrollTrigger: { trigger: el.querySelector("[data-team-head]"), start: "top 85%", once: true },
        });

        // Lead cards: card rises, photo develops from grey to colour, text lines follow
        el.querySelectorAll<HTMLElement>("[data-team-lead]").forEach((card) => {
          gsap
            .timeline({ scrollTrigger: { trigger: card, start: "top 85%", once: true } })
            .from(card, { y: 40, opacity: 0, duration: 0.9, ease: "expo.out", clearProps: "transform,opacity" })
            .from(card.querySelector("[data-team-photo]"), develop, "<0.1")
            .from(card.querySelectorAll("[data-team-line]"), { y: 24, opacity: 0, duration: 0.7, ease: "expo.out", stagger: 0.07 }, "<0.25");
        });

        // Crew cards: each row plays as it enters. Card rises, photo develops,
        // name letters rise, role and city follow.
        ScrollTrigger.batch(el.querySelectorAll<HTMLElement>("[data-team-card]"), {
          start: "top 90%",
          once: true,
          onEnter: (cards) => {
            cards.forEach((card, i) => {
              gsap
                .timeline({ delay: i * 0.1 })
                .from(card, { y: 40, opacity: 0, duration: 0.9, ease: "expo.out", clearProps: "transform,opacity" })
                .from(card.querySelector("[data-team-cardphoto]"), develop, "<0.1")
                .from(card.querySelectorAll("[data-team-char]"), { yPercent: 120, opacity: 0, duration: 0.7, ease: "expo.out", stagger: 0.02 }, "<0.35")
                .from(card.querySelectorAll("[data-team-meta]"), { y: 10, opacity: 0, duration: 0.6, ease: "expo.out", stagger: 0.06 }, "<0.2");
            });
          },
        });
      });
    },
    { scope: root, dependencies: [members.length] }
  );

  if (members.length === 0) return null;

  const leads = members.filter((m) => m.is_lead);
  const crew = members.filter((m) => !m.is_lead);
  const heading = "The people behind every trip".split(" ");

  return (
    <section ref={root} aria-labelledby="team-heading" className="relative overflow-hidden bg-brand-light py-24">
      {/* Outline word */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-10 select-none whitespace-nowrap">
        <span
          className="block font-display text-[22vw] font-black uppercase leading-none text-transparent"
          style={{ WebkitTextStroke: "1.5px rgba(14,116,144,0.14)" }}
        >
          Our Crew · Our Crew
        </span>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div data-team-head className="mx-auto mb-14 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-sky/30 bg-white px-3 py-1 text-xs font-bold text-brand-ocean shadow-xs">
            <Mountain className="h-3.5 w-3.5" /> Meet the team
          </span>
          <h2 id="team-heading" className="mt-4 font-display text-3xl font-black uppercase tracking-tight text-brand-navy sm:text-5xl">
            {heading.map((w, i) => (
              <span key={i} className="inline-block overflow-hidden pb-1 align-bottom">
                <span data-team-word className="inline-block will-change-transform">
                  {w}
                  {i < heading.length - 1 ? " " : ""}
                </span>
              </span>
            ))}
          </h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            Trip captains, planners and the folks who pick up your call at midnight before a trek.
          </p>
        </div>

        {/* Leadership */}
        {leads.length > 0 && (
          <div className="mb-16 grid gap-6 lg:grid-cols-2">
            {leads.map((m) => (
              <article
                key={m.id}
                data-team-lead
                className="relative grid min-h-[420px] overflow-hidden rounded-[28px] bg-brand-navy text-white shadow-2xl sm:grid-cols-[1fr_1.1fr]"
                style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 30px 60px -20px rgba(2,32,71,0.45)" }}
              >
                <div className="relative min-h-[280px] overflow-hidden">
                  <div data-team-photo className="absolute inset-0">
                    <Photo m={m} sizes="(min-width:1024px) 25vw, 100vw" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-brand-navy/90" />
                </div>
                <div className="relative flex flex-col justify-end gap-3 p-7">
                  <span data-team-line className="text-xs font-bold uppercase tracking-[0.2em] text-brand-sky">
                    {m.role}
                  </span>
                  <h3 data-team-line className="font-display text-3xl font-black uppercase leading-none">
                    {m.name}
                  </h3>
                  {m.bio && (
                    <p data-team-line className="text-sm leading-relaxed text-slate-300">
                      {m.bio}
                    </p>
                  )}
                  <div data-team-line className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300">
                    {m.city && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-brand-sky" /> {m.city}
                      </span>
                    )}
                    {m.experience && <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 font-semibold">{m.experience}</span>}
                  </div>
                  <div data-team-line>
                    <Socials m={m} dark />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Crew */}
        {crew.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {crew.map((m) => (
              <div key={m.id} data-team-card>
                  <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-xl">
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <div data-team-cardphoto className="absolute inset-0">
                        <Photo m={m} sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw" className="transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/10 to-transparent" />
                      {m.city && (
                        <span data-team-meta className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                          <MapPin className="h-3 w-3" /> {m.city}
                        </span>
                      )}
                      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                        <h3 className="font-display text-xl font-black uppercase leading-tight" aria-label={m.name}>
                          {m.name.split(" ").map((word, wi, arr) => (
                            <span key={wi} aria-hidden="true" className="inline-block overflow-hidden whitespace-nowrap align-bottom">
                              {Array.from(word).map((ch, ci) => (
                                <span key={ci} data-team-char className="inline-block will-change-transform">
                                  {ch}
                                </span>
                              ))}
                              {wi < arr.length - 1 ? "\u00A0" : ""}
                            </span>
                          ))}
                        </h3>
                        <p data-team-meta className="text-xs font-bold uppercase tracking-wider text-brand-sky">{m.role}</p>
                        {/* Bio slides up on hover (always shown on touch screens) */}
                        {(m.bio || m.experience || m.instagram_url || m.linkedin_url) && (
                          <div className="grid grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out [@media(hover:hover)]:grid-rows-[0fr] [@media(hover:hover)]:group-hover:grid-rows-[1fr] [@media(hover:hover)]:group-focus-within:grid-rows-[1fr]">
                            <div className="overflow-hidden">
                              {m.experience && <p className="mt-2 text-[11px] font-semibold text-white/80">{m.experience}</p>}
                              {m.bio && <p className="mt-1.5 line-clamp-4 text-xs leading-relaxed text-slate-200">{m.bio}</p>}
                              <div className="mt-3">
                                <Socials m={m} dark />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
