'use client';

import React from 'react';
import { Calendar as CalendarIcon, MapPin, Users, Ticket, Bed, Sparkles, Layers } from 'lucide-react';
import { CalendarDepartureDay } from '@/lib/crm/types';

interface CalendarViewProps {
  departures: CalendarDepartureDay[];
  onSelectEnquiry: (id: number) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  departures,
  onSelectEnquiry,
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
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0A6FAE] tracking-tight m-0">
              Expedition Batches & Departure Calendar
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Departures by day, with boys, girls and couples counts
            </p>
          </div>
        </div>
      </div>

      {departures.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <CalendarIcon className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-600">No scheduled departures found</p>
          <p className="text-xs text-slate-400 mt-1">Booked travel dates will appear here automatically.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departures.map((day) => {
            const formattedDate = new Date(day.date).toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={day.date}
                className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm hover:shadow-md hover:border-[#0A6FAE]/50 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Date Header & Headcount Badges */}
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-3">
                    <div>
                      <span className="text-xs font-bold text-[#0A6FAE] block font-mono">
                        {formattedDate}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {day.total_departures} Expedition Group{day.total_departures > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-800 font-mono block">
                        {day.total_travelers} Travelers
                      </span>
                      {/* Headcount Segregation */}
                      <div className="flex items-center gap-1 justify-end mt-1 text-[10px]">
                        <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                          👦 {day.boys}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200">
                          👧 {day.girls}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 font-bold border border-purple-200">
                          💑 {day.couples}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Trips List */}
                  <div className="space-y-2">
                    {day.trips.map((trip) => (
                      <div
                        key={trip.enquiry_id}
                        onClick={() => onSelectEnquiry(trip.enquiry_id)}
                        className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-[#0A6FAE] hover:bg-[#EFF8FD]/50 cursor-pointer transition-all text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-slate-800 truncate font-bold">{trip.lead_name}</span>
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                            {trip.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-600">
                          <MapPin className="h-3 w-3 text-[#0A6FAE] shrink-0" />
                          <span className="truncate">{trip.tour}</span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200 text-slate-500">
                          <span className="flex items-center gap-1 font-mono text-sky-700 font-semibold">
                            <Ticket className="h-3 w-3" />
                            {trip.pnr_up || 'No PNR'}
                          </span>
                          <span className="capitalize font-medium text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded">
                            {trip.accommodation.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
