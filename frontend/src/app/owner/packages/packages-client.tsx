"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Mountain, Plus, Edit3, Trash2, Save, X, Video, MapPin, 
  CheckCircle2, Clock, Footprints, Utensils, Home, ArrowRight,
  Layers, Check, Eye, ExternalLink, Star
} from "lucide-react";
import { OwnerOverviewData, TripSummary, updateTripConfig } from "@/lib/api";
import { Trip, TripItinerary } from "@/lib/types";
import { formatCurrency, cn } from "@/lib/utils";
import { TablePagination } from "@/components/ui/table-pagination";

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

export default function PackagesClientPage({ initialData }: { initialData: OwnerOverviewData }) {
  const [data, setData] = useState<OwnerOverviewData>(initialData);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [editorTab, setEditorTab] = useState<"itinerary" | "general" | "media" | "inclusions">("itinerary");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const filteredTrips = data.trips.filter((t) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return t.title.toLowerCase().includes(s) || t.destination_name.toLowerCase().includes(s);
  });

  const paginatedTrips = filteredTrips.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
          title: `Day 1: Arrival & Trail Briefing in ${summary.destination_name.split(",")[0]}`,
          description: "Arrive at base camp. Safety fitting, introductory trail walk, and evening riverside campfire.",
          altitude: "4,200 ft",
          distance: "5 km trail",
          meals: "Lunch, Dinner",
          stay_type: "Riverside Eco Tents"
        },
        {
          id: 2,
          day_number: 2,
          title: "Day 2: Main Mountain Ridge / River Rapids Section",
          description: "Early morning start for main mountain summit ridge or white water rafting stretch with packed trail lunch.",
          altitude: isSouthIndia ? "5,800 ft" : "12,500 ft",
          distance: "10 km trail",
          meals: "Breakfast, Lunch, Dinner",
          stay_type: "Alpine Stargazing Camp"
        },
        {
          id: 3,
          day_number: 3,
          title: "Day 3: Heritage Plantation Trail & Departure",
          description: "Morning celebration breakfast, local plantation walk, and transfer to drop point with memorable moments.",
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
          destination_name: editingTrip.destination_name || "Karnataka",
          category_name: editingTrip.category_name || "Treks",
          price: editingTrip.price,
          difficulty: editingTrip.difficulty,
          duration_days: editingTrip.duration_days,
          duration_nights: editingTrip.duration_nights,
          duration_label: `${editingTrip.duration_days}D / ${editingTrip.duration_nights}N`,
          cover_image: editingTrip.cover_image,
          hero_video_url: editingTrip.hero_video_url,
          is_featured: editingTrip.is_featured,
          is_bestseller: editingTrip.is_bestseller,
          is_published: true,
          leads_count: 0
        };
        updatedTrips = [newSummary, ...prev.trips];
      }
      return { ...prev, trips: updatedTrips };
    });
    setEditingTrip(null);
    showToast(`Package "${editingTrip.title}" day-wise itinerary updated!`);
  };

  const handleAddItineraryDay = () => {
    if (!editingTrip) return;
    const currentDays = editingTrip.itinerary_days || [];
    const nextNum = currentDays.length + 1;
    const newDay: TripItinerary = {
      id: Date.now(),
      day_number: nextNum,
      title: `Day ${nextNum}: Summit Ridge & Campfire`,
      description: "Trek along scenic ridge viewpoints and relax at mountain camp under stars.",
      altitude: "6,000 ft",
      distance: "8 km trail",
      meals: "All Meals",
      stay_type: "Alpine Tents"
    };
    setEditingTrip({
      ...editingTrip,
      itinerary_days: [...currentDays, newDay]
    });
  };

  const handleDeleteItineraryDay = (indexToRemove: number) => {
    if (!editingTrip) return;
    const filtered = (editingTrip.itinerary_days || []).filter((_, idx) => idx !== indexToRemove);
    const renumbered = filtered.map((day, idx) => ({ ...day, day_number: idx + 1 }));
    setEditingTrip({ ...editingTrip, itinerary_days: renumbered });
  };

  const handleUpdateDayField = (dayIndex: number, field: keyof TripItinerary, value: any) => {
    if (!editingTrip) return;
    const days = [...(editingTrip.itinerary_days || [])];
    days[dayIndex] = { ...days[dayIndex], [field]: value };
    setEditingTrip({ ...editingTrip, itinerary_days: days });
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

      {/* Clean Header with Create Package Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-brand-navy">
            Adventure Packages
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage itineraries, pricing, durations, and day-by-day expedition plans.
          </p>
        </div>

        <button
          onClick={() => {
            const newTrip: Trip = {
              id: Date.now(),
              title: "New 3D 2N Wilderness Package",
              slug: "new-wilderness-package",
              destination_name: "Dandeli, Karnataka",
              destination_slug: "dandeli",
              category_name: "Water Sports",
              short_description: "New small-group wilderness adventure from Hyderabad.",
              duration_days: 3,
              duration_nights: 2,
              duration_label: "3D / 2N",
              difficulty: "MODERATE",
              price: 4999,
              original_price: 6999,
              pickup_location: "Hyderabad / Hubli (7:00 PM)",
              drop_location: "Hyderabad / Hubli (6:00 AM)",
              altitude: "2,500 ft",
              trek_distance: "14 km",
              best_season: "Sep to May",
              cover_image: "https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341325/spirit_adventures/shorts/dandeli_rafting_poster.jpg",
              hero_video_url: "https://res.cloudinary.com/xvxaicfe/video/upload/f_auto,q_auto/v1790341176/spirit_adventures/shorts/dandeli_rafting.mp4",
              is_featured: true,
              is_bestseller: false,
              inclusions: ["All meals", "Certified leader", "Stay", "Safety gear"],
              exclusions: ["Personal travel"],
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
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-ocean hover:bg-brand-ocean-light text-white text-xs font-bold uppercase tracking-wider transition shadow-md cursor-pointer hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Package Row</span>
        </button>
      </div>

      {/* MASTER PACKAGES INVENTORY TABLE (CLEAN WHITE) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <input
            type="text"
            placeholder="Search packages or destinations..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full sm:w-80 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-ocean"
          />
          <span className="text-xs text-slate-500 font-semibold">{filteredTrips.length} Active Packages</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-4 px-4">Preview</th>
                <th className="py-4 px-4">Package Name</th>
                <th className="py-4 px-4">Destination</th>
                <th className="py-4 px-4">Duration</th>
                <th className="py-4 px-4">Difficulty</th>
                <th className="py-4 px-4">Price / Person</th>
                <th className="py-4 px-4">Featured</th>
                <th className="py-4 px-4">Total Inquiries</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedTrips.map((trip) => (
                <tr
                  key={trip.id}
                  className="hover:bg-slate-50/80 transition group"
                >
                  <td className="py-3 px-4">
                    <div className="relative w-14 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs flex-shrink-0">
                      {trip.hero_video_url ? (
                        <video
                          src={trip.hero_video_url}
                          poster={trip.cover_image}
                          muted
                          loop
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image
                          src={trip.cover_image || "https://res.cloudinary.com/xvxaicfe/image/upload/f_auto,q_auto/v1790341325/spirit_adventures/shorts/dandeli_rafting_poster.jpg"}
                          alt={trip.title}
                          fill
                          className="object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/10" />
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-brand-navy text-sm group-hover:text-brand-ocean transition">
                      {trip.title}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      /trips/{trip.slug}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                      📍 {trip.destination_name}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-semibold text-slate-700">
                    {trip.duration_label || `${trip.duration_days}D / ${trip.duration_nights}N`}
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase border border-slate-200">
                      {trip.difficulty}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-display font-black text-brand-ocean text-sm">
                    {formatCurrency(trip.price)}
                  </td>

                  <td className="py-3 px-4">
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
                        "px-2.5 py-1 rounded-full text-[10px] font-black uppercase transition cursor-pointer border",
                        trip.is_featured
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                      )}
                    >
                      {trip.is_featured ? "★ Featured" : "☆ Standard"}
                    </button>
                  </td>

                  <td className="py-3 px-4 font-bold text-slate-800">
                    {trip.leads_count || 0} Inquiries
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleOpenEditTrip(trip)}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-brand-ocean hover:bg-brand-ocean-light text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Day-wise Plan</span>
                      </button>

                      <Link
                        href={`/trips/${trip.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-brand-navy border border-slate-200 transition"
                        title="View Live Trip Page"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Component */}
        <TablePagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={filteredTrips.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="packages"
        />
      </div>

      {/* DAY-WISE ITINERARY EDITOR MODAL (WHITE THEME) */}
      {editingTrip && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in overflow-y-auto">
          <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden text-slate-800">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-brand-navy text-white">
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
            <div className="flex items-center space-x-1 px-6 pt-3 border-b border-slate-200 bg-slate-50 overflow-x-auto">
              <button
                onClick={() => setEditorTab("itinerary")}
                className={cn(
                  "px-4 py-2.5 rounded-t-xl text-xs font-black uppercase tracking-wider transition whitespace-nowrap cursor-pointer",
                  editorTab === "itinerary"
                    ? "bg-white text-brand-ocean border-t-2 border-brand-ocean font-black shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                ✨ Day-Wise Timeline Table ({(editingTrip.itinerary_days || []).length} Days)
              </button>

              <button
                onClick={() => setEditorTab("general")}
                className={cn(
                  "px-4 py-2.5 rounded-t-xl text-xs font-black uppercase tracking-wider transition whitespace-nowrap cursor-pointer",
                  editorTab === "general"
                    ? "bg-white text-brand-ocean border-t-2 border-brand-ocean font-black shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                Pricing & Logistics
              </button>

              <button
                onClick={() => setEditorTab("media")}
                className={cn(
                  "px-4 py-2.5 rounded-t-xl text-xs font-black uppercase tracking-wider transition whitespace-nowrap cursor-pointer",
                  editorTab === "media"
                    ? "bg-white text-brand-ocean border-t-2 border-brand-ocean font-black shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                🎬 Video Loop Selector
              </button>

              <button
                onClick={() => setEditorTab("inclusions")}
                className={cn(
                  "px-4 py-2.5 rounded-t-xl text-xs font-black uppercase tracking-wider transition whitespace-nowrap cursor-pointer",
                  editorTab === "inclusions"
                    ? "bg-white text-brand-ocean border-t-2 border-brand-ocean font-black shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                Inclusions & Gear List
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-grow">
              {/* TAB 1: DAY-WISE ITINERARY TABLE */}
              {editorTab === "itinerary" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-brand-navy">Daily Trail Milestones & Activities</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Configure hiking distance, altitude reached, meals, and overnight accommodation for each day.
                      </p>
                    </div>

                    <button
                      onClick={handleAddItineraryDay}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-ocean hover:bg-brand-ocean-light text-white text-xs font-bold uppercase tracking-wider transition shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Day {(editingTrip.itinerary_days || []).length + 1}</span>
                    </button>
                  </div>

                  {/* Day-Wise Rows Table */}
                  <div className="space-y-3">
                    {(editingTrip.itinerary_days || []).map((day, idx) => (
                      <div
                        key={day.id || idx}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 rounded-xl bg-brand-light text-brand-ocean font-mono font-bold text-xs uppercase tracking-wider border border-brand-ocean/20">
                            Day {day.day_number} Milestone
                          </span>

                          <button
                            onClick={() => handleDeleteItineraryDay(idx)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer border border-rose-200"
                            title="Delete this day"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                            Trail Activity Goal
                          </label>
                          <input
                            type="text"
                            value={day.title}
                            onChange={(e) => handleUpdateDayField(idx, "title", e.target.value)}
                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-ocean"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                            Trail Description
                          </label>
                          <textarea
                            rows={2}
                            value={day.description}
                            onChange={(e) => handleUpdateDayField(idx, "description", e.target.value)}
                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-brand-ocean"
                          />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-slate-500">Max Altitude</label>
                            <input
                              type="text"
                              value={day.altitude || ""}
                              onChange={(e) => handleUpdateDayField(idx, "altitude", e.target.value)}
                              placeholder="e.g. 5,735 ft"
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] uppercase font-bold text-slate-500">Trek Distance</label>
                            <input
                              type="text"
                              value={day.distance || ""}
                              onChange={(e) => handleUpdateDayField(idx, "distance", e.target.value)}
                              placeholder="e.g. 9 km"
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] uppercase font-bold text-slate-500">Meals Provided</label>
                            <input
                              type="text"
                              value={day.meals || ""}
                              onChange={(e) => handleUpdateDayField(idx, "meals", e.target.value)}
                              placeholder="e.g. B, L, D"
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] uppercase font-bold text-slate-500">Stay Type</label>
                            <input
                              type="text"
                              value={day.stay_type || ""}
                              onChange={(e) => handleUpdateDayField(idx, "stay_type", e.target.value)}
                              placeholder="e.g. Swiss Tents"
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
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
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Package Title
                    </label>
                    <input
                      type="text"
                      value={editingTrip.title}
                      onChange={(e) => setEditingTrip({ ...editingTrip, title: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-brand-ocean"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Destination Region
                    </label>
                    <select
                      value={editingTrip.destination_name || "Gokarna, Karnataka"}
                      onChange={(e) => setEditingTrip({ ...editingTrip, destination_name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-brand-ocean cursor-pointer"
                    >
                      <option value="Hampi & Gokarna, Karnataka">Hampi & Gokarna, Karnataka</option>
                      <option value="Dandeli, Karnataka">Dandeli, Karnataka (Rafting)</option>
                      <option value="Coorg, Karnataka">Coorg, Karnataka (Misty Coffee Hills)</option>
                      <option value="Goa Coast, India">Goa Coast, India (Water Sports & Forts)</option>
                      <option value="Chikmagalur, Karnataka">Chikmagalur, Karnataka (Mullayanagiri)</option>
                      <option value="Ooty, Tamil Nadu">Ooty, Tamil Nadu (Nilgiri Pine Forests)</option>
                      <option value="Wayanad, Kerala">Wayanad, Kerala (Chembra Heart Lake)</option>
                      <option value="Ladakh, Himalayas">Ladakh, Himalayas (Motorcycle Odyssey)</option>
                      <option value="Uttarakhand, Himalayas">Uttarakhand, Himalayas (Kedarkantha)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Difficulty Level
                    </label>
                    <select
                      value={editingTrip.difficulty}
                      onChange={(e) => setEditingTrip({ ...editingTrip, difficulty: e.target.value as any })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="EASY">EASY</option>
                      <option value="MODERATE">MODERATE</option>
                      <option value="CHALLENGING">CHALLENGING</option>
                      <option value="DIFFICULT">DIFFICULT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Price per Person (₹ INR)
                    </label>
                    <input
                      type="number"
                      value={editingTrip.price}
                      onChange={(e) => setEditingTrip({ ...editingTrip, price: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-brand-ocean focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Duration (Days & Nights)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Days"
                        value={editingTrip.duration_days}
                        onChange={(e) => setEditingTrip({ ...editingTrip, duration_days: Number(e.target.value) })}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
                      />
                      <input
                        type="number"
                        placeholder="Nights"
                        value={editingTrip.duration_nights}
                        onChange={(e) => setEditingTrip({ ...editingTrip, duration_nights: Number(e.target.value) })}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Short Overview Summary
                    </label>
                    <textarea
                      rows={3}
                      value={editingTrip.short_description}
                      onChange={(e) => setEditingTrip({ ...editingTrip, short_description: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-ocean"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: VIDEO BACKGROUND SELECTOR */}
              {editorTab === "media" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase text-brand-ocean mb-1.5">
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
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-brand-ocean cursor-pointer"
                    >
                      {AVAILABLE_LOCAL_VIDEOS.map((vid) => (
                        <option key={vid.value} value={vid.value}>
                          🎬 {vid.label} [{vid.region}] &mdash; {vid.value}
                        </option>
                      ))}
                    </select>
                  </div>

                  {editingTrip.hero_video_url && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="text-xs font-bold text-slate-700">Live Video Preview:</span>
                      <div className="relative aspect-[16/9] w-full max-w-md rounded-xl overflow-hidden border border-slate-300 shadow-sm">
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
                    <label className="block text-xs font-bold uppercase text-emerald-700 mb-1.5">
                      Included in Package (One item per line)
                    </label>
                    <textarea
                      rows={4}
                      value={(editingTrip.inclusions || []).join("\n")}
                      onChange={(e) => setEditingTrip({ ...editingTrip, inclusions: e.target.value.split("\n").filter(Boolean) })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-rose-700 mb-1.5">
                      Exclusions (One item per line)
                    </label>
                    <textarea
                      rows={3}
                      value={(editingTrip.exclusions || []).join("\n")}
                      onChange={(e) => setEditingTrip({ ...editingTrip, exclusions: e.target.value.split("\n").filter(Boolean) })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-brand-ocean mb-1.5">
                      Things to Carry Checklist
                    </label>
                    <textarea
                      rows={3}
                      value={(editingTrip.things_to_carry || []).join("\n")}
                      onChange={(e) => setEditingTrip({ ...editingTrip, things_to_carry: e.target.value.split("\n").filter(Boolean) })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-brand-ocean"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => setEditingTrip(null)}
                className="px-5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveTripForm}
                className="px-7 py-2.5 rounded-xl bg-brand-ocean hover:bg-brand-ocean-light text-white text-xs font-bold uppercase tracking-wider transition shadow-md flex items-center space-x-1.5 cursor-pointer"
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
