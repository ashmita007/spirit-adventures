export interface Destination {
  id: number;
  name: string;
  slug: string;
  subtitle?: string;
  description: string;
  cover_image: string;
  hero_image?: string;
  video_url?: string;
  is_featured: boolean;
  trip_count?: number;
  trips?: Trip[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description?: string;
}

export interface TripImage {
  id: number;
  image_url: string;
  caption?: string;
  ordering: number;
  is_cover: boolean;
}

export interface TripVideo {
  id: number;
  video_url: string;
  poster_image?: string;
  title?: string;
}

export interface TripItinerary {
  id: number;
  day_number: number;
  title: string;
  description: string;
  altitude?: string;
  distance?: string;
  meals?: string;
  stay_type?: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export interface Review {
  id: number;
  traveler_name: string;
  traveler_location?: string;
  avatar_url?: string;
  rating: number;
  review_text: string;
  travel_date?: string;
  is_verified: boolean;
  is_featured: boolean;
  trip_title?: string;
}

export interface Trip {
  id: number;
  title: string;
  slug: string;
  destination_name?: string;
  destination_slug?: string;
  destination?: Destination;
  category_name?: string | null;
  category_slug?: string | null;
  category?: Category | null;
  short_description: string;
  full_description?: string;
  duration_days: number;
  duration_nights: number;
  duration_label: string;
  difficulty: "EASY" | "MODERATE" | "CHALLENGING" | "DIFFICULT";
  price: number;
  original_price?: number | null;
  pickup_location?: string;
  drop_location?: string;
  altitude?: string;
  trek_distance?: string;
  best_season?: string;
  cover_image: string;
  hero_video_url?: string;
  inclusions?: string[];
  exclusions?: string[];
  things_to_carry?: string[];
  is_featured: boolean;
  is_bestseller: boolean;
  rating?: number;
  reviews_count?: number;
  gallery_images?: TripImage[];
  videos?: TripVideo[];
  itinerary_days?: TripItinerary[];
  faqs?: FAQ[];
  reviews?: Review[];
  meta_title?: string;
  meta_description?: string;
}

export interface GalleryImage {
  /** Gallery items use a number; photos taken from trips use "cover-<id>" / "photo-<id>". */
  id: number | string;
  title: string;
  category: string;
  image_url: string;
  caption?: string;
  location?: string;
  is_featured?: boolean;
  /** Set on photos that come from a trip, so the gallery can link to it. */
  trip_slug?: string;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio?: string;
  photo_url?: string;
  city?: string;
  experience?: string;
  instagram_url?: string;
  linkedin_url?: string;
  is_lead: boolean;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  cover_image: string;
  author: string;
  category: string;
  reading_time_minutes: number;
  published_at: string;
  meta_title?: string;
  meta_description?: string;
}

export interface EnquiryPayload {
  trip_id?: number;
  trip_slug?: string;
  full_name: string;
  email?: string;
  phone: string;
  travel_date?: string;
  travelers_count?: number;
  message?: string;
}

/** Landing page sections the owner can hide (Owner HQ → Landing page). */
export const HOME_SECTIONS = [
  { key: "offers", label: "Offers and events" },
  { key: "packages", label: "Trip packages" },
  { key: "destinations", label: "Moving destinations band" },
  { key: "how", label: "How a trip works" },
  { key: "quote", label: "Mountain quote with film" },
  { key: "why", label: "Why travel with us" },
  { key: "reviews", label: "Reviews" },
  { key: "gallery", label: "Moments gallery and reels" },
  { key: "maps", label: "Office maps" },
  { key: "social", label: "Instagram and YouTube" },
] as const;

export type HomeSectionKey = (typeof HOME_SECTIONS)[number]["key"];

export interface HeroVideo {
  video_url: string;
  poster_url: string;
}

/** Owner-editable landing page content. Empty values mean "use the built-in default". */
export interface SiteContent {
  instagram_url: string;
  youtube_url: string;
  hero_words: string[];
  hero_subtitle: string;
  hero_videos: HeroVideo[];
  home_trip_ids: number[];
  quote_image_url: string;
  cta_image_url: string;
  hidden_sections: HomeSectionKey[];
}

