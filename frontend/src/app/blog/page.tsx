import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Clock, BookOpen, ArrowRight, User } from "lucide-react";
import { getBlogs } from "@/lib/api";
import PageHero from "@/components/page-hero";

export const metadata: Metadata = {
  alternates: { canonical: "/blog" },
  title: "Wilderness Stories & Trekking Guides | Spirit Adventures",
  description: "Packing guides, trail notes and mountain advice from our certified trek leaders.",
};

export default async function BlogPage() {
  const blogs = await getBlogs();

  return (
    <div className="min-h-dvh bg-white pb-20">
      <PageHero
        eyebrow="Outdoor Journal"
        title="Stories & Trail Guides"
        subtitle={<>In-depth advice on gear prep, mountain weather, acclimatization, and stories from the high trails.</>}
        image="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=80"
        crumbs={[{ label: "Journal" }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogs.map((post) => (
            <article
              key={post.id}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition duration-300 flex flex-col justify-between"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                <Image
                  src={post.cover_image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-brand-navy text-[10px] font-bold shadow">
                    {post.category}
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-8 flex flex-col flex-grow justify-between">
                <div>
                  <div className="flex items-center space-x-3 text-xs text-slate-400 mb-3">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{post.reading_time_minutes} min read</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <User className="w-3.5 h-3.5" />
                      <span>{post.author}</span>
                    </span>
                  </div>

                  <Link href={`/blog/${post.slug}`} className="block group-hover:text-brand-ocean transition-colors">
                    <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-navy leading-snug">
                      {post.title}
                    </h2>
                  </Link>

                  <p className="mt-3 text-slate-600 text-sm leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wide text-brand-ocean hover:text-brand-navy transition group/link"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-4 h-4 group-link-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
