import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Star, Clock, MapPin, Mountain, ArrowLeft, Check, X as XIcon, 
  Calendar, ShieldCheck, Backpack, HelpCircle, MessageCircle, Play
} from "lucide-react";
import { getTripBySlug, getTrips, getReviews } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import TripDetailClient from "./trip-detail-client";
import JsonLd from "@/components/json-ld";
import { tripJsonLd, breadcrumbJsonLd } from "@/lib/seo";

interface TripPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TripPageProps): Promise<Metadata> {
  const { slug } = await params;
  const trip = await getTripBySlug(slug);
  if (!trip) {
    return { title: "Trip Not Found | Spirit Adventures" };
  }
  const t = trip as typeof trip & { meta_title?: string; meta_description?: string };
  const title = t.meta_title || `${trip.title} | ${trip.duration_label || "Trip"} from ₹${Math.round(Number(trip.price)).toLocaleString("en-IN")} | Spirit Adventures`;
  const description = t.meta_description || trip.short_description;
  return {
    title,
    description,
    alternates: { canonical: `/trips/${trip.slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/trips/${trip.slug}`,
      images: trip.cover_image ? [{ url: trip.cover_image, width: 1200, height: 630, alt: trip.title }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: trip.cover_image ? [trip.cover_image] : undefined },
  };
}

export default async function TripDetailPage({ params }: TripPageProps) {
  const { slug } = await params;
  const trip = await getTripBySlug(slug);

  if (!trip) {
    notFound();
  }

  // Similar adventures: same destination or category first, then featured trips
  const [allTrips, siteReviews] = await Promise.all([getTrips(), getReviews(true)]);
  const others = allTrips.filter((t) => t.slug !== trip.slug);
  const dest = trip.destination_slug || trip.destination?.slug;
  const cat = trip.category_slug || trip.category?.slug;
  const score = (t: (typeof others)[number]) =>
    ((t.destination_slug || t.destination?.slug) === dest ? 2 : 0) +
    ((t.category_slug || t.category?.slug) === cat ? 1 : 0) +
    (t.is_featured ? 0.5 : 0);
  const similar = [...others].sort((a, b) => score(b) - score(a)).slice(0, 3);
  const reviews = (trip.reviews && trip.reviews.length > 0 ? trip.reviews : siteReviews).slice(0, 3);

  return (
    <>
      <JsonLd
        data={[
          tripJsonLd(trip),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Trips", path: "/trips" },
            { name: trip.title, path: `/trips/${trip.slug}` },
          ]),
        ]}
      />
      <TripDetailClient trip={trip} similar={similar} reviews={reviews} />
    </>
  );
}
