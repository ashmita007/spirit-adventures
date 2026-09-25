"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, User, Phone, Mail, MessageSquare } from "lucide-react";
import { submitEnquiry } from "@/lib/api";

export default function ContactForm() {
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
          Thank you for reaching out. Our adventure team will review your message and contact you shortly.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setFullName("");
            setEmail("");
            setPhone("");
            setMessage("");
          }}
          className="mt-4 px-6 py-2.5 rounded-full bg-brand-navy text-white text-xs font-semibold uppercase tracking-wider hover:bg-brand-ocean transition"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm space-y-6">
      <div>
        <h3 className="font-display font-bold text-2xl text-brand-navy uppercase tracking-tight">
          Send Us A Message
        </h3>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Tell us where you want to go, and let our mountain leaders handle the logistics.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Full Name *
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Vikram Singhania"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-ocean focus:border-transparent transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Phone / WhatsApp *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-ocean focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vikram@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-ocean focus:border-transparent transition"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Your Message / Trip Plans
          </label>
          <div className="relative">
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what you're dreaming of — a winter summit, a corporate wilderness retreat, or a quiet beach trek..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-ocean focus:border-transparent transition resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-2xl bg-brand-ocean hover:bg-brand-ocean-light text-white font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-cyan-500/20 disabled:opacity-60"
        >
          {loading ? (
            <span>Sending...</span>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Send Message</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
