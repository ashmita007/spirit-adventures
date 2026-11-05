import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

/**
 * Cinematic header for inner pages: photo + navy gradient, breadcrumb,
 * GSAP word-rise title (data-anim="heading"), and a mountain-ridge edge that
 * melts into the page. The photo zooms out gently as you scroll (data-hero-bg).
 */
export interface PageHeroProps {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  image: string;
  crumbs?: { label: string; href?: string }[];
  align?: "left" | "center";
  children?: React.ReactNode;
  /** Text colour class matching the section below, so the ridge blends in. */
  edge?: string;
}

export default function PageHero({
  eyebrow,
  title,
  subtitle,
  image,
  crumbs = [],
  align = "left",
  children,
  edge = "text-white",
}: PageHeroProps) {
  const center = align === "center";
  return (
    <section className="relative isolate overflow-hidden bg-brand-navy text-white">
      <div data-hero-bg className="absolute inset-0 -z-10 will-change-transform">
        <Image src={image} alt="" fill priority sizes="100vw" className="object-cover object-center" />
      </div>
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-navy/85 via-brand-navy/55 to-brand-navy/90" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(56,189,248,0.25),transparent_55%)]" />

      <div
        className={`relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 pb-20 sm:pb-28 ${
          center ? "text-center" : ""
        }`}
      >
        <nav aria-label="Breadcrumb" className={`mb-5 flex items-center gap-1.5 text-[11px] font-semibold text-sky-100/80 ${center ? "justify-center" : ""}`}>
          <Link href="/" className="hover:text-white transition">Home</Link>
          {crumbs.map((c) => (
            <span key={c.label} className="flex items-center gap-1.5">
              <ChevronRight className="h-3 w-3 opacity-60" aria-hidden />
              {c.href ? (
                <Link href={c.href} className="hover:text-white transition">{c.label}</Link>
              ) : (
                <span aria-current="page" className="text-white">{c.label}</span>
              )}
            </span>
          ))}
        </nav>

        <span
          data-anim="fade-up"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-sky-200"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-brand-sky" aria-hidden />
          {eyebrow}
        </span>

        <h1
          data-anim="heading"
          className={`[perspective:800px] mt-4 font-display font-black uppercase tracking-tight leading-[0.95] text-[2.4rem] sm:text-6xl lg:text-7xl ${
            center ? "mx-auto max-w-4xl" : "max-w-4xl"
          }`}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            data-anim="fade-up"
            className={`mt-5 text-sm sm:text-lg text-sky-50/85 leading-relaxed ${center ? "mx-auto max-w-2xl" : "max-w-2xl"}`}
          >
            {subtitle}
          </p>
        )}

        {children && <div data-anim="fade-up" className={`mt-8 ${center ? "flex justify-center" : ""}`}>{children}</div>}
      </div>

      {/* Mountain ridge edge into the page */}
      <svg aria-hidden className={`absolute inset-x-0 -bottom-px h-10 sm:h-16 w-full ${edge}`} viewBox="0 0 1440 80" preserveAspectRatio="none">
        <path
          fill="currentColor"
          d="M0 80V52l120-22 110 18 150-38 140 30 120-16 170 34 150-30 130 20 150-36 200 40V80Z"
        />
      </svg>
    </section>
  );
}
