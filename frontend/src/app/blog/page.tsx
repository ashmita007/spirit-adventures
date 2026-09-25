import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Clock, BookOpen, ArrowRight, User } from "lucide-react";
import { getBlogs } from "@/lib/api";

export const metadata: Metadata = {
  title: "Wilderness Stories & Trekking Guides | Spirit Adventures",
  description: "Read expert packing guides, mountain philosophies, trail reflections, and outdoor knowledge from certified trek leaders.",
};

export default async function BlogPage() {
  const blogs = await getBlogs();

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="bg-brand-light border-b border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-brand-ocean block mb-2">
            Outdoor Journal
          </span>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-brand-navy uppercase tracking-tight">
            Stories & Trail Guides
          </h1>
          <p className="mt-3 text-slate-600 text-sm sm:text-base max-w-2xl">
            In-depth advice on gear prep, mountain weather, acclimatization, and stories from the high trails.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogs.map((post) => (
            <article
              key={post.id}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
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
                  <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-brand-navy text-[10px] font-bold uppercase tracking-wider shadow">
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
                    className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-brand-ocean hover:text-brand-navy transition group/link"
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
