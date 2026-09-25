"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Users, Mountain, ArrowRight, ArrowUpRight, Search, 
  MapPin, CheckCircle2, ChevronRight, MessageCircle, Phone,
  UserPlus, X, Filter, DollarSign, TrendingUp, Sparkles,
  ExternalLink, Download, Clock, Flame, Calendar, RefreshCw,
  Eye, Check, Mail, ShieldCheck, BarChart3, Layers
} from "lucide-react";
import { OwnerOverviewData, OwnerEnquiry, updateEnquiryStatus } from "@/lib/api";
import { formatCurrency, cn } from "@/lib/utils";
import { TablePagination } from "@/components/ui/table-pagination";

const PIPELINE_STAGES: Array<{
  key: OwnerEnquiry["status"];
  label: string;
  badgeClass: string;
  dotColor: string;
}> = [
  { key: "NEW", label: "Fresh Inquiries", badgeClass: "bg-sky-50 text-sky-700 border-sky-200", dotColor: "bg-sky-500" },
  { key: "CONTACTED", label: "In Discussion", badgeClass: "bg-amber-50 text-amber-700 border-amber-200", dotColor: "bg-amber-500" },
  { key: "FOLLOW_UP", label: "Quote Sent", badgeClass: "bg-purple-50 text-purple-700 border-purple-200", dotColor: "bg-purple-500" },
  { key: "PAYMENT_PENDING", label: "Payment Pending", badgeClass: "bg-orange-50 text-orange-700 border-orange-200", dotColor: "bg-orange-500" },
  { key: "CONVERTED", label: "Confirmed (Paid)", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200", dotColor: "bg-emerald-500" },
  { key: "CLOSED", label: "Closed / Cold", badgeClass: "bg-slate-100 text-slate-600 border-slate-200", dotColor: "bg-slate-400" },
];

const WHATSAPP_TEMPLATES = [
  {
    id: "itinerary",
    title: "📋 Full Itinerary & Quote",
    generateText: (lead: OwnerEnquiry) => 
      `Hi ${lead.full_name}! 🌿 Greetings from *Spirit Adventures*.\n\nThank you for reaching out regarding *${lead.trip_title}* for *${lead.travelers_count || 1} travelers*.\n\nHere are your trip details:\n• *Destination*: ${lead.trip_title}\n• *Group Size*: ${lead.travelers_count || 1} Pax\n• *Travel Dates*: ${lead.travel_date || "Upcoming Weekend"}\n• *Package Price*: ₹${(lead.trip_price || 3999).toLocaleString("en-IN")}/person (All-inclusive stay, meals, guide & permits)\n\nWould you like us to reserve your slots or send the detailed day-wise schedule PDF? 🏔️`
  },
  {
    id: "payment",
    title: "💳 Payment & Booking Link",
    generateText: (lead: OwnerEnquiry) => 
      `Hi ${lead.full_name}! ✨ Your slots for *${lead.trip_title}* (${lead.travelers_count || 1} Pax) are temporarily held.\n\nTotal Booking Amount: *₹${((lead.travelers_count || 1) * (lead.trip_price || 3999)).toLocaleString("en-IN")}*\n\nPlease complete your advance confirmation to lock in your mountain tent / homestay reservation. Let us know once completed and we'll dispatch your expedition kit list! 🎒`
  },
  {
    id: "checklist",
    title: "🎒 Things to Carry Checklist",
    generateText: (lead: OwnerEnquiry) => 
      `Hi ${lead.full_name}! 🏕️ Here is your essential packing list for *${lead.trip_title}*:\n\n1. Trekking / Trail shoes with good rubber grip\n2. Quick-dry synthetic t-shirts & track pants\n3. Warm fleece / windcheater for evenings\n4. Reusable 1L water bottle\n5. Personal medication, headlamp/torch & power bank\n\nOur team leader contact will be shared 24 hours prior to departure.`
  },
  {
    id: "pickup",
    title: "📍 Pickup Hub & Timing",
    generateText: (lead: OwnerEnquiry) => 
      `Hi ${lead.full_name}! 🚌 Pickup logistics for *${lead.trip_title}*:\n\n• *Departure City*: ${lead.departure_city || "Hyderabad / Bengaluru"}\n• *Pickup Point*: Main Hub (Exact GPS pin will be shared)\n• *Reporting Time*: Friday 7:00 PM\n• *Expedition Lead*: Spirit Adventures Ops Team (Aditya / Sathwik)\n\nSee you at the pickup point! Let us know if you have any questions.`
  }
];

export default function OwnerOverviewClient({ initialData }: { initialData: OwnerOverviewData }) {
  const [data, setData] = useState<OwnerOverviewData>(initialData);
  const [stageFilter, setStageFilter] = useState<string>("ALL");
  const [leadsSearch, setLeadsSearch] = useState("");
  const [leadsPage, setLeadsPage] = useState(1);
  const [leadsPageSize, setLeadsPageSize] = useState(8);

  // Modals & Drawers
  const [selectedLead, setSelectedLead] = useState<OwnerEnquiry | null>(null);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [activeWaTemplate, setActiveWaTemplate] = useState("itinerary");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Lead Form State
  const [newLeadForm, setNewLeadForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    trip_title: data?.trips?.[0]?.title || "Dandeli Kali River White Water Rafting & Jungle Expedition",
    travelers_count: 2,
    travel_date: "Upcoming Weekend",
    departure_city: "Hyderabad",
    priority: "HIGH" as const,
    follow_up_date: "Today 4:00 PM",
    admin_notes: ""
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStatusChange = async (enquiryId: number, nextStatus: OwnerEnquiry["status"]) => {
    await updateEnquiryStatus(enquiryId, nextStatus);
    setData(prev => ({
      ...prev,
      enquiries: prev.enquiries.map(enq => enq.id === enquiryId ? { ...enq, status: nextStatus } : enq)
    }));
    if (selectedLead && selectedLead.id === enquiryId) {
      setSelectedLead(prev => prev ? { ...prev, status: nextStatus } : null);
    }
    showToast(`Status updated to ${nextStatus.replace("_", " ")}!`);
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedTrip = data.trips.find(t => t.title === newLeadForm.trip_title);
    const newEntry: OwnerEnquiry = {
      id: Date.now(),
      full_name: newLeadForm.full_name,
      phone: newLeadForm.phone,
      email: newLeadForm.email,
      trip_title: newLeadForm.trip_title,
      trip_slug: matchedTrip?.slug || "dandeli-river-rafting",
      trip_price: matchedTrip?.price || 3999,
      travelers_count: Number(newLeadForm.travelers_count) || 1,
      travel_date: newLeadForm.travel_date,
      departure_city: newLeadForm.departure_city,
      status: "NEW",
      priority: newLeadForm.priority,
      follow_up_date: newLeadForm.follow_up_date,
      admin_notes: newLeadForm.admin_notes,
      message: newLeadForm.admin_notes,
      created_at: "Just now"
    };

    setData(prev => ({
      ...prev,
      enquiries: [newEntry, ...prev.enquiries],
      metrics: {
        ...prev.metrics,
        total_leads: prev.metrics.total_leads + 1,
        new_leads: prev.metrics.new_leads + 1
      }
    }));

    setIsAddLeadOpen(false);
    showToast(`New inquiry for ${newLeadForm.full_name} added!`);
  };

  const openWhatsAppLead = (lead: OwnerEnquiry, templateId: string) => {
    const tmpl = WHATSAPP_TEMPLATES.find(t => t.id === templateId) || WHATSAPP_TEMPLATES[0];
    const message = tmpl.generateText(lead);
    const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  };

  const handleExportCSV = () => {
    const headers = "ID,Name,Phone,Email,Trip,Travelers,Price,TotalValue,Status,Priority,City\n";
    const rows = (data?.enquiries || []).map(e => 
      `${e.id},"${e.full_name}","${e.phone}","${e.email || ""}","${e.trip_title}",${e.travelers_count || 1},${e.trip_price || 0},${(e.trip_price || 0) * (e.travelers_count || 1)},${e.status},${e.priority},"${e.departure_city || ""}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spirit_adventures_crm_leads_${Date.now()}.csv`;
    a.click();
    showToast("Leads CSV exported successfully!");
  };

  // Filtered Leads for Recent Activity
  const filteredLeads = useMemo(() => {
    return (data?.enquiries || []).filter((l) => {
      const matchSearch = !leadsSearch || 
        l.full_name?.toLowerCase().includes(leadsSearch.toLowerCase()) ||
        l.phone?.toLowerCase().includes(leadsSearch.toLowerCase()) ||
        l.trip_title?.toLowerCase().includes(leadsSearch.toLowerCase());
      
      const matchStage = stageFilter === "ALL" || l.status === stageFilter;
      return matchSearch && matchStage;
    });
  }, [data?.enquiries, leadsSearch, stageFilter]);

  const paginatedLeads = useMemo(() => {
    const start = (leadsPage - 1) * leadsPageSize;
    return filteredLeads.slice(start, start + leadsPageSize);
  }, [filteredLeads, leadsPage, leadsPageSize]);

  // Top Expeditions
  const topTrips = useMemo(() => {
    return (data?.trips || []).slice(0, 4);
  }, [data?.trips]);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 selection:bg-brand-ocean selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-2.5 font-bold text-xs border border-emerald-400/40 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. EXECUTIVE TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight">
              Executive HQ & Operations
            </h1>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-black tracking-wide border border-emerald-200 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>LIVE PIPELINE</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time revenue monitoring, customer CRM intelligence, and expedition management.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition border border-slate-200 shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Leads</span>
          </button>

          <button
            onClick={() => setIsAddLeadOpen(true)}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-ocean hover:bg-brand-ocean/90 text-white text-xs font-black uppercase tracking-wider transition shadow-md shadow-brand-ocean/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Inquiry</span>
          </button>
        </div>
      </div>

      {/* 2. HIGH-IMPACT REVENUE & KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Est Revenue Card */}
        <div className="bg-gradient-to-br from-brand-navy to-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-lg relative overflow-hidden group">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-28 h-28 bg-brand-ocean/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-3">
            <span>Estimated Pipeline Revenue</span>
            <div className="p-2 rounded-xl bg-white/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
            {formatCurrency(data.metrics.est_revenue)}
          </div>
          <div className="mt-3 flex items-center space-x-2 text-[11px] text-emerald-400 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{data.metrics.conversion_rate}% Conversion Rate</span>
          </div>
        </div>

        {/* Fresh Inquiries */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition group">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-3">
            <span>Fresh Inquiries</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight">
            {data.metrics.new_leads}
          </div>
          <div className="mt-3 flex items-center space-x-2 text-[11px] text-sky-600 font-semibold">
            <span>Requires instant outreach</span>
          </div>
        </div>

        {/* Confirmed Bookings */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition group">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-3">
            <span>Confirmed (Paid)</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight">
            {data.metrics.converted_leads}
          </div>
          <div className="mt-3 flex items-center space-x-2 text-[11px] text-emerald-600 font-semibold">
            <span>Fully paid departures</span>
          </div>
        </div>

        {/* Active Expeditions */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition group">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-3">
            <span>Active Expeditions</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <Mountain className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight">
            {data.metrics.active_trips_count}
          </div>
          <div className="mt-3 flex items-center space-x-2 text-[11px] text-purple-600 font-semibold">
            <span>Published on website</span>
          </div>
        </div>
      </div>

      {/* 3. DEDICATED MODULE ACCESS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/owner/leads"
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-brand-ocean/40 transition group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 group-hover:bg-brand-ocean group-hover:text-white transition">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                {data.enquiries.length} Total Leads
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-ocean transition">
              Customer Leads & Pipeline CRM
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Full spreadsheet table, Kanban stage transitions, WhatsApp quote dispatch, and follow-up tracking.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-brand-ocean space-x-1 group-hover:translate-x-1 transition-transform">
            <span>Open Leads Studio</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          href="/owner/packages"
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-brand-ocean/40 transition group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 group-hover:bg-brand-ocean group-hover:text-white transition">
                <Mountain className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                {data.trips.length} Packages
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-ocean transition">
              Day-Wise Itinerary Studio
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Curate day-wise schedules, update pricing, manage inclusions, and edit trip photography.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-brand-ocean space-x-1 group-hover:translate-x-1 transition-transform">
            <span>Open Itinerary Studio</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          href="/owner/analytics"
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-brand-ocean/40 transition group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:bg-brand-ocean group-hover:text-white transition">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                Demand Metrics
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-ocean transition">
              Destination Breakdown & Insights
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Track high-intent booking destinations (Dandeli, Gokarna, Coorg) and revenue attribution.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-brand-ocean space-x-1 group-hover:translate-x-1 transition-transform">
            <span>View Analytics</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      {/* 4. RECENT INQUIRIES & LEAD PIPELINE TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Header & Controls */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <span>Recent Inquiries</span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                {filteredLeads.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any customer row to open full inquiry modal, dispatch WhatsApp quotes, or update stage.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, phone, trip..."
                value={leadsSearch}
                onChange={(e) => {
                  setLeadsSearch(e.target.value);
                  setLeadsPage(1);
                }}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-ocean"
              />
            </div>

            {/* Stage Filter */}
            <select
              value={stageFilter}
              onChange={(e) => {
                setStageFilter(e.target.value);
                setLeadsPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Stages</option>
              <option value="NEW">⚡ Fresh Leads</option>
              <option value="CONTACTED">In Discussion</option>
              <option value="FOLLOW_UP">Quote Sent</option>
              <option value="PAYMENT_PENDING">Payment Pending</option>
              <option value="CONVERTED">Confirmed (Paid)</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        {/* The Spreadsheet Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap">
              <tr>
                <th className="py-3.5 px-5">Customer</th>
                <th className="py-3.5 px-4">Package</th>
                <th className="py-3.5 px-4">Group Size</th>
                <th className="py-3.5 px-4">Estimated Deal</th>
                <th className="py-3.5 px-4">Pipeline Stage</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No inquiries found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="hover:bg-slate-50/80 transition cursor-pointer group"
                  >
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900 text-sm group-hover:text-brand-ocean transition flex items-center space-x-2">
                        <span>{lead.full_name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center space-x-1.5">
                        <span>{lead.phone}</span>
                        <span>&bull;</span>
                        <span>{lead.departure_city || "Hyderabad"}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-semibold text-slate-800">
                      <div className="truncate max-w-[220px] font-bold text-slate-900">{lead.trip_title}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{lead.travel_date || "Upcoming Weekend"}</div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200 text-[11px] inline-flex items-center space-x-1">
                        <span>👥 {lead.travelers_count || 1} Pax</span>
                      </span>
                    </td>

                    <td className="py-4 px-4 font-display font-black text-brand-ocean text-sm whitespace-nowrap">
                      {formatCurrency((lead.trip_price || 3999) * (lead.travelers_count || 1))}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value as any)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border focus:outline-none cursor-pointer transition",
                          lead.status === "CONVERTED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          lead.status === "NEW" ? "bg-sky-50 text-sky-700 border-sky-200" :
                          lead.status === "FOLLOW_UP" ? "bg-purple-50 text-purple-700 border-purple-200" :
                          lead.status === "PAYMENT_PENDING" ? "bg-orange-50 text-orange-700 border-orange-200" :
                          "bg-slate-100 text-slate-600 border-slate-200"
                        )}
                      >
                        <option value="NEW">⚡ FRESH LEAD</option>
                        <option value="CONTACTED">IN DISCUSSION</option>
                        <option value="FOLLOW_UP">QUOTE SENT</option>
                        <option value="PAYMENT_PENDING">PAYMENT PENDING</option>
                        <option value="CONVERTED">✅ CONFIRMED (PAID)</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block",
                        lead.priority === "HIGH" ? "bg-rose-50 text-rose-700 border-rose-200 font-black" :
                        lead.priority === "MEDIUM" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-100 text-slate-600 border-slate-200"
                      )}>
                        {lead.priority === "HIGH" ? "🔥 VIP" : (lead.priority === "MEDIUM" ? "⚡ Medium" : "💤 Low")}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => openWhatsAppLead(lead, "itinerary")}
                          className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition hover:scale-105 cursor-pointer shadow-2xs"
                          title="Send WhatsApp Quote"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition hover:scale-105 cursor-pointer shadow-2xs"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Clean Table Pagination */}
        <TablePagination
          currentPage={leadsPage}
          pageSize={leadsPageSize}
          totalItems={filteredLeads.length}
          onPageChange={setLeadsPage}
          onPageSizeChange={setLeadsPageSize}
          pageSizeOptions={[5, 8, 15, 25]}
          itemLabel="inquiries"
        />
      </div>

      {/* 5. TOP EXPEDITIONS PERFORMANCE PREVIEW */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Active Adventure Packages
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Top curated expeditions running this season.
            </p>
          </div>
          <Link
            href="/owner/packages"
            className="text-xs font-bold text-brand-ocean hover:underline flex items-center space-x-1"
          >
            <span>Manage All ({data.trips.length})</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topTrips.map((trip) => (
            <div
              key={trip.id}
              className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-sm hover:border-brand-ocean/40 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-2">
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                    {trip.duration_days || 2}D / {(trip.duration_days || 2) - 1}N
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-black">
                    {trip.difficulty || "Moderate"}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs line-clamp-2 group-hover:text-brand-ocean transition">
                  {trip.title}
                </h4>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400">Starting from</div>
                  <div className="text-sm font-display font-black text-brand-ocean">
                    {formatCurrency(trip.price)}
                  </div>
                </div>
                <Link
                  href={`/owner/packages`}
                  className="p-1.5 rounded-lg bg-white hover:bg-brand-ocean hover:text-white text-slate-600 border border-slate-200 transition"
                  title="Edit Itinerary"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL 1: LEAD DETAILS & WHATSAPP ACTION DRAWER */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-display font-black text-slate-900">
                    {selectedLead.full_name}
                  </h3>
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border",
                    selectedLead.priority === "HIGH" ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-slate-100 text-slate-700 border-slate-200"
                  )}>
                    {selectedLead.priority}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inquiry ID #{selectedLead.id} &bull; Received {selectedLead.created_at || "Recently"}
                </p>
              </div>

              <button
                onClick={() => setSelectedLead(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Travel Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Expedition Package Summary
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{selectedLead.trip_title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {selectedLead.travel_date || "Upcoming Weekend"} &bull; {selectedLead.departure_city || "Hyderabad"} Departure
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Total Quote</div>
                  <div className="text-base font-display font-black text-brand-ocean">
                    {formatCurrency((selectedLead.trip_price || 3999) * (selectedLead.travelers_count || 1))}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="text-slate-400 font-semibold mb-1">Phone Number</div>
                <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedLead.phone}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="text-slate-400 font-semibold mb-1">Email Address</div>
                <div className="font-bold text-slate-900 truncate">
                  {selectedLead.email || "Not Provided"}
                </div>
              </div>
            </div>

            {/* Pipeline Stage Transition */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Update Pipeline Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PIPELINE_STAGES.map((st) => (
                  <button
                    key={st.key}
                    onClick={() => handleStatusChange(selectedLead.id, st.key)}
                    className={cn(
                      "px-3 py-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer",
                      selectedLead.status === st.key
                        ? "bg-brand-navy text-white border-brand-navy shadow-xs font-black"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* WhatsApp Quick Dispatcher */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>1-Click WhatsApp Dispatch</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">Ready to Send</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {WHATSAPP_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => {
                      setActiveWaTemplate(tmpl.id);
                      openWhatsAppLead(selectedLead, tmpl.id);
                    }}
                    className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-200 text-left text-xs font-bold text-slate-800 transition flex items-center justify-between group cursor-pointer shadow-2xs"
                  >
                    <span>{tmpl.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 transition" />
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW INQUIRY MODAL */}
      {isAddLeadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-display font-black text-slate-900">
                  Add Customer Inquiry
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Record offline phone inquiries or custom WhatsApp bookings.
                </p>
              </div>
              <button
                onClick={() => setIsAddLeadOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={newLeadForm.full_name}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, full_name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-brand-ocean"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-brand-ocean"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Adventure Package *</label>
                <select
                  value={newLeadForm.trip_title}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, trip_title: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none cursor-pointer"
                >
                  {data.trips.map((t) => (
                    <option key={t.id} value={t.title}>
                      {t.title} (₹{t.price.toLocaleString("en-IN")})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pax Count</label>
                  <input
                    type="number"
                    min="1"
                    value={newLeadForm.travelers_count}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, travelers_count: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Travel Date</label>
                  <input
                    type="text"
                    placeholder="This Weekend"
                    value={newLeadForm.travel_date}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, travel_date: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newLeadForm.priority}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, priority: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
                  >
                    <option value="HIGH">🔥 High (VIP)</option>
                    <option value="MEDIUM">⚡ Medium</option>
                    <option value="LOW">💤 Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Admin Notes / Requirements</label>
                <textarea
                  rows={2}
                  placeholder="Special requests, tent requirements, pickup point..."
                  value={newLeadForm.admin_notes}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, admin_notes: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddLeadOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-ocean hover:bg-brand-ocean/90 text-white text-xs font-black uppercase tracking-wider transition shadow-md shadow-brand-ocean/20 cursor-pointer"
                >
                  Save Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
