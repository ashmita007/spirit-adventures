/** Pre-filled WhatsApp messages. One place so every button says who is asking and about what. */
import { SITE_URL } from "./seo";
import { smartCase } from "./readable-text";

export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+919666567551").replace(/\D/g, "");

export const whatsappUrl = (message: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

// Blank lines the traveller fills in, so the team gets what it needs in the first message
const DETAILS = ["Travel date: ", "Number of people: ", "Starting city: "].join("\n");

const rupees = (amount: number) => `₹${Math.round(amount).toLocaleString("en-IN")}`;

type TripLike = {
  title: string;
  slug: string;
  price?: number | null;
  duration_label?: string | null;
  destination_name?: string | null;
  destination?: { name?: string | null } | null;
};

/** Message for a specific trip: name, place, length, price and the page link. */
export function tripMessage(trip: TripLike): string {
  const place = trip.destination_name || trip.destination?.name;
  const facts = [place, trip.duration_label, trip.price ? `${rupees(trip.price)} per person` : null].filter(Boolean).join(" · ");
  return [
    "Hi Spirit Adventures, I want to book this trip:",
    "",
    `*${smartCase(trip.title)}*`,
    facts,
    `${SITE_URL}/trips/${trip.slug}`,
    "",
    DETAILS,
    "",
    "Please share the next available dates.",
  ].join("\n");
}

const titleFromSlug = (slug: string) =>
  decodeURIComponent(slug).split("-").filter(Boolean).map((w) => (/\d/.test(w) ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1))).join(" ");

/** Message for the site-wide buttons, based on the page (and search) the visitor is on. */
export function pageMessage(pathname: string | null | undefined, search = ""): string {
  const path = pathname || "/";
  const trip = path.match(/^\/trips\/([^/]+)/);
  const destination = path.match(/^\/destinations\/([^/]+)/);
  const query = new URLSearchParams(search).get("search")?.trim().slice(0, 60);

  let ask = "I want to plan a trip. Please share your upcoming trips and prices.";
  let link = "";
  if (trip) {
    ask = `I have a question about this trip:\n*${titleFromSlug(trip[1])}*`;
    link = `${SITE_URL}${path}`;
  } else if (destination) {
    ask = `I want to plan a trip to *${titleFromSlug(destination[1])}*. Please share the trips, dates and prices.`;
    link = `${SITE_URL}${path}`;
  } else if (path.startsWith("/trips") && query) {
    ask = `I am looking for a *${query}* trip. Please share what you have, with dates and prices.`;
  } else if (path.startsWith("/contact")) {
    ask = "I have a question before booking.";
  }
  return ["Hi Spirit Adventures,", ask, ...(link ? [link] : []), "", DETAILS].join("\n");
}
