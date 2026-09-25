"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { formatCurrency, cn } from "@/lib/utils";
import { ArrowRight, Search, TrendingUp, DollarSign, Users, Award, MapPin } from "lucide-react";
import { TablePagination } from "@/components/ui/table-pagination";

interface DestinationAnalyticsItem {
  name: string;
  region: string;
  state: string;
  highlight: string;
}

const ALL_DESTINATIONS: DestinationAnalyticsItem[] = [
  { name: "Hampi & Gokarna", region: "Karnataka", state: "Heritage & Arabian Sea", highlight: "Temple Ruins, Boulder Hikes & 5-Beach Cliff Trek" },
  { name: "Dandeli", region: "Karnataka", state: "Western Ghats", highlight: "Kali River Grade 3 White Water Rafting" },
  { name: "Coorg", region: "Karnataka", state: "Western Ghats", highlight: "Misty Coffee Highlands & Tadiandamol Peak" },
  { name: "Goa", region: "Goa", state: "Coastal Arabian Sea", highlight: "Water Sports Combo, Scuba & Portuguese Forts" },
  { name: "Chikmagalur", region: "Karnataka", state: "Western Ghats", highlight: "Mullayanagiri Peak & Sea of Morning Clouds" },
  { name: "Ooty & Kodaikanal", region: "Tamil Nadu", state: "Nilgiri Highlands", highlight: "Pine Sanctuaries & UNESCO Heritage Mountain Train" },
  { name: "Wayanad", region: "Kerala", state: "Western Ghats", highlight: "Chembra Heart Lake & Rainforest Treehouse Stays" },
  { name: "Ladakh", region: "Himalayas", state: "Trans-Himalayas", highlight: "Khardung La Pass & Royal Enfield Motorcycle Odyssey" },
  { name: "Kedarkantha", region: "Uttarakhand", state: "Garhwal Himalayas", highlight: "Winter Snow Summit & Frozen Juda Ka Talab" },
];

export function AnalyticsClient({ data }: { data: any }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const filteredDestinations = useMemo(() => {
    if (!searchTerm) return ALL_DESTINATIONS;
    const s = searchTerm.toLowerCase();
    return ALL_DESTINATIONS.filter(
      (d) =>
        d.name.toLowerCase().includes(s) ||
        d.region.toLowerCase().includes(s) ||
        d.state.toLowerCase().includes(s) ||
        d.highlight.toLowerCase().includes(s)
    );
  }, [searchTerm]);

  const paginatedDestinations = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDestinations.slice(start, start + pageSize);
  }, [filteredDestinations, currentPage, pageSize]);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-brand-navy">
            Destination & Revenue Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tabular tracking of traveler demand, conversion velocities, and gross revenue per adventure hub.
          </p>
        </div>

        <Link
          href="/owner/leads"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-ocean hover:bg-brand-ocean-light text-white text-xs font-bold uppercase tracking-wider transition shadow-sm hover:scale-105 active:scale-95 cursor-pointer w-fit"
        >
          <span>Open Leads CRM</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search region, destination or state..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-ocean"
          />
        </div>
        <span className="text-xs text-slate-500 font-semibold">{filteredDestinations.length} Destinations</span>
      </div>

      {/* MASTER DESTINATIONS ANALYTICS SPREADSHEET (CLEAN WHITE) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-4 px-4">#</th>
                <th className="py-4 px-4">Destination Hub</th>
                <th className="py-4 px-4">State & Region</th>
                <th className="py-4 px-4">Primary Attraction</th>
                <th className="py-4 px-4">Inquiries</th>
                <th className="py-4 px-4">Confirmed</th>
                <th className="py-4 px-4">Conversion Win Rate</th>
                <th className="py-4 px-4">Pipeline Deal Value</th>
                <th className="py-4 px-4 text-right">Trend Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedDestinations.map((dest, idx) => {
                const matchingLeads = (data.enquiries || []).filter((e: any) =>
                  e.trip_title.toLowerCase().includes(dest.name.toLowerCase())
                );
                const destRevenue = matchingLeads.reduce(
                  (acc: number, curr: any) => acc + curr.trip_price * (curr.travelers_count || 1),
                  0
                );
                const convertedCount = matchingLeads.filter((e: any) => e.status === "CONVERTED").length;
                const conversionRate =
                  matchingLeads.length > 0 ? ((convertedCount / matchingLeads.length) * 100).toFixed(0) : "0";

                return (
                  <tr key={dest.name} className="hover:bg-slate-50/80 transition group">
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-brand-navy text-sm group-hover:text-brand-ocean transition">
                        📍 {dest.name}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {dest.region} &bull; {dest.state}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 truncate max-w-[220px]">
                      {dest.highlight}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-brand-ocean text-sm">
                      {matchingLeads.length} Inquiries
                    </td>

                    <td className="py-3.5 px-4 font-bold text-emerald-600">
                      {convertedCount} Groups
                    </td>

                    <td className="py-3.5 px-4 font-bold text-purple-600">
                      {conversionRate}%
                    </td>

                    <td className="py-3.5 px-4 font-display font-black text-brand-navy text-sm">
                      {formatCurrency(destRevenue)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block",
                          matchingLeads.length > 2
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-black"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        )}
                      >
                        {matchingLeads.length > 2 ? "🔥 High Demand" : "⚡ Active"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Component */}
        <TablePagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={filteredDestinations.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="destinations"
        />
      </div>
    </div>
  );
}
