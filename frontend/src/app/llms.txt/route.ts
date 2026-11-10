/**
 * /llms.txt (llmstxt.org): a plain-text summary of the business and every trip,
 * so AI assistants (ChatGPT, Perplexity, Claude) can answer "trips from Bengaluru"
 * style questions with correct prices and links. Built from the same API as the site.
 */
import { getDestinations, getTrips } from "@/lib/api";
import { EMAIL, PHONE, SITE_NAME, SITE_URL, cleanText, tripDisplayName } from "@/lib/seo";

export const revalidate = 3600;

/** Cut at a word boundary. */
const clip = (s: string, n: number) => (s.length <= n ? s : s.slice(0, n).replace(/\s+\S*$/, "") + "…");

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export async function GET() {
  const [trips, destinations] = await Promise.all([getTrips(), getDestinations()]);
  const updated = new Date().toISOString().slice(0, 10);

  const tripLines = trips
    .slice()
    .sort((a, b) => Number(a.price) - Number(b.price))
    .map((t) => {
      const days = t.duration_label || `${t.duration_days}D ${t.duration_nights}N`;
      const where = t.destination_name ? `, ${t.destination_name}` : "";
      const summary = clip(cleanText(t.short_description || ""), 160);
      return `- [${tripDisplayName(t.title)}](${SITE_URL}/trips/${t.slug}): ${days}${where}, from ${inr(Number(t.price))} per person. ${summary}`;
    });

  const destLines = destinations.map(
    (d) => `- [${d.name}](${SITE_URL}/destinations/${d.slug}): ${clip(cleanText(d.subtitle || d.description || ""), 140)}`,
  );

  const body = `# ${SITE_NAME}

> ${SITE_NAME} is an Indian travel company (est. 2022) running group weekend trips, treks, rafting and tour packages from Hyderabad, Bengaluru and Chennai to South India (Coorg, Gokarna, Dandeli, Ooty, Wayanad, Munnar, Hampi, Goa, Pondicherry) and the Himalayas (Manali, Kashmir, Ladakh, Meghalaya, Darjeeling).

Prices are starting prices per person in Indian rupees; each trip page lists what is included. To book, send an enquiry on the trip page or contact us by phone or WhatsApp.

- Phone / WhatsApp: ${PHONE}
- Email: ${EMAIL}
- Office: KPHB, Kukatpally, Hyderabad, Telangana 500085, India
- Last updated: ${updated}

## Trips (${trips.length}, cheapest first)

${tripLines.join("\n")}

## Destinations

${destLines.join("\n")}

## Pages

- [All trips](${SITE_URL}/trips): filter by place, days and price
- [About](${SITE_URL}/about): company, team and safety
- [Contact](${SITE_URL}/contact): enquiry form, phone, WhatsApp
- [Blog](${SITE_URL}/blog): packing lists and trail guides
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
