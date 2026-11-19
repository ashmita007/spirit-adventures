"use client";

import React, { useState, useEffect } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Heart, Phone, Compass, Mountain, MapPin, Image as ImageIcon, BookOpen, MessageCircle, Gift } from "lucide-react";
import { cn, isPortalPath } from "@/lib/utils";
import { whatsappUrl, pageMessage } from "@/lib/whatsapp";
import { PHONES } from "@/lib/offices";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  // Pages that open with a full-bleed photo hero: navbar starts transparent
  const hasHero = isHomePage || ["/trips", "/destinations", "/about", "/contact", "/gallery", "/blog", "/offers"].includes(pathname);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Do not render the public navbar inside the owner portal or CRM (after all hooks)
  if (isPortalPath(pathname)) {
    return null;
  }

  const navLinks = [
    { name: "Explore Packages", href: "/trips", icon: Mountain },
    { name: "Offers", href: "/offers", icon: Gift },
    { name: "Gallery", href: "/gallery", icon: ImageIcon },
    { name: "About Us", href: "/about", icon: Compass },
    { name: "Stories", href: "/blog", icon: BookOpen },
    { name: "Contact", href: "/contact", icon: Phone },
  ];

  // Dynamic header styles based on scroll state and page
  const headerBgClass = hasHero
    ? isScrolled
      ? "bg-brand-navy/[0.97] shadow-md text-white py-3.5 border-b border-white/10"
      : "bg-gradient-to-b from-black/80 via-black/30 to-transparent text-white py-4"
    : "bg-brand-navy/[0.97] shadow-md text-white py-3.5 border-b border-white/10";

  const isLightText = true;

  return (
    <>
      <header
        className={cn(
          "fixed top-[var(--festive-h,0px)] left-0 right-0 z-50 transition duration-300",
          headerBgClass
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Left: Mobile Hamburger Button & Official Logo */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open Navigation Menu"
                aria-expanded={mobileMenuOpen}
                className="md:hidden p-2 rounded-xl text-white hover:bg-white/10 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>

              <NextLink href="/" aria-label="Spirit Adventures home" className="flex items-center group">
                <div className="bg-white px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl shadow-xs border border-white/30 flex items-center justify-center transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-2">
                  <img
                    src="/images/logo.png"
                    alt="Spirit Adventures"
                    width={564}
                    height={149}
                    fetchPriority="high"
                    className="h-7 sm:h-8 w-auto object-contain"
                  />
                </div>
              </NextLink>
            </div>

            {/* Center Desktop Links */}
            <nav className="hidden lg:flex items-center space-x-1 bg-white/10 backdrop-blur-md p-1.5 rounded-full border border-white/15">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <NextLink
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "text-xs font-semibold px-4 py-1.5 rounded-full transition duration-200 flex items-center space-x-1.5",
                      isActive
                        ? "bg-brand-ocean text-white shadow-md font-bold"
                        : "text-white/90 hover:text-white hover:bg-white/15"
                    )}
                  >
                    <span>{link.name}</span>
                  </NextLink>
                );
              })}
            </nav>

            {/* Right: both office numbers, labelled by city */}
            <div className="flex items-center">
              <div className="hidden sm:flex flex-col rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1.5 shadow-md">
                {PHONES.map((ph) => (
                  <a
                    key={ph.tel}
                    href={`tel:${ph.tel}`}
                    aria-label={`Call ${ph.city} office ${ph.display}`}
                    className="group flex items-center gap-2 leading-tight py-0.5 text-white"
                  >
                    <Phone className="w-3 h-3 text-brand-sky" aria-hidden="true" />
                    <span className="w-[62px] text-[10px] font-bold uppercase tracking-wider text-white/70 group-hover:text-white">{ph.city}</span>
                    <span className="text-xs font-bold tabular-nums group-hover:text-brand-sky transition-colors">{ph.display}</span>
                  </a>
                ))}
              </div>

              {/* Phones: one call chip per city */}
              <div className="flex sm:hidden items-center gap-1.5">
                {PHONES.map((ph) => (
                  <a
                    key={ph.tel}
                    href={`tel:${ph.tel}`}
                    aria-label={`Call ${ph.city} office ${ph.display}`}
                    className="flex items-center gap-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white active:scale-95 transition"
                  >
                    <Phone className="w-3 h-3 text-brand-sky" aria-hidden="true" />
                    <span>{ph.city === "Bengaluru" ? "BLR" : ph.city === "Hyderabad" ? "HYD" : ph.city.slice(0, 3)}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between p-6 z-10 animate-fade-in">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <NextLink href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center">
                  <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center">
                    <img src="/images/logo.png" alt="Spirit Adventures" className="h-7 w-auto object-contain" />
                  </div>
                </NextLink>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                  aria-label="Close Navigation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-6 flex flex-col space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <NextLink
                      key={link.name}
                      href={link.href}
                      className={cn(
                        "flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors",
                        isActive
                          ? "bg-brand-light text-brand-ocean font-semibold"
                          : "text-slate-700 hover:bg-slate-50 hover:text-brand-navy"
                      )}
                    >
                      <Icon className={cn("w-5 h-5", isActive ? "text-brand-ocean" : "text-slate-400")} />
                      <span>{link.name}</span>
                    </NextLink>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-3">
              <a
                href={whatsappUrl(pageMessage(pathname))}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 w-full py-3 px-4 rounded-xl bg-emerald-600 text-white font-medium text-sm shadow-sm hover:bg-emerald-700 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Expert</span>
              </a>

              {PHONES.map((ph) => (
                <a
                  key={ph.tel}
                  href={`tel:${ph.tel}`}
                  className="flex items-center justify-center space-x-2 w-full py-3 px-4 rounded-xl border border-slate-200 text-brand-navy font-medium text-sm hover:bg-slate-50 transition"
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-slate-500 text-xs font-bold uppercase">{ph.city}</span>
                  <span>{ph.display}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
