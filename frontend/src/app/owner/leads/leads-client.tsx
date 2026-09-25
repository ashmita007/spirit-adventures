"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Users, DollarSign, Search, Filter, Plus, Phone, MessageCircle, Clock, 
  MapPin, Check, ArrowUpRight, Download, UserPlus, Send, X, Flame, 
  ShieldCheck, CheckCircle2, ChevronDown, RefreshCw, Eye, Edit2
} from "lucide-react";
import { OwnerOverviewData, OwnerEnquiry, updateEnquiryStatus } from "@/lib/api";
import { formatCurrency, cn } from "@/lib/utils";
import { TablePagination } from "@/components/ui/table-pagination";

const PIPELINE_STAGES: Array<{
  key: OwnerEnquiry["status"];
  label: string;
  badgeClass: string;
}> = [
  { key: "NEW", label: "Fresh", badgeClass: "bg-sky-50 text-sky-700 border-sky-200" },
  { key: "CONTACTED", label: "In Discussion", badgeClass: "bg-amber-50 text-amber-700 border-amber-200" },
  { key: "FOLLOW_UP", label: "Quote Sent", badgeClass: "bg-purple-50 text-purple-700 border-purple-200" },
  { key: "PAYMENT_PENDING", label: "Payment Pending", badgeClass: "bg-orange-50 text-orange-700 border-orange-200" },
  { key: "CONVERTED", label: "Confirmed & Paid", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { key: "CLOSED", label: "Closed / Cold", badgeClass: "bg-slate-100 text-slate-600 border-slate-200" },
];

const WHATSAPP_TEMPLATES = [
  {
    id: "itinerary",
    title: "📋 Full Itinerary & Quote",
    generateText: (lead: OwnerEnquiry) => 
      `Hi ${lead.full_name}! 🌿 Greetings from *Spirit Adventures*.\n\nThank you for reaching out regarding *${lead.trip_title}* for *${lead.travelers_count || 1} travelers*.\n\nHere are your trip details:\n• *Destination*: ${lead.trip_title}\n• *Group Size*: ${lead.travelers_count || 1} Pax\n• *Travel Dates*: ${lead.travel_date || "Upcoming Weekend"}\n• *Package Price*: ₹${lead.trip_price.toLocaleString("en-IN")}/person (All-inclusive stay, meals, guide & permits)\n\nWould you like us to reserve your slots or send the detailed day-wise schedule PDF? 🏔️`
  },
  {
    id: "payment",
    title: "💳 Payment & Booking Link",
    generateText: (lead: OwnerEnquiry) => 
      `Hi ${lead.full_name}! ✨ Your slots for *${lead.trip_title}* (${lead.travelers_count || 1} Pax) are temporarily held.\n\nTotal Booking Amount: *₹${((lead.travelers_count || 1) * lead.trip_price).toLocaleString("en-IN")}*\n\nPlease complete your advance confirmation to lock in your mountain tent / homestay reservation. Let us know once completed and we'll dispatch your expedition kit list! 🎒`
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

export default function LeadsClientPage({ initialData }: { initialData: OwnerOverviewData }) {
  const [data, setData] = useState<OwnerOverviewData>(initialData);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [destinationFilter, setDestinationFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modals & Drawers
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<OwnerEnquiry | null>(null);
  const [activeWaTemplate, setActiveWaTemplate] = useState<string>("itinerary");

  // New Lead Form State
  const [newLeadForm, setNewLeadForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    trip_title: initialData.trips[0]?.title || "4D 3N Hampi, Gokarna & Dandeli Grand Combo",
    trip_slug: initialData.trips[0]?.slug || "hampi-gokarna-dandeli-grand-combo",
    travelers_count: 2,
    travel_date: "Upcoming Weekend",
    priority: "HIGH" as "HIGH" | "MEDIUM" | "LOW",
    status: "NEW" as OwnerEnquiry["status"],
    departure_city: "Hyderabad",
    follow_up_date: "Today 4:00 PM",
    admin_notes: "Inquired via direct call / WhatsApp."
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handlePriorityFilterChange = (val: string) => {
    setPriorityFilter(val);
    setCurrentPage(1);
  };

  const handleDestinationFilterChange = (val: string) => {
    setDestinationFilter(val);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const filteredEnquiries = useMemo(() => {
    return data.enquiries.filter((e) => {
      if (statusFilter !== "ALL" && e.status !== statusFilter) return false;
      if (priorityFilter !== "ALL" && e.priority !== priorityFilter) return false;
      if (destinationFilter !== "ALL") {
        if (!e.trip_title.toLowerCase().includes(destinationFilter.toLowerCase())) return false;
      }
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        return (
          e.full_name.toLowerCase().includes(s) ||
          e.email.toLowerCase().includes(s) ||
          e.phone.toLowerCase().includes(s) ||
          e.trip_title.toLowerCase().includes(s) ||
          (e.departure_city && e.departure_city.toLowerCase().includes(s))
        );
      }
      return true;
    });
  }, [data.enquiries, statusFilter, priorityFilter, destinationFilter, searchTerm]);

  const paginatedEnquiries = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredEnquiries.slice(startIndex, startIndex + pageSize);
  }, [filteredEnquiries, currentPage, pageSize]);

  const totalRevenue = useMemo(() => {
    return data.enquiries.reduce((acc, curr) => acc + curr.trip_price * (curr.travelers_count || 1), 0);
  }, [data.enquiries]);

  const confirmedRevenue = useMemo(() => {
    return data.enquiries
      .filter((e) => e.status === "CONVERTED")
      .reduce((acc, curr) => acc + curr.trip_price * (curr.travelers_count || 1), 0);
  }, [data.enquiries]);

  const handleStatusChange = async (id: number, newStatus: OwnerEnquiry["status"]) => {
    try {
      await fetch(`/api/v1/owner/enquiries/${id}/status/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {}

    setData((prev) => ({
      ...prev,
      enquiries: prev.enquiries.map((e) => (e.id === id ? { ...e, status: newStatus } : e)),
    }));
    if (selectedLead && selectedLead.id === id) {
      setSelectedLead({ ...selectedLead, status: newStatus });
    }
    showToast(`Lead status updated to "${newStatus.replace("_", " ")}"`);
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.full_name.trim() || !newLeadForm.phone.trim()) {
      showToast("Please provide Customer Name and Phone Number");
      return;
    }

    const matchedTrip = data.trips.find(t => t.title === newLeadForm.trip_title);
    const price = matchedTrip ? matchedTrip.price : 7999;

    const payload = {
      full_name: newLeadForm.full_name.trim(),
      email: newLeadForm.email.trim() || `${newLeadForm.full_name.toLowerCase().replace(/\s+/g, "")}@customer.in`,
      phone: newLeadForm.phone.trim(),
      travel_date: newLeadForm.travel_date,
      travelers_count: Number(newLeadForm.travelers_count) || 1,
      status: newLeadForm.status,
      priority: newLeadForm.priority,
      departure_city: newLeadForm.departure_city,
      follow_up_date: newLeadForm.follow_up_date,
      admin_notes: newLeadForm.admin_notes,
      trip_title: newLeadForm.trip_title,
      trip_price: price,
      message: "Lead manually ingested via Owner CRM Desk."
    };

    let createdId = Date.now();
    try {
      const res = await fetch("/api/v1/owner/enquiries/create/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const resJson = await res.json();
      if (resJson.success && resJson.data?.id) {
        createdId = resJson.data.id;
      }
    } catch (err) {}

    const createdLead: OwnerEnquiry = {
      id: createdId,
      full_name: payload.full_name,
      email: payload.email,
      phone: payload.phone,
      travel_date: payload.travel_date,
      travelers_count: payload.travelers_count,
      message: payload.message,
      status: payload.status,
      priority: payload.priority,
      departure_city: payload.departure_city,
      follow_up_date: payload.follow_up_date,
      admin_notes: payload.admin_notes,
      trip_title: payload.trip_title,
      trip_slug: matchedTrip ? matchedTrip.slug : "hampi-gokarna-dandeli-grand-combo",
      trip_price: price,
      created_at: "Just now"
    };

    setData(prev => ({
      ...prev,
      enquiries: [createdLead, ...prev.enquiries],
      metrics: {
        ...prev.metrics,
        total_leads: prev.metrics.total_leads + 1,
        new_leads: prev.metrics.new_leads + 1
      }
    }));

    setIsAddLeadOpen(false);
    showToast(`Lead for "${createdLead.full_name}" added to CRM.`);
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Full Name", "Phone", "Email", "Trip Title", "Pax", "Price (INR)", "City", "Stage", "Priority", "Follow Up", "Notes"];
    const rows = filteredEnquiries.map(e => [
      e.id,
      `"${e.full_name.replace(/"/g, '""')}"`,
      `"${e.phone}"`,
      `"${e.email}"`,
      `"${e.trip_title.replace(/"/g, '""')}"`,
      e.travelers_count,
      e.trip_price,
      `"${e.departure_city || ""}"`,
      e.status,
      e.priority,
      `"${e.follow_up_date || ""}"`,
      `"${(e.admin_notes || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `spirit_adventures_leads_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Downloaded CRM Lead Database (CSV)");
  };

  const openWhatsAppLead = (lead: OwnerEnquiry, templateId: string = "itinerary") => {
    const template = WHATSAPP_TEMPLATES.find(t => t.id === templateId) || WHATSAPP_TEMPLATES[0];
    const message = template.generateText(lead);
    const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-brand-navy text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-2.5 font-bold text-xs border border-emerald-400/40 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Clean Header with Add Lead Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-brand-navy">
            Customer Leads
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage inquiries, update pipeline stages, and dispatch WhatsApp itineraries.
          </p>
        </div>

        <button
          onClick={() => setIsAddLeadOpen(true)}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider transition shadow-md hover:scale-105 active:scale-95 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add Lead</span>
        </button>
      </div>

      {/* Filter & Search Bar (White Card) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer, phone, trip, city, email..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-ocean"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto">
          <select
            value={priorityFilter}
            onChange={(e) => handlePriorityFilterChange(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-ocean cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">🔥 High Priority (VIP)</option>
            <option value="MEDIUM">⚡ Medium</option>
            <option value="LOW">💤 Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-ocean cursor-pointer"
          >
            <option value="ALL">All Pipeline Stages</option>
            <option value="NEW">Fresh Inquiries</option>
            <option value="CONTACTED">In Discussion</option>
            <option value="FOLLOW_UP">Quote / Itinerary Sent</option>
            <option value="PAYMENT_PENDING">Payment Pending</option>
            <option value="CONVERTED">Confirmed & Paid</option>
            <option value="CLOSED">Closed / Cold</option>
          </select>

          <select
            value={destinationFilter}
            onChange={(e) => handleDestinationFilterChange(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-ocean cursor-pointer"
          >
            <option value="ALL">All Destinations</option>
            <option value="Hampi">Hampi & Gokarna</option>
            <option value="Dandeli">Dandeli</option>
            <option value="Coorg">Coorg</option>
            <option value="Goa">Goa</option>
            <option value="Chikmagalur">Chikmagalur</option>
            <option value="Ooty">Ooty & Kodaikanal</option>
            <option value="Wayanad">Wayanad</option>
            <option value="Ladakh">Ladakh</option>
            <option value="Kedarkantha">Kedarkantha</option>
          </select>
        </div>
      </div>

      {/* MASTER DATA TABLE (CLEAN WHITE) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap">
              <tr>
                <th className="py-4 px-4 w-12 text-center">#</th>
                <th className="py-4 px-4 min-w-[200px]">Customer Details</th>
                <th className="py-4 px-4 min-w-[220px]">Adventure Package</th>
                <th className="py-4 px-4">Group Size</th>
                <th className="py-4 px-4">Deal Value</th>
                <th className="py-4 px-4 min-w-[150px]">Pipeline Stage</th>
                <th className="py-4 px-4">Priority</th>
                <th className="py-4 px-4 min-w-[120px]">Follow-Up Due</th>
                <th className="py-4 px-4 text-right min-w-[130px]">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedEnquiries.map((lead, idx) => (
                <tr
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className="hover:bg-slate-50/90 transition cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px] text-center whitespace-nowrap">
                    #{(currentPage - 1) * pageSize + idx + 1}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-brand-navy text-sm group-hover:text-brand-ocean transition">
                      {lead.full_name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono flex items-center space-x-2 mt-0.5 whitespace-nowrap">
                      <span>{lead.phone}</span>
                      <span>&bull;</span>
                      <span className="text-slate-500">{lead.departure_city || "Hyderabad"}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    <div className="truncate max-w-[220px] font-bold text-slate-800">{lead.trip_title}</div>
                    <div className="text-[10px] text-slate-500 font-normal">{lead.travel_date || "Upcoming Weekend"}</div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200 text-[11px] inline-flex items-center space-x-1">
                      <span>👥 {lead.travelers_count} Pax</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-display font-black text-brand-ocean text-sm whitespace-nowrap">
                    {formatCurrency(lead.trip_price * (lead.travelers_count || 1))}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value as any)}
                      className={cn(
                        "px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border focus:outline-none cursor-pointer",
                        lead.status === "CONVERTED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        lead.status === "NEW" ? "bg-sky-50 text-sky-700 border-sky-200" :
                        lead.status === "FOLLOW_UP" ? "bg-purple-50 text-purple-700 border-purple-200" :
                        lead.status === "PAYMENT_PENDING" ? "bg-orange-50 text-orange-700 border-orange-200" :
                        "bg-slate-100 text-slate-600 border-slate-200"
                      )}
                    >
                      <option value="NEW">FRESH LEAD</option>
                      <option value="CONTACTED">IN DISCUSSION</option>
                      <option value="FOLLOW_UP">QUOTE SENT</option>
                      <option value="PAYMENT_PENDING">PAYMENT PENDING</option>
                      <option value="CONVERTED">CONFIRMED (PAID)</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block",
                      lead.priority === "HIGH" ? "bg-rose-50 text-rose-700 border-rose-200 font-black" :
                      lead.priority === "MEDIUM" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-100 text-slate-600 border-slate-200"
                    )}>
                      {lead.priority === "HIGH" ? "🔥 VIP" : (lead.priority === "MEDIUM" ? "⚡ Medium" : "💤 Low")}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-amber-700 font-semibold whitespace-nowrap">
                    {lead.follow_up_date || "-"}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => openWhatsAppLead(lead, "itinerary")}
                        className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition hover:scale-105 cursor-pointer shadow-2xs"
                        title="Send WhatsApp Quote"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>

                      <a
                        href={`tel:${lead.phone}`}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                        title="Call Customer"
                      >
                        <Phone className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-brand-ocean hover:text-white text-slate-700 border border-slate-200 transition cursor-pointer"
                        title="Open Lead Profile"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedEnquiries.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 italic">
                    No inquiries found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Component */}
        <TablePagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={filteredEnquiries.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="CRM leads"
        />
      </div>

      {/* ADD LEAD MODAL (WHITE THEME) */}
      {isAddLeadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden text-slate-800">
            <div className="bg-brand-navy p-5 flex items-center justify-between border-b border-slate-800 text-white">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-sky">
                  Lead Ingestion
                </span>
                <h3 className="font-display font-bold text-lg text-white">Add Customer Inquiry Row</h3>
              </div>
              <button onClick={() => setIsAddLeadOpen(false)} className="text-slate-300 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-[10px] text-slate-600 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={newLeadForm.full_name}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, full_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-brand-ocean"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-[10px] text-slate-600 mb-1">WhatsApp / Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 9666567551"
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-brand-ocean"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-[10px] text-slate-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="rahul@example.com"
                    value={newLeadForm.email}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-brand-ocean"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-[10px] text-slate-600 mb-1">Departure City</label>
                  <input
                    type="text"
                    placeholder="Hyderabad / Bengaluru"
                    value={newLeadForm.departure_city}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, departure_city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-brand-ocean"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-[10px] text-slate-600 mb-1">Trip Package</label>
                  <select
                    value={newLeadForm.trip_title}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, trip_title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-brand-ocean cursor-pointer"
                  >
                    {data.trips.map(t => (
                      <option key={t.id} value={t.title}>{t.title} ({t.destination_name})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-[10px] text-slate-600 mb-1">Group Size (Pax)</label>
                  <input
                    type="number"
                    min={1}
                    value={newLeadForm.travelers_count}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, travelers_count: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-brand-ocean"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-[10px] text-slate-600 mb-1">Priority</label>
                  <select
                    value={newLeadForm.priority}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, priority: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none cursor-pointer"
                  >
                    <option value="HIGH">🔥 High Priority (VIP)</option>
                    <option value="MEDIUM">⚡ Medium</option>
                    <option value="LOW">💤 Low</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-[10px] text-slate-600 mb-1">Follow-Up Date</label>
                  <input
                    type="text"
                    placeholder="Today 4:00 PM"
                    value={newLeadForm.follow_up_date}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, follow_up_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-brand-ocean"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-[10px] text-slate-600 mb-1">Notes & Requirements</label>
                <textarea
                  rows={2}
                  placeholder="Tentative dates, corporate queries, tent requirements..."
                  value={newLeadForm.admin_notes}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, admin_notes: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-brand-ocean"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddLeadOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-md cursor-pointer"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LEAD DETAIL & WHATSAPP DRAWER (WHITE THEME) */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end animate-fade-in">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 overflow-y-auto text-slate-800">
            <div className="p-6 bg-brand-navy text-white flex items-start justify-between border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-ocean text-white text-[10px] font-bold uppercase">
                    {selectedLead.status}
                  </span>
                  {selectedLead.priority === "HIGH" && (
                    <span className="px-2 py-0.5 rounded bg-rose-500 text-white text-[10px] font-bold">
                      🔥 VIP LEAD
                    </span>
                  )}
                </div>
                <h3 className="font-display font-bold text-xl text-white">
                  {selectedLead.full_name}
                </h3>
                <p className="text-xs text-brand-sky font-semibold mt-0.5">
                  📍 {selectedLead.trip_title}
                </p>
              </div>

              <button
                onClick={() => setSelectedLead(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-grow overflow-y-auto">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">
                  1-Click WhatsApp Dispatch (Choose Template)
                </span>
                
                <div className="grid grid-cols-2 gap-2">
                  {WHATSAPP_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      onClick={() => {
                        setActiveWaTemplate(tmpl.id);
                        openWhatsAppLead(selectedLead, tmpl.id);
                      }}
                      className={cn(
                        "p-2.5 rounded-xl text-[11px] font-bold border transition text-left flex items-center justify-between cursor-pointer shadow-2xs",
                        activeWaTemplate === tmpl.id
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      )}
                    >
                      <span className="truncate">{tmpl.title}</span>
                      <Send className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Phone</span>
                  <span className="font-bold text-slate-900 font-mono">{selectedLead.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Email</span>
                  <span className="font-bold text-slate-900">{selectedLead.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Group Size</span>
                  <span className="font-bold text-brand-ocean">{selectedLead.travelers_count || 1} Travelers</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Departure City</span>
                  <span className="font-bold text-slate-900">{selectedLead.departure_city || "Hyderabad"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Quoted Total Value</span>
                  <span className="font-display font-black text-brand-ocean text-sm">
                    {formatCurrency(selectedLead.trip_price * (selectedLead.travelers_count || 1))}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-[10px] text-slate-500 mb-2">
                  Update Lead Pipeline Stage
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PIPELINE_STAGES.map(st => (
                    <button
                      key={st.key}
                      onClick={() => handleStatusChange(selectedLead.id, st.key)}
                      className={cn(
                        "py-2 px-3 rounded-xl text-[11px] font-bold border transition text-left flex items-center justify-between cursor-pointer",
                        selectedLead.status === st.key
                          ? "bg-brand-ocean text-white border-brand-ocean shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      )}
                    >
                      <span>{st.label}</span>
                      {selectedLead.status === st.key && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-[10px] text-slate-500 mb-1">
                  Follow-Up Notes & Requests
                </label>
                <textarea
                  rows={3}
                  value={selectedLead.admin_notes || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedLead({ ...selectedLead, admin_notes: val });
                    setData(prev => ({
                      ...prev,
                      enquiries: prev.enquiries.map(enq => enq.id === selectedLead.id ? { ...enq, admin_notes: val } : enq)
                    }));
                  }}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-brand-ocean"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono">ID: #{selectedLead.id}</span>
              <button
                onClick={() => {
                  showToast("Customer lead saved!");
                  setSelectedLead(null);
                }}
                className="px-5 py-2 rounded-xl bg-brand-ocean hover:bg-brand-ocean-light text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
