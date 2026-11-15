"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Phone, Mail, User, CheckCircle2, Send } from "lucide-react";
import { submitEnquiry } from "@/lib/api";

// Strict gate: every visitor must leave phone + email before browsing. It cannot be
// closed; it only goes away for good once they submit name + mobile.
const SUBMITTED_KEY = "sa_lead_submitted";
const SHOW_AFTER_MS = 1500;
const HIDDEN_PREFIXES = ["/crm", "/owner"];
// Search engines and link previews must still see the page, or rankings drop.
const BOT_UA = /bot|crawl|spider|slurp|lighthouse|facebookexternalhit|whatsapp|telegram|preview|headless/i;

function readStore(store: "local" | "session", key: string): string | null {
  try {
    return (store === "local" ? window.localStorage : window.sessionStorage).getItem(key);
  } catch {
    return null;
  }
}

function writeStore(store: "local" | "session", key: string, value: string) {
  try {
    (store === "local" ? window.localStorage : window.sessionStorage).setItem(key, value);
  } catch {
    /* storage blocked (private mode) – popup just may show again */
  }
}

export default function LeadPopup() {
  const pathname = usePathname() || "/";
  const hidden = HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));

  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const uid = useId();

  // Show shortly after landing on any public page, every page, until submitted.
  useEffect(() => {
    if (hidden || readStore("local", SUBMITTED_KEY) || BOT_UA.test(navigator.userAgent)) return;
    const timer = window.setTimeout(() => setOpen(true), SHOW_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [hidden, pathname]);

  const unlock = useCallback(() => {
    writeStore("local", SUBMITTED_KEY, "1");
  }, []);

  // Scroll lock and focus the name field. Escape does nothing on purpose.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => nameRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(t);
    };
  }, [open]);

  if (hidden || !open) return null;

  const tripSlug = pathname.startsWith("/trips/") ? pathname.split("/")[2] : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const cleanName = name.trim().replace(/\s+/g, " ");
    if (cleanName.replace(/[^\p{L}]/gu, "").length < 2) {
      setError("Please enter your name.");
      return;
    }
    // Accept 98765 43210, +91 98765 43210, 098765 43210 – store as the 10 digits.
    let digits = phone.replace(/\D/g, "");
    if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
    if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
    if (!/^[6-9]\d{9}$/.test(digits)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("That email doesn't look right. You can also leave it empty.");
      return;
    }
    setLoading(true);
    const res = await submitEnquiry({
      trip_slug: tripSlug,
      full_name: cleanName,
      phone: digits,
      email: email.trim(),
      message: `Website popup lead (page: ${pathname})`,
    });
    setLoading(false);
    if (res.success) {
      setDone(true);
      unlock();
    } else {
      setError(res.message || "Something went wrong. Please try again.");
    }
  };

  const inputCls =
    "w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-ocean focus:border-transparent transition";

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${uid}-title`}
      data-lead-popup
    >
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative w-full max-w-md max-h-[92dvh] flex flex-col bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 animate-fade-in border border-slate-100">
        <div className="bg-brand-navy px-5 pt-6 pb-5 sm:p-6 text-white relative shrink-0">
          <h3 id={`${uid}-title`} className="font-display font-black text-xl sm:text-2xl tracking-tight leading-snug">
            One quick step to continue
          </h3>
          <p className="text-sm text-sky-200 mt-1.5">
            Just your name and mobile number. It takes 10 seconds, and our team will share the latest prices,
            dates and offers.
          </p>
        </div>

        <div data-lenis-prevent className="p-5 sm:p-7 overflow-y-auto min-h-0 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {done ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-display font-bold text-xl text-brand-navy">You&apos;re all set!</h4>
              <p className="text-slate-600 text-sm">Thanks{name.trim() ? `, ${name.trim().split(" ")[0]}` : ""}! Our team will contact you shortly. Enjoy exploring.</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-2 px-8 py-3 rounded-full bg-brand-navy hover:bg-brand-ocean text-white font-semibold text-xs uppercase tracking-wide transition-colors"
              >
                Continue browsing
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
              {error && (
                <div role="alert" className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor={`${uid}-name`} className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Your name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <input
                    ref={nameRef}
                    id={`${uid}-name`}
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Kumar"
                    autoComplete="name"
                    autoCapitalize="words"
                    maxLength={150}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label htmlFor={`${uid}-phone`} className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mobile number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <span className="absolute left-10 top-1/2 -translate-y-1/2 text-base sm:text-sm text-slate-500" aria-hidden="true">+91</span>
                  <input
                    id={`${uid}-phone`}
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s-]/g, ""))}
                    placeholder="98765 43210"
                    autoComplete="tel-national"
                    inputMode="numeric"
                    maxLength={16}
                    className={inputCls.replace("pl-10", "pl-[4.75rem]")}
                  />
                </div>
              </div>

              <div>
                <label htmlFor={`${uid}-email`} className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email <span className="font-normal text-slate-500">(optional)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <input
                    id={`${uid}-email`}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    inputMode="email"
                    maxLength={254}
                    className={inputCls}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 min-h-12 py-3.5 px-6 rounded-2xl bg-brand-ocean hover:bg-brand-ocean-light text-white font-semibold text-sm uppercase tracking-wide transition shadow-lg disabled:opacity-60"
              >
                {loading ? "Please wait…" : (<>Continue <Send className="w-4 h-4" aria-hidden="true" /></>)}
              </button>
              <p className="text-[11px] text-center text-slate-500">We only use your details to plan your trip. No spam.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
