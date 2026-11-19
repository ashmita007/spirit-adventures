"use client";
import { isPortalPath } from "@/lib/utils";

import React from "react";
import Link from "next/link";
import { OFFICES, PHONES, mapOpenUrl, mapEmbedUrl } from "@/lib/offices";
import { usePathname } from "next/navigation";
import { Compass, Instagram, Youtube, MessageCircle, Mail, Phone, MapPin } from "lucide-react";
import { whatsappUrl, pageMessage } from "@/lib/whatsapp";
import { socialLinks, type SocialLinks } from "@/lib/social";
import FooterWordmark from "@/components/footer-wordmark";

const POPULAR = [
  { slug: "3d-2n-gokarna-dandeli", label: "Gokarna & Dandeli (3D 2N)" },
  { slug: "2d-1n-coorg", label: "Coorg weekend (2D 1N)" },
  { slug: "4d-3n-munnar-alleppey", label: "Munnar & Alleppey (4D 3N)" },
  { slug: "4d-3n-manali", label: "Manali (4D 3N)" },
  { slug: "5d-4n-kashmir", label: "Kashmir (5D 4N)" },
  { slug: "gokarna-dandeli-couple-package", label: "Gokarna–Dandeli couple package" },
];

export default function Footer({ social = socialLinks() }: { social?: SocialLinks }) {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (isPortalPath(pathname)) {
    return null;
  }

  return (
    <footer className="bg-brand-navy text-white pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center group">
              <div className="bg-white px-4 py-2 rounded-xl shadow-xs border border-white/20 flex items-center justify-center transition-transform group-hover:scale-105">
                <img src="/images/logo.png" alt="Spirit Adventures" width={564} height={149} loading="lazy" className="h-8 w-auto object-contain" />
              </div>
            </Link>

            <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
              Group treks, weekend getaways and Himalayan trips from Hyderabad, Bengaluru and Chennai.
            </p>

            <div className="pt-2 flex items-center space-x-3">
              <a
                href={social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-brand-ocean text-white flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-brand-ocean text-white flex items-center justify-center transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href={whatsappUrl(pageMessage(pathname))}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Popular packages (real trips only) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-brand-sky">Popular packages</h4>
            <ul className="space-y-0 sm:space-y-2 text-sm text-slate-300 [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center sm:[&_a]:min-h-0">
              {POPULAR.map((t) => (
                <li key={t.slug}>
                  <Link href={`/trips/${t.slug}`} className="sa-underline hover:text-white">{t.label}</Link>
                </li>
              ))}
              <li><Link href="/trips" className="sa-underline text-brand-sky hover:text-white">All packages →</Link></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-brand-sky">Official HQ</h4>
            <ul className="space-y-0 sm:space-y-2.5 text-sm text-slate-300 [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center sm:[&_a]:min-h-0">
              {PHONES.map((ph) => (
                <li key={ph.city} className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-brand-sky flex-shrink-0" />
                  <a href={`tel:${ph.tel}`} className="sa-underline hover:text-white">
                    <span className="text-xs text-slate-400">{ph.city}:</span> {ph.display}
                  </a>
                </li>
              ))}
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-brand-sky flex-shrink-0" />
                <a href="mailto:info@spiritadventures.in" className="sa-underline hover:text-white">info@spiritadventures.in</a>
              </li>
              {OFFICES.map((o) => (
                <li key={o.city} className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-brand-sky flex-shrink-0 mt-0.5" />
                  <a href={mapOpenUrl(o)} target="_blank" rel="noopener noreferrer" className="hover:text-white text-xs leading-relaxed">
                    <span className="font-semibold">{o.city}:</span> {o.short}
                  </a>
                </li>
              ))}
              <li className="pt-2">
                <Link
                  href="/contact"
                  className="inline-block text-xs uppercase font-semibold tracking-wide text-brand-sky hover:underline"
                >
                  Plan a custom trip
                </Link>
              </li>
            </ul>
          </div>

          {/* Office maps */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-brand-sky">Find us</h4>
            <div className="grid grid-cols-1 gap-3">
              {OFFICES.map((o) => (
                <a
                  key={`${o.city}-map`}
                  href={mapOpenUrl(o)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block overflow-hidden rounded-xl border border-white/10 bg-white/5 hover:border-brand-sky/60 transition"
                  aria-label={`Open the ${o.city} office in Google Maps`}
                >
                  <div className="relative h-32 w-full">
                    <iframe
                      title={`Map of the Spirit Adventures ${o.city} office`}
                      src={mapEmbedUrl(o)}
                      loading="lazy"
                      tabIndex={-1}
                      referrerPolicy="no-referrer-when-downgrade"
                      className="pointer-events-none absolute inset-0 h-full w-full border-0"
                    />
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 text-xs">
                    <span className="font-semibold text-white">{o.city} office</span>
                    <span className="text-brand-sky group-hover:underline">Directions →</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        <FooterWordmark />

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 space-y-4 sm:space-y-0">
          <div className="flex flex-col items-center sm:items-start gap-1.5 text-center sm:text-left">
            <p>© {currentYear} Spirit Adventures (spiritadventures.in). All rights reserved.</p>
            <a
              href="https://kashiiupdatez.online/"
              target="_blank"
              rel="noopener"
              className="hover:text-white transition underline-offset-4 hover:underline"
            >
              Designed &amp; developed by updatezbykashi
            </a>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/gallery" className="hover:text-white transition">Gallery</Link>
            <Link href="/blog" className="hover:text-white transition">Stories</Link>
            <Link href="/about" className="hover:text-white transition">About & Safety</Link>
            <Link href="/contact" className="hover:text-white transition">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
