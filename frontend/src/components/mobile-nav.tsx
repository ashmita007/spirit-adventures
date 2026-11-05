"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home, MapPin, PhoneCall } from "lucide-react";
import { cn, isPortalPath } from "@/lib/utils";

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Hide on owner dashboard so it does not collide with admin tools
  const onTripPage = /^\/trips\/[^/]+/.test(pathname || "");
  if (isPortalPath(pathname)) {
    return null;
  }

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "Trips",
      href: "/trips",
      icon: Compass,
      isActive: pathname.startsWith("/trips"),
    },
    {
      label: "Destinations",
      href: "/destinations",
      icon: MapPin,
      isActive: pathname.startsWith("/destinations"),
    },
    {
      label: "Book / Contact",
      href: "/contact",
      icon: PhoneCall,
      isActive: pathname.startsWith("/contact"),
    },
  ];

  const wa = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+919666567551").replace(/\D/g, "");
  const waHref = `https://wa.me/${wa}?text=${encodeURIComponent("Hi Spirit Adventures! I want to know about upcoming trips.")}`;
  const [first, second, third, fourth] = navItems;

  const renderItem = (item: (typeof navItems)[number]) => {
    const Icon = item.icon;
    return (
      <Link
        key={item.label}
        href={item.href}
        aria-current={item.isActive ? "page" : undefined}
        className={cn(
          "relative flex flex-1 flex-col items-center justify-center min-h-[48px] rounded-xl transition-colors duration-200",
          item.isActive ? "text-brand-sky font-bold" : "text-slate-300 active:text-white"
        )}
      >
        {item.isActive && <span aria-hidden className="absolute -top-1 h-1 w-6 rounded-full bg-brand-sky" />}
        <Icon className={cn("w-5 h-5", item.isActive ? "stroke-[2.5]" : "stroke-[1.75]")} aria-hidden />
        <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className={cn("md:hidden fixed bottom-0 left-0 right-0 z-40 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pointer-events-none", onTripPage && "hidden")}>
      <nav aria-label="Main" className="pointer-events-auto max-w-md mx-auto bg-brand-navy/[0.97] border border-white/15 rounded-2xl shadow-2xl px-2 py-1.5 flex items-center">
        {renderItem(first)}
        {renderItem(second)}
        {/* WhatsApp: the main way customers reach us, so it gets the centre spot */}
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="flex flex-1 flex-col items-center justify-center min-h-[48px]"
        >
          <span className="-mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/40 ring-4 ring-brand-navy active:scale-95 transition">
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden>
              <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88a9.88 9.88 0 0 1 9.88 9.9c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.9 0-3.18-1.24-6.17-3.48-8.41" />
            </svg>
          </span>
          <span className="text-[10px] mt-0.5 tracking-tight text-[#6EE7A0] font-semibold">WhatsApp</span>
        </a>
        {renderItem(third)}
        {renderItem({ ...fourth, label: "Contact" })}
      </nav>
    </div>
  );
}
