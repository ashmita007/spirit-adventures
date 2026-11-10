'use client';

import React from 'react';
import { PlusCircle, PhoneCall, Wallet, CalendarDays, ArrowRight } from 'lucide-react';

interface QuickActionCardsProps {
  onOpenNewModal: () => void;
  followupsCount: number;
  paymentDuesCount: number;
  departuresCount: number;
  onNavigateTab: (tab: 'enquiries' | 'followups' | 'dues' | 'calendar' | 'team') => void;
}

export const QuickActionCards: React.FC<QuickActionCardsProps> = ({
  onOpenNewModal,
  followupsCount,
  paymentDuesCount,
  departuresCount,
  onNavigateTab,
}) => {
  return (
    <div data-crm-stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
      {/* 1. Add Enquiry - Action Card */}
      <div
        onClick={onOpenNewModal}
        className="group bg-white rounded-xl p-5 border border-slate-200/80 border-t-[3px] border-t-[#0A6FAE] shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-200 cursor-pointer text-center flex flex-col items-center justify-between"
      >
        <div className="w-12 h-12 rounded-full bg-[#EFF8FD] text-[#0A6FAE] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <PlusCircle className="h-6 w-6 stroke-[2.2]" />
        </div>
        <div>
          <h4 className="font-bold text-[#062B49] text-sm group-hover:text-[#0A6FAE] transition-colors mb-1">
            + Add New Enquiry
          </h4>
          <p className="text-xs text-slate-500 leading-snug">
            Log traveler with PNRs, accommodation & group segregation
          </p>
        </div>
        <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-[#0A6FAE] group-hover:translate-x-0.5 transition-transform">
          <span>Create Now</span>
          <ArrowRight className="h-3 w-3" />
        </div>
      </div>

      {/* 2. Today's Follow-ups */}
      <div
        onClick={() => onNavigateTab('followups')}
        className="group bg-white rounded-xl p-5 border border-slate-200/80 border-t-[3px] border-t-[#f59e0b] shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-200 cursor-pointer text-center flex flex-col items-center justify-between"
      >
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform relative">
          <PhoneCall className="h-5 w-5 stroke-[2.2]" />
          <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full shadow-xs">
            {followupsCount}
          </span>
        </div>
        <div>
          <h4 className="font-bold text-[#062B49] text-sm group-hover:text-amber-600 transition-colors mb-1">
            Today's Follow-ups
          </h4>
          <p className="text-xs text-slate-500 leading-snug">
            Call queue for callbacks, negotiations & confirmations
          </p>
        </div>
        <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-amber-600 group-hover:translate-x-0.5 transition-transform">
          <span>View Call Queue</span>
          <ArrowRight className="h-3 w-3" />
        </div>
      </div>

      {/* 3. Payment Dues */}
      <div
        onClick={() => onNavigateTab('dues')}
        className="group bg-white rounded-xl p-5 border border-slate-200/80 border-t-[3px] border-t-[#ef4444] shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-200 cursor-pointer text-center flex flex-col items-center justify-between"
      >
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform relative">
          <Wallet className="h-5 w-5 stroke-[2.2]" />
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full shadow-xs">
            {paymentDuesCount}
          </span>
        </div>
        <div>
          <h4 className="font-bold text-[#062B49] text-sm group-hover:text-rose-600 transition-colors mb-1">
            Payment Dues & Balances
          </h4>
          <p className="text-xs text-slate-500 leading-snug">
            Track outstanding fees & record advance payments
          </p>
        </div>
        <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-rose-600 group-hover:translate-x-0.5 transition-transform">
          <span>Collect Payments</span>
          <ArrowRight className="h-3 w-3" />
        </div>
      </div>

      {/* 4. Departure Calendar */}
      <div
        onClick={() => onNavigateTab('calendar')}
        className="group bg-white rounded-xl p-5 border border-slate-200/80 border-t-[3px] border-t-[#0284c7] shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-200 cursor-pointer text-center flex flex-col items-center justify-between"
      >
        <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform relative">
          <CalendarDays className="h-5 w-5 stroke-[2.2]" />
          <span className="absolute -top-1 -right-1 bg-sky-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full shadow-xs">
            {departuresCount}
          </span>
        </div>
        <div>
          <h4 className="font-bold text-[#062B49] text-sm group-hover:text-sky-600 transition-colors mb-1">
            Tour Batches & Departures
          </h4>
          <p className="text-xs text-slate-500 leading-snug">
            Expedition dates with boys/girls/couples headcounts
          </p>
        </div>
        <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-sky-600 group-hover:translate-x-0.5 transition-transform">
          <span>View Batches</span>
          <ArrowRight className="h-3 w-3" />
        </div>
      </div>
    </div>
  );
};
