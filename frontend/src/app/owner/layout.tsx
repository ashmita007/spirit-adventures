"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Users, Mountain, BarChart3, Settings, 
  Compass, Eye, ExternalLink, Menu, X, CheckCircle2, ChevronRight,
  ShieldCheck, PhoneCall, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    {
      name: "Dashboard Overview",
      href: "/owner",
      icon: LayoutDashboard,
      exact: true,
      badge: "Live",
    },
    {
      name: "Customer Leads & CRM",
      href: "/owner/leads",
      icon: Users,
      exact: false,
      badge: "10+",
    },
    {
      name: "Day-Wise Itinerary Studio",
      href: "/owner/packages",
      icon: Mountain,
      exact: false,
      badge: "8 Trips",
    },
    {
      name: "Destination Breakdown",
      href: "/owner/analytics",
      icon: BarChart3,
      exact: false,
    },
    {
      name: "Google Reviews & Settings",
      href: "/owner/settings",
      icon: Settings,
      exact: false,
    },
  ];

  const isLinkActive = (item: typeof navigation[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-brand-ocean selection:text-white flex">
      {/* 1. DESKTOP PERMANENT SIDEBAR (CLEAN WHITE) */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 flex-shrink-0 justify-between shadow-xs">
        <div>
          {/* Brand Header with Official Logo */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <Link href="/owner" className="flex items-center">
              <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center">
                <img src="/images/logo.png" alt="Spirit Adventures Logo" className="h-7 w-auto object-contain" />
              </div>
            </Link>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[9px] font-bold uppercase tracking-wider text-slate-600 border border-slate-200">
              HQ
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1.5">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Management Modules
            </div>

            {navigation.map((item) => {
              const active = isLinkActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group",
                    active
                      ? "bg-brand-ocean text-white shadow-md shadow-brand-ocean/20 font-black"
                      : "text-slate-600 hover:text-brand-navy hover:bg-slate-100/80"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={cn("w-4 h-4 transition group-hover:scale-110", active ? "text-white" : "text-slate-400 group-hover:text-brand-ocean")} />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold",
                      active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600 border border-slate-200/60"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Quick Links */}
        <div className="p-4 border-t border-slate-100 space-y-2 bg-slate-50/50">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition border border-slate-200 shadow-2xs"
          >
            <div className="flex items-center space-x-2">
              <Eye className="w-3.5 h-3.5 text-brand-ocean" />
              <span>Consumer Site</span>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <a
            href="http://localhost:8000/admin/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold transition border border-slate-200 shadow-2xs"
          >
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Django Admin DB</span>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </aside>

      {/* 2. MOBILE SIDEBAR DRAWER */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 bg-white h-full shadow-2xl flex flex-col justify-between p-4 z-10 animate-fade-in border-r border-slate-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <Link href="/owner" onClick={() => setSidebarOpen(false)} className="flex items-center">
                  <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center">
                    <img src="/images/logo.png" alt="Spirit Adventures Logo" className="h-7 w-auto object-contain" />
                  </div>
                </Link>
                <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="mt-4 space-y-1.5">
                {navigation.map((item) => {
                  const active = isLinkActive(item);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition",
                        active ? "bg-brand-ocean text-white font-black" : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-bold border border-slate-200">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <Link href="/" target="_blank" className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 text-xs font-semibold text-slate-700 border border-slate-200">
                <span>View Public Site</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN CONTENT CONTAINER (WHITE CANVAS) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-xs">
              <span className="font-bold text-slate-400">Owner HQ</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="font-extrabold text-brand-navy">
                {navigation.find(n => isLinkActive(n))?.name || "Overview"}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Systems Online</span>
            </div>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200 shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">View Site</span>
            </Link>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
