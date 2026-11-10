"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle, Check, Eye, EyeOff, ExternalLink, ImagePlus, Link2, Loader2, Star, Trash2, X,
} from "lucide-react";
import { ownerFetch } from "@/lib/owner-fetch";
import { cn } from "@/lib/utils";
import MediaUploadButton from "@/components/owner/media-upload-button";

interface GalleryItem {
  id: number;
  title: string;
  category: string;
  image_url: string;
  caption: string;
  location: string;
  ordering: number;
  is_featured: boolean;
  is_published: boolean;
}

const field =
  "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-brand-ocean";

export default function GalleryManager() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [toast, setToast] = useState<{ msg: string; bad?: boolean } | null>(null);
  const [filter, setFilter] = useState("All");
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [newCategory, setNewCategory] = useState("Mountains");
  const [newLocation, setNewLocation] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [showLink, setShowLink] = useState(false);

  const say = (msg: string, bad = false) => {
    setToast({ msg, bad });
    window.setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    const [g, s] = await Promise.all([
      ownerFetch("/api/v1/owner/gallery/").then((r) => r.json()).catch(() => null),
      ownerFetch("/api/v1/owner/media/status/").then((r) => r.json()).catch(() => null),
    ]);
    if (g?.success) {
      setItems(g.data.items);
      setCategories(g.data.categories);
    }
    setConfigured(Boolean(s?.data?.configured));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addItems = async (urls: string[], titleFrom: string[] = []) => {
    if (urls.length === 0) return;
    const res = await ownerFetch("/api/v1/owner/gallery/", {
      method: "POST",
      body: JSON.stringify({
        items: urls.map((u, i) => ({
          image_url: u,
          title: titleFrom[i] || "",
          category: newCategory,
          location: newLocation,
        })),
      }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      say(json?.message || "Could not add the photo.", true);
      return;
    }
    setItems((prev) => [...json.data, ...prev]);
    if (!categories.includes(newCategory)) setCategories((c) => [...c, newCategory].sort());
    say(json.message);
  };

  const save = async (id: number, patch: Partial<GalleryItem>) => {
    const res = await ownerFetch(`/api/v1/owner/gallery/${id}/`, { method: "POST", body: JSON.stringify(patch) });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      say(json?.message || "Could not save.", true);
      return false;
    }
    setItems((prev) => prev.map((g) => (g.id === id ? json.data : g)));
    return true;
  };

  const remove = async (g: GalleryItem) => {
    if (!window.confirm(`Remove "${g.title}" from the gallery?`)) return;
    const res = await ownerFetch(`/api/v1/owner/gallery/${g.id}/`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((x) => x.id !== g.id));
      say("Photo removed");
    } else say("Could not remove the photo.", true);
  };

  // Uploaded files are collected and added to the gallery in one go
  const pending = useRef<{ url: string; title: string }[]>([]);

  const shown = filter === "All" ? items : items.filter((g) => g.category === filter);
  const live = items.filter((g) => g.is_published).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-brand-navy">Gallery</h1>
          <p className="mt-1 text-sm text-slate-500">
            {items.length} photos · {live} live on{" "}
            <Link href="/gallery" target="_blank" className="font-semibold text-brand-ocean hover:underline">
              /gallery <ExternalLink className="inline h-3 w-3" />
            </Link>
            . New photos show on the site within a minute.
          </p>
        </div>
      </div>

      {configured === false && (
        <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold">Cloudinary is not connected yet, so uploads are off.</p>
            <p className="mt-1 text-amber-800">
              Add <code className="rounded bg-white/70 px-1">CLOUDINARY_URL</code> (from Cloudinary → Settings → API Keys) to the backend
              environment and restart it. Until then you can still add photos by pasting a link.
            </p>
          </div>
        </div>
      )}

      {/* Add photos */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <ImagePlus className="h-5 w-5 text-brand-ocean" />
          <h2 className="font-bold text-brand-navy">Add gallery photos</h2>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="block">
            <span className="mb-1 block text-[11px] font-bold text-slate-500">Category</span>
            <input list="gallery-cats" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className={field} />
            <datalist id="gallery-cats">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-bold text-slate-500">Location (optional)</span>
            <input value={newLocation} onChange={(e) => setNewLocation(e.target.value)} placeholder="e.g. Coorg, Karnataka" className={field} />
          </label>
          <div className="flex flex-wrap gap-2">
            {configured !== false && (
              <MediaUploadButton
                folder="gallery"
                multiple
                label="Add photos"
                onUploaded={(r, f) => pending.current.push({ url: r.url, title: f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ") })}
                onError={(m) => say(m, true)}
                onDone={async () => {
                  const batch = pending.current.splice(0);
                  await addItems(batch.map((p) => p.url), batch.map((p) => p.title));
                }}
              />
            )}
            <button
              type="button"
              onClick={() => setShowLink((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <Link2 className="h-4 w-4" /> Paste link
            </button>
          </div>
        </div>
        {showLink && (
          <form
            className="mt-3 flex flex-col gap-2 sm:flex-row"
            onSubmit={async (e) => {
              e.preventDefault();
              await addItems([linkUrl.trim()]);
              setLinkUrl("");
            }}
          >
            <input
              type="url"
              required
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://res.cloudinary.com/.../photo.jpg"
              className={field}
            />
            <button className="rounded-xl bg-brand-navy px-4 py-2 text-xs font-bold text-white">Add</button>
          </form>
        )}
        <p className="mt-3 text-[11px] text-slate-400">
          Pick several photos at once. Landscape photos at least 1600px wide look best. Max 10 MB each.
        </p>
      </section>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["All", ...categories.filter((c) => items.some((g) => g.category === c))].map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={cn(
              "whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition",
              filter === c ? "bg-brand-navy text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-brand-ocean" />
        </div>
      ) : shown.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">
          No photos yet. Use <b>Add photos</b> above.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((g) => (
            <figure
              key={g.id}
              className={cn(
                "group overflow-hidden rounded-2xl border bg-white shadow-sm",
                g.is_published ? "border-slate-200" : "border-dashed border-slate-300 opacity-70"
              )}
            >
              <button type="button" onClick={() => setEditing(g)} className="relative block aspect-[4/3] w-full bg-slate-100">
                <Image src={g.image_url} alt={g.title} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover" />
                <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold text-white">{g.category}</span>
                {g.is_featured && (
                  <span className="absolute right-2 top-2 rounded-full bg-amber-400 p-1 text-white" title="Featured on home page">
                    <Star className="h-3 w-3 fill-white" />
                  </span>
                )}
                {!g.is_published && (
                  <span className="absolute inset-x-0 bottom-0 bg-slate-900/70 py-1 text-center text-[10px] font-bold text-white">Hidden</span>
                )}
              </button>
              <figcaption className="flex items-center justify-between gap-1 p-2.5">
                <span className="min-w-0 truncate text-xs font-semibold text-slate-800" title={g.title}>{g.title}</span>
                <span className="flex shrink-0 items-center">
                  <button
                    onClick={() => save(g.id, { is_published: !g.is_published })}
                    aria-label={g.is_published ? "Hide from site" : "Show on site"}
                    title={g.is_published ? "Hide from site" : "Show on site"}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-navy"
                  >
                    {g.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => remove(g)}
                    aria-label="Remove photo"
                    title="Remove photo"
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      {/* Edit drawer */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Edit photo">
          <form
            className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl"
            onSubmit={async (e) => {
              e.preventDefault();
              const { id, title, category, caption, location, is_featured, is_published } = editing;
              if (await save(id, { title, category, caption, location, is_featured, is_published })) {
                setEditing(null);
                say("Photo updated");
              }
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-brand-navy">Edit photo</h3>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close" className="rounded-lg p-1.5 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-xl bg-slate-100">
              <Image src={editing.image_url} alt="" fill sizes="512px" className="object-cover" />
            </div>
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold text-slate-500">Title</span>
                <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className={field} />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold text-slate-500">Category</span>
                  <input list="gallery-cats" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className={field} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold text-slate-500">Location</span>
                  <input value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} className={field} />
                </label>
              </div>
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold text-slate-500">Caption</span>
                <textarea rows={2} value={editing.caption} onChange={(e) => setEditing({ ...editing, caption: e.target.value })} className={field} />
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={editing.is_featured} onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} />
                Feature on the home page
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={editing.is_published} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
                Show on the website
              </label>
            </div>
            <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-ocean py-3 text-sm font-bold text-white hover:bg-brand-navy">
              <Check className="h-4 w-4" /> Save photo
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
