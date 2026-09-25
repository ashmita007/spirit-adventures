import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Star, Clock, MapPin, Mountain, ArrowLeft, Check, X as XIcon, 
  Calendar, ShieldCheck, Backpack, HelpCircle, MessageCircle, Play
} from "lucide-react";
import { getTripBySlug, getTrips } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import TripDetailClient from "./trip-detail-client";

interface TripPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TripPageProps): Promise<Metadata> {
  const { slug } = await params;
  const trip = await getTripBySlug(slug);
  if (!trip) {
    return { title: "Trip Not Found | Spirit Adventures" };
  }
  return {
    title: `${trip.title} | Spirit Adventures`,
    description: trip.short_description,
    openGraph: {
      title: `${trip.title} - Spirit Adventures`,
      description: trip.short_description,
      images: [{ url: trip.cover_image }],
    },
  };
}

export default async function TripDetailPage({ params }: TripPageProps) {
  const { slug } = await params;
  const trip = await getTripBySlug(slug);

  if (!trip) {
    notFound();
  }

  return <TripDetailClient trip={trip} />;
}
