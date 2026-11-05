/** Shared SEO constants and JSON-LD builders. */
import type { Trip } from "./types";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://spiritadventures.in").replace(/\/$/, "");
export const SITE_NAME = "Spirit Adventures";
export const LOGO_URL = `${SITE_URL}/images/logo.png`;
export const PHONE = "+91-9666567551";
export const EMAIL = "info@spiritadventures.in";
export const DEFAULT_DESCRIPTION =
  "Small-group treks, river rafting, beach trails and Himalayan expeditions from Hyderabad and Bengaluru with certified trek leaders. Gokarna, Dandeli, Coorg, Kedarkantha, Ladakh and more.";

export const absoluteUrl = (path = "/") => (path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`);

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: LOGO_URL, width: 564, height: 149 },
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

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-IN",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/trips?search={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
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

export function tripJsonLd(trip: Trip) {
  const t = trip as Trip & { reviews_count?: number; rating?: number; destination?: { name?: string } | string };
  const destName = typeof t.destination === "object" ? t.destination?.name : t.destination_name;
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: trip.title,
    description: trip.short_description,
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
        item: { "@type": "TouristAttraction", name: d.title },
      })),
    };
  }
  // Only claim a rating when real approved reviews exist
  if (t.reviews_count && t.reviews_count > 0 && t.rating) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: t.rating,
      reviewCount: t.reviews_count,
      bestRating: 5,
    };
  }
  return data;
}
