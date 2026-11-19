"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown, ArrowUp, Check, ExternalLink, Eye, EyeOff, Film, Image as ImageIcon, Instagram, Loader2, Plus, Trash2,
  Youtube,
} from "lucide-react";
import { ownerFetch } from "@/lib/owner-fetch";
import { cn } from "@/lib/utils";
import MediaUploadButton from "@/components/owner/media-upload-button";
import { HOME_SECTIONS, type HeroVideo, type HomeSectionKey, type SiteContent } from "@/lib/types";

interface TripLite {
  id: number;
  title: string;
  slug: string;
  cover_image?: string;
  destination_name?: string;
}

const EMPTY: SiteContent = {
  instagram_url: "", youtube_url: "", hero_words: [], hero_subtitle: "", hero_videos: [],
  home_trip_ids: [], quote_image_url: "", cta_image_url: "", hidden_sections: [],
};
const MAX_VIDEOS = 6;
const MAX_TRIPS = 12;

const field =
  "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-brand-ocean";
const card = "rounded-2xl border border-slate-200 bg-white p-4 sm:p-6";

function Section({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className={card}>
      <h2 className="text-base font-bold text-brand-navy">{title}</h2>
      <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** One photo slot: preview, upload, paste a link, or clear back to the default. */
function PhotoField({ label, value, onChange, onError }: {
  label: string; value: string; onChange: (url: string) => void; onError: (m: string) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold text-slate-600">{label}</p>
      <div className="flex items-start gap-3">
        <div className="relative grid h-20 w-32 flex-shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-100 text-slate-400">
          {value ? <Image src={value} alt="" fill sizes="128px" className="object-cover" /> : <ImageIcon className="h-5 w-5" aria-hidden="true" />}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input className={field} value={value} placeholder="Default photo" onChange={(e) => onChange(e.target.value)} aria-label={`${label} link`} />
          <div className="flex flex-wrap gap-2">
            <MediaUploadButton folder="home" label="Upload photo" onUploaded={(r) => onChange(r.url)} onError={onError} />
            {value && (
              <button type="button" onClick={() => onChange("")} className="min-h-9 rounded-lg px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100">
                Use default
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Owner HQ → Landing page: social links, hero words and films, which trips lead the
 * home page, section photos and which sections show. Saved to the backend in one go.
 */
export default function HomepageManager() {
  const [content, setContent] = useState<SiteContent>(EMPTY);
  const [saved, setSaved] = useState<SiteContent>(EMPTY);
  const [trips, setTrips] = useState<TripLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [wordsText, setWordsText] = useState("");
  const [toast, setToast] = useState<{ msg: string; bad?: boolean } | null>(null);

  const say = useCallback((msg: string, bad = false) => {
    setToast({ msg, bad });
    window.setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    Promise.all([
      ownerFetch("/api/v1/owner/site-content/").then((r) => r.json()).catch(() => null),
      fetch("/api/v1/trips/").then((r) => r.json()).catch(() => null),
    ]).then(([c, t]) => {
      if (c?.success) {
        const data = { ...EMPTY, ...c.data } as SiteContent;
        setContent(data);
        setSaved(data);
        setWordsText(data.hero_words.join(", "));
      } else {
        say("Couldn't load the landing page settings. Refresh to try again.", true);
      }
      const list = Array.isArray(t?.data) ? t.data : Array.isArray(t?.data?.items) ? t.data.items : [];
      setTrips(list);
      setLoading(false);
    });
  }, [say]);

  const set = <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => setContent((c) => ({ ...c, [key]: value }));
  const dirty = useMemo(
    () => JSON.stringify(saved) !== JSON.stringify({ ...content, hero_words: splitWords(wordsText) }),
    [saved, content, wordsText]
  );

  const save = async () => {
    setSaving(true);
    const body = { ...content, hero_words: splitWords(wordsText) };
    const res = await ownerFetch("/api/v1/owner/site-content/", { method: "POST", body: JSON.stringify(body) });
    const json = await res.json().catch(() => null);
    setSaving(false);
    if (!res.ok || !json?.success) {
      say(json?.message || "Couldn't save. Try again.", true);
      return;
    }
    const data = { ...EMPTY, ...json.data } as SiteContent;
    setContent(data);
    setSaved(data);
    setWordsText(data.hero_words.join(", "));
    say("Saved. The live site updates within a minute.");
  };

  // Hero films
  const setVideo = (i: number, patch: Partial<HeroVideo>) =>
    set("hero_videos", content.hero_videos.map((v, j) => (j === i ? { ...v, ...patch } : v)));
  const moveIn = <T,>(list: T[], i: number, d: -1 | 1) => {
    const next = [...list];
    const j = i + d;
    if (j < 0 || j >= next.length) return list;
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  };

  // Trips leading the home page
  const tripById = useMemo(() => new Map(trips.map((t) => [t.id, t])), [trips]);
  const picked = content.home_trip_ids.filter((id) => tripById.has(id) || trips.length === 0);
  const toggleTrip = (id: number) =>
    set(
      "home_trip_ids",
      content.home_trip_ids.includes(id)
        ? content.home_trip_ids.filter((x) => x !== id)
        : content.home_trip_ids.length >= MAX_TRIPS
          ? content.home_trip_ids
          : [...content.home_trip_ids, id]
    );

  const toggleSection = (key: HomeSectionKey) =>
    set("hidden_sections", content.hidden_sections.includes(key) ? content.hidden_sections.filter((k) => k !== key) : [...content.hidden_sections, key]);

  if (loading) {
    return (
      <div className="grid min-h-[40vh] place-items-center text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5 pb-28">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">Landing page</h1>
          <p className="mt-1 text-sm text-slate-500">
            Change what visitors see on the home page. Photos for the gallery live in{" "}
            <Link href="/owner/gallery" className="font-semibold text-brand-ocean hover:underline">Gallery</Link>, trips in{" "}
            <Link href="/owner/packages" className="font-semibold text-brand-ocean hover:underline">Trips</Link>.
          </p>
        </div>
        <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          View site <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      </header>

      <Section title="Social links" hint="Shown in the footer, the Contact page and the Follow the trail section.">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600"><Instagram className="h-4 w-4" aria-hidden="true" /> Instagram</span>
            <input className={field} type="url" inputMode="url" placeholder="https://www.instagram.com/yourpage" value={content.instagram_url} onChange={(e) => set("instagram_url", e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600"><Youtube className="h-4 w-4" aria-hidden="true" /> YouTube</span>
            <input className={field} type="url" inputMode="url" placeholder="https://www.youtube.com/@yourchannel" value={content.youtube_url} onChange={(e) => set("youtube_url", e.target.value)} />
          </label>
        </div>
      </Section>

      <Section title="Hero" hint="The first screen. Leave a box empty to keep the current text.">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">Rolling words (comma separated, up to 8)</span>
            <input className={field} placeholder="Adventure, Trek, Beach, River, Himalaya" value={wordsText} onChange={(e) => setWordsText(e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">Line under the headline</span>
            <textarea className={cn(field, "min-h-20")} maxLength={240} placeholder="High-altitude Himalayan passes, South Indian river rafting…" value={content.hero_subtitle} onChange={(e) => set("hero_subtitle", e.target.value)} />
          </label>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600"><Film className="h-4 w-4" aria-hidden="true" /> Background films ({content.hero_videos.length}/{MAX_VIDEOS})</span>
              {content.hero_videos.length < MAX_VIDEOS && (
                <MediaUploadButton
                  folder="home"
                  accept="video"
                  label="Upload film"
                  onUploaded={(r) => set("hero_videos", [...content.hero_videos, { video_url: r.url, poster_url: r.posterUrl || "" }].slice(0, MAX_VIDEOS))}
                  onError={(m) => say(m, true)}
                />
              )}
            </div>
            {content.hero_videos.length === 0 ? (
              <p className="rounded-lg bg-slate-50 px-3 py-3 text-xs text-slate-500">Using the built-in films. Upload one to use your own.</p>
            ) : (
              <ul className="space-y-2">
                {content.hero_videos.map((v, i) => (
                  <li key={`${v.video_url}-${i}`} className="flex items-center gap-3 rounded-lg border border-slate-200 p-2">
                    <div className="relative h-12 w-20 flex-shrink-0 overflow-hidden rounded bg-slate-100">
                      {v.poster_url && <Image src={v.poster_url} alt="" fill sizes="80px" className="object-cover" />}
                    </div>
                    <input className={cn(field, "min-w-0 flex-1")} value={v.video_url} onChange={(e) => setVideo(i, { video_url: e.target.value })} aria-label={`Film ${i + 1} link`} />
                    <div className="flex flex-shrink-0">
                      <button type="button" aria-label="Move up" onClick={() => set("hero_videos", moveIn(content.hero_videos, i, -1))} className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><ArrowUp className="h-4 w-4" /></button>
                      <button type="button" aria-label="Move down" onClick={() => set("hero_videos", moveIn(content.hero_videos, i, 1))} className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><ArrowDown className="h-4 w-4" /></button>
                      <button type="button" aria-label="Remove film" onClick={() => set("hero_videos", content.hero_videos.filter((_, j) => j !== i))} className="grid h-9 w-9 place-items-center rounded-lg text-rose-500 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Section>

      <Section title="Trips on the home page" hint={`Pick up to ${MAX_TRIPS}. The first one is the big featured trip; the rest follow in order. None picked: newest and featured trips lead.`}>
        {picked.length > 0 && (
          <ol className="mb-4 space-y-2">
            {picked.map((id, i) => {
              const t = tripById.get(id);
              return (
                <li key={id} className="flex items-center gap-3 rounded-lg border border-brand-ocean/30 bg-sky-50/50 p-2">
                  <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full bg-brand-navy text-xs font-bold text-white">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">{t?.title ?? `Trip #${id}`}</span>
                  <button type="button" aria-label="Move up" onClick={() => set("home_trip_ids", moveIn(picked, i, -1))} className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-white"><ArrowUp className="h-4 w-4" /></button>
                  <button type="button" aria-label="Move down" onClick={() => set("home_trip_ids", moveIn(picked, i, 1))} className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-white"><ArrowDown className="h-4 w-4" /></button>
                  <button type="button" aria-label="Remove trip" onClick={() => toggleTrip(id)} className="grid h-9 w-9 place-items-center rounded-lg text-rose-500 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
                </li>
              );
            })}
          </ol>
        )}
        <ul className="grid max-h-80 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
          {trips.filter((t) => !picked.includes(t.id)).map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => toggleTrip(t.id)}
                disabled={picked.length >= MAX_TRIPS}
                className="flex w-full items-center gap-2 rounded-lg border border-slate-200 p-2 text-left hover:border-brand-ocean disabled:opacity-50"
              >
                <Plus className="h-4 w-4 flex-shrink-0 text-brand-ocean" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-800">{t.title}</span>
                  {t.destination_name && <span className="block text-xs text-slate-500">{t.destination_name}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Section photos" hint="Replace the background photos. Empty keeps the current look.">
        <div className="grid gap-5 sm:grid-cols-2">
          <PhotoField label="Mountain quote background (replaces the film)" value={content.quote_image_url} onChange={(u) => set("quote_image_url", u)} onError={(m) => say(m, true)} />
          <PhotoField label="Closing section background" value={content.cta_image_url} onChange={(u) => set("cta_image_url", u)} onError={(m) => say(m, true)} />
        </div>
      </Section>

      <Section title="Sections" hint="Hide a section to take it off the home page. Nothing is deleted.">
        <ul className="grid gap-2 sm:grid-cols-2">
          {HOME_SECTIONS.map((s) => {
            const hidden = content.hidden_sections.includes(s.key);
            return (
              <li key={s.key}>
                <button
                  type="button"
                  role="switch"
                  aria-checked={!hidden}
                  onClick={() => toggleSection(s.key)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left text-sm font-semibold transition",
                    hidden ? "border-slate-200 bg-slate-50 text-slate-400" : "border-emerald-200 bg-emerald-50/60 text-slate-800"
                  )}
                >
                  {s.label}
                  {hidden ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4 text-emerald-600" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* Save bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <p className="text-xs text-slate-500" aria-live="polite">{dirty ? "You have unsaved changes." : "All changes saved."}</p>
          <button
            type="button"
            onClick={save}
            disabled={!dirty || saving}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-navy px-5 text-sm font-bold text-white transition hover:bg-brand-ocean disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
            Save landing page
          </button>
        </div>
      </div>

      {toast && (
        <div role="status" className={cn("fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-lg", toast.bad ? "bg-rose-600" : "bg-emerald-600")}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function splitWords(text: string): string[] {
  return text.split(",").map((w) => w.trim()).filter(Boolean).slice(0, 8);
}
