'use client';

import React, { useState } from 'react';
import { Phone, Calendar, Clock, MessageSquare, ChevronRight, User, CheckCircle2, Send } from 'lucide-react';
import { Enquiry } from '@/lib/crm/types';
import { api } from '@/lib/crm/api';

interface TodayFollowupsWidgetProps {
  followups: Enquiry[];
  onSelectEnquiry: (id: number) => void;
  onRefresh: () => void;
}

export const TodayFollowupsWidget: React.FC<TodayFollowupsWidgetProps> = ({
  followups,
  onSelectEnquiry,
  onRefresh,
}) => {
  const [activeEnquiryId, setActiveEnquiryId] = useState<number | null>(null);
  const [quickComment, setQuickComment] = useState('');
  const [callStatus, setCallStatus] = useState('connected');
  const [loading, setLoading] = useState(false);

  const handleQuickSubmit = async (e: React.FormEvent, enqId: number) => {
    e.preventDefault();
    if (!quickComment.trim()) return;
    setLoading(true);
    try {
      await api.addComment(enqId, quickComment, callStatus);
      setQuickComment('');
      setActiveEnquiryId(null);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-crm-reveal className="rounded-xl bg-white border border-slate-200/90 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Card Header */}
      <div
        className="px-5 py-3.5 flex items-center justify-between border-b border-sky-100"
        style={{
          background: 'linear-gradient(120deg, #E3F2FC 0%, #F5FAFE 100%)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0A6FAE] text-white flex items-center justify-center shadow-xs">
            <Phone className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0A6FAE] leading-tight">
              Today's Follow-Up Calls
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Scheduled callbacks & active traveler negotiations
            </p>
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-[#0A6FAE] text-white font-mono text-xs font-bold shadow-xs">
          {followups.length} Calls Due
        </span>
      </div>

      {/* Body List */}
      <div className="p-4 flex-1">
        {followups.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 italic">
            All scheduled follow-up calls are completed for today!
          </div>
        ) : (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {followups.slice(0, 10).map((enq) => {
              const isLogging = activeEnquiryId === enq.id;

              return (
                <div
                  key={enq.id}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-[#0A6FAE]/50 transition text-xs space-y-2 hover:bg-[#EFF8FD]/30"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block text-[13px]">{enq.name}</span>
                      <a
                        href={`tel:${enq.contact}`}
                        className="text-[11px] text-[#0A6FAE] font-mono font-semibold flex items-center gap-1 hover:underline mt-0.5"
                      >
                        <Phone className="h-3 w-3" />
                        {enq.contact}
                      </a>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
                      {enq.tour_name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span className="flex items-center gap-1 text-slate-600">
                      <User className="h-3 w-3 text-slate-400" />
                      {enq.sales_person_name || 'Assigned Agent'}
                    </span>
                    <button
                      onClick={() => setActiveEnquiryId(isLogging ? null : enq.id)}
                      className="font-bold text-[#0A6FAE] hover:text-[#0A6FAE] flex items-center gap-1 cursor-pointer"
                    >
                      {isLogging ? 'Cancel Log' : '+ Quick Call Log'}
                    </button>
                  </div>

                  {/* Inline Call Logger (Style) */}
                  {isLogging && (
                    <form
                      onSubmit={(e) => handleQuickSubmit(e, enq.id)}
                      className="pt-2 border-t border-slate-200 space-y-2"
                    >
                      <div className="flex gap-2">
                        <select
                          value={callStatus}
                          onChange={(e) => setCallStatus(e.target.value)}
                          className="bg-white border border-slate-300 rounded-md px-2 py-1 text-[11px] text-slate-800 font-medium focus:outline-none focus:border-[#0A6FAE]"
                        >
                          <option value="connected">Connected</option>
                          <option value="ringing_not_answered">Ringing No Answer</option>
                          <option value="switched_off">Switched Off</option>
                          <option value="busy">Busy</option>
                          <option value="callback_requested">Callback Later</option>
                          <option value="booked">Confirmed Booked</option>
                        </select>
                        <input
                          type="text"
                          required
                          placeholder="Call notes / outcome..."
                          value={quickComment}
                          onChange={(e) => setQuickComment(e.target.value)}
                          className="flex-1 bg-white border border-slate-300 rounded-md px-2 py-1 text-[11px] text-slate-800 focus:outline-none focus:border-[#0A6FAE]"
                        />
                        <button
                          type="submit"
                          disabled={loading}
                          className="bg-[#0A6FAE] hover:bg-[#0A6FAE] text-white px-3 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition disabled:opacity-50 cursor-pointer"
                        >
                          <Send className="h-3 w-3" />
                          Save
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
