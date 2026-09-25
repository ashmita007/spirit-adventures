import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, User, Calendar, Compass, Share2 } from "lucide-react";
import { getBlogBySlug, getBlogs } from "@/lib/api";

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);
  if (!post) {
    return { title: "Story Not Found | Spirit Adventures" };
  }
  return {
    title: `${post.title} | Spirit Adventures`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.cover_image }],
    },
  };
}

export default async function BlogPostDetailPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="min-h-screen bg-white pt-24 pb-20">
      {/* Article Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link
          href="/blog"
          className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-brand-ocean hover:text-brand-navy transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Stories</span>
        </Link>

        <div className="space-y-4">
          <span className="px-3 py-1 rounded-full bg-brand-light text-brand-ocean text-xs font-bold uppercase tracking-wider border border-brand-ocean/20 inline-block">
            {post.category}
          </span>

          <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-brand-navy uppercase tracking-tight leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-b border-slate-100 pb-6">
            <span className="flex items-center space-x-1.5">
              <User className="w-4 h-4 text-brand-ocean" />
              <span className="font-medium text-slate-700">{post.author}</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-brand-ocean" />
              <span>{post.reading_time_minutes} min read</span>
            </span>
          </div>
        </div>
      </div>

      {/* Featured Banner */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden shadow-lg bg-slate-100">
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="object-cover object-center"
          />
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="prose prose-slate lg:prose-lg max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:text-brand-navy prose-p:text-slate-700 prose-p:leading-relaxed whitespace-pre-line">
          {post.content || post.excerpt}
        </div>

        {/* Footer CTA Box */}
        <div className="mt-16 p-8 rounded-3xl bg-brand-light border border-slate-200/80 text-center space-y-4">
          <h3 className="font-display font-bold text-xl text-brand-navy">
            Ready to experience this firsthand?
          </h3>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            Join a small, mindful group of adventurers on our upcoming Himalayan and Sahyadri departures.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link
              href="/trips"
              className="px-6 py-3 rounded-full bg-brand-ocean hover:bg-brand-ocean-light text-white text-xs font-bold uppercase tracking-wider transition shadow-md"
            >
              Browse Upcoming Treks
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
