import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { FALLBACK_TRIPS } from "@/lib/fallback-trips";
import { getDestinations } from "@/lib/api";

export const revalidate = 3600;

const API = process.env.DJANGO_API_URL || process.env.INTERNAL_API_URL || "http://127.0.0.1:8000/api/v1";

type Row = { slug: string; updated_at?: string; created_at?: string; published_at?: string };

async function slugs(endpoint: string, fallbackRows: Row[]): Promise<Row[]> {
  try {
    const res = await fetch(`${API}${endpoint}`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(3000) });
    if (!res.ok) return fallbackRows;
    const json = await res.json();
    const data = json.data ?? json;
    const items = Array.isArray(data) ? data.filter((r: Row) => r?.slug) : [];
    return items.length > 0 ? items : fallbackRows;
  } catch {
    return fallbackRows;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const statics: MetadataRoute.Sitemap = [
    { path: "", priority: 1.0, freq: "daily" as const },
    { path: "/trips", priority: 0.9, freq: "daily" as const },
    { path: "/destinations", priority: 0.8, freq: "weekly" as const },
    { path: "/gallery", priority: 0.6, freq: "weekly" as const },
    { path: "/blog", priority: 0.6, freq: "weekly" as const },
    { path: "/about", priority: 0.5, freq: "monthly" as const },
    { path: "/contact", priority: 0.7, freq: "monthly" as const },
  ].map((r) => ({ url: `${SITE_URL}${r.path}`, lastModified: now, changeFrequency: r.freq, priority: r.priority }));

  const defaultTrips: Row[] = FALLBACK_TRIPS.map(t => ({ slug: t.slug }));
  const fallbackDests = await getDestinations();
  const defaultDests: Row[] = fallbackDests.map(d => ({ slug: d.slug }));

  const [trips, destinations, posts] = await Promise.all([
    slugs("/trips/", defaultTrips),
    slugs("/destinations/", defaultDests),
    slugs("/blog/", [])
  ]);
  const when = (r: Row) => new Date(r.updated_at || r.published_at || r.created_at || now);

  return [
    ...statics,
    ...trips.map((t) => ({ url: `${SITE_URL}/trips/${t.slug}`, lastModified: when(t), changeFrequency: "weekly" as const, priority: 0.9 })),
    ...destinations.map((d) => ({ url: `${SITE_URL}/destinations/${d.slug}`, lastModified: when(d), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...posts.map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: when(p), changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
