"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown, ArrowUp, Check, Crown, ExternalLink, Eye, EyeOff, Loader2, Pencil, Plus, Trash2, UserRound, X,
} from "lucide-react";
import { ownerFetch } from "@/lib/owner-fetch";
import { cn } from "@/lib/utils";
import MediaUploadButton from "@/components/owner/media-upload-button";

interface Member {
  id: number;
  name: string;
  role: string;
  bio: string;
  photo_url: string;
  city: string;
  experience: string;
  instagram_url: string;
  linkedin_url: string;
  is_lead: boolean;
  ordering: number;
  is_published: boolean;
}

type Draft = Omit<Member, "id" | "ordering"> & { id?: number };

const EMPTY: Draft = {
  name: "", role: "", bio: "", photo_url: "", city: "", experience: "",
  instagram_url: "", linkedin_url: "", is_lead: false, is_published: true,
};

const field =
  "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-brand-ocean";

export default function TeamManager() {
  const [items, setItems] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; bad?: boolean } | null>(null);

  const say = (msg: string, bad = false) => {
    setToast({ msg, bad });
    window.setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    const j = await ownerFetch("/api/v1/owner/team/").then((r) => r.json()).catch(() => null);
    if (j?.success) setItems(j.data);
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
    const { id, ...data } = editing;
    const json = id
      ? await call(`/api/v1/owner/team/${id}/`, "POST", data)
      : await call("/api/v1/owner/team/", "POST", data);
    setSaving(false);
    if (!json) return;
    setItems((prev) => (id ? prev.map((m) => (m.id === id ? json.data : m)) : [...prev, json.data]));
    setEditing(null);
    say(json.message);
  };

  const patch = async (m: Member, p: Partial<Member>) => {
    const json = await call(`/api/v1/owner/team/${m.id}/`, "POST", p);
    if (json) setItems((prev) => prev.map((x) => (x.id === m.id ? json.data : x)));
  };

  const remove = async (m: Member) => {
    if (!window.confirm(`Remove ${m.name} from the team?`)) return;
    if (await call(`/api/v1/owner/team/${m.id}/`, "DELETE")) {
      setItems((prev) => prev.filter((x) => x.id !== m.id));
      say(`${m.name} removed`);
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...items];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    setItems(next);
    await call("/api/v1/owner/team/reorder/", "POST", { ids: next.map((m) => m.id) });
  };

  const live = items.filter((m) => m.is_published).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-brand-navy">Team</h1>
          <p className="mt-1 text-sm text-slate-500">
            {items.length} people · {live} shown on{" "}
            <Link href="/about" target="_blank" className="font-semibold text-brand-ocean hover:underline">
              About us <ExternalLink className="inline h-3 w-3" />
            </Link>
            . Changes show on the site within a minute.
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...EMPTY })}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-ocean px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-navy active:scale-[0.97]"
        >
          <Plus className="h-4 w-4" /> Add team member
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-brand-ocean" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">
          <UserRound className="mx-auto mb-3 h-8 w-8 text-slate-300" />
          No team members yet. Add your founders and trip captains and they will appear on the About page.
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((m, i) => (
            <li
              key={m.id}
              className={cn(
                "flex items-center gap-4 rounded-2xl border bg-white p-3 shadow-sm",
                m.is_published ? "border-slate-200" : "border-dashed border-slate-300 opacity-70"
              )}
            >
              <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                {m.photo_url ? (
                  <Image src={m.photo_url} alt="" fill sizes="56px" className="object-cover" />
                ) : (
                  <UserRound className="absolute inset-0 m-auto h-6 w-6 text-slate-300" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate font-bold text-brand-navy">
                  {m.name}
                  {m.is_lead && <Crown className="h-3.5 w-3.5 text-amber-500" aria-label="Leadership card" />}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {m.role}
                  {m.city ? ` · ${m.city}` : ""}
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
                  onClick={() => patch(m, { is_published: !m.is_published })}
                  aria-label={m.is_published ? "Hide from site" : "Show on site"}
                  title={m.is_published ? "Hide from site" : "Show on site"}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-navy"
                >
                  {m.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button onClick={() => setEditing({ ...m })} aria-label="Edit" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-navy">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => remove(m)} aria-label="Remove" className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={editing.id ? "Edit team member" : "Add team member"}>
          <form onSubmit={submit} className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-brand-navy">{editing.id ? "Edit team member" : "Add team member"}</h3>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close" className="rounded-lg p-1.5 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 flex items-center gap-4">
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                {editing.photo_url ? (
                  <Image src={editing.photo_url} alt="" fill sizes="80px" className="object-cover" />
                ) : (
                  <UserRound className="absolute inset-0 m-auto h-8 w-8 text-slate-300" />
                )}
              </div>
              <div className="space-y-2">
                <MediaUploadButton
                  folder="team"
                  label={editing.photo_url ? "Change photo" : "Upload photo"}
                  onUploaded={(r) => setEditing((d) => (d ? { ...d, photo_url: r.url } : d))}
                  onError={(msg) => say(msg, true)}
                />
                <p className="text-[11px] text-slate-400">Portrait photo, face centred. Without one, initials are shown.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold text-slate-500">Name *</span>
                  <input required maxLength={120} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={field} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold text-slate-500">Role *</span>
                  <input required maxLength={120} value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })} placeholder="Founder, Trip Captain…" className={field} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold text-slate-500">City</span>
                  <input maxLength={80} value={editing.city} onChange={(e) => setEditing({ ...editing, city: e.target.value })} placeholder="Bengaluru" className={field} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold text-slate-500">Highlight</span>
                  <input maxLength={80} value={editing.experience} onChange={(e) => setEditing({ ...editing, experience: e.target.value })} placeholder="120+ treks led" className={field} />
                </label>
              </div>
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold text-slate-500">About ({editing.bio.length}/600)</span>
                <textarea rows={3} maxLength={600} value={editing.bio} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} className={field} />
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold text-slate-500">Instagram link</span>
                  <input type="url" value={editing.instagram_url} onChange={(e) => setEditing({ ...editing, instagram_url: e.target.value })} placeholder="https://instagram.com/…" className={field} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold text-slate-500">LinkedIn link</span>
                  <input type="url" value={editing.linkedin_url} onChange={(e) => setEditing({ ...editing, linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/…" className={field} />
                </label>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={editing.is_lead} onChange={(e) => setEditing({ ...editing, is_lead: e.target.checked })} />
                Leadership (large card at the top)
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={editing.is_published} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
                Show on the website
              </label>
            </div>

            <button
              disabled={saving}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-ocean py-3 text-sm font-bold text-white hover:bg-brand-navy disabled:opacity-70"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {editing.id ? "Save changes" : "Add to team"}
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
