'use client';

import React from 'react';
import {
  Compass,
  CheckCircle2,
  Wallet,
  Users,
} from 'lucide-react';
import { DashboardStats } from '@/lib/crm/types';

interface StatsCardsProps {
  stats: DashboardStats | null;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const s: DashboardStats = stats || {
    total_enquiries: 0,
    new_leads: 0,
    confirmed_bookings: 0,
    total_revenue_booked: 0,
    total_advance_collected: 0,
    total_balance_pending: 0,
    total_travelers: 0,
    total_boys: 0,
    total_girls: 0,
    total_couples: 0,
    conversion_rate: 0,
    accommodation_breakdown: { sharing: 0, private_room: 0, tent: 0 },
  };

  return (
    <div data-crm-stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-7">
      {/* 1. Total Enquiries - Primary Orange */}
      <div
        className="relative overflow-hidden rounded-xl p-5 text-white shadow-md hover:-translate-y-1 transition duration-300 group"
        style={{
          background: 'linear-gradient(145deg, #0A6FAE 0%, #0A6FAE 100%)',
          boxShadow: '0 8px 16px -2px rgba(254, 119, 67, 0.3)',
        }}
      >
        <div className="flex items-center justify-between mb-1 relative z-10">
          <span className="text-xs font-bold text-white/90">
            Total Enquiries
          </span>
          <span className="text-[11px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-xs">
            {s.new_leads} Leads
          </span>
        </div>
        <div className="text-4xl font-extrabold text-white mb-1 tracking-tight relative z-10 font-sans">
          {s.total_enquiries}
        </div>
        <p className="text-xs text-white/85 relative z-10 font-medium">
          Active in your pipeline
        </p>
        <Compass className="absolute -bottom-3 -right-2 h-24 w-24 text-white/15 stroke-[1.2] pointer-events-none transform group-hover:scale-110 transition-transform" />
      </div>

      {/* 2. Confirmed Bookings - Emerald / Green Accent */}
      <div
        className="relative overflow-hidden rounded-xl p-5 text-white shadow-md hover:-translate-y-1 transition duration-300 group"
        style={{
          background: 'linear-gradient(145deg, #10b981 0%, #059669 100%)',
          boxShadow: '0 8px 16px -2px rgba(16, 185, 129, 0.3)',
        }}
      >
        <div className="flex items-center justify-between mb-1 relative z-10">
          <span className="text-xs font-bold text-white/90">
            Confirmed Bookings
          </span>
          <span className="text-[11px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-xs">
            {s.conversion_rate}% Conv.
          </span>
        </div>
        <div className="text-4xl font-extrabold text-white mb-1 tracking-tight relative z-10 font-sans">
          {s.confirmed_bookings}
        </div>
        <p className="text-xs text-white/85 relative z-10 font-medium">
          Joined travelers with vouchers issued
        </p>
        <CheckCircle2 className="absolute -bottom-3 -right-2 h-24 w-24 text-white/15 stroke-[1.2] pointer-events-none transform group-hover:scale-110 transition-transform" />
      </div>

      {/* 3. Collected vs Pending - Navy Theme */}
      <div
        className="relative overflow-hidden rounded-xl p-5 text-white shadow-md hover:-translate-y-1 transition duration-300 group"
        style={{
          background: 'linear-gradient(145deg, #062B49 0%, #1e293b 100%)',
          boxShadow: '0 8px 16px -2px rgba(44, 62, 80, 0.3)',
        }}
      >
        <div className="flex items-center justify-between mb-1 relative z-10">
          <span className="text-xs font-bold text-white/90">
            Advance Collected
          </span>
          <span className="text-[11px] font-bold bg-[#0A6FAE] text-white px-2 py-0.5 rounded-full">
            Paid
          </span>
        </div>
        <div className="text-3xl font-extrabold text-white mb-1 tracking-tight relative z-10 font-sans">
          ₹{Number(s.total_advance_collected).toLocaleString('en-IN')}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-300 pt-1.5 border-t border-white/10 relative z-10">
          <span>Pending Due:</span>
          <strong className="text-[#38BDF8] font-bold text-xs">
            ₹{Number(s.total_balance_pending).toLocaleString('en-IN')}
          </strong>
        </div>
        <Wallet className="absolute -bottom-3 -right-2 h-24 w-24 text-white/10 stroke-[1.2] pointer-events-none transform group-hover:scale-110 transition-transform" />
      </div>

      {/* 4. Group Segregation - Warm Gold / Indigo Blend */}
      <div
        className="relative overflow-hidden rounded-xl p-5 text-white shadow-md hover:-translate-y-1 transition duration-300 group"
        style={{
          background: 'linear-gradient(145deg, #4f46e5 0%, #3730a3 100%)',
          boxShadow: '0 8px 16px -2px rgba(79, 70, 229, 0.3)',
        }}
      >
        <div className="flex items-center justify-between mb-1 relative z-10">
          <span className="text-xs font-bold text-white/90">
            Group Segregation
          </span>
          <span className="text-[11px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">
            {s.total_travelers} Heads
          </span>
        </div>
        <div className="text-4xl font-extrabold text-white mb-1 tracking-tight relative z-10 font-sans">
          {s.total_travelers}
        </div>
        <div className="flex items-center gap-1.5 pt-1.5 border-t border-white/10 relative z-10">
          <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded">
            {s.total_boys} Boys
          </span>
          <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded">
            {s.total_girls} Girls
          </span>
          <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded">
            {s.total_couples} Couples
          </span>
        </div>
        <Users className="absolute -bottom-3 -right-2 h-24 w-24 text-white/15 stroke-[1.2] pointer-events-none transform group-hover:scale-110 transition-transform" />
      </div>
    </div>
  );
};
