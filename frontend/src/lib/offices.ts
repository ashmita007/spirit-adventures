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
  // Both entries match the business listings on Google Maps (name, address, rating card in the embed).
  {
    city: "Bengaluru",
    address: "274, 7th Main 6th Cross, Hongasandra, Bengaluru, Karnataka - 560114",
    short: "274, 7th Main 6th Cross, Hongasandra, Bengaluru - 560114",
    mapQuery: "Spirit Adventures Bengaluru, Hongasandra, Bengaluru",
    mapsUrl: "https://www.google.com/maps/place/Spirit+Adventures+Bengaluru/@12.8984211,77.6298895,17z/data=!4m6!3m5!1s0xafbfec00bce94717:0xac8957bc19b8f487!8m2!3d12.8984211!4d77.6298895!16s%2Fg%2F11zf3ytk0r",
    street: "274, 7th Main 6th Cross, Hongasandra",
    locality: "Bengaluru",
    region: "Karnataka",
    postalCode: "560114",
  },
  {
    city: "Hyderabad",
    address: "Vasantha Sai Apartments, Opposite Rishi Towers, KPHB, Kukatpally, Hyderabad, Telangana - 500072",
    short: "Vasantha Sai Apts, Opp. Rishi Towers, KPHB, Kukatpally, Hyderabad - 500072",
    mapQuery: "Spirit Adventures, KPHB, Kukatpally, Hyderabad",
    mapsUrl: "https://www.google.com/maps/place/Spirit+Adventures/@17.4956388,78.4031687,17z/data=!4m6!3m5!1s0x3bcb91fb8155e6af:0xd88bc4b31a75eea3!8m2!3d17.4956388!4d78.4031687!16s%2Fg%2F11wv_mb8tf",
    street: "Vasantha Sai Apts, Opp. Rishi Towers, KPHB",
    locality: "Kukatpally, Hyderabad",
    region: "Telangana",
    postalCode: "500072",
  },
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
