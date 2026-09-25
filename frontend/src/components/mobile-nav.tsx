"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home, MapPin, PhoneCall } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Hide on owner dashboard so it does not collide with admin tools
  if (pathname?.startsWith("/owner")) {
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

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-2 pointer-events-none">
      <nav className="pointer-events-auto max-w-md mx-auto bg-brand-navy/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl px-3 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 min-w-[56px]",
                item.isActive
                  ? "text-brand-sky scale-105 font-bold"
                  : "text-slate-300 hover:text-white"
              )}
            >
              <Icon className={cn("w-5 h-5", item.isActive ? "stroke-[2.5]" : "stroke-[1.75]")} />
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
