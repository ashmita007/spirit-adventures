import React from "react";
import { Metadata } from "next";
import { getGallery } from "@/lib/api";
import GalleryClient from "./gallery-client";
import PageHero from "@/components/page-hero";

export const metadata: Metadata = {
  alternates: { canonical: "/gallery" },
  title: "Nature Photography & Visual Archive | Spirit Adventures",
  description: "Browse high-resolution photographs of Himalayan peaks, alpine lakes, stargazing campsites, and coastal headlands.",
};

export default async function GalleryPage() {
  const images = await getGallery();

  return (
    <div className="min-h-screen bg-[#F7FBFE] pb-20">
      <PageHero
        eyebrow="Visual Storytelling"
        title="Nature Gallery"
        subtitle={<>A window into the raw stillness and towering grandeur of the Indian wilderness captured across our expeditions.</>}
        image="https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341330/spirit_adventures/shorts/wayanad_waterfall_poster.jpg"
        crumbs={[{ label: "Gallery" }]}
        edge="text-[#F7FBFE]"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <GalleryClient initialImages={images} />
      </div>
    </div>
  );
}
