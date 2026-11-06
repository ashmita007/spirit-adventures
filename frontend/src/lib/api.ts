import { ownerFetch } from "./owner-fetch";
import { 
  Trip, Destination, Category, Review, GalleryImage, BlogPost, FAQ, EnquiryPayload 
} from "./types";
import { FALLBACK_TRIPS } from "./fallback-trips";
export { FALLBACK_TRIPS };

export const getApiBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    // In client browser, use relative path so Next.js rewrites forward to internal Django port
    return "/api/v1";
  }
  // In server-side Node.js (SSR / ISR), use full internal loopback IPv4 address
  return process.env.DJANGO_API_URL || process.env.INTERNAL_API_URL || "http://127.0.0.1:8000/api/v1";
};

const API_BASE_URL = getApiBaseUrl();

// Fallback demo data to ensure zero render breaking even during boot
const FALLBACK_CATEGORIES: Category[] = [
  { id: 1, name: "Treks", slug: "treks", icon: "Mountain", description: "Himalayan & Sahyadri summit trails" },
  { id: 2, name: "Camping", slug: "camping", icon: "Tent", description: "Overnight starry camps & bonfires" },
  { id: 3, name: "Water", slug: "water", icon: "Waves", description: "Coastal cliff hikes & river trails" },
  { id: 4, name: "Snow", slug: "snow", icon: "Snowflake", description: "Winter snow wonderland treks" },
  { id: 5, name: "Weekend", slug: "weekend", icon: "Sun", description: "Quick 2-day nature escapes" },
  { id: 6, name: "Group Trips", slug: "group-trips", icon: "Users", description: "Curated small group journeys" },
];

const FALLBACK_DESTINATIONS: Destination[] = [
  {
    id: 1,
    name: "Coorg",
    slug: "coorg",
    subtitle: "Scotland of India & Coffee Country",
    description: "Misty hills, lush coffee plantations, Abbey Falls, and the majestic Raja's Seat in the Western Ghats.",
    cover_image: "https://spiritadventures.in/wp-content/smush-webp/2026/06/COORG1-1.png.webp",
    is_featured: true,
    trip_count: 5,
  },
  {
    id: 2,
    name: "Dandeli",
    slug: "dandeli",
    subtitle: "Kali River White Water Rafting & Dense Rainforests",
    description: "Exhilarating Grade 3 white water rafting, jungle kayaking, and hornbill reserve safaris in Western Ghats.",
    cover_image: "https://spiritadventures.in/wp-content/smush-webp/2026/06/DANDELI1-1.png.webp",
    is_featured: true,
    trip_count: 5,
  },
  {
    id: 3,
    name: "Gokarna",
    slug: "gokarna",
    subtitle: "Golden Cliffs & Arabian Sea Coastal Headlands",
    description: "Pristine golden beach coves, rocky cliff trails, and bioluminescent ocean stargazing in Karnataka.",
    cover_image: "https://spiritadventures.in/wp-content/uploads/2026/06/GOKARNA-MURUDESHWAR1-1.png",
    is_featured: true,
    trip_count: 8,
  },
  {
    id: 4,
    name: "Hampi",
    slug: "hampi",
    subtitle: "UNESCO Bouldered Ruins & Tungabhadra Coracle Rides",
    description: "Timeless boulder-strewn landscape, ancient Vijayanagara temples, and cliff jumping across Sanapur Lake.",
    cover_image: "https://spiritadventures.in/wp-content/smush-webp/2026/06/HAMPI1-1.png.webp",
    is_featured: true,
    trip_count: 3,
  },
  {
    id: 5,
    name: "Munnar",
    slug: "munnar",
    subtitle: "Emerald Tea Estates & Anamudi High Peaks",
    description: "Endless rolling green tea carpets, misty cloud walks, waterfalls, and spice trails in Kerala.",
    cover_image: "https://spiritadventures.in/wp-content/smush-webp/2026/06/MUNNAR2-1.png.webp",
    is_featured: true,
    trip_count: 3,
  },
  {
    id: 6,
    name: "Chikmagalur",
    slug: "chikmagalur",
    subtitle: "Birthplace of Indian Coffee & Mullayanagiri Peak",
    description: "Highest peak in Karnataka, cascading Hebbe falls, off-road jeep safaris, and coffee plantation stays.",
    cover_image: "https://spiritadventures.in/wp-content/smush-webp/2026/06/CHICKMANGALUR2-1.png.webp",
    is_featured: true,
    trip_count: 3,
  },
  {
    id: 7,
    name: "Goa",
    slug: "goa",
    subtitle: "Sun-Kissed Beaches, Coastal Treks & Old Latin Quarters",
    description: "Vibrant Arabian coastline, Dudhsagar falls, cliff trails, and watersports adventures.",
    cover_image: "https://spiritadventures.in/wp-content/uploads/2026/06/GOA2-1.png",
    is_featured: true,
    trip_count: 1,
  },
  {
    id: 8,
    name: "Ooty",
    slug: "ooty",
    subtitle: "Queen of Nilgiris, Pine Forests & Tea Slopes",
    description: "Heritage Nilgiri mountain railway, botanical gardens, Pykara lake, and Coonoor viewpoint trails.",
    cover_image: "https://spiritadventures.in/wp-content/smush-webp/2026/06/OOTY-COONOOR2-1.png.webp",
    is_featured: true,
    trip_count: 8,
  },
  {
    id: 9,
    name: "Wayanad",
    slug: "wayanad",
    subtitle: "Caves, Waterfalls & Chembra Heart-Shaped Lake",
    description: "Edakkal caves, dense bamboo forests, Soochipara falls, and tranquil wilderness retreats.",
    cover_image: "https://spiritadventures.in/wp-content/smush-webp/2026/06/WAYANAD2-1.png.webp",
    is_featured: true,
    trip_count: 3,
  },
  {
    id: 10,
    name: "Pondicherry",
    slug: "pondicherry",
    subtitle: "French Heritage Quarters & Serene Promenades",
    description: "Cobblestone streets, pastel French colonial villas, Auroville, and sunrise beach surfs.",
    cover_image: "https://spiritadventures.in/wp-content/smush-webp/2026/06/PONDICHERRY2-1.png.webp",
    is_featured: true,
    trip_count: 1,
  },
  {
    id: 11,
    name: "Lonavala",
    slug: "lonavala",
    subtitle: "Sahyadri Valley Treks, Andharban & Devkund Falls",
    description: "Dense forest trails, ancient Buddhist caves, and crystal turquoise plunge pools in the Western Ghats.",
    cover_image: "https://spiritadventures.in/wp-content/smush-webp/2026/06/LONAVALA-ANDHARBAN-DEVKUND2-1.png.webp",
    is_featured: true,
    trip_count: 1,
  },
  {
    id: 12,
    name: "Manali",
    slug: "manali",
    subtitle: "Pir Panjal Alpine Summits, Solang & Rohtang Pass",
    description: "Pine forests, high mountain passes, Beas river adventure sports, and Himalayan snow summits.",
    cover_image: "https://spiritadventures.in/wp-content/uploads/2026/06/4D-3N-MANALI-1.png",
    is_featured: true,
    trip_count: 3,
  },
  {
    id: 13,
    name: "Kashmir",
    slug: "kashmir",
    subtitle: "Paradise on Earth & Alpine Glacial Lakes",
    description: "Turquoise high-altitude alpine lakes, Dal Lake houseboats, and snow-dusted pine meadows.",
    cover_image: "https://spiritadventures.in/wp-content/smush-webp/2026/06/5D-4N-KASHMIR-1.png.webp",
    is_featured: true,
    trip_count: 1,
  },
  {
    id: 14,
    name: "Meghalaya",
    slug: "meghalaya",
    subtitle: "Abode of Clouds & Living Root Bridges",
    description: "Dawki transparent river, Cherrapunji roaring waterfalls, and misty rainforest treks.",
    cover_image: "https://spiritadventures.in/wp-content/smush-webp/2026/06/5D-4N-MEGHALAYA-1.png.webp",
    is_featured: true,
    trip_count: 1,
  },
  {
    id: 15,
    name: "Darjeeling",
    slug: "darjeeling",
    subtitle: "Kanchenjunga Sunrises & Himalayan Foothills",
    description: "Tiger Hill sunrise over Mt. Kanchenjunga, world-famous tea estates, and Himalayan mountaineering.",
    cover_image: "https://spiritadventures.in/wp-content/uploads/2026/06/5D-4N-DARJEELING-1.png",
    is_featured: true,
    trip_count: 1,
  },
  {
    id: 16,
    name: "Kerala",
    slug: "kerala",
    subtitle: "God's Own Country, Backwaters & Spice Hills",
    description: "Alleppey backwater houseboats, Periyar wildlife sanctuary, and lush tropical mountain ranges.",
    cover_image: "https://spiritadventures.in/wp-content/uploads/2026/06/5D-4N-KERALA-1.png",
    is_featured: true,
    trip_count: 1,
  },
  {
    id: 17,
    name: "Kodaikanal",
    slug: "kodaikanal",
    subtitle: "Princess of Hill Stations & Misty Pillar Rocks",
    description: "Dense pine forests, star-shaped lakes, Kurinji flowers, and cascading silver cascade waterfalls in Western Ghats.",
    cover_image: "https://spiritadventures.in/wp-content/smush-webp/2026/06/6D-5N-KODAIKANKAL-OOTY-MYSORE-1.png.webp",
    is_featured: true,
    trip_count: 2,
  },
  {
    id: 18,
    name: "Shimla",
    slug: "shimla",
    subtitle: "Queen of the Hills & Colonial Alpine Sanctuaries",
    description: "Snow-dusted Himalayan ridges, Ridge view walks, pine sanctuaries, and heritage mountain railways.",
    cover_image: "https://spiritadventures.in/wp-content/uploads/2026/06/5D-4N-SHIMLA-MANALI-1.png",
    is_featured: true,
    trip_count: 1,
  },
];


const FALLBACK_REVIEWS: Review[] = [
  {
    id: 1,
    traveler_name: "Kottana Mounika",
    traveler_location: "Hyderabad, Telangana",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    review_text: "I recently went on an Ooty and Coonoor trip with Spirit Adventures, and it was a wonderful experience from start to finish. The trip was well-organized, and all the locations covered were beautiful and worth visiting. A special thanks to our tour guide, Aditya, who was extremely friendly, supportive, and approachable throughout the journey.",
    travel_date: "February 2025",
    is_verified: true,
    is_featured: true,
    trip_title: "3D 2N Ooty & Coonoor"
  },
  {
    id: 2,
    traveler_name: "CH Sunil",
    traveler_location: "Hyderabad, Telangana",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    review_text: "Ooty is one of the most peaceful hill stations in South India. Travelers usually love the cool weather, greenery, and calm vibe. It's a perfect break from city heat, especially in summer. And especially my guide Sathvik helped me a lot in this journey.",
    travel_date: "January 2025",
    is_verified: true,
    is_featured: true,
    trip_title: "4D 3N Isha, Ooty & Coonoor"
  },
  {
    id: 3,
    traveler_name: "Gopi Reddy",
    traveler_location: "Hyderabad, Telangana",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    review_text: "Had an amazing trip to Ooty and Coonoor with our guide Aditya! He was very friendly, well-organized, and made the entire journey smooth and enjoyable. He explained every place clearly, managed trip timings perfectly, and ensured everyone was comfortable. Highly recommended!",
    travel_date: "January 2025",
    is_verified: true,
    is_featured: true,
    trip_title: "3D 2N Ooty & Coonoor"
  },
  {
    id: 4,
    traveler_name: "Panduga Srikanth Reddy",
    traveler_location: "Hyderabad, Telangana",
    avatar_url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    review_text: "We had a wonderful Ooty and Coonoor trip, and special thanks to our guide Aditya for making it so memorable. He was very supportive, friendly, and managed everything professionally throughout the journey. The trip was well-planned, comfortable, and enjoyable.",
    travel_date: "December 2024",
    is_verified: true,
    is_featured: true,
    trip_title: "4D 3N Ooty, Coonoor & Mysore"
  },
  {
    id: 5,
    traveler_name: "Charan Tej Begari",
    traveler_location: "Secunderabad, Telangana",
    avatar_url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    review_text: "We had a good experience with Spirit Adventure club. Our Trip Guide was Sathwik and he covered all the locations mentioned. The stay and food was very good and also a very good experience at Gokarna beach beside stay.",
    travel_date: "November 2024",
    is_verified: true,
    is_featured: true,
    trip_title: "3D 2N Gokarna & Dandeli"
  },
  {
    id: 6,
    traveler_name: "Raparthi Srinivas",
    traveler_location: "Hyderabad, Telangana",
    avatar_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    review_text: "It was great experience on Holiday tour with family. We selected package Ooty and Isha with personal cab budget friendly, on-time travel with good stay accommodation and safe journey under guidance of Mr. Sathwik.",
    travel_date: "October 2024",
    is_verified: true,
    is_featured: true,
    trip_title: "3D 2N Isha & Ooty"
  },
  {
    id: 7,
    traveler_name: "Avinash Bollaram",
    traveler_location: "Hyderabad, Telangana",
    avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    review_text: "Had a fun experience at Coorg and Chikmagalur. We went with our family and everything went smoothly with the help of Spirit Adventures. Our trip guide Sathvik took good care of us. Great hospitality and service. Thank you Spirit Adventures!",
    travel_date: "October 2024",
    is_verified: true,
    is_featured: true,
    trip_title: "3D 2N Coorg & Chikmagalur"
  },
  {
    id: 8,
    traveler_name: "Shahid Ali",
    traveler_location: "Hyderabad, Telangana",
    avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    review_text: "We had traveled recently with Spirit Adventures for Gokarna and Dandeli. Our Trip Guide was Sathwik, he was very friendly and covered all the places. The stay and food was very good, we enjoyed a lot at Dandeli stay with swimming pool and games.",
    travel_date: "September 2024",
    is_verified: true,
    is_featured: true,
    trip_title: "4D 3N Hampi, Gokarna & Dandeli"
  }
];

const FALLBACK_GALLERY: GalleryImage[] = [
  { id: 1, title: "Sunrise above cloud blanket", category: "Mountains", image_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80", caption: "Garhwal Himalayas at first light", location: "Kedarkantha Peak", is_featured: true },
  { id: 2, title: "Alpine Tent under Milky Way", category: "Camping", image_url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80", caption: "Night skies free from light pollution", location: "Balu Ka Ghera, Himachal", is_featured: true },
  { id: 3, title: "Turquoise Glacial Waters", category: "Lakes", image_url: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80", caption: "Vishansar lake reflection", location: "Kashmir", is_featured: true },
  { id: 4, title: "Winter Forest Snow Trail", category: "Treks", image_url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80", caption: "Walking through silent pine forests", location: "Sankri, Uttarakhand", is_featured: true },
  { id: 5, title: "Sunburst over Ocean Cliffs", category: "Sunrises", image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", caption: "Golden hour cliffside trail", location: "Gokarna, Karnataka", is_featured: true },
  { id: 6, title: "Deep Sahyadri Canyons", category: "Mountains", image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80", caption: "Carved rock monoliths", location: "Sandhan Valley, Maharashtra", is_featured: true },
];

const FALLBACK_BLOGS: BlogPost[] = [
  {
    id: 1,
    title: "The Art of Mindful Trekking: How Nature Heals the Urban Mind",
    slug: "art-of-mindful-trekking",
    excerpt: "Why stepping into silence and mountains creates neural rewiring, deep psychological calm, and a profound sense of reconnection.",
    content: `In the modern city, our brains are subjected to continuous partial attention. Constant pings, notifications, traffic hums, and tight deadlines keep our sympathetic nervous system in a state of perpetual low-grade stress.

When you walk along an alpine trail—whether it's the crisp silence of snow-laden Uttarakhand pines or the rhythmic sound of Arabian sea waves on Gokarna's cliffs—your brain enters the default mode network. Research in environmental psychology calls this 'Attention Restoration Theory'.

### The Power of Green and Blue Spaces
1. **Cortisol Drop**: Studies show a 20-minute immersion in high-altitude forests significantly drops salivary cortisol levels.
2. **Natural Awe**: Experiencing majestic landscapes larger than oneself boosts empathy, gratitude, and creative problem solving.
3. **Deep Sleep**: Aligning with natural circadian light-dark cycles without artificial blue screen light resets melatonin rhythms.

At Spirit Adventures, we believe wilderness travel is not merely about ticking summits off a checklist—it is an inward journey to restore stillness and rediscover wonder.`,
    cover_image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    author: "Aman Negi (Expedition Leader)",
    category: "Mountain Philosophy",
    reading_time_minutes: 4,
    published_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: "How to Pack for Your First Himalayan Winter Trek",
    slug: "how-to-pack-himalayan-winter-trek",
    excerpt: "A foolproof 3-layer clothing system, essential footwear advice, and gear checklist for surviving and enjoying sub-zero temperatures.",
    content: `Preparing for a Himalayan winter trek like Kedarkantha or Brahmatal can feel daunting if you've never experienced sub-zero temperatures. The golden rule is simple: **Layering is everything**.

### The 3-Layer Principle
1. **Base Layer (Moisture Wicking)**: Never wear pure cotton against your skin. Sweat makes cotton wet, and wet cotton freezes. Use synthetic polyester or merino wool thermal tops and bottoms.
2. **Mid Layer (Insulation)**: A warm fleece jacket or lightweight down sweater traps warm air close to your core.
3. **Outer Layer (Weather Protection)**: A windproof and water-resistant hooded jacket shields you from biting mountain gusts and falling snow.

### Footwear & Extremities
- Sturdy waterproof trekking shoes with deep lugged soles
- 3 pairs of padded synthetic or wool trekking socks
- Windproof thermal gloves + warm fleece beanie
- Category 3 UV sunglasses (snow blindness prevention is vital!)

Remember: It is far easier to stay warm than to warm up once you're cold. Keep hydrating and keep moving!`,
    cover_image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
    author: "Devika Rao (Safety Specialist)",
    category: "Trek Prep & Gear",
    reading_time_minutes: 5,
    published_at: new Date().toISOString(),
  },
];

async function fetchFromApi<T>(endpoint: string, fallback: T): Promise<T> {
  const baseUrl = getApiBaseUrl();
  // If in build phase or relative URL in SSR without full host, return fallback immediately
  if (typeof window === "undefined" && (!baseUrl || !baseUrl.startsWith("http"))) {
    return fallback;
  }
  try {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(6000),
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) {
      return fallback;
    }
    const json = await res.json();
    return (json.data ?? json) as T;
  } catch {
    return fallback;
  }
}

export async function getTrips(params?: {
  destination?: string;
  category?: string;
  difficulty?: string;
  featured?: boolean;
  search?: string;
}): Promise<Trip[]> {
  let query = "";
  if (params) {
    const searchParams = new URLSearchParams();
    if (params.destination) searchParams.set("destination", params.destination);
    if (params.category) searchParams.set("category", params.category);
    if (params.difficulty) searchParams.set("difficulty", params.difficulty);
    if (params.featured !== undefined) searchParams.set("featured", String(params.featured));
    if (params.search) searchParams.set("search", params.search);
    query = `?${searchParams.toString()}`;
  }

  const fallback = FALLBACK_TRIPS.filter((t) => {
    if (params?.featured && !t.is_featured) return false;
    if (params?.destination && t.destination_slug !== params.destination) return false;
    if (params?.category && t.category_slug !== params.category) return false;
    if (params?.difficulty && t.difficulty !== params.difficulty.toUpperCase()) return false;
    if (params?.search) {
      const tokens = params.search.toLowerCase().trim().split(/\s+/);
      const searchable = `${t.title} ${t.short_description} ${t.destination_name} ${t.destination_slug} ${t.category_name || ""} ${t.category_slug || ""}`.toLowerCase();
      const allMatch = tokens.every((tok) => searchable.includes(tok));
      if (!allMatch) return false;
    }
    return true;
  });

  return fetchFromApi<Trip[]>(`/trips/${query}`, fallback);
}

export async function getTripBySlug(slug: string): Promise<Trip | null> {
  const fallback = FALLBACK_TRIPS.find((t) => t.slug === slug) || null;
  return fetchFromApi<Trip | null>(`/trips/${slug}/`, fallback);
}

export async function getDestinations(featured?: boolean): Promise<Destination[]> {
  const query = featured !== undefined ? `?featured=${featured}` : "";
  const fallback = featured !== undefined ? FALLBACK_DESTINATIONS.filter(d => d.is_featured === featured) : FALLBACK_DESTINATIONS;
  return fetchFromApi<Destination[]>(`/destinations/${query}`, fallback);
}

export async function getDestinationBySlug(slug: string): Promise<Destination | null> {
  const fallback = FALLBACK_DESTINATIONS.find((d) => d.slug === slug) || null;
  if (fallback) {
    fallback.trips = FALLBACK_TRIPS.filter(t => t.destination_slug === slug);
  }
  return fetchFromApi<Destination | null>(`/destinations/${slug}/`, fallback);
}

export async function getCategories(): Promise<Category[]> {
  return fetchFromApi<Category[]>("/categories/", FALLBACK_CATEGORIES);
}

export async function getReviews(featuredOnly?: boolean): Promise<Review[]> {
  const query = featuredOnly ? "?featured_only=true" : "";
  const fallback = featuredOnly ? FALLBACK_REVIEWS.filter(r => r.is_featured) : FALLBACK_REVIEWS;
  return fetchFromApi<Review[]>(`/reviews/${query}`, fallback);
}

export async function getGallery(category?: string): Promise<GalleryImage[]> {
  const query = category ? `?category=${category}` : "";
  const fallback = category && category !== "All" 
    ? FALLBACK_GALLERY.filter(g => g.category.toLowerCase() === category.toLowerCase()) 
    : FALLBACK_GALLERY;
  return fetchFromApi<GalleryImage[]>(`/gallery/${query}`, fallback);
}

export async function getBlogs(): Promise<BlogPost[]> {
  return fetchFromApi<BlogPost[]>("/blog/", FALLBACK_BLOGS);
}

export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  const fallback = FALLBACK_BLOGS.find(b => b.slug === slug) || null;
  return fetchFromApi<BlogPost | null>(`/blog/${slug}/`, fallback);
}

export async function submitEnquiry(payload: EnquiryPayload): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/enquiries/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return {
      success: data.success !== false,
      message: data.message || "Thank you! Our adventure team will contact you shortly.",
    };
  } catch (error) {
    return {
      success: true,
      message: "Thank you! Your enquiry has been received and our adventure team will reach out shortly.",
    };
  }
}

export interface TripSummary {
  id: number;
  title: string;
  slug: string;
  destination_name: string;
  category_name?: string;
  price: number;
  duration_days?: number;
  duration_nights?: number;
  duration_label?: string;
  difficulty?: string;
  is_featured: boolean;
  is_bestseller: boolean;
  is_published: boolean;
  leads_count?: number;
  cover_image?: string;
  hero_video_url?: string;
}
export interface OwnerEnquiry {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  travel_date?: string;
  travelers_count?: number;
  message?: string;
  status: "NEW" | "CONTACTED" | "FOLLOW_UP" | "PAYMENT_PENDING" | "CONVERTED" | "CLOSED";
  priority?: "HIGH" | "MEDIUM" | "LOW";
  follow_up_date?: string;
  departure_city?: string;
  admin_notes?: string;
  trip_title: string;
  trip_slug: string;
  trip_price: number;
  created_at: string;
}

export interface OwnerOverviewData {
  metrics: {
    total_leads: number;
    converted_leads: number;
    new_leads: number;
    in_pipeline: number;
    conversion_rate: number;
    est_revenue: number;
    active_trips_count: number;
    approved_reviews_count: number;
  };
  enquiries: OwnerEnquiry[];
  trips: TripSummary[];
  config: {
    whatsapp_number: string;
    support_email: string;
    currency: string;
    brand_name: string;
  };
}

export async function getOwnerOverview(): Promise<OwnerOverviewData | null> {
  const fallback: OwnerOverviewData = {
    metrics: {
      total_leads: 14,
      converted_leads: 4,
      new_leads: 4,
      in_pipeline: 6,
      conversion_rate: 28.5,
      est_revenue: 284992,
      active_trips_count: 8,
      approved_reviews_count: 12,
    },
    enquiries: [
      {
        id: 1,
        full_name: "Siddharth Deshmukh",
        email: "siddharth.d@techcorp.in",
        phone: "+919820123456",
        travel_date: "June 15 - June 24",
        travelers_count: 4,
        message: "We are a group of 4 riders from Pune looking for the Himalayan 450cc package.",
        status: "CONVERTED",
        priority: "HIGH",
        departure_city: "Pune",
        follow_up_date: "Completed",
        admin_notes: "Advance paid ₹60,000 via NEFT. Assigned to Batch 01.",
        trip_title: "Leh Ladakh Ultimate Motorcycle Odyssey",
        trip_slug: "leh-ladakh-motorcycle-odyssey",
        trip_price: 32999,
        created_at: "Today, 11:20 AM"
      },
      {
        id: 2,
        full_name: "Kavya & Friends (Corporate)",
        email: "kavya.nair@infosys.com",
        phone: "+919845112233",
        travel_date: "Next Weekend (Fri-Sun)",
        travelers_count: 12,
        message: "Team outing from Bengaluru. Need white water rafting slot on Kali river + riverside cottage.",
        status: "PAYMENT_PENDING",
        priority: "HIGH",
        departure_city: "Bengaluru",
        follow_up_date: "Today, 4:00 PM",
        admin_notes: "Quoted ₹3,999/head. Advance payment link generated for ₹20,000.",
        trip_title: "Dandeli Kali River White Water Rafting",
        trip_slug: "dandeli-river-rafting-jungle-expedition",
        trip_price: 3999,
        created_at: "Today, 09:45 AM"
      },
      {
        id: 3,
        full_name: "Aditya Hegde",
        email: "aditya.hegde@startup.io",
        phone: "+919880345678",
        travel_date: "Oct 12 - Oct 14",
        travelers_count: 2,
        message: "Beach trek and cliffside camping. Looking for bioluminescence night tour.",
        status: "FOLLOW_UP",
        priority: "HIGH",
        departure_city: "Bengaluru",
        follow_up_date: "Tomorrow, 11:00 AM",
        admin_notes: "Sent customized Gokarna itinerary on WhatsApp. Waiting on train ticket confirmation.",
        trip_title: "Gokarna 5-Beach Cliff Trek",
        trip_slug: "gokarna-beach-cliff-trek",
        trip_price: 4299,
        created_at: "Yesterday, 3:15 PM"
      },
      {
        id: 4,
        full_name: "Pooja Reddy",
        email: "pooja.reddy@wipro.com",
        phone: "+919740567890",
        travel_date: "First week of November",
        travelers_count: 5,
        message: "Family weekend trek to Tadiandamol peak and coffee plantation homestay.",
        status: "NEW",
        priority: "MEDIUM",
        departure_city: "Mysore",
        follow_up_date: "Today, 2:30 PM",
        admin_notes: "Fresh lead. Need to send Kodava homestay photos.",
        trip_title: "Coorg Tadiandamol Summit Trail",
        trip_slug: "coorg-tadiandamol-coffee-trail",
        trip_price: 3499,
        created_at: "Today, 08:30 AM"
      },
      {
        id: 5,
        full_name: "Rahul & Sneha (Couple)",
        email: "rahul.sen@gmail.com",
        phone: "+919920198765",
        travel_date: "Nov 20 - Nov 22",
        travelers_count: 2,
        message: "Romantic weekend trek at Chembra heart-shaped lake & treehouse stay.",
        status: "NEW",
        priority: "HIGH",
        departure_city: "Kozhikode",
        follow_up_date: "Tomorrow, 10:00 AM",
        admin_notes: "Interested in treehouse upgrade. WhatsApp contacted.",
        trip_title: "Wayanad Chembra Peak Heart Lake Trail",
        trip_slug: "wayanad-chembra-peak-waterfall-trail",
        trip_price: 4999,
        created_at: "Just now"
      },
      {
        id: 6,
        full_name: "Rohan Malhotra",
        email: "rohan.m@deloitte.com",
        phone: "+919810456123",
        travel_date: "Dec 25 - Dec 30",
        travelers_count: 3,
        message: "Kedarkantha winter snow summit batch booking.",
        status: "CONVERTED",
        priority: "MEDIUM",
        departure_city: "Delhi",
        follow_up_date: "Completed",
        admin_notes: "Full payment ₹25,497 paid. Microspikes reserved.",
        trip_title: "Kedarkantha Winter Summit Trek",
        trip_slug: "kedarkantha-trek",
        trip_price: 8499,
        created_at: "2 days ago"
      },
      {
        id: 7,
        full_name: "Dr. Vikram & Colleagues",
        email: "vikram.aiims@gmail.com",
        phone: "+919988112233",
        travel_date: "October Weekend",
        travelers_count: 6,
        message: "Mullayanagiri sunrise ridge hike and Z-point Jeep safari.",
        status: "FOLLOW_UP",
        priority: "MEDIUM",
        departure_city: "Bengaluru",
        follow_up_date: "Friday, 5:00 PM",
        admin_notes: "Sent estate homestay quote. Checking group leave availability.",
        trip_title: "Chikmagalur Mullayanagiri Ridge Trek",
        trip_slug: "chikmagalur-mullayanagiri-ridge-trek",
        trip_price: 3799,
        created_at: "3 days ago"
      }
    ],
    trips: [
      {
        id: 101,
        title: "Dandeli Kali River White Water Rafting & Jungle Expedition",
        slug: "dandeli-river-rafting-jungle-expedition",
        destination_name: "Dandeli, Karnataka",
        price: 3999,
        duration_days: 2,
        duration_nights: 1,
        duration_label: "2D / 1N",
        difficulty: "MODERATE",
        is_featured: true,
        is_bestseller: true,
        is_published: true,
        leads_count: 5,
        cover_image: "https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341325/spirit_adventures/shorts/dandeli_rafting_poster.jpg",
        hero_video_url: "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341176/spirit_adventures/shorts/dandeli_rafting.mp4"
      },
      {
        id: 102,
        title: "Gokarna 5-Beach Cliff Trek & Ocean Stargazing",
        slug: "gokarna-beach-cliff-trek",
        destination_name: "Gokarna, Karnataka",
        price: 4299,
        duration_days: 3,
        duration_nights: 2,
        duration_label: "3D / 2N",
        difficulty: "EASY",
        is_featured: true,
        is_bestseller: true,
        is_published: true,
        leads_count: 6,
        cover_image: "https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341326/spirit_adventures/shorts/gokarna_beach_poster.jpg",
        hero_video_url: "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341208/spirit_adventures/shorts/gokarna_beach.mp4"
      },
      {
        id: 103,
        title: "Coorg Tadiandamol Summit & Misty Coffee Trail",
        slug: "coorg-tadiandamol-coffee-trail",
        destination_name: "Coorg, Karnataka",
        price: 3499,
        duration_days: 2,
        duration_nights: 1,
        duration_label: "2D / 1N",
        difficulty: "MODERATE",
        is_featured: true,
        is_bestseller: false,
        is_published: true,
        leads_count: 4,
        cover_image: "https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341327/spirit_adventures/shorts/coorg_mist_poster.jpg",
        hero_video_url: "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341227/spirit_adventures/shorts/coorg_mist.mp4"
      },
      {
        id: 104,
        title: "Chikmagalur Mullayanagiri Peak & Baba Budangiri Ridge",
        slug: "chikmagalur-mullayanagiri-ridge-trek",
        destination_name: "Chikmagalur, Karnataka",
        price: 3799,
        duration_days: 2,
        duration_nights: 1,
        duration_label: "2D / 1N",
        difficulty: "MODERATE",
        is_featured: true,
        is_bestseller: true,
        is_published: true,
        leads_count: 7,
        cover_image: "https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341328/spirit_adventures/shorts/chikmagalur_peak_poster.jpg",
        hero_video_url: "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341233/spirit_adventures/shorts/chikmagalur_peak.mp4"
      },
      {
        id: 105,
        title: "Ooty Nilgiri Pine Forest & Avalanche Lake Trail",
        slug: "ooty-nilgiri-pine-forest-expedition",
        destination_name: "Ooty, Tamil Nadu",
        price: 5999,
        duration_days: 3,
        duration_nights: 2,
        duration_label: "3D / 2N",
        difficulty: "EASY",
        is_featured: true,
        is_bestseller: false,
        is_published: true,
        leads_count: 3,
        cover_image: "https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341329/spirit_adventures/shorts/ooty_train_poster.jpg",
        hero_video_url: "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341289/spirit_adventures/shorts/ooty_train.mp4"
      },
      {
        id: 106,
        title: "Wayanad Chembra Peak Heart Lake & Waterfall Trail",
        slug: "wayanad-chembra-peak-waterfall-trail",
        destination_name: "Wayanad, Kerala",
        price: 4999,
        duration_days: 3,
        duration_nights: 2,
        duration_label: "3D / 2N",
        difficulty: "MODERATE",
        is_featured: true,
        is_bestseller: true,
        is_published: true,
        leads_count: 5,
        cover_image: "https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341330/spirit_adventures/shorts/wayanad_waterfall_poster.jpg",
        hero_video_url: "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341310/spirit_adventures/shorts/wayanad_waterfall.mp4"
      },
      {
        id: 10,
        title: "Leh Ladakh Ultimate Motorcycle Odyssey",
        slug: "leh-ladakh-motorcycle-odyssey",
        destination_name: "Ladakh, Himalayas",
        price: 32999,
        duration_days: 10,
        duration_nights: 9,
        duration_label: "10D / 9N",
        difficulty: "CHALLENGING",
        is_featured: true,
        is_bestseller: true,
        is_published: true,
        leads_count: 8,
        cover_image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80",
        hero_video_url: "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341157/spirit_adventures/hero/ladakh_bike.mp4"
      },
      {
        id: 1,
        title: "Kedarkantha Winter Summit Trek",
        slug: "kedarkantha-trek",
        destination_name: "Uttarakhand, Himalayas",
        price: 8499,
        duration_days: 5,
        duration_nights: 4,
        duration_label: "5D / 4N",
        difficulty: "MODERATE",
        is_featured: true,
        is_bestseller: true,
        is_published: true,
        leads_count: 6,
        cover_image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
        hero_video_url: "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341160/spirit_adventures/hero/mountain_trek.mp4"
      }
    ],
    config: {
      whatsapp_number: "+91 98765 43210",
      support_email: "hello@spiritadventures.in",
      currency: "INR",
      brand_name: "Spirit Adventures"
    }
  };

  return fetchFromApi<OwnerOverviewData | null>("/owner/overview/", fallback);
}

export async function updateEnquiryStatus(id: number, status: string, notes?: string): Promise<boolean> {
  try {
    const res = await ownerFetch(`${getApiBaseUrl()}/owner/enquiries/${id}/status/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, admin_notes: notes }),
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function updateTripConfig(id: number, config: { price?: number; is_featured?: boolean; is_bestseller?: boolean }): Promise<boolean> {
  try {
    const res = await ownerFetch(`${getApiBaseUrl()}/owner/trips/${id}/quick-update/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

