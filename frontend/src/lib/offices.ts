/**
 * Office locations. One list drives the Contact page maps, the footer and the
 * Google business data, so adding a city here updates all three.
 */
export interface Office {
  city: string;
  /** Full postal address shown on the site */
  address: string;
  /** Short one-line version for the footer */
  short: string;
  /** What Google Maps should search for to place the pin */
  mapQuery: string;
  /** Optional exact Google Maps share link (place page) */
  mapsUrl?: string;
  street: string;
  locality: string;
  region: string;
  postalCode: string;
}

export const OFFICES: Office[] = [
  {
    city: "Hyderabad",
    address: "Vasantha Sai Apartments, Opposite Rishi Towers, KPHB, Kukatpally, Hyderabad, Telangana - 500085",
    short: "Vasantha Sai Apts, Opp. Rishi Towers, KPHB, Kukatpally, Hyderabad - 500085",
    // Google knows the building as "Vasantha sai" (next to Rishi Towers); this wording drops the pin on it.
    mapQuery: "Vasantha Sai Apartments, KPHB Colony, Kukatpally, Hyderabad",
    mapsUrl: "https://maps.app.goo.gl/4N6qZD9KAyb6pBA19",
    street: "Vasantha Sai Apts, Opp. Rishi Towers, KPHB",
    locality: "Kukatpally, Hyderabad",
    region: "Telangana",
    postalCode: "500085",
  },
  // Bengaluru: add here once the address is confirmed, same fields as above.
];

export const mapEmbedUrl = (o: Office) =>
  `https://www.google.com/maps?q=${encodeURIComponent(o.mapQuery)}&z=17&output=embed`;

export const mapOpenUrl = (o: Office) =>
  o.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.mapQuery)}`;

/** Directions to the office; with no origin Google uses the visitor's current location. */
export const directionsUrl = (o: Office, from = "") =>
  `https://www.google.com/maps/dir/?api=1${from ? `&origin=${encodeURIComponent(from)}` : ""}&destination=${encodeURIComponent(o.mapQuery)}`;

/** Phone desks by city, shown in this order (Bengaluru first). */
export const PHONES = [
  { city: "Bengaluru", display: "+91 70755 67551", tel: "+917075567551" },
  { city: "Hyderabad", display: "+91 96665 67551", tel: "+919666567551" },
];
