"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Users, Mountain, BarChart3, Settings, 
  Compass, Eye, ExternalLink, Menu, X, CheckCircle2, ChevronRight,
  ShieldCheck, PhoneCall, Sparkles, LogOut, BookOpen, Briefcase, Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ownerFetch } from "@/lib/owner-fetch";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const crmUrl = "/crm";

  // The login screen renders on its own, without the portal chrome
  if (pathname === "/owner/login") return <>{children}</>;

  const signOut = async () => {
    await ownerFetch("/api/v1/auth/logout/", { method: "POST", body: "{}" }).catch(() => null);
    window.location.href = "/owner/login";
  };

  const navigation = [
    {
      name: "Today",
      href: "/owner",
      icon: LayoutDashboard,
      exact: true,
      badge: "",
    },
    {
      name: "Leads",
      href: "/owner/leads",
      icon: Users,
      exact: false,
    },
    {
      name: "Trips",
      href: "/owner/packages",
      icon: Mountain,
      exact: false,
    },
    {
      name: "Gallery",
      href: "/owner/gallery",
      icon: ImageIcon,
      exact: false,
    },
    {
      name: "Analytics",
      href: "/owner/analytics",
      icon: BarChart3,
      exact: false,
    },
    {
      name: "Settings",
      href: "/owner/settings",
      icon: Settings,
      exact: false,
    },
    {
      name: "Help",
      href: "/owner/help",
      icon: BookOpen,
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
    <div className="min-h-dvh bg-slate-50 text-slate-900 font-sans selection:bg-brand-ocean selection:text-white flex">
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
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-0.5">
            {navigation.map((item) => {
              const active = isLinkActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "relative flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition group",
                    active
                      ? "bg-slate-100 text-slate-900 font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:rounded-full before:bg-brand-ocean"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={cn("w-4 h-4 transition", active ? "text-brand-ocean" : "text-slate-400 group-hover:text-slate-600")} />
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
              <span>Website</span>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <a
            href={crmUrl}
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold transition border border-slate-200 shadow-2xs"
          >
            <div className="flex items-center space-x-2">
              <Briefcase className="w-3.5 h-3.5 text-brand-ocean" />
              <span>Sales CRM</span>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <a
            href="/admin/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold transition border border-slate-200 shadow-2xs"
          >
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Database admin</span>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <button
            type="button"
            onClick={signOut}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
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
                <button onClick={() => setSidebarOpen(false)} aria-label="Close menu" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700">
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
                        "flex items-center justify-between px-3 py-3 rounded-lg text-[15px] font-medium transition",
                        active ? "bg-slate-100 text-slate-900 font-semibold" : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={cn("w-4 h-4", active ? "text-brand-ocean" : "text-slate-400")} />
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
                <span>Website</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <a href={crmUrl} className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 text-xs font-semibold text-slate-700 border border-slate-200">
                <span>Sales CRM</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
              <button type="button" onClick={signOut} className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer">
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN CONTENT CONTAINER (WHITE CANVAS) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-sm font-semibold text-slate-900">
                {navigation.find(n => isLinkActive(n))?.name || "Today"}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200 shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">View website</span>
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
