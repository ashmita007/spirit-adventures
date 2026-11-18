"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown, ArrowUp, CalendarDays, Check, ExternalLink, Eye, EyeOff, Gift, Loader2, Pencil, Plus,
  Snowflake, Sparkles, Trash2, X,
} from "lucide-react";
import { ownerFetch } from "@/lib/owner-fetch";
import { cn } from "@/lib/utils";
import MediaUploadButton from "@/components/owner/media-upload-button";

type Festival = "NONE" | "CHRISTMAS" | "NEWYEAR";

interface Promo {
  id: number;
  kind: "OFFER" | "EVENT";
  festival: Festival;
  title: string;
  description: string;
  image_url: string;
  badge: string;
  trip_id: number | null;
  trip_slug: string;
  trip_title: string;
  price: number | null;
  original_price: number | null;
  location: string;
  event_date: string | null;
  starts_on: string | null;
  ends_on: string | null;
  cta_label: string;
  is_published: boolean;
  ordering: number;
}

interface Theme {
  theme: "AUTO" | "CHRISTMAS" | "NEWYEAR" | "NONE";
  active: "CHRISTMAS" | "NEWYEAR" | "NONE";
  custom_banner_text: string;
  banner_text: string;
  banner_link: string;
  snow: boolean;
}

interface TripOption { id: number; title: string; slug: string }

interface Draft {
  id?: number;
  kind: "OFFER" | "EVENT";
  festival: Festival;
  title: string;
  description: string;
  image_url: string;
  badge: string;
  trip_id: number | null;
  price: string;
  original_price: string;
  location: string;
  event_date: string;
  starts_on: string;
  ends_on: string;
  cta_label: string;
  is_published: boolean;
}

const EMPTY: Draft = {
  kind: "OFFER", festival: "NONE", title: "", description: "", image_url: "", badge: "", trip_id: null, price: "",
  original_price: "", location: "", event_date: "", starts_on: "", ends_on: "", cta_label: "Book now",
  is_published: true,
};

const THEMES: { value: Theme["theme"]; label: string; hint: string }[] = [
  { value: "AUTO", label: "Automatic", hint: "Festive look only while an offer/event tagged Christmas or New Year is live (recommended)" },
  { value: "CHRISTMAS", label: "Christmas", hint: "Always on, even without an offer" },
  { value: "NEWYEAR", label: "New Year", hint: "Always on, even without an offer" },
  { value: "NONE", label: "Off", hint: "Never show the festive look" },
];

const field =
  "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-brand-ocean";

const toDraft = (p: Promo): Draft => ({
  id: p.id, kind: p.kind, festival: p.festival, title: p.title, description: p.description, image_url: p.image_url,
  badge: p.badge, trip_id: p.trip_id, price: p.price?.toString() ?? "",
  original_price: p.original_price?.toString() ?? "", location: p.location, event_date: p.event_date ?? "",
  starts_on: p.starts_on ?? "", ends_on: p.ends_on ?? "", cta_label: p.cta_label, is_published: p.is_published,
});

function status(p: Promo): { label: string; tone: string } {
  const today = new Date().toISOString().slice(0, 10);
  if (!p.is_published) return { label: "Hidden", tone: "bg-slate-100 text-slate-500" };
  if (p.ends_on && p.ends_on < today) return { label: "Ended", tone: "bg-slate-100 text-slate-500" };
  if (p.event_date && p.event_date < today) return { label: "Past event", tone: "bg-slate-100 text-slate-500" };
  if (p.starts_on && p.starts_on > today) return { label: `Starts ${p.starts_on}`, tone: "bg-amber-50 text-amber-700" };
  return { label: "Live", tone: "bg-emerald-50 text-emerald-700" };
}

export default function OffersManager() {
  const [items, setItems] = useState<Promo[]>([]);
  const [trips, setTrips] = useState<TripOption[]>([]);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [themeSaving, setThemeSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; bad?: boolean } | null>(null);

  const say = (msg: string, bad = false) => {
    setToast({ msg, bad });
    window.setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    const j = await ownerFetch("/api/v1/owner/promotions/").then((r) => r.json()).catch(() => null);
    if (j?.success) {
      setItems(j.data.items);
      setTrips(j.data.trips);
      setTheme(j.data.theme);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const call = async (url: string, method: string, body?: unknown) => {
    const res = await ownerFetch(url, { method, body: body ? JSON.stringify(body) : undefined });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      say(json?.message || "Something went wrong. Try again.", true);
      return null;
    }
    return json;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    const { id, trip_id, ...rest } = editing;
    const body = {
      ...rest,
      price: rest.price || null,
      original_price: rest.original_price || null,
      event_date: rest.event_date || null,
      starts_on: rest.starts_on || null,
      ends_on: rest.ends_on || null,
      ...(trip_id ? { trip_id } : id ? { clear_trip: true } : {}),
    };
    const json = await call(id ? `/api/v1/owner/promotions/${id}/` : "/api/v1/owner/promotions/", "POST", body);
    setSaving(false);
    if (!json) return;
    setItems((prev) => (id ? prev.map((p) => (p.id === id ? json.data : p)) : [...prev, json.data]));
    setEditing(null);
    say(json.message);
  };

  const patch = async (p: Promo, body: Record<string, unknown>) => {
    const json = await call(`/api/v1/owner/promotions/${p.id}/`, "POST", body);
    if (json) setItems((prev) => prev.map((x) => (x.id === p.id ? json.data : x)));
  };

  const remove = async (p: Promo) => {
    if (!window.confirm(`Delete "${p.title}"? This can't be undone.`)) return;
    if (await call(`/api/v1/owner/promotions/${p.id}/`, "DELETE")) {
      setItems((prev) => prev.filter((x) => x.id !== p.id));
      say("Deleted");
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...items];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    setItems(next);
    await call("/api/v1/owner/promotions/reorder/", "POST", { ids: next.map((p) => p.id) });
  };

  const saveTheme = async (change: Partial<{ theme: string; banner_text: string; banner_link: string; snow: boolean }>) => {
    if (!theme) return;
    setThemeSaving(true);
    const json = await call("/api/v1/owner/promotions/theme/", "POST", change);
    setThemeSaving(false);
    if (json) {
      setTheme((t) => (t ? { ...t, ...json.data, custom_banner_text: change.banner_text ?? t.custom_banner_text } : t));
      say("Site theme saved. The website updates within 5 minutes.");
    }
  };

  const live = items.filter((p) => status(p).label === "Live").length;
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setEditing((d) => (d ? { ...d, [k]: v } : d));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-brand-navy">Events & Offers</h1>
          <p className="mt-1 text-sm text-slate-500">
            {items.length} created · {live} live on the{" "}
            <Link href="/" target="_blank" className="font-semibold text-brand-ocean hover:underline">
              home page <ExternalLink className="inline h-3 w-3" />
            </Link>{" "}
            and{" "}
            <Link href="/offers" target="_blank" className="font-semibold text-brand-ocean hover:underline">
              /offers <ExternalLink className="inline h-3 w-3" />
            </Link>
            .
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditing({ ...EMPTY, kind: "EVENT", cta_label: "Reserve my spot" })}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-brand-navy shadow-sm transition hover:border-brand-ocean active:scale-[0.97]"
          >
            <CalendarDays className="h-4 w-4" /> New event
          </button>
          <button
            onClick={() => setEditing({ ...EMPTY })}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-ocean px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-navy active:scale-[0.97]"
          >
            <Plus className="h-4 w-4" /> New offer
          </button>
        </div>
      </div>

      {/* Festive theme */}
      {theme && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 font-bold text-brand-navy">
                <Sparkles className="h-4 w-4 text-amber-500" /> Website theme
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Showing now:{" "}
                <span className="font-semibold text-brand-navy">
                  {theme.active === "CHRISTMAS" ? "Christmas" : theme.active === "NEWYEAR" ? "New Year" : "Normal look"}
                </span>
              </p>
            </div>
            {themeSaving && <Loader2 className="h-4 w-4 animate-spin text-brand-ocean" />}
          </div>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4" role="radiogroup" aria-label="Website theme">
            {THEMES.map((t) => (
              <button
                key={t.value}
                role="radio"
                aria-checked={theme.theme === t.value}
                onClick={() => saveTheme({ theme: t.value })}
                className={cn(
                  "rounded-xl border p-3 text-left transition",
                  theme.theme === t.value
                    ? "border-brand-ocean bg-sky-50 ring-1 ring-brand-ocean"
                    : "border-slate-200 hover:border-slate-300"
                )}
              >
                <span className="block text-sm font-bold text-brand-navy">{t.label}</span>
                <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">{t.hint}</span>
              </button>
            ))}
          </div>
          <form
            className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_200px_auto]"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              saveTheme({ banner_text: String(f.get("banner_text") || ""), banner_link: String(f.get("banner_link") || "") });
            }}
          >
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold text-slate-500">Top banner text (empty = festive greeting)</span>
              <input name="banner_text" maxLength={160} defaultValue={theme.custom_banner_text} placeholder="New Year sale: up to 20% off on Gokarna & Dandeli" className={field} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold text-slate-500">Banner opens</span>
              <input name="banner_link" maxLength={300} defaultValue={theme.banner_link} placeholder="/offers" className={field} />
            </label>
            <div className="flex items-end gap-3">
              <label className="flex h-10 items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={theme.snow} onChange={(e) => saveTheme({ snow: e.target.checked })} />
                <Snowflake className="h-4 w-4 text-sky-500" /> Effects
              </label>
              <button className="h-10 rounded-xl bg-brand-navy px-4 text-sm font-bold text-white hover:bg-brand-ocean">Save</button>
            </div>
          </form>
        </section>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-brand-ocean" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">
          <Gift className="mx-auto mb-3 h-8 w-8 text-slate-300" />
          No events or offers yet. Create a Christmas or New Year offer and it appears on the home page right away.
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((p, i) => {
            const st = status(p);
            return (
              <li
                key={p.id}
                className={cn(
                  "flex items-center gap-4 rounded-2xl border bg-white p-3 shadow-sm",
                  p.is_published ? "border-slate-200" : "border-dashed border-slate-300 opacity-70"
                )}
              >
                <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  {p.image_url ? (
                    <Image src={p.image_url} alt="" fill sizes="96px" className="object-cover" />
                  ) : (
                    <Gift className="absolute inset-0 m-auto h-6 w-6 text-slate-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", p.kind === "EVENT" ? "bg-violet-50 text-violet-700" : "bg-rose-50 text-rose-700")}>
                      {p.kind === "EVENT" ? "Event" : "Offer"}
                    </span>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", st.tone)}>{st.label}</span>
                    {p.festival !== "NONE" && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                        {p.festival === "CHRISTMAS" ? "🎄 Christmas" : "🎉 New Year"}
                      </span>
                    )}
                    {p.badge && <span className="text-[11px] font-bold text-amber-600">{p.badge}</span>}
                  </div>
                  <p className="mt-1 truncate font-bold text-brand-navy">{p.title}</p>
                  <p className="truncate text-xs text-slate-500">
                    {p.trip_title || "No trip linked (enquiry button)"}
                    {p.event_date ? ` · ${p.event_date}` : ""}
                    {p.ends_on ? ` · until ${p.ends_on}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center">
                  <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30">
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30">
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => patch(p, { is_published: !p.is_published })}
                    aria-label={p.is_published ? "Hide from site" : "Show on site"}
                    title={p.is_published ? "Hide from site" : "Show on site"}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-navy"
                  >
                    {p.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button onClick={() => setEditing(toDraft(p))} aria-label="Edit" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-navy">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => remove(p)} aria-label="Delete" className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={editing.id ? "Edit" : "Create"}>
          <form onSubmit={submit} className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-brand-navy">
                {editing.id ? "Edit" : "New"} {editing.kind === "EVENT" ? "event" : "offer"}
              </h3>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close" className="rounded-lg p-1.5 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Type">
              {(["OFFER", "EVENT"] as const).map((k) => (
                <button
                  type="button"
                  key={k}
                  role="radio"
                  aria-checked={editing.kind === k}
                  onClick={() => set("kind", k)}
                  className={cn(
                    "rounded-xl border py-2 text-sm font-bold transition",
                    editing.kind === k ? "border-brand-ocean bg-sky-50 text-brand-navy" : "border-slate-200 text-slate-500"
                  )}
                >
                  {k === "OFFER" ? "Offer / discount" : "Event / group trip"}
                </button>
              ))}
            </div>

            <div className="mb-4">
              <span className="mb-1 block text-[11px] font-bold text-slate-500">Festival theme</span>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Festival">
                {([["NONE", "None"], ["CHRISTMAS", "🎄 Christmas"], ["NEWYEAR", "🎉 New Year"]] as const).map(([v, l]) => (
                  <button
                    type="button"
                    key={v}
                    role="radio"
                    aria-checked={editing.festival === v}
                    onClick={() => set("festival", v)}
                    className={cn(
                      "rounded-xl border py-2 text-xs font-bold transition active:scale-[0.97]",
                      editing.festival === v ? "border-amber-400 bg-amber-50 text-brand-navy" : "border-slate-200 text-slate-500"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-[11px] text-slate-400">While this is live, the whole website switches to this festival&apos;s look. It goes back to normal when it ends.</p>
            </div>

            <div className="mb-4 flex items-center gap-4">
              <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                {editing.image_url ? (
                  <Image src={editing.image_url} alt="" fill sizes="128px" className="object-cover" />
                ) : (
                  <Gift className="absolute inset-0 m-auto h-8 w-8 text-slate-300" />
                )}
              </div>
              <div className="space-y-2">
                <MediaUploadButton
                  folder="offers"
                  label={editing.image_url ? "Change image" : "Upload image"}
                  onUploaded={(r) => set("image_url", r.url)}
                  onError={(msg) => say(msg, true)}
                />
                <p className="text-[11px] text-slate-400">Landscape photo. Without one, the linked trip&apos;s cover photo is used.</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold text-slate-500">Title *</span>
                <input required maxLength={150} value={editing.title} onChange={(e) => set("title", e.target.value)} placeholder={editing.kind === "EVENT" ? "New Year Eve camp at Dandeli" : "Christmas special: Gokarna & Dandeli"} className={field} />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold text-slate-500">Details ({editing.description.length}/1000)</span>
                <textarea rows={3} maxLength={1000} value={editing.description} onChange={(e) => set("description", e.target.value)} placeholder="What's included, who it's for, how to book…" className={field} />
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold text-slate-500">Badge</span>
                  <input maxLength={40} value={editing.badge} onChange={(e) => set("badge", e.target.value)} placeholder="20% OFF · Early bird" className={field} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold text-slate-500">Linked trip</span>
                  <select value={editing.trip_id ?? ""} onChange={(e) => set("trip_id", e.target.value ? Number(e.target.value) : null)} className={field}>
                    <option value="">None (button opens enquiry)</option>
                    {trips.map((t) => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold text-slate-500">Offer price (₹)</span>
                  <input inputMode="decimal" value={editing.price} onChange={(e) => set("price", e.target.value.replace(/[^\d.]/g, ""))} placeholder="3999" className={field} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold text-slate-500">Old price (₹, crossed out)</span>
                  <input inputMode="decimal" value={editing.original_price} onChange={(e) => set("original_price", e.target.value.replace(/[^\d.]/g, ""))} placeholder="4999" className={field} />
                </label>
                {editing.kind === "EVENT" && (
                  <>
                    <label className="block">
                      <span className="mb-1 block text-[11px] font-bold text-slate-500">Event date</span>
                      <input type="date" value={editing.event_date} onChange={(e) => set("event_date", e.target.value)} className={field} />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[11px] font-bold text-slate-500">Location</span>
                      <input maxLength={120} value={editing.location} onChange={(e) => set("location", e.target.value)} placeholder="Dandeli, Karnataka" className={field} />
                    </label>
                  </>
                )}
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold text-slate-500">Show from</span>
                  <input type="date" value={editing.starts_on} onChange={(e) => set("starts_on", e.target.value)} className={field} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold text-slate-500">Hide after</span>
                  <input type="date" value={editing.ends_on} onChange={(e) => set("ends_on", e.target.value)} className={field} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold text-slate-500">Button text</span>
                  <input maxLength={40} value={editing.cta_label} onChange={(e) => set("cta_label", e.target.value)} placeholder="Book now" className={field} />
                </label>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={editing.is_published} onChange={(e) => set("is_published", e.target.checked)} />
                Show on the website
              </label>
            </div>

            <button
              disabled={saving}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-ocean py-3 text-sm font-bold text-white hover:bg-brand-navy disabled:opacity-70"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {editing.id ? "Save changes" : `Create ${editing.kind === "EVENT" ? "event" : "offer"}`}
            </button>
          </form>
        </div>
      )}

      {toast && (
        <div
          role="status"
          className={cn(
            "fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-xl",
            toast.bad ? "bg-rose-600" : "bg-brand-navy"
          )}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
