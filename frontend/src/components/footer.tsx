"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Instagram, Youtube, MessageCircle, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname?.startsWith("/owner")) {
    return null;
  }

  return (
    <footer className="bg-brand-navy text-white pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center group">
              <div className="bg-white px-4 py-2 rounded-xl shadow-xs border border-white/20 flex items-center justify-center transition-transform group-hover:scale-105">
                <img src="/images/logo.png" alt="Spirit Adventures Logo" className="h-8 w-auto object-contain" />
              </div>
            </Link>

            <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
              Mindfully crafted group adventures, weekend getaways, and high-altitude Himalayan expeditions. 
              Safe, authentic, and rooted in nature.
            </p>

            <div className="pt-2 flex items-center space-x-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-brand-ocean text-white flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-brand-ocean text-white flex items-center justify-center transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/919666567551"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Expeditions & Treks */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-sky">Expeditions</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><Link href="/trips?category=snow" className="hover:text-white transition">Kedarkantha Winter Snow Trek</Link></li>
              <li><Link href="/trips?category=water" className="hover:text-white transition">Dandeli White Water Rafting</Link></li>
              <li><Link href="/trips?category=water" className="hover:text-white transition">Gokarna 5-Beach Cliff Trek</Link></li>
              <li><Link href="/trips?category=group-trips" className="hover:text-white transition">Leh Ladakh Royal Enfield Ride</Link></li>
              <li><Link href="/gallery" className="hover:text-white transition">Nature Photo Gallery</Link></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-sky">Official HQ</h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-brand-sky flex-shrink-0" />
                <a href="tel:+919666567551" className="hover:text-white">+91 96665 67551</a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-brand-sky flex-shrink-0" />
                <a href="mailto:info@spiritadventures.in" className="hover:text-white">info@spiritadventures.in</a>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-brand-sky flex-shrink-0 mt-0.5" />
                <a 
                  href="https://maps.app.goo.gl/4N6qZD9KAyb6pBA19" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white text-xs leading-relaxed"
                >
                  Vasantha Sai Apts, Opp. Rishi Towers, KPHB, Kukatpally, Hyderabad - 500085
                </a>
              </li>
              <li className="pt-2">
                <Link
                  href="/contact"
                  className="inline-block text-xs uppercase font-semibold tracking-wider text-brand-sky hover:underline"
                >
                  Plan A Custom Journey →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 space-y-4 sm:space-y-0">
          <p>© {currentYear} Spirit Adventures (spiritadventures.in). All rights reserved.</p>
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
