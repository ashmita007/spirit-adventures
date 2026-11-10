/**
 * Per-trip questions and answers, built only from the trip's own data so every
 * answer stays true when the owner edits the trip. Owner-written FAQs come first.
 * Questions follow how people search: "<place> trip cost", "how many days", "pickup point".
 */
import type { FAQ, Trip } from "./types";
import { PHONE, cleanText, tripDisplayName } from "./seo";

// Defaults copied into the imported WordPress packages; they are not real values.
const PLACEHOLDER_POINT = "dehradun / base camp";
const PLACEHOLDER_SEASON = "dec - apr";

const destSlugOf = (trip: Trip) => (trip.destination_slug || trip.destination?.slug || "").toLowerCase();

/** The value, or "" when it is empty or a known placeholder (allowed on Uttarakhand trips, where it is true). */
function realValue(value: string | undefined | null, placeholder: string, trip: Trip) {
  const v = (value || "").trim();
  if (!v) return "";
  if (destSlugOf(trip) !== "uttarakhand" && v.toLowerCase() === placeholder) return "";
  return v;
}

export const tripPickup = (trip: Trip) => realValue(trip.pickup_location, PLACEHOLDER_POINT, trip);
export const tripDrop = (trip: Trip) => realValue(trip.drop_location, PLACEHOLDER_POINT, trip);
export const tripSeason = (trip: Trip) => realValue(trip.best_season, PLACEHOLDER_SEASON, trip);

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const list = (items: string[] | undefined, max = 8) => {
  const clean = (items || []).map((s) => cleanText(s)).filter(Boolean);
  if (clean.length === 0) return "";
  const shown = clean.slice(0, max);
  const more = clean.length > max ? `, and ${clean.length - max} more` : "";
  return shown.join(", ") + more + ".";
};

const DIFFICULTY_ANSWER: Record<Trip["difficulty"], string> = {
  EASY: "Yes. It is graded Easy, so first-timers, families and anyone with everyday fitness can join.",
  MODERATE:
    "Mostly, yes. It is graded Moderate: you should be able to walk for a few hours a day. Light walking or jogging for two weeks before the trip helps.",
  CHALLENGING:
    "It is graded Challenging, so it suits people who already walk or exercise regularly. Beginners should start a few weeks of cardio training before the trip.",
  DIFFICULT:
    "It is graded Difficult and is meant for experienced trekkers with good fitness. Talk to us before booking if this is your first high-altitude trip.",
};

let nextId = -1;
const qa = (question: string, answer: string): FAQ => ({ id: nextId--, question, answer, category: "trip" });

export function tripFaqs(trip: Trip): FAQ[] {
  const fullName = tripDisplayName(trip.title);
  const place = trip.destination_name || trip.destination?.name || fullName;
  // Questions read the way people search ("Dandeli trip cost"), so long titles fall back to the place
  const name = fullName.length > 32 ? place : fullName;
  const days = trip.duration_days && trip.duration_nights !== undefined
    ? `${trip.duration_days} days and ${trip.duration_nights} night${trip.duration_nights === 1 ? "" : "s"}`
    : trip.duration_label;
  const pickup = tripPickup(trip);
  const drop = tripDrop(trip);
  const season = tripSeason(trip);
  const price = Number(trip.price);
  const was = Number(trip.original_price || 0);

  const out: FAQ[] = [...(trip.faqs || [])];

  if (price > 0) {
    out.push(
      qa(
        `How much does the ${name} trip cost?`,
        `The ${name} trip starts at ${inr(price)} per person` +
          (was > price ? ` (regular price ${inr(was)})` : "") +
          `, for ${days}. Send an enquiry with your date to get the exact price for your batch.`,
      ),
    );
  }

  if (days) {
    out.push(qa(`How many days is the ${name} trip?`, `The trip is ${days} (${trip.duration_label}).`));
  }

  if (pickup) {
    out.push(
      qa(
        `Where does the ${name} trip start?`,
        `Pickup is at ${pickup}` + (drop ? ` and the trip ends at ${drop}` : "") + ".",
      ),
    );
  }

  const inc = list(trip.inclusions);
  if (inc) out.push(qa(`What is included in the ${name} package?`, `The package includes: ${inc}`));

  const exc = list(trip.exclusions);
  if (exc) out.push(qa(`What is not included?`, `Not included: ${exc}`));

  if (season) {
    out.push(qa(`What is the best time to visit ${place}?`, `The best season for this trip is ${season}.`));
  }

  if (trip.difficulty && DIFFICULTY_ANSWER[trip.difficulty]) {
    out.push(qa(`Is the ${name} trip good for beginners?`, DIFFICULTY_ANSWER[trip.difficulty]));
  }

  const carry = list(trip.things_to_carry, 10);
  if (carry) out.push(qa(`What should I pack for ${place}?`, `Carry: ${carry}`));

  out.push(
    qa(
      `How do I book the ${name} trip?`,
      `Send an enquiry from this page or message us on WhatsApp at ${PHONE}. We confirm your seat and batch date once the advance is paid.`,
    ),
  );

  return out;
}
