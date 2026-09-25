"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  TrendingUp, Users, DollarSign, Award, CheckCircle2, Phone, 
  MessageCircle, Clock, Search, Filter, Settings, ShieldCheck, 
  Sparkles, ExternalLink, RefreshCw, Save, ArrowRight, Eye,
  Plus, Trash2, Edit3, X, Video, MapPin, Check, AlertCircle, 
  ChevronDown, ChevronUp, Calendar, Download, UserPlus, FileText,
  Kanban, Table as TableIcon, Flame, BellRing, ArrowUpRight, CheckSquare,
  Compass, Send, Copy, Mountain, Utensils, Home, Footprints, Layers,
  ChevronRight, BarChart3, HelpCircle, PhoneCall
} from "lucide-react";
import { OwnerOverviewData, OwnerEnquiry, updateEnquiryStatus, updateTripConfig, TripSummary } from "@/lib/api";
import { Trip, TripItinerary } from "@/lib/types";
import { formatCurrency, cn } from "@/lib/utils";

interface OwnerDashboardProps {
  initialData: OwnerOverviewData;
}

const PIPELINE_STAGES: Array<{
  key: OwnerEnquiry["status"];
  label: string;
  badgeClass: string;
  dotColor: string;
  headerBg: string;
}> = [
  { key: "NEW", label: "Fresh Inquiries", badgeClass: "bg-sky-50 text-sky-700 border-sky-200", dotColor: "bg-sky-500", headerBg: "bg-sky-50/80 border-sky-100" },
  { key: "CONTACTED", label: "In Discussion", badgeClass: "bg-amber-50 text-amber-700 border-amber-200", dotColor: "bg-amber-500", headerBg: "bg-amber-50/80 border-amber-100" },
  { key: "FOLLOW_UP", label: "Quote & Itinerary Sent", badgeClass: "bg-purple-50 text-purple-700 border-purple-200", dotColor: "bg-purple-500", headerBg: "bg-purple-50/80 border-purple-100" },
  { key: "PAYMENT_PENDING", label: "Payment Pending", badgeClass: "bg-orange-50 text-orange-700 border-orange-200", dotColor: "bg-orange-500", headerBg: "bg-orange-50/80 border-orange-100" },
  { key: "CONVERTED", label: "Confirmed & Paid", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200", dotColor: "bg-emerald-500", headerBg: "bg-emerald-50/80 border-emerald-100" },
  { key: "CLOSED", label: "Closed / Cold", badgeClass: "bg-slate-100 text-slate-600 border-slate-200", dotColor: "bg-slate-400", headerBg: "bg-slate-100/80 border-slate-200" },
];

const AVAILABLE_LOCAL_VIDEOS = [
  { label: "Dandeli Kali River Rafting", value: "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341176/spirit_adventures/shorts/dandeli_rafting.mp4", poster: "https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341325/spirit_adventures/shorts/dandeli_rafting_poster.jpg", region: "Karnataka" },
  { label: "Gokarna Coastal Trail & Om Beach", value: "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341208/spirit_adventures/shorts/gokarna_beach.mp4", poster: "https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341326/spirit_adventures/shorts/gokarna_beach_poster.jpg", region: "Karnataka" },
  { label: "Coorg Misty Coffee Highlands", value: "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341227/spirit_adventures/shorts/coorg_mist.mp4", poster: "https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341327/spirit_adventures/shorts/coorg_mist_poster.jpg", region: "Karnataka" },
  { label: "Chikmagalur Mullayanagiri Clouds", value: "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341233/spirit_adventures/shorts/chikmagalur_peak.mp4", poster: "https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341328/spirit_adventures/shorts/chikmagalur_peak_poster.jpg", region: "Karnataka" },
  { label: "Ooty Nilgiri Mountain Train & Pines", value: "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341289/spirit_adventures/shorts/ooty_train.mp4", poster: "https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341329/spirit_adventures/shorts/ooty_train_poster.jpg", region: "Tamil Nadu" },
  { label: "Wayanad Chembra Peak & Heart Lake", value: "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341310/spirit_adventures/shorts/wayanad_waterfall.mp4", poster: "https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341330/spirit_adventures/shorts/wayanad_waterfall_poster.jpg", region: "Kerala" },
  { label: "Ladakh Himalayan Motorcycle Pass", value: "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341157/spirit_adventures/hero/ladakh_bike.mp4", poster: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80", region: "Himalayas" },
  { label: "Kedarkantha Alpine Snow Summit", value: "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341160/spirit_adventures/hero/mountain_trek.mp4", poster: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80", region: "Uttarakhand" },
  { label: "Western Ghats Waterfall Plunge", value: "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341162/spirit_adventures/nature/waterfall.mp4", poster: "https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341314/spirit_adventures/hero/maldives_travel_poster.jpg", region: "Western Ghats" },
];

const WHATSAPP_TEMPLATES = [
  {
    id: "itinerary",
    title: "📋 Full Itinerary & Pricing",
    generateText: (lead: OwnerEnquiry) => 
      `Hi ${lead.full_name}! 🌿 Greetings from *Spirit Adventures*.\n\nThank you for reaching out regarding *${lead.trip_title}* for *${lead.travelers_count || 1} travelers*.\n\nHere are your trip details:\n• *Destination*: ${lead.trip_title}\n• *Group Size*: ${lead.travelers_count || 1} Pax\n• *Travel Dates*: ${lead.travel_date || "Upcoming Weekend"}\n• *Package Price*: ₹${lead.trip_price.toLocaleString("en-IN")}/person (All-inclusive stay, meals, guide & permits)\n\nWould you like us to reserve your slots or send the detailed day-wise schedule PDF? 🏔️`
  },
  {
    id: "payment",
    title: "💳 Slot Booking & Payment Link",
    generateText: (lead: OwnerEnquiry) => 
      `Hi ${lead.full_name}! ✨ Your slots for *${lead.trip_title}* (${lead.travelers_count || 1} Pax) are temporarily held.\n\nTotal Booking Amount: *₹${((lead.travelers_count || 1) * lead.trip_price).toLocaleString("en-IN")}*\n\nPlease complete your advance confirmation to lock in your mountain tent / homestay reservation. Let us know once completed and we'll dispatch your expedition kit list! 🎒`
  },
  {
    id: "checklist",
    title: "🎒 Things to Carry & Gear Guide",
    generateText: (lead: OwnerEnquiry) => 
      `Hi ${lead.full_name}! 🏕️ Here is your essential packing list for *${lead.trip_title}*:\n\n1. Trekking / Trail shoes with good rubber grip\n2. Quick-dry synthetic t-shirts & track pants\n3. Warm fleece / windcheater for evenings\n4. Reusable 1L water bottle\n5. Personal medication, headlamp/torch & power bank\n\nOur team leader contact will be shared 24 hours prior to departure.`
  },
  {
    id: "pickup",
    title: "📍 Pickup Hub & Timing Details",
    generateText: (lead: OwnerEnquiry) => 
      `Hi ${lead.full_name}! 🚌 Pickup logistics for *${lead.trip_title}*:\n\n• *Departure City*: ${lead.departure_city || "Bengaluru"}\n• *Pickup Point*: Main Hub (Exact GPS pin will be shared)\n• *Reporting Time*: Friday 10:00 PM\n• *Expedition Lead*: Spirit Adventures Ops Team\n\nSee you at the pickup point! Let us know if you have any questions.`
  }
];

export default function OwnerDashboard({ initialData }: OwnerDashboardProps) {
  const [data, setData] = useState<OwnerOverviewData>(initialData);
  const [activeTab, setActiveTab] = useState<"leads" | "packages" | "analytics" | "config">("leads");
  const [leadViewMode, setLeadViewMode] = useState<"kanban" | "table">("kanban");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedDestinationFilter, setSelectedDestinationFilter] = useState<string>("ALL");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals & Drawers
  const [isAddLeadOpen, setIsAddLeadOpen] = useState<boolean>(false);
  const [selectedLead, setSelectedLead] = useState<OwnerEnquiry | null>(null);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [editorTab, setEditorTab] = useState<"itinerary" | "general" | "media" | "inclusions">("itinerary");
  const [activeWaTemplate, setActiveWaTemplate] = useState<string>("itinerary");

  // Quick Ingestion Form State
  const [newLeadForm, setNewLeadForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    trip_title: "Dandeli Kali River White Water Rafting",
    trip_slug: "dandeli-river-rafting-jungle-expedition",
    travelers_count: 2,
    travel_date: "Upcoming Weekend",
    priority: "HIGH" as "HIGH" | "MEDIUM" | "LOW",
    status: "NEW" as OwnerEnquiry["status"],
    departure_city: "Bengaluru",
    follow_up_date: "Tomorrow 11:00 AM",
    admin_notes: "Inquired via phone / WhatsApp."
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered Leads
  const filteredEnquiries = useMemo(() => {
    return data.enquiries.filter((e) => {
      if (statusFilter !== "ALL" && e.status !== statusFilter) return false;
      if (priorityFilter !== "ALL" && e.priority !== priorityFilter) return false;
      if (selectedDestinationFilter !== "ALL") {
        if (!e.trip_title.toLowerCase().includes(selectedDestinationFilter.toLowerCase())) return false;
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
  }, [data.enquiries, statusFilter, priorityFilter, selectedDestinationFilter, searchTerm]);

  // Aggregate Calculations
  const totalPipelineRevenue = useMemo(() => {
    return data.enquiries.reduce((acc, curr) => acc + curr.trip_price * (curr.travelers_count || 1), 0);
  }, [data.enquiries]);

  const confirmedRevenue = useMemo(() => {
    return data.enquiries
      .filter((e) => e.status === "CONVERTED")
      .reduce((acc, curr) => acc + curr.trip_price * (curr.travelers_count || 1), 0);
  }, [data.enquiries]);

  const highPriorityCount = useMemo(() => {
    return data.enquiries.filter(e => e.priority === "HIGH").length;
  }, [data.enquiries]);

  const freshLeadsCount = useMemo(() => {
    return data.enquiries.filter(e => e.status === "NEW").length;
  }, [data.enquiries]);

  // Handle status update
  const handleStatusChange = async (id: number, newStatus: OwnerEnquiry["status"]) => {
    setSavingId(id);
    const success = await updateEnquiryStatus(id, newStatus);
    setSavingId(null);
    setData((prev) => ({
      ...prev,
      enquiries: prev.enquiries.map((e) => (e.id === id ? { ...e, status: newStatus } : e)),
    }));
    if (selectedLead && selectedLead.id === id) {
      setSelectedLead({ ...selectedLead, status: newStatus });
    }
    showToast(`Lead status updated to "${newStatus.replace("_", " ")}"`);
  };

  // Create new customer lead
  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.full_name.trim()) {
      showToast("Please provide Customer Name");
      return;
    }
    if (!newLeadForm.phone.trim() || !/^[0-9]{7,15}$/.test(newLeadForm.phone.trim())) { // Basic phone number validation
      showToast("Please provide a valid Phone Number (7-15 digits)");
      return;
    }
    if (newLeadForm.email.trim() && !/^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,6}$/.test(newLeadForm.email.trim())) { // Basic email validation
      showToast("Please provide a valid Email Address");
      return;
    }
    if (Number(newLeadForm.travelers_count) < 1) {
      showToast("Travelers count must be at least 1");
      return;
    }

    const matchedTrip = data.trips.find(t => t.title === newLeadForm.trip_title);
    const price = matchedTrip ? matchedTrip.price : 3999;

    const createdLead: OwnerEnquiry = {
      id: Date.now(),
      full_name: newLeadForm.full_name.trim(),
      email: newLeadForm.email.trim() || `${newLeadForm.full_name.toLowerCase().replace(/\s+/g, "")}@customer.in`,
      phone: newLeadForm.phone.trim(),
      travel_date: newLeadForm.travel_date,
      travelers_count: Number(newLeadForm.travelers_count) || 1,
      message: "Lead manually ingested via Owner CRM Desk.",
      status: newLeadForm.status,
      priority: newLeadForm.priority,
      departure_city: newLeadForm.departure_city,
      follow_up_date: newLeadForm.follow_up_date,
      admin_notes: newLeadForm.admin_notes,
      trip_title: newLeadForm.trip_title,
      trip_slug: matchedTrip ? matchedTrip.slug : "adventure-trip",
      trip_price: price,
      created_at: "Just now"
    };

    setData((prev) => ({
      ...prev,
      enquiries: [createdLead, ...prev.enquiries],
      metrics: {
        ...prev.metrics,
        total_leads: prev.metrics.total_leads + 1,
        new_leads: createdLead.status === "NEW" ? prev.metrics.new_leads + 1 : prev.metrics.new_leads
      }
    }));

    setIsAddLeadOpen(false);
    showToast(`🎉 Lead created for ${createdLead.full_name}!`);
    setNewLeadForm({
      full_name: "",
      email: "",
      phone: "",
      trip_title: data.trips[0]?.title || "Dandeli Kali River White Water Rafting",
      trip_slug: data.trips[0]?.slug || "dandeli-river-rafting-jungle-expedition",
      travelers_count: 2,
      travel_date: "Upcoming Weekend",
      priority: "HIGH",
      status: "NEW",
      departure_city: "Bengaluru",
      follow_up_date: "Tomorrow 11:00 AM",
      admin_notes: "Inquired via phone / WhatsApp."
    });
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ["ID", "Customer Name", "Phone", "Email", "Trip Package", "Travelers", "Travel Date", "Pipeline Status", "Priority", "Departure City", "Admin Notes"];
    const rows = filteredEnquiries.map(e => [
      e.id,
      `"${e.full_name}"`,
      `"${e.phone}"`,
      `"${e.email}"`,
      `"${e.trip_title}"`,
      e.travelers_count || 1,
      `"${e.travel_date || ""}"`,
      e.status,
      e.priority || "MEDIUM",
      `"${e.departure_city || ""}"`,
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
    showToast("Downloaded customer CRM CSV");
  };

  // Open Itinerary Editor
  const handleOpenEditTrip = (summary: TripSummary) => {
    const isSouthIndia = ["Dandeli", "Gokarna", "Coorg", "Chikmagalur", "Ooty", "Wayanad"].some(r => summary.destination_name.includes(r));
    
    const fullTrip: Trip = {
      id: summary.id,
      title: summary.title,
      slug: summary.slug,
      destination_name: summary.destination_name,
      destination_slug: summary.slug,
      category_name: summary.category_name,
      short_description: "Immersive nature and wilderness expedition with certified mountain leaders and local hospitality.",
      full_description: "Explore uncharted trails, pristine rivers, and mountain peaks with full safety gear, local homestays, and campfire nights.",
      duration_days: summary.duration_days ?? 3,
      duration_nights: summary.duration_nights ?? 2,
      duration_label: `${summary.duration_days ?? 3}D / ${summary.duration_nights ?? 2}N`,
      difficulty: (summary.difficulty as any) ?? "MODERATE",
      price: summary.price,
      original_price: Math.round(summary.price * 1.3),
      pickup_location: `${summary.destination_name.split(",")[0]} Station Hub (7:00 AM)`,
      drop_location: `${summary.destination_name.split(",")[0]} Station Hub (6:00 PM)`,
      altitude: isSouthIndia ? "5,800 ft Western Ghats" : "14,500 ft High Himalayas",
      trek_distance: "16 km circuit",
      best_season: isSouthIndia ? "Sep to May" : "May to Oct / Dec to Apr",
      cover_image: summary.cover_image || "https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341325/spirit_adventures/shorts/dandeli_rafting_poster.jpg",
      hero_video_url: summary.hero_video_url || "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341176/spirit_adventures/shorts/dandeli_rafting.mp4",
      is_featured: summary.is_featured,
      is_bestseller: summary.is_bestseller,
      inclusions: [
        "Certified IRF / IMF expedition leader & safety marshals",
        "All nutritious meals (Breakfast, Packed Trail Lunch, Hot Dinner)",
        "Tents / eco-resort / heritage homestay accommodation",
        "Technical safety gear, life jackets, helmets, permits & first-aid kit"
      ],
      exclusions: [
        "Personal transport to pickup hub",
        "Personal snacks, tips & cafe visits",
        "Optional water sports or bike security deposit"
      ],
      things_to_carry: [
        "Trekking shoes with deep lug grip",
        "Quick-dry synthetic apparel & warm evening fleece",
        "Reusable 1L water bottle & energy bars",
        "Torch / headlamp & power bank"
      ],
      itinerary_days: [
        {
          id: 1,
          day_number: 1,
          title: `Day 1: Arrival, Welcome Briefing & First Trail in ${summary.destination_name.split(",")[0]}`,
          description: "Arrive at base camp. Welcome refreshments and safety gear fitting. Afternoon introductory trail walk and evening riverside bonfire.",
          altitude: "4,200 ft",
          distance: "5 km trail",
          meals: "Lunch, Dinner",
          stay_type: "Riverside Eco Tents"
        },
        {
          id: 2,
          day_number: 2,
          title: "Day 2: Main Summit Ridge / White Water Rapids & Sunset Vista",
          description: "Early morning start for main mountain summit ridge or river rafting stretch. Packed trail lunch and glorious panoramic sunset vista.",
          altitude: isSouthIndia ? "5,800 ft" : "12,500 ft",
          distance: "10 km trail",
          meals: "Breakfast, Lunch, Dinner",
          stay_type: "Alpine Stargazing Camp"
        },
        {
          id: 3,
          day_number: 3,
          title: "Day 3: Heritage Village Exploration & Departure",
          description: "Morning celebration breakfast, local spice / coffee plantation walk, and transfer to drop point with unforgettable memories.",
          altitude: "Base level",
          distance: "3 km walk",
          meals: "Breakfast, Lunch",
          stay_type: "Departure"
        }
      ]
    };
    setEditingTrip(fullTrip);
    setEditorTab("itinerary");
  };

  const handleSaveTripForm = () => {
    if (!editingTrip) return;
    setData((prev) => {
      const exists = prev.trips.some((t) => t.id === editingTrip.id);
      let updatedTrips: TripSummary[];
      if (exists) {
        updatedTrips = prev.trips.map((t) =>
          t.id === editingTrip.id
            ? {
                ...t,
                title: editingTrip.title,
                price: editingTrip.price,
                difficulty: editingTrip.difficulty,
                duration_days: editingTrip.duration_days,
                duration_nights: editingTrip.duration_nights,
                is_featured: editingTrip.is_featured,
                is_bestseller: editingTrip.is_bestseller,
                cover_image: editingTrip.cover_image,
                hero_video_url: editingTrip.hero_video_url,
              }
            : t
        );
      } else {
        const newSummary: TripSummary = {
          id: editingTrip.id,
          title: editingTrip.title,
          slug: editingTrip.slug,
          destination_name: editingTrip.destination_name || "Custom",
          category_name: editingTrip.category_name || "Treks",
          duration_days: editingTrip.duration_days,
          duration_nights: editingTrip.duration_nights,
          difficulty: editingTrip.difficulty,
          price: editingTrip.price,
          is_featured: editingTrip.is_featured,
          is_bestseller: editingTrip.is_bestseller,
          is_published: true,
          cover_image: editingTrip.cover_image,
          hero_video_url: editingTrip.hero_video_url,
        };
        updatedTrips = [newSummary, ...prev.trips];
      }
      return {
        ...prev,
        trips: updatedTrips,
        metrics: { ...prev.metrics, active_trips_count: updatedTrips.length }
      };
    });
    showToast(`Saved itinerary & details for "${editingTrip.title}"!`);
    setEditingTrip(null);
  };

  const handleAddItineraryDay = () => {
    if (!editingTrip) return;
    const days = editingTrip.itinerary_days || [];
    const nextDayNum = days.length + 1;
    const newDay: TripItinerary = {
      id: Date.now(),
      day_number: nextDayNum,
      title: `Day ${nextDayNum}: Ridge Summit / Valley Trek Milestone`,
      description: "Morning departure for the designated mountain trail section, outdoor packed lunch, and evening campfire relaxation.",
      altitude: "5,400 ft",
      distance: "8 km trail",
      meals: "Breakfast, Lunch, Dinner",
      stay_type: "Alpine Tents"
    };
    setEditingTrip({ ...editingTrip, itinerary_days: [...days, newDay] });
  };

  const handleDeleteItineraryDay = (dayIndex: number) => {
    if (!editingTrip) return;
    const days = [...(editingTrip.itinerary_days || [])];
    days.splice(dayIndex, 1);
    const renumbered = days.map((d, i) => ({ ...d, day_number: i + 1 }));
    setEditingTrip({ ...editingTrip, itinerary_days: renumbered });
  };

  const handleUpdateDayField = (dayIndex: number, field: keyof TripItinerary, value: any) => {
    if (!editingTrip) return;
    const days = [...(editingTrip.itinerary_days || [])];
    days[dayIndex] = { ...days[dayIndex], [field]: value };
    setEditingTrip({ ...editingTrip, itinerary_days: days });
  };

  // Helper for WhatsApp action
  const openWhatsAppLead = (lead: OwnerEnquiry, templateId: string = "itinerary") => {
    const template = WHATSAPP_TEMPLATES.find(t => t.id === templateId) || WHATSAPP_TEMPLATES[0];
    const message = template.generateText(lead);
    const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-brand-ocean selection:text-white pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-brand-navy text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-3 font-semibold text-xs border border-brand-ocean/40 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP LUXURY APP BAR */}
      <header className="sticky top-0 z-40 bg-brand-navy/95 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-ocean to-brand-sky flex items-center justify-center text-white font-black shadow-md group-hover:scale-105 transition">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="font-display font-black text-base text-white tracking-wide block leading-none">
                  SPIRIT ADVENTURES
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-sky block mt-0.5">
                  Executive Suite &bull; Owner HQ
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Primary Bar Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setIsAddLeadOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider transition shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add Lead</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold transition border border-white/10"
            >
              <Eye className="w-3.5 h-3.5 text-brand-sky" />
              <span>Live Site</span>
            </Link>

            <a
              href="http://localhost:8000/admin/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 text-xs font-semibold transition border border-white/10"
            >
              <span>Django DB</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </header>

      {/* HERO EXECUTIVE OVERVIEW BANNER */}
      <section className="bg-gradient-to-b from-brand-navy via-brand-navy/90 to-slate-900 pt-8 pb-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-brand-sky/20 text-brand-sky text-[11px] font-bold uppercase tracking-wider border border-brand-sky/30">
                  Real-time CRM & Fleet Operations
                </span>
                <span className="text-xs text-slate-400">&bull; Last updated live</span>
              </div>
              <h1 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tight text-white">
                Operations & Lead Dispatch Desk
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl font-normal">
                Manage incoming adventure inquiries, dispatch day-wise itineraries on WhatsApp in 1-click, and configure local video packages.
              </p>
            </div>

            {/* Quick Action Summary Stats Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">VIP High Priority</span>
                <span className="font-display font-black text-lg text-rose-400">🔥 {highPriorityCount} Leads</span>
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Fresh Uncontacted</span>
                <span className="font-display font-black text-lg text-sky-400">⚡ {freshLeadsCount} New</span>
              </div>
            </div>
          </div>

          {/* 4 EXECUTIVE KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {/* Total Pipeline Revenue */}
            <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 border border-slate-700/80 shadow-lg hover:border-brand-ocean/50 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pipeline Deal Value</span>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="font-display font-black text-2xl sm:text-3xl text-white">
                  {formatCurrency(totalPipelineRevenue)}
                </div>
                <div className="flex items-center space-x-1.5 mt-1 text-xs text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{formatCurrency(confirmedRevenue)} Confirmed & Paid</span>
                </div>
              </div>
            </div>

            {/* Total Leads Count */}
            <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 border border-slate-700/80 shadow-lg hover:border-brand-ocean/50 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Pipeline Leads</span>
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-brand-sky border border-sky-500/20 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="font-display font-black text-2xl sm:text-3xl text-white">
                  {data.enquiries.length} Travelers
                </div>
                <div className="flex items-center space-x-1.5 mt-1 text-xs text-brand-sky font-semibold">
                  <span>{freshLeadsCount} Fresh Inquiries</span>
                  <span>&bull;</span>
                  <span className="text-amber-400 font-bold">{data.enquiries.filter(e => e.status === "FOLLOW_UP").length} Follow-ups</span>
                </div>
              </div>
            </div>

            {/* Conversion Rate */}
            <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 border border-slate-700/80 shadow-lg hover:border-brand-ocean/50 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Conversion Win Rate</span>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="font-display font-black text-2xl sm:text-3xl text-white">
                  {data.metrics.conversion_rate}%
                </div>
                <div className="flex items-center space-x-1.5 mt-1 text-xs text-purple-300 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>High engagement on WhatsApp</span>
                </div>
              </div>
            </div>

            {/* Active Expedition Packages */}
            <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 border border-slate-700/80 shadow-lg hover:border-brand-ocean/50 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Adventure Inventory</span>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="font-display font-black text-2xl sm:text-3xl text-white">
                  {data.trips.length} Packages
                </div>
                <div className="flex items-center space-x-1 mt-1 text-xs text-amber-300 truncate">
                  <span>Dandeli, Gokarna, Coorg, Ooty, Ladakh</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN OPERATIONS WORKSPACE */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 mt-6 space-y-6">
        {/* TAB CONTROLS & UTILITIES */}
        <div className="bg-slate-800/90 rounded-2xl p-3 border border-slate-700 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Main Module Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setActiveTab("leads")}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer",
                activeTab === "leads"
                  ? "bg-brand-ocean text-white shadow-lg font-black scale-[1.02]"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              )}
            >
              <Users className="w-4 h-4" />
              <span>Customer CRM Leads ({data.enquiries.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("packages")}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer",
                activeTab === "packages"
                  ? "bg-brand-ocean text-white shadow-lg font-black scale-[1.02]"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              )}
            >
              <Mountain className="w-4 h-4" />
              <span>Day-Wise Itinerary Studio ({data.trips.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer",
                activeTab === "analytics"
                  ? "bg-brand-ocean text-white shadow-lg font-black scale-[1.02]"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              )}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Destination Breakdown</span>
            </button>

            <button
              onClick={() => setActiveTab("config")}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer",
                activeTab === "config"
                  ? "bg-brand-ocean text-white shadow-lg font-black scale-[1.02]"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              )}
            >
              <Settings className="w-4 h-4" />
              <span>WhatsApp & Channels</span>
            </button>
          </div>

          {/* View Mode & Export (Only on leads tab) */}
          {activeTab === "leads" && (
            <div className="flex items-center space-x-2 self-end md:self-auto">
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition border border-slate-600 shadow-xs cursor-pointer"
                title="Export all leads to CSV file"
              >
                <Download className="w-3.5 h-3.5 text-slate-300" />
                <span>Export CSV</span>
              </button>

              <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-700">
                <button
                  onClick={() => setLeadViewMode("kanban")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer",
                    leadViewMode === "kanban" ? "bg-brand-ocean text-white shadow-sm" : "text-slate-400 hover:text-white"
                  )}
                >
                  <Kanban className="w-3.5 h-3.5" />
                  <span>Kanban</span>
                </button>
                <button
                  onClick={() => setLeadViewMode("table")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer",
                    leadViewMode === "table" ? "bg-brand-ocean text-white shadow-sm" : "text-slate-400 hover:text-white"
                  )}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Table</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* MODULE 1: ADVANCED HIGH-VOLUME CRM PIPELINE                               */}
        {/* ========================================================================= */}
        {activeTab === "leads" && (
          <div className="space-y-4">
            {/* Search, Filter & Quick Tag Bar */}
            <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 shadow-md flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customer, phone, package, city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-ocean"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Priority, Destination & Stage Filters */}
              <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-brand-ocean cursor-pointer"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="HIGH">🔥 High Priority (VIP)</option>
                  <option value="MEDIUM">⚡ Medium</option>
                  <option value="LOW">💤 Low</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-brand-ocean cursor-pointer"
                >
                  <option value="ALL">All Stages</option>
                  <option value="NEW">Fresh Inquiries</option>
                  <option value="CONTACTED">In Discussion</option>
                  <option value="FOLLOW_UP">Quote / Itinerary Sent</option>
                  <option value="PAYMENT_PENDING">Payment Pending</option>
                  <option value="CONVERTED">Confirmed & Paid</option>
                  <option value="CLOSED">Closed / Cold</option>
                </select>

                <select
                  value={selectedDestinationFilter}
                  onChange={(e) => setSelectedDestinationFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-brand-ocean cursor-pointer"
                >
                  <option value="ALL">All Destinations</option>
                  <option value="Dandeli">Dandeli</option>
                  <option value="Gokarna">Gokarna</option>
                  <option value="Coorg">Coorg</option>
                  <option value="Chikmagalur">Chikmagalur</option>
                  <option value="Ooty">Ooty</option>
                  <option value="Wayanad">Wayanad</option>
                  <option value="Ladakh">Ladakh</option>
                  <option value="Kedarkantha">Kedarkantha</option>
                </select>
              </div>
            </div>

            {/* KANBAN VIEW (Twenty CRM Style with Luxury Navy/Ocean Accents) */}
            {leadViewMode === "kanban" && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
                {PIPELINE_STAGES.filter(s => s.key !== "CLOSED").map((stage) => {
                  const stageLeads = filteredEnquiries.filter((e) => e.status === stage.key);
                  const stageTotalValue = stageLeads.reduce((acc, curr) => acc + curr.trip_price * (curr.travelers_count || 1), 0);

                  return (
                    <div
                      key={stage.key}
                      className="bg-slate-800/70 rounded-2xl p-3 border border-slate-700/80 flex flex-col space-y-3 min-w-[270px]"
                    >
                      {/* Column Header */}
                      <div className="flex items-center justify-between px-1 py-1 border-b border-slate-700/50 pb-2">
                        <div className="flex items-center space-x-2">
                          <span className={cn("w-2.5 h-2.5 rounded-full ring-2 ring-white/10", stage.dotColor)} />
                          <h3 className="font-bold text-xs text-white uppercase tracking-wider">
                            {stage.label}
                          </h3>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-200 text-[10px] font-black">
                          {stageLeads.length}
                        </span>
                      </div>

                      {/* Stage Value Aggregate */}
                      <div className="px-1 text-[11px] font-bold text-slate-400 flex items-center justify-between">
                        <span>Stage Total:</span>
                        <span className="text-brand-sky">{formatCurrency(stageTotalValue)}</span>
                      </div>

                      {/* Lead Cards List */}
                      <div className="space-y-3 min-h-[380px]">
                        {stageLeads.map((lead) => (
                          <div
                            key={lead.id}
                            onClick={() => setSelectedLead(lead)}
                            className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-700/80 hover:border-brand-ocean shadow-md hover:shadow-cyan-500/10 transition-all cursor-pointer space-y-3 group relative"
                          >
                            {/* Card Top: Priority & Name */}
                            <div className="flex items-start justify-between gap-1">
                              <div>
                                <h4 className="font-bold text-sm text-white group-hover:text-brand-sky transition">
                                  {lead.full_name}
                                </h4>
                                <div className="text-[11px] font-medium text-slate-400">
                                  👥 {lead.travelers_count} Pax &bull; {lead.departure_city || "Bengaluru"}
                                </div>
                              </div>

                              {lead.priority === "HIGH" && (
                                <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[9px] font-black border border-rose-500/30">
                                  🔥 VIP
                                </span>
                              )}
                            </div>

                            {/* Trip Badge */}
                            <div className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700/60 text-[10px] font-bold text-slate-300 truncate flex items-center space-x-1">
                              <MapPin className="w-3 h-3 text-brand-ocean flex-shrink-0" />
                              <span className="truncate">{lead.trip_title}</span>
                            </div>

                            {/* Follow-up reminder pill */}
                            {lead.follow_up_date && (
                              <div className="flex items-center space-x-1.5 text-[10px] text-amber-300 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 font-medium">
                                <Clock className="w-3 h-3 text-amber-400" />
                                <span>Due: {lead.follow_up_date}</span>
                              </div>
                            )}

                            {/* Card Bottom: Deal Value & WhatsApp Quick Actions */}
                            <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between">
                              <span className="font-display font-black text-xs text-brand-sky">
                                {formatCurrency(lead.trip_price * (lead.travelers_count || 1))}
                              </span>

                              <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => openWhatsAppLead(lead, "itinerary")}
                                  className="w-7 h-7 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 flex items-center justify-center transition hover:scale-110 cursor-pointer"
                                  title="Send WhatsApp Itinerary"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </button>

                                <a
                                  href={`tel:${lead.phone}`}
                                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center transition"
                                  title="Call Customer"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>

                                <button
                                  onClick={() => setSelectedLead(lead)}
                                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-brand-ocean text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center transition"
                                  title="View Full Profile"
                                >
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {stageLeads.length === 0 && (
                          <div className="py-12 text-center text-slate-500 text-xs italic border-2 border-dashed border-slate-700/60 rounded-xl">
                            No active leads in this stage
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TABLE VIEW (High-Density Spreadsheet View) */}
            {leadViewMode === "table" && (
              <div className="bg-slate-800/90 rounded-2xl border border-slate-700 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/90 border-b border-slate-700 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="py-3.5 px-4">Customer</th>
                        <th className="py-3.5 px-4">Trip Package</th>
                        <th className="py-3.5 px-4">Group Size</th>
                        <th className="py-3.5 px-4">Est. Value</th>
                        <th className="py-3.5 px-4">Pipeline Stage</th>
                        <th className="py-3.5 px-4">Priority</th>
                        <th className="py-3.5 px-4">Follow-Up Due</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/60">
                      {filteredEnquiries.map((lead) => (
                        <tr
                          key={lead.id}
                          onClick={() => setSelectedLead(lead)}
                          className="hover:bg-slate-750/70 transition cursor-pointer"
                        >
                          <td className="py-3 px-4">
                            <div className="font-bold text-white text-sm">{lead.full_name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{lead.phone}</div>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-200">
                            {lead.trip_title}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 font-bold border border-slate-700">
                              {lead.travelers_count} Pax
                            </span>
                          </td>
                          <td className="py-3 px-4 font-display font-black text-brand-sky">
                            {formatCurrency(lead.trip_price * (lead.travelers_count || 1))}
                          </td>
                          <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={lead.status}
                              onChange={(e) => handleStatusChange(lead.id, e.target.value as any)}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border border-slate-700 bg-slate-900 text-white focus:outline-none cursor-pointer"
                            >
                              <option value="NEW">NEW</option>
                              <option value="CONTACTED">CONTACTED</option>
                              <option value="FOLLOW_UP">FOLLOW UP</option>
                              <option value="PAYMENT_PENDING">PAYMENT PENDING</option>
                              <option value="CONVERTED">CONVERTED (PAID)</option>
                              <option value="CLOSED">CLOSED</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                              lead.priority === "HIGH" ? "bg-rose-500/20 text-rose-300 border-rose-500/30" :
                              lead.priority === "MEDIUM" ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-slate-800 text-slate-400 border-slate-700"
                            )}>
                              {lead.priority || "MEDIUM"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-amber-300/90 font-medium">
                            {lead.follow_up_date || "-"}
                          </td>
                          <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => openWhatsAppLead(lead, "itinerary")}
                                className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition"
                                title="WhatsApp"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setSelectedLead(lead)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                              >
                                <ArrowUpRight className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 2: PACKAGE & DAY-WISE ITINERARY STUDIO                             */}
        {/* ========================================================================= */}
        {activeTab === "packages" && (
          <div className="space-y-6">
            <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-sky">
                  Live Adventure Inventory
                </span>
                <h3 className="text-xl font-display font-black text-white">
                  Expedition Routes & Day-Wise Milestone Studio
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure local video backgrounds, price per head, difficulty, and day-by-day trail activities for all 8+ destinations.
                </p>
              </div>

              <button
                onClick={() => {
                  const newTrip: Trip = {
                    id: Date.now(),
                    title: "New Wilderness Expedition",
                    slug: "new-wilderness-expedition",
                    destination_name: "Dandeli, Karnataka",
                    destination_slug: "dandeli",
                    category_name: "Water Sports",
                    short_description: "New small-group wilderness adventure.",
                    duration_days: 3,
                    duration_nights: 2,
                    duration_label: "3D / 2N",
                    difficulty: "MODERATE",
                    price: 4499,
                    original_price: 5999,
                    pickup_location: "Hubli Railway Station (7:00 AM)",
                    drop_location: "Hubli Railway Station (6:00 PM)",
                    altitude: "2,500 ft",
                    trek_distance: "14 km",
                    best_season: "Sep to May",
                    cover_image: "https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341325/spirit_adventures/shorts/dandeli_rafting_poster.jpg",
                    hero_video_url: "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341176/spirit_adventures/shorts/dandeli_rafting.mp4",
                    is_featured: true,
                    is_bestseller: false,
                    inclusions: ["All meals", "Certified leader", "Stay", "Safety gear"],
                    exclusions: ["Personal travel to hub"],
                    things_to_carry: ["Grip trail shoes", "Water bottle"],
                    itinerary_days: [
                      {
                        id: 1,
                        day_number: 1,
                        title: "Day 1: Arrival & River Rapid Briefing",
                        description: "Check into camp and start preliminary trail exploration.",
                        altitude: "1,500 ft",
                        distance: "5 km",
                        meals: "Lunch, Dinner",
                        stay_type: "Eco Tents"
                      }
                    ]
                  };
                  setEditingTrip(newTrip);
                  setEditorTab("itinerary");
                }}
                className="px-5 py-2.5 rounded-xl bg-brand-ocean hover:bg-brand-ocean-light text-white text-xs font-bold uppercase tracking-wider transition shadow-lg flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add New Adventure Package</span>
              </button>
            </div>

            {/* Packages Grid with Real Local Looping Videos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.trips.map((trip) => (
                <div
                  key={trip.id}
                  className="bg-slate-800/80 rounded-2xl overflow-hidden border border-slate-700 shadow-lg hover:border-brand-ocean transition-all flex flex-col justify-between group"
                >
                  {/* Media Header (Local Video Player) */}
                  <div className="relative aspect-[16/10] w-full bg-slate-950 overflow-hidden">
                    {trip.hero_video_url ? (
                      <video
                        src={trip.hero_video_url}
                        poster={trip.cover_image}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <Image
                        src={trip.cover_image || "https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341325/spirit_adventures/shorts/dandeli_rafting_poster.jpg"}
                        alt={trip.title}
                        fill
                        className="object-cover"
                      />
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/30 to-black/40 pointer-events-none" />

                    {/* Destination Pill & Feature Badge */}
                    <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-bold uppercase border border-white/10">
                        📍 {trip.destination_name}
                      </span>
                      {trip.is_featured && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase shadow">
                          ★ Featured
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-bold">
                      <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md">
                        ⏱ {trip.duration_label || `${trip.duration_days}D / ${trip.duration_nights}N`}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white/20 backdrop-blur-md uppercase text-[10px]">
                        {trip.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
                    <div>
                      <h4 className="font-display font-bold text-base text-white leading-snug line-clamp-2">
                        {trip.title}
                      </h4>
                      <div className="mt-3 flex items-baseline space-x-2">
                        <span className="font-display font-black text-xl text-brand-sky">
                          {formatCurrency(trip.price)}
                        </span>
                        <span className="text-xs text-slate-400">per person all-inclusive</span>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="pt-3 border-t border-slate-700/80 flex items-center justify-between gap-2">
                      <button
                        onClick={async () => {
                          const success = await updateTripConfig(trip.id, { is_featured: !trip.is_featured });
                          if (success) {
                            setData(prev => ({
                              ...prev,
                              trips: prev.trips.map(t => t.id === trip.id ? { ...t, is_featured: !trip.is_featured } : t)
                            }));
                            showToast(trip.is_featured ? "Removed from featured banner" : "Featured on homepage!");
                          }
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer",
                          trip.is_featured
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold"
                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        )}
                      >
                        {trip.is_featured ? "★ Featured" : "☆ Feature"}
                      </button>

                      <button
                        onClick={() => handleOpenEditTrip(trip)}
                        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-ocean hover:bg-brand-ocean-light text-white text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Day-wise Plan</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 3: DESTINATION BREAKDOWN & INSIGHTS                                */}
        {/* ========================================================================= */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="bg-slate-800/90 p-6 rounded-2xl border border-slate-700 shadow-md">
              <h3 className="text-xl font-display font-black text-white">
                Destination Demand & Lead Distribution
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Real-time booking inquiries mapped to each adventure hub.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {["Dandeli", "Gokarna", "Coorg", "Chikmagalur", "Ooty", "Wayanad", "Ladakh", "Kedarkantha"].map((dest) => {
                  const matchingLeads = data.enquiries.filter(e => e.trip_title.toLowerCase().includes(dest.toLowerCase()));
                  const destRevenue = matchingLeads.reduce((acc, curr) => acc + curr.trip_price * (curr.travelers_count || 1), 0);
                  const convertedCount = matchingLeads.filter(e => e.status === "CONVERTED").length;

                  return (
                    <div key={dest} className="bg-slate-900/90 p-4 rounded-xl border border-slate-700/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-white">📍 {dest}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-brand-ocean/20 text-brand-sky font-bold">
                          {matchingLeads.length} Leads
                        </span>
                      </div>
                      <div className="font-display font-black text-lg text-emerald-400">
                        {formatCurrency(destRevenue)}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
                        <span>Converted:</span>
                        <span className="text-white font-bold">{convertedCount} groups</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 4: BUSINESS CONFIG & WHATSAPP SETTINGS                             */}
        {/* ========================================================================= */}
        {activeTab === "config" && (
          <div className="bg-slate-800/90 p-6 sm:p-8 rounded-2xl border border-slate-700 shadow-md max-w-3xl space-y-6">
            <div>
              <h3 className="font-display font-bold text-xl text-white">Official Operations & Dispatch Channels</h3>
              <p className="text-xs text-slate-400 mt-1">
                Configure primary WhatsApp dispatch numbers, emergency helplines, and expedition departure hubs.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                  Official WhatsApp Contact Number
                </label>
                <input
                  type="text"
                  defaultValue="+91 98765 43210"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-ocean"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                  Customer Support Email
                </label>
                <input
                  type="email"
                  defaultValue="hello@spiritadventures.in"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-ocean"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                  Operating Base Hubs
                </label>
                <input
                  type="text"
                  defaultValue="Bengaluru, Dehradun, Leh, Hubli, Mysore, Coimbatore"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-ocean"
                />
              </div>

              <button
                onClick={() => showToast("Business configuration updated successfully!")}
                className="px-6 py-2.5 rounded-xl bg-brand-ocean hover:bg-brand-ocean-light text-white font-bold text-xs uppercase tracking-wider transition shadow-md cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 5. MODAL: ADD CUSTOMER LEAD INGESTION                                     */}
      {/* ========================================================================= */}
      {isAddLeadOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 w-full max-w-xl rounded-3xl border border-slate-700 shadow-2xl overflow-hidden text-slate-200">
            {/* Modal Header */}
            <div className="bg-brand-navy p-5 flex items-center justify-between border-b border-white/10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-sky">
                  Rapid Lead Ingestion
                </span>
                <h3 className="font-display font-bold text-lg text-white">Add Customer Inquiry</h3>
              </div>
              <button 
                onClick={() => setIsAddLeadOpen(false)} 
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateLead} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-[10px] text-slate-400 mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={newLeadForm.full_name}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, full_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-ocean"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-[10px] text-slate-400 mb-1">WhatsApp / Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 9876543210"
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-ocean"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-[10px] text-slate-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="rahul@example.com"
                    value={newLeadForm.email}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-ocean"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-[10px] text-slate-400 mb-1">Departure City</label>
                  <input
                    type="text"
                    placeholder="Bengaluru / Mumbai / Pune"
                    value={newLeadForm.departure_city}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, departure_city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-ocean"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-[10px] text-slate-400 mb-1">Trip Package Interest</label>
                  <select
                    value={newLeadForm.trip_title}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, trip_title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-ocean cursor-pointer"
                  >
                    {data.trips.map(t => (
                      <option key={t.id} value={t.title}>{t.title} ({t.destination_name})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-[10px] text-slate-400 mb-1">Travelers Count (Pax)</label>
                  <input
                    type="number"
                    min={1}
                    value={newLeadForm.travelers_count}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, travelers_count: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-ocean"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-[10px] text-slate-400 mb-1">Priority Level</label>
                  <select
                    value={newLeadForm.priority}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, priority: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="HIGH">🔥 High Priority (VIP)</option>
                    <option value="MEDIUM">⚡ Medium</option>
                    <option value="LOW">💤 Low</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-[10px] text-slate-400 mb-1">Follow-Up Reminder</label>
                  <input
                    type="text"
                    placeholder="Tomorrow 11:00 AM"
                    value={newLeadForm.follow_up_date}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, follow_up_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-ocean"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-[10px] text-slate-400 mb-1">Initial Notes / Requirements</label>
                <textarea
                  rows={2}
                  placeholder="Tentative dates, corporate requirements, tent preferences..."
                  value={newLeadForm.admin_notes}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, admin_notes: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-ocean"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddLeadOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg cursor-pointer"
                >
                  Save & Ingest Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. DRAWER: LEAD DETAIL & MULTI-TEMPLATE WHATSAPP DISPATCH                 */}
      {/* ========================================================================= */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-fade-in">
          <div className="bg-slate-900 w-full max-w-lg h-full shadow-2xl flex flex-col justify-between border-l border-slate-700 overflow-y-auto text-slate-200">
            {/* Drawer Header */}
            <div className="p-6 bg-brand-navy text-white flex items-start justify-between border-b border-white/10">
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

            {/* Drawer Body */}
            <div className="p-6 space-y-6 flex-grow overflow-y-auto">
              {/* Direct WhatsApp & Call Action Bar */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  1-Click WhatsApp Dispatch (Choose Message Template)
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
                        "p-2.5 rounded-xl text-[11px] font-bold border transition text-left flex items-center justify-between cursor-pointer",
                        activeWaTemplate === tmpl.id
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750"
                      )}
                    >
                      <span className="truncate">{tmpl.title}</span>
                      <Send className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Lead Details Grid */}
              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Phone</span>
                  <span className="font-bold text-white font-mono">{selectedLead.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Email</span>
                  <span className="font-bold text-white">{selectedLead.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Group Size</span>
                  <span className="font-bold text-brand-sky">{selectedLead.travelers_count || 1} Travelers</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Departure City</span>
                  <span className="font-bold text-white">{selectedLead.departure_city || "Bengaluru"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Quoted Total Value</span>
                  <span className="font-display font-black text-brand-sky text-sm">
                    {formatCurrency(selectedLead.trip_price * (selectedLead.travelers_count || 1))}
                  </span>
                </div>
              </div>

              {/* Pipeline Stage Updater */}
              <div>
                <label className="block font-bold uppercase text-[10px] text-slate-400 mb-2">
                  Update Lead Stage in Pipeline
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PIPELINE_STAGES.map(st => (
                    <button
                      key={st.key}
                      onClick={() => handleStatusChange(selectedLead.id, st.key)}
                      className={cn(
                        "py-2 px-3 rounded-xl text-[11px] font-bold border transition text-left flex items-center justify-between cursor-pointer",
                        selectedLead.status === st.key
                          ? "bg-brand-ocean text-white border-brand-sky"
                          : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750"
                      )}
                    >
                      <span>{st.label.split(" ")[0]}</span>
                      {selectedLead.status === st.key && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin Notes & Activity Log */}
              <div>
                <label className="block font-bold uppercase text-[10px] text-slate-400 mb-1">
                  Follow-Up Notes & Customer Requests
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
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-ocean"
                />
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono">ID: #{selectedLead.id}</span>
              <button
                onClick={() => {
                  showToast("Customer lead saved!");
                  setSelectedLead(null);
                }}
                className="px-5 py-2 rounded-xl bg-brand-ocean hover:bg-brand-ocean-light text-white font-bold text-xs cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL: DAY-WISE ITINERARY & EXPEDITION ARCHITECT                       */}
      {/* ========================================================================= */}
      {editingTrip && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in overflow-y-auto">
          <div className="bg-slate-900 w-full max-w-4xl max-h-[92vh] rounded-3xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden text-slate-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-700 flex items-center justify-between bg-brand-navy text-white">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-sky">
                  Day-Wise Route Architect
                </span>
                <h3 className="text-lg sm:text-xl font-display font-black text-white mt-0.5">
                  {editingTrip.title}
                </h3>
              </div>

              <button
                onClick={() => setEditingTrip(null)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center space-x-1 px-6 pt-3 border-b border-slate-750 bg-slate-950 overflow-x-auto">
              <button
                onClick={() => setEditorTab("itinerary")}
                className={cn(
                  "px-4 py-2.5 rounded-t-xl text-xs font-black uppercase tracking-wider transition whitespace-nowrap cursor-pointer",
                  editorTab === "itinerary"
                    ? "bg-slate-900 text-brand-sky border-t-2 border-brand-ocean"
                    : "text-slate-400 hover:text-white"
                )}
              >
                ✨ Day-Wise Plan ({(editingTrip.itinerary_days || []).length} Days)
              </button>

              <button
                onClick={() => setEditorTab("general")}
                className={cn(
                  "px-4 py-2.5 rounded-t-xl text-xs font-black uppercase tracking-wider transition whitespace-nowrap cursor-pointer",
                  editorTab === "general"
                    ? "bg-slate-900 text-brand-sky border-t-2 border-brand-ocean"
                    : "text-slate-400 hover:text-white"
                )}
              >
                Pricing & Logistics
              </button>

              <button
                onClick={() => setEditorTab("media")}
                className={cn(
                  "px-4 py-2.5 rounded-t-xl text-xs font-black uppercase tracking-wider transition whitespace-nowrap cursor-pointer",
                  editorTab === "media"
                    ? "bg-slate-900 text-brand-sky border-t-2 border-brand-ocean"
                    : "text-slate-400 hover:text-white"
                )}
              >
                🎬 Local Video Background
              </button>

              <button
                onClick={() => setEditorTab("inclusions")}
                className={cn(
                  "px-4 py-2.5 rounded-t-xl text-xs font-black uppercase tracking-wider transition whitespace-nowrap cursor-pointer",
                  editorTab === "inclusions"
                    ? "bg-slate-900 text-brand-sky border-t-2 border-brand-ocean"
                    : "text-slate-400 hover:text-white"
                )}
              >
                Inclusions & Gear List
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-grow">
              {/* TAB 1: DAY-WISE TIMELINE */}
              {editorTab === "itinerary" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-white">Expedition Trail Milestones</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Define daily trail activities, altitude reached, meals, and overnight accommodation.
                      </p>
                    </div>

                    <button
                      onClick={handleAddItineraryDay}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-ocean hover:bg-brand-ocean-light text-white text-xs font-bold uppercase tracking-wider transition shadow cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Day {(editingTrip.itinerary_days || []).length + 1}</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(editingTrip.itinerary_days || []).map((day, idx) => (
                      <div
                        key={day.id || idx}
                        className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3 shadow-md"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 rounded-xl bg-brand-navy text-brand-sky font-mono font-bold text-xs uppercase tracking-wider border border-brand-sky/20">
                            Day {day.day_number} Milestone
                          </span>

                          <button
                            onClick={() => handleDeleteItineraryDay(idx)}
                            className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition cursor-pointer"
                            title="Delete this day"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Title */}
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                            Day Goal & Trail Activity
                          </label>
                          <input
                            type="text"
                            value={day.title}
                            onChange={(e) => handleUpdateDayField(idx, "title", e.target.value)}
                            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-brand-ocean"
                          />
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                            Detailed Trail Description
                          </label>
                          <textarea
                            rows={2}
                            value={day.description}
                            onChange={(e) => handleUpdateDayField(idx, "description", e.target.value)}
                            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-ocean"
                          />
                        </div>

                        {/* Metadata Pills */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-slate-400">Max Altitude</label>
                            <input
                              type="text"
                              value={day.altitude || ""}
                              onChange={(e) => handleUpdateDayField(idx, "altitude", e.target.value)}
                              placeholder="e.g. 5,735 ft"
                              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] uppercase font-bold text-slate-400">Trek Distance</label>
                            <input
                              type="text"
                              value={day.distance || ""}
                              onChange={(e) => handleUpdateDayField(idx, "distance", e.target.value)}
                              placeholder="e.g. 9 km"
                              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] uppercase font-bold text-slate-400">Meals Provided</label>
                            <input
                              type="text"
                              value={day.meals || ""}
                              onChange={(e) => handleUpdateDayField(idx, "meals", e.target.value)}
                              placeholder="e.g. B, L, D"
                              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] uppercase font-bold text-slate-400">Stay Type</label>
                            <input
                              type="text"
                              value={day.stay_type || ""}
                              onChange={(e) => handleUpdateDayField(idx, "stay_type", e.target.value)}
                              placeholder="e.g. Swiss Tents"
                              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: PRICING & LOGISTICS */}
              {editorTab === "general" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                      Package Title
                    </label>
                    <input
                      type="text"
                      value={editingTrip.title}
                      onChange={(e) => setEditingTrip({ ...editingTrip, title: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-brand-ocean"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                      Destination Region
                    </label>
                    <select
                      value={editingTrip.destination_name || "Gokarna, Karnataka"}
                      onChange={(e) => setEditingTrip({ ...editingTrip, destination_name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-ocean cursor-pointer"
                    >
                      <option value="Dandeli, Karnataka">Dandeli, Karnataka (Rafting)</option>
                      <option value="Gokarna, Karnataka">Gokarna, Karnataka (Beaches & Cliffs)</option>
                      <option value="Coorg, Karnataka">Coorg, Karnataka (Misty Coffee Hills)</option>
                      <option value="Chikmagalur, Karnataka">Chikmagalur, Karnataka (Mullayanagiri)</option>
                      <option value="Ooty, Tamil Nadu">Ooty, Tamil Nadu (Nilgiri Pine Forests)</option>
                      <option value="Wayanad, Kerala">Wayanad, Kerala (Chembra Heart Lake)</option>
                      <option value="Ladakh, Himalayas">Ladakh, Himalayas (Motorcycle Odyssey)</option>
                      <option value="Uttarakhand, Himalayas">Uttarakhand, Himalayas (Kedarkantha)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                      Difficulty Level
                    </label>
                    <select
                      value={editingTrip.difficulty}
                      onChange={(e) => setEditingTrip({ ...editingTrip, difficulty: e.target.value as any })}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none cursor-pointer"
                    >
                      <option value="EASY">EASY</option>
                      <option value="MODERATE">MODERATE</option>
                      <option value="CHALLENGING">CHALLENGING</option>
                      <option value="DIFFICULT">DIFFICULT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                      Price per Person (₹ INR)
                    </label>
                    <input
                      type="number"
                      value={editingTrip.price}
                      onChange={(e) => setEditingTrip({ ...editingTrip, price: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-black text-brand-sky focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                      Duration (Days & Nights)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Days"
                        value={editingTrip.duration_days}
                        onChange={(e) => setEditingTrip({ ...editingTrip, duration_days: Number(e.target.value) })}
                        className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
                      />
                      <input
                        type="number"
                        placeholder="Nights"
                        value={editingTrip.duration_nights}
                        onChange={(e) => setEditingTrip({ ...editingTrip, duration_nights: Number(e.target.value) })}
                        className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                      Short Overview Summary
                    </label>
                    <textarea
                      rows={3}
                      value={editingTrip.short_description}
                      onChange={(e) => setEditingTrip({ ...editingTrip, short_description: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-ocean"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: VIDEO BACKGROUND SELECTOR */}
              {editorTab === "media" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase text-brand-sky mb-1.5">
                      Select Local Looping Video (Card & Banner Background)
                    </label>
                    <select
                      value={editingTrip.hero_video_url || ""}
                      onChange={(e) => {
                        const selected = AVAILABLE_LOCAL_VIDEOS.find((v) => v.value === e.target.value);
                        setEditingTrip({
                          ...editingTrip,
                          hero_video_url: e.target.value,
                          cover_image: selected ? selected.poster : editingTrip.cover_image
                        });
                      }}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-brand-ocean cursor-pointer"
                    >
                      {AVAILABLE_LOCAL_VIDEOS.map((vid) => (
                        <option key={vid.value} value={vid.value}>
                          🎬 {vid.label} [{vid.region}] &mdash; {vid.value}
                        </option>
                      ))}
                    </select>
                  </div>

                  {editingTrip.hero_video_url && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <span className="text-xs font-bold text-slate-300">Live Video Preview:</span>
                      <div className="relative aspect-[16/9] w-full max-w-md rounded-xl overflow-hidden border border-slate-700 shadow-md">
                        <video
                          src={editingTrip.hero_video_url}
                          poster={editingTrip.cover_image}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: INCLUSIONS & GEAR */}
              {editorTab === "inclusions" && (
                <div className="space-y-5 text-xs">
                  <div>
                    <label className="block text-xs font-bold uppercase text-emerald-400 mb-1.5">
                      Included in Package (One item per line)
                    </label>
                    <textarea
                      rows={4}
                      value={(editingTrip.inclusions || []).join("\n")}
                      onChange={(e) => setEditingTrip({ ...editingTrip, inclusions: e.target.value.split("\n").filter(Boolean) })}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-rose-400 mb-1.5">
                      Exclusions (One item per line)
                    </label>
                    <textarea
                      rows={3}
                      value={(editingTrip.exclusions || []).join("\n")}
                      onChange={(e) => setEditingTrip({ ...editingTrip, exclusions: e.target.value.split("\n").filter(Boolean) })}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-brand-sky mb-1.5">
                      Things to Carry Checklist
                    </label>
                    <textarea
                      rows={3}
                      value={(editingTrip.things_to_carry || []).join("\n")}
                      onChange={(e) => setEditingTrip({ ...editingTrip, things_to_carry: e.target.value.split("\n").filter(Boolean) })}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-brand-ocean"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 sm:p-5 border-t border-slate-700 bg-slate-950 flex items-center justify-between">
              <button
                onClick={() => setEditingTrip(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveTripForm}
                className="px-7 py-2.5 rounded-xl bg-brand-ocean hover:bg-brand-ocean-light text-white text-xs font-bold uppercase tracking-wider transition shadow-lg flex items-center space-x-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Day-wise Itinerary</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
