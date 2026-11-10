"use client";

import React, { useState, useId } from "react";
import { Send, CheckCircle2, User, Phone, Mail, MessageSquare } from "lucide-react";
import { submitEnquiry } from "@/lib/api";

export default function ContactForm() {
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName || !email || !phone) {
      setErrorMsg("Please fill in your name, email, and phone number.");
      return;
    }

    setLoading(true);
    const res = await submitEnquiry({
      full_name: fullName,
      email,
      phone,
      message,
    });
    setLoading(false);

    if (res.success) {
      setSubmitted(true);
    } else {
      setErrorMsg(res.message || "Something went wrong.");
    }
  };

  if (submitted) {
    return (
      <div className="bg-brand-light rounded-3xl p-10 text-center space-y-4 border border-slate-100">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="font-display font-bold text-2xl text-brand-navy">Message Received!</h3>
        <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
          Thank you for reaching out. We'll reply on WhatsApp or by phone, usually the same day.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setFullName("");
            setEmail("");
            setPhone("");
            setMessage("");
          }}
          className="mt-4 px-6 py-2.5 rounded-full bg-brand-navy text-white text-xs font-semibold uppercase tracking-wide hover:bg-brand-ocean transition"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-10 border border-slate-200 shadow-sm space-y-6">
      <div>
        <h3 className="font-display font-bold text-2xl text-brand-navy uppercase tracking-tight">
          Send us a message
        </h3>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Tell us where and when. We reply on WhatsApp or by phone, usually the same day.
        </p>
      </div>

      {errorMsg && (
        <div role="alert" className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor={fid("name")} className="block text-xs font-semibold text-slate-700 mb-1.5">
            Full name *
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              id={fid("name")}
              type="text"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Vikram Singhania"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-ocean focus:border-transparent transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor={fid("phone")} className="block text-xs font-semibold text-slate-700 mb-1.5">
              Phone / WhatsApp *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                id={fid("phone")}
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-ocean focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor={fid("email")} className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                id={fid("email")}
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vikram@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-ocean focus:border-transparent transition"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor={fid("message")} className="block text-xs font-semibold text-slate-700 mb-1.5">
            Where do you want to go?
          </label>
          <div className="relative">
            <textarea
              id={fid("message")}
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Gokarna for 4 friends, second week of December"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-ocean focus:border-transparent transition resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 whitespace-nowrap min-h-12 py-4 px-6 rounded-2xl bg-brand-ocean hover:bg-brand-ocean-light text-white font-bold text-sm uppercase tracking-wide transition duration-300 shadow-lg hover:shadow-cyan-500/20 disabled:opacity-60"
        >
          {loading ? (
            <span>Sending…</span>
          ) : (
            <>
              <Send className="w-4 h-4" aria-hidden="true" />
              <span>Send Message</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
