"use client";

import React, { useState, useEffect } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Heart, Phone, Compass, Mountain, MapPin, Image as ImageIcon, BookOpen, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  // Do not render consumer website navbar on the owner operations portal
  if (pathname?.startsWith("/owner")) {
    return null;
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Explore Packages", href: "/trips", icon: Mountain },
    { name: "Gallery", href: "/gallery", icon: ImageIcon },
    { name: "About Us", href: "/about", icon: Compass },
    { name: "Stories", href: "/blog", icon: BookOpen },
    { name: "Contact", href: "/contact", icon: Phone },
  ];

  // Dynamic header styles based on scroll state and page
  const headerBgClass = isHomePage
    ? isScrolled
      ? "bg-brand-navy/95 backdrop-blur-md shadow-md text-white py-3.5 border-b border-white/10"
      : "bg-gradient-to-b from-black/80 via-black/30 to-transparent text-white py-4"
    : "bg-brand-navy/95 backdrop-blur-md shadow-md text-white py-3.5 border-b border-white/10";

  const isLightText = true;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
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
                className="md:hidden p-2 rounded-xl text-white hover:bg-white/10 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>

              <NextLink href="/" className="flex items-center group">
                <div className="bg-white px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl shadow-xs border border-white/30 flex items-center justify-center transition-transform group-hover:scale-105">
                  <img
                    src="/images/logo.png"
                    alt="Spirit Adventures"
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
                      "text-xs font-semibold px-4 py-1.5 rounded-full transition-all duration-200 flex items-center space-x-1.5",
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

            {/* Right: Direct Call Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <a
                href="tel:+919666567551"
                className="hidden sm:inline-flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-md bg-brand-ocean hover:bg-brand-ocean-light text-white hover:scale-105 active:scale-95"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>966 656 7551</span>
              </a>

              {/* Quick phone icon on mobile */}
              <a
                href="tel:+919666567551"
                aria-label="Call Adventure Desk"
                className="sm:hidden p-2 rounded-full text-brand-sky hover:bg-white/10 transition-colors"
              >
                <Phone className="w-5 h-5" />
              </a>
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
                href="https://wa.me/919666567551?text=Hi%20Spirit%20Adventures%2C%20I%20would%20like%20to%20know%20more%20about%20your%20upcoming%20trips."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 w-full py-3 px-4 rounded-xl bg-emerald-600 text-white font-medium text-sm shadow-sm hover:bg-emerald-700 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Expert</span>
              </a>

              <a
                href="tel:+919666567551"
                className="flex items-center justify-center space-x-2 w-full py-3 px-4 rounded-xl border border-slate-200 text-brand-navy font-medium text-sm hover:bg-slate-50 transition"
              >
                <Phone className="w-4 h-4" />
                <span>+91 96665 67551</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
