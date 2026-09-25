export interface Destination {
  id: number;
  name: string;
  slug: string;
  subtitle?: string;
  description: string;
  cover_image: string;
  hero_image?: string;
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
  id: number;
  title: string;
  category: string;
  image_url: string;
  caption?: string;
  location?: string;
  is_featured: boolean;
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
  email: string;
  phone: string;
  travel_date?: string;
  travelers_count?: number;
  message?: string;
}
