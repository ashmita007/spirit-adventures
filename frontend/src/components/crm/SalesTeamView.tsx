'use client';

import React from 'react';
import { Users, Award, Target, Phone, Mail, ChevronRight, CheckCircle2, UserCheck } from 'lucide-react';
import { User, Enquiry } from '@/lib/crm/types';

interface SalesTeamViewProps {
  salespersons: User[];
  enquiries: Enquiry[];
  onFilterBySalesperson: (spId: number) => void;
}

export const SalesTeamView: React.FC<SalesTeamViewProps> = ({
  salespersons,
  enquiries,
  onFilterBySalesperson,
}) => {
  return (
    <div data-crm-stagger className="space-y-4">
      {/* Section Header */}
      <div
        className="rounded-xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border border-sky-100 shadow-sm"
        style={{
          background: 'linear-gradient(120deg, #E3F2FC 0%, #F5FAFE 100%)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0A6FAE] text-white flex items-center justify-center shadow-sm">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0A6FAE] tracking-tight m-0">
              Counsellor Summary & Monthly Targets
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Each counsellor's leads, targets and bookings
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {salespersons.map((sp) => {
          const spEnquiries = enquiries.filter((e) => e.sales_person_id === sp.id);
          const bookedEnquiries = spEnquiries.filter((e) => ['booked', 'travelled'].includes(e.status));
          const totalRevenue = bookedEnquiries.reduce(
            (sum, e) => sum + Number(e.total_amount || 0),
            0
          );
          const advanceCollected = bookedEnquiries.reduce(
            (sum, e) => sum + Number(e.advance_paid || 0),
            0
          );

          const target = Number(sp.target_amount || 250000);
          const targetPct = Math.min(100, Math.round((advanceCollected / target) * 100));

          return (
            <div
              key={sp.id}
              className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-[#0A6FAE]/50 transition flex flex-col justify-between"
            >
              <div>
                {/* Profile Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#0A6FAE] to-[#38BDF8] flex items-center justify-center font-bold text-white text-sm shadow-xs">
                    {sp.first_name[0]}
                    {sp.last_name ? sp.last_name[0] : ''}
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      sp.role === 'manager'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-sky-50 text-[#0A6FAE] border border-sky-200'
                    }`}
                  >
                    {sp.role === 'manager' ? 'Super Admin' : 'Counsellor'}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">{sp.display_name}</h3>
                <div className="text-[11px] text-slate-500 truncate mb-4">{sp.email}</div>

                {/* Target Progress Bar */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 mb-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 font-medium">Monthly Target:</span>
                    <span className="font-mono font-bold text-[#0A6FAE]">
                      ₹{advanceCollected.toLocaleString('en-IN')} / ₹{target.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#0A6FAE] to-[#10b981] h-full rounded-full transition duration-500"
                      style={{ width: `${targetPct}%` }}
                    />
                  </div>
                  <div className="text-right text-[10px] font-bold text-slate-500">
                    {targetPct}% Achieved
                  </div>
                </div>

                {/* Stats Breakdown */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 text-[10px] block font-bold">
                      Assigned Leads
                    </span>
                    <strong className="text-slate-800 font-mono text-sm">{spEnquiries.length}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                    <span className="text-emerald-700 text-[10px] block font-bold">
                      Joined Bookings
                    </span>
                    <strong className="text-emerald-800 font-mono text-sm">{bookedEnquiries.length}</strong>
                  </div>
                </div>
              </div>

              {/* Filter Button */}
              <button
                onClick={() => onFilterBySalesperson(sp.id)}
                className="mt-4 w-full py-2 rounded-lg bg-slate-100 hover:bg-[#0A6FAE] hover:text-white text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <span>View Counsellor Pipeline</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
