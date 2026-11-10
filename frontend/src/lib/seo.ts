/** Shared SEO constants and JSON-LD builders. */
import type { BlogPosting, BreadcrumbList, ItemList, TouristTrip, TravelAgency, WebSite, WithContext } from "schema-dts";
import type { BlogPost, Trip } from "./types";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://spiritadventures.in").replace(/\/$/, "");
export const SITE_NAME = "Spirit Adventures";
export const LOGO_URL = `${SITE_URL}/images/logo.png`;
export const PHONE = "+91-9666567551";
export const EMAIL = "info@spiritadventures.in";
export const DEFAULT_DESCRIPTION =
  "Small-group treks, river rafting, beach trails and Himalayan trips from Hyderabad and Bengaluru with certified leaders. Gokarna, Dandeli, Coorg, Ladakh & more.";

export const absoluteUrl = (path = "/") => (path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`);

export function organizationJsonLd(): WithContext<TravelAgency> {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: LOGO_URL, width: "564", height: "149" },
    image: LOGO_URL,
    description: DEFAULT_DESCRIPTION,
    telephone: PHONE,
    email: EMAIL,
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Vasantha Sai Apts, Opp. Rishi Towers, KPHB",
      addressLocality: "Kukatpally, Hyderabad",
      addressRegion: "Telangana",
      postalCode: "500085",
      addressCountry: "IN",
    },
    areaServed: ["Karnataka", "Kerala", "Tamil Nadu", "Goa", "Uttarakhand", "Ladakh", "Himachal Pradesh", "Kashmir"],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: PHONE,
      email: EMAIL,
      contactType: "customer service",
      availableLanguage: ["English", "Hindi", "Telugu", "Kannada"],
    },
  };
}

export function websiteJsonLd(): WithContext<WebSite> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-IN",
    // No SearchAction: Google retired the sitelinks search box in November 2024.
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function tripJsonLd(trip: Trip): WithContext<TouristTrip> {
  const t = trip as Trip & { destination?: { name?: string } | string };
  const destName = typeof t.destination === "object" ? t.destination?.name : t.destination_name;
  const data: WithContext<TouristTrip> = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: tripDisplayName(trip.title),
    description: tripMetaDescription(trip),
    url: absoluteUrl(`/trips/${trip.slug}`),
    image: trip.cover_image ? [trip.cover_image] : [LOGO_URL],
    touristType: trip.category_name || "Adventure travellers",
    provider: { "@id": `${SITE_URL}/#organization` },
    offers: {
      "@type": "Offer",
      price: Number(trip.price),
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: absoluteUrl(`/trips/${trip.slug}`),
      seller: { "@id": `${SITE_URL}/#organization` },
    },
  };
  if (destName) {
    data.itinerary = {
      "@type": "ItemList",
      itemListElement: (trip.itinerary_days?.length ? trip.itinerary_days : [{ title: destName }]).map((d, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: { "@type": "TouristAttraction", name: cleanText(d.title) || destName },
      })),
    };
  }
  // aggregateRating is not a TouristTrip property in schema.org, so ratings are not claimed here.
  return data;
}

/* ------------------------------------------------------------------ */
/* Trip metadata: short, unique titles and descriptions per package    */
/* ------------------------------------------------------------------ */

const SMALL_WORDS = new Set(["and", "of", "the", "to", "in", "on", "for", "via", "with", "at", "by"]);
const EMOJI = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu;

/** Strip emoji and collapse whitespace. */
export const cleanText = (s = "") => s.replace(EMOJI, "").replace(/\s+/g, " ").trim();

/** "3D 2N GOKARNA & DANDELI" -> "Gokarna & Dandeli". Mixed-case titles are left alone. */
export function tripDisplayName(title: string) {
  const base = cleanText(title).replace(/^\d+\s*D\s*\/?\s*\d+\s*N\s+/i, "").trim() || cleanText(title);
  if (base !== base.toUpperCase()) return base;
  return base
    .toLowerCase()
    .split(" ")
    .map((w, i) => (i > 0 && SMALL_WORDS.has(w) ? w : w.replace(/^(\p{L})/u, (c) => c.toUpperCase())))
    .join(" ")
    .replace(/\bG&d\b/g, "G&D");
}

function truncateWords(s: string, max: number) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:\-–—&]+$/, "").trim()}…`;
}

const inr = (n: number) => `₹${Math.round(Number(n)).toLocaleString("en-IN")}`;

/** Title tag under ~60 chars: "Gokarna & Dandeli 3D/2N Trip from ₹6,200 | Spirit Adventures". */
export function tripMetaTitle(trip: Trip) {
  if (trip.meta_title?.trim()) return trip.meta_title.trim();
  const name = tripDisplayName(trip.title);
  const dur = trip.duration_days ? `${trip.duration_days}D/${trip.duration_nights}N` : "";
  const candidates = [
    `${name} ${dur} Trip from ${inr(trip.price)} | ${SITE_NAME}`,
    `${name} ${dur} from ${inr(trip.price)} | ${SITE_NAME}`,
    `${name} | ${SITE_NAME}`,
    `${name} ${dur} from ${inr(trip.price)}`,
  ].map((c) => c.replace(/\s+/g, " "));
  return candidates.find((c) => c.length <= 60) || truncateWords(name, 60);
}

/** Templated seed copy ("Curated 3 Days / 2 Nights adventure through X…") is identical across trips. */
const isTemplatedDescription = (s = "") => /^curated \d+ days? \/ \d+ nights? adventure through/i.test(s.trim());

/** Meta description (≤158 chars), unique per trip, built from real itinerary and inclusions. */
export function tripMetaDescription(trip: Trip) {
  if (trip.meta_description?.trim()) return trip.meta_description.trim();
  const short = cleanText(trip.short_description);
  if (short && !isTemplatedDescription(short)) return truncateWords(short, 158);

  const name = tripDisplayName(trip.title);
  const stops = Array.from(
    new Set(
      (trip.itinerary_days || [])
        .map((d) => tripDisplayName(cleanText(d.title).replace(/^day\s*\d+\s*[:\-–]\s*/i, "")))
        .filter((s) => s && s.length <= 40)
    )
  ).slice(0, 3);
  const incl = (trip.inclusions || []).map((i) => cleanText(i).replace(/\s*\(.*?\)\s*/g, " ").trim()).filter(Boolean).slice(0, 2);

  // Append whole sentences only while they fit, so nothing is cut mid-phrase.
  let d = `${name}: ${trip.duration_days} days, ${trip.duration_nights} nights from ${inr(trip.price)} per person.`;
  const extras = [
    stops.length ? `Covers ${stops.join(", ")}.` : "",
    incl.length ? `Includes ${incl.join(" and ")}.` : "",
    incl.length > 1 ? `Includes ${incl[0]}.` : "",
    `Book with ${SITE_NAME}.`,
  ];
  for (const extra of extras) {
    if (extra && d.length + 1 + extra.length <= 158 && !(extra.startsWith("Includes") && d.includes("Includes"))) {
      d += ` ${extra}`;
    }
  }
  return truncateWords(d, 158);
}

/** BlogPosting for /blog/[slug]. Only fields that are visible on the page. */
export function blogPostingJsonLd(post: BlogPost): WithContext<BlogPosting> {
  const url = absoluteUrl(`/blog/${post.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.meta_description || post.excerpt,
    url,
    mainEntityOfPage: url,
    image: post.cover_image ? [absoluteUrl(post.cover_image)] : undefined,
    datePublished: post.published_at || undefined,
    dateModified: post.published_at || undefined,
    articleSection: post.category || undefined,
    timeRequired: post.reading_time_minutes ? `PT${post.reading_time_minutes}M` : undefined,
    inLanguage: "en-IN",
    author: post.author ? { "@type": "Person", name: post.author } : { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

/** ItemList of the trips shown on a listing page (destination pages). */
export function tripListJsonLd(name: string, trips: Trip[]): WithContext<ItemList> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: trips.length,
    itemListElement: trips.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(`/trips/${t.slug}`),
      name: tripDisplayName(t.title),
    })),
  };
}
