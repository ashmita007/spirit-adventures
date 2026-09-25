import React from "react";
import { Metadata } from "next";
import { Phone, Mail, MapPin, MessageCircle, Instagram, Youtube, Clock, ShieldCheck } from "lucide-react";
import ContactForm from "./contact-form";

export const metadata: Metadata = {
  title: "Contact & Plan Your Trip | Spirit Adventures",
  description: "Connect directly with our adventure desk via WhatsApp, phone, or email to discuss custom itineraries and upcoming batches.",
};

export default function ContactPage() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+919666567551";
  const phone = process.env.NEXT_PUBLIC_PHONE_NUMBER || "+91 96665 67551";
  const email = process.env.NEXT_PUBLIC_EMAIL || "info@spiritadventures.in";

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="bg-brand-light border-b border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-brand-ocean block mb-2">
            Get in Touch
          </span>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-brand-navy uppercase tracking-tight">
            Connect With Our Team
          </h1>
          <p className="mt-3 text-slate-600 text-sm sm:text-base max-w-2xl">
            Have questions about upcoming weekend getaways, combo packages, or customized group departures? We&apos;re here to guide you.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Direct Channels */}
          <div className="space-y-8">
            <div className="bg-brand-navy rounded-3xl p-8 text-white space-y-6 shadow-xl">
              <h3 className="font-display font-bold text-xl uppercase tracking-wide text-brand-sky">
                Direct Adventure Desk
              </h3>

              <div className="space-y-4 text-sm">
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3.5 rounded-2xl bg-white/10 hover:bg-emerald-600 transition text-slate-200 hover:text-white"
                >
                  <MessageCircle className="w-5 h-5 text-emerald-400" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">WhatsApp Expert</span>
                    <span className="font-semibold">{whatsappNumber}</span>
                  </div>
                </a>

                <a
                  href={`tel:${whatsappNumber}`}
                  className="flex items-center space-x-3 p-3.5 rounded-2xl bg-white/10 hover:bg-brand-ocean transition text-slate-200 hover:text-white"
                >
                  <Phone className="w-5 h-5 text-brand-sky" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone Support</span>
                    <span className="font-semibold">{phone}</span>
                  </div>
                </a>

                <a
                  href={`mailto:${email}`}
                  className="flex items-center space-x-3 p-3.5 rounded-2xl bg-white/10 hover:bg-brand-ocean transition text-slate-200 hover:text-white"
                >
                  <Mail className="w-5 h-5 text-brand-sky" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Email Inquiries</span>
                    <span className="font-semibold">{email}</span>
                  </div>
                </a>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-3 text-xs text-slate-300">
                <div className="flex items-start space-x-2.5">
                  <MapPin className="w-4 h-4 text-brand-sky flex-shrink-0 mt-0.5" />
                  <a 
                    href="https://maps.app.goo.gl/4N6qZD9KAyb6pBA19" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-white leading-relaxed"
                  >
                    Vasantha Sai Apartments, Opposite Rishi Towers, KPHB, Kukatpally, Hyderabad, Telangana - 500085
                  </a>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Clock className="w-4 h-4 text-brand-sky flex-shrink-0" />
                  <span>Desk Hours: 9:00 AM – 9:00 PM IST (Mon - Sun)</span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="p-6 rounded-3xl bg-brand-light border border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-navy">Follow The Trails</span>
              <div className="flex items-center space-x-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-full bg-white text-brand-navy hover:bg-brand-ocean hover:text-white flex items-center justify-center transition shadow-sm"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-10 h-10 rounded-full bg-white text-brand-navy hover:bg-brand-ocean hover:text-white flex items-center justify-center transition shadow-sm"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
