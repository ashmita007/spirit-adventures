import React from "react";
import { Metadata } from "next";
import { getGallery } from "@/lib/api";
import GalleryClient from "./gallery-client";

export const metadata: Metadata = {
  title: "Nature Photography & Visual Archive | Spirit Adventures",
  description: "Browse high-resolution photographs of Himalayan peaks, alpine lakes, stargazing campsites, and coastal headlands.",
};

export default async function GalleryPage() {
  const images = await getGallery();

  return (
    <div className="min-h-screen bg-brand-light/40 pt-24 pb-20">
      <div className="bg-brand-light border-b border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-brand-ocean block mb-2">
            Visual Storytelling
          </span>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-brand-navy uppercase tracking-tight">
            Nature Gallery
          </h1>
          <p className="mt-3 text-slate-600 text-sm sm:text-base max-w-2xl">
            A window into the raw stillness and towering grandeur of the Indian wilderness captured across our expeditions.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <GalleryClient initialImages={images} />
      </div>
    </div>
  );
}
