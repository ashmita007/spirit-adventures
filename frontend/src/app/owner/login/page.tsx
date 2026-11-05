import type { Metadata } from "next";
import { Suspense } from "react";
import { BarChart3, MessageCircle, Mountain, Users } from "lucide-react";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Team Sign In | Spirit Adventures",
  robots: { index: false, follow: false },
};

const points = [
  { icon: Mountain, text: "Add and edit trip packages, live on the site instantly" },
  { icon: Users, text: "Every website enquiry lands in the CRM, auto-assigned" },
  { icon: MessageCircle, text: "Call, WhatsApp and log follow-ups from your phone" },
  { icon: BarChart3, text: "Track payments, departures and monthly targets" },
];

export default function OwnerLoginPage() {
  return (
    <div className="min-h-[100dvh] grid lg:grid-cols-[1.1fr_1fr] bg-brand-light">
      {/* Brand panel (desktop) */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-navy via-[#08406B] to-brand-ocean p-12 text-white">
        <svg aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 w-full text-white/10" viewBox="0 0 800 300" preserveAspectRatio="none">
          <path d="M0 300 L0 210 L120 120 L200 180 L330 40 L450 170 L540 110 L660 200 L800 90 L800 300 Z" fill="currentColor" />
          <path d="M0 300 L0 250 L150 180 L260 230 L400 140 L520 220 L650 170 L800 230 L800 300 Z" fill="currentColor" />
        </svg>
        <div aria-hidden className="absolute -top-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-brand-sky/25 blur-3xl" />

        <div className="relative">
          <span className="inline-flex rounded-2xl bg-white px-4 py-2.5 shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="Spirit Adventures" width={564} height={149} className="h-8 w-auto" />
          </span>
        </div>

        <div className="relative max-w-md">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-300">Team workspace</p>
          <h2 className="mt-3 font-display text-4xl font-black leading-tight">
            Run every trip, lead and booking from one place.
          </h2>
          <ul className="mt-8 space-y-4">
            {points.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-sky-50/90">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                  <Icon className="h-4 w-4 text-sky-300" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-sky-100/60">© {new Date().getFullYear()} Spirit Adventures</p>
      </aside>

      {/* Form */}
      <main className="relative flex items-center justify-center px-4 py-12 sm:py-16">
        <div aria-hidden className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-brand-sky/15 to-transparent lg:hidden" />
        <div className="relative w-full flex justify-center">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
