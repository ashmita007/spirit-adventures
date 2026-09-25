"use client";

import React, { useState } from "react";
import { X, Send, CheckCircle2, Phone, Calendar, Users, Mail, User, Sparkles } from "lucide-react";
import { Trip } from "@/lib/types";
import { submitEnquiry } from "@/lib/api";

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTrip?: Trip | null;
}

export default function EnquiryModal({ isOpen, onClose, selectedTrip }: EnquiryModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [travelersCount, setTravelersCount] = useState(1);
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!fullName || !phone || !email) {
      setErrorMessage("Please fill in your name, phone number, and email.");
      return;
    }

    setLoading(true);
    const res = await submitEnquiry({
      trip_id: selectedTrip?.id,
      trip_slug: selectedTrip?.slug,
      full_name: fullName,
      email,
      phone,
      travel_date: travelDate,
      travelers_count: travelersCount,
      message,
    });

    setLoading(false);
    if (res.success) {
      setSubmitted(true);
    } else {
      setErrorMessage(res.message || "Something went wrong. Please try again or reach out on WhatsApp.");
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFullName("");
    setEmail("");
    setPhone("");
    setTravelDate("");
    setTravelersCount(1);
    setMessage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={handleReset} />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 animate-fade-in border border-slate-100">
        {/* Header with Navy accent */}
        <div className="bg-brand-navy p-6 text-white relative">
          <button
            onClick={handleReset}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-brand-sky text-[11px] font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Direct Adventure Desk</span>
          </div>

          <h3 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight">
            {selectedTrip ? `Enquire: ${selectedTrip.title}` : "Plan Your Next Adventure"}
          </h3>
          {selectedTrip && (
            <p className="text-xs text-sky-200 mt-1">
              {selectedTrip.duration_label} • Starting from ₹{selectedTrip.price.toLocaleString("en-IN")}
            </p>
          )}
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h4 className="font-display font-bold text-2xl text-brand-navy">
                Thank you!
              </h4>
              <p className="text-slate-600 text-sm max-w-sm mx-auto leading-relaxed">
                Our adventure team will contact you shortly with slot availability, preparation guide, and itinerary details.
              </p>
              <button
                onClick={handleReset}
                className="mt-4 px-8 py-3 rounded-full bg-brand-navy hover:bg-brand-ocean text-white font-semibold text-xs uppercase tracking-wider transition-colors shadow-md"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
                  {errorMessage}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Your Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aditi Sharma"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-ocean focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-ocean focus:border-transparent transition"
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
                      placeholder="aditi@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-ocean focus:border-transparent transition"
                    />
                  </div>
                </div>
              </div>

              {/* Travel Date & Travelers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Preferred Date / Month
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={travelDate}
                      onChange={(e) => setTravelDate(e.target.value)}
                      placeholder="e.g. Dec 25 or Next Month"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-ocean focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    No. of Travelers
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={travelersCount}
                      onChange={(e) => setTravelersCount(parseInt(e.target.value) || 1)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-ocean focus:border-transparent transition"
                    />
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Questions / Specific Requests
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your fitness level, group composition, or gear queries..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-ocean focus:border-transparent transition resize-none"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 flex items-center justify-center space-x-2 py-3.5 px-6 rounded-2xl bg-brand-ocean hover:bg-brand-ocean-light text-white font-semibold text-sm uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-cyan-500/20 disabled:opacity-60"
              >
                {loading ? (
                  <span>Sending Enquiry...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Adventure Enquiry</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-slate-600 mt-2">
                🔒 We respect your privacy. No spam, ever.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
