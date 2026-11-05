'use client';

import React, { useState } from 'react';
import { Wallet, IndianRupee, Phone, Calendar, CheckCircle2, ChevronRight, ArrowDownRight } from 'lucide-react';
import { Enquiry } from '@/lib/crm/types';
import { api } from '@/lib/crm/api';

interface PaymentDuesWidgetProps {
  paymentDues: Enquiry[];
  onSelectEnquiry: (id: number) => void;
  onRefresh: () => void;
}

export const PaymentDuesWidget: React.FC<PaymentDuesWidgetProps> = ({
  paymentDues,
  onSelectEnquiry,
  onRefresh,
}) => {
  const [activeEnquiryId, setActiveEnquiryId] = useState<number | null>(null);
  const [amountReceived, setAmountReceived] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const handleUpdatePayment = async (enq: Enquiry) => {
    if (!amountReceived || amountReceived <= 0) return;
    setLoading(true);
    try {
      const newAdvance = Number(enq.advance_paid || 0) + Number(amountReceived);
      await api.updatePayment(enq.id, newAdvance);
      await api.addComment(
        enq.id,
        `Collected payment installment of ₹${amountReceived.toLocaleString('en-IN')}. Updated advance: ₹${newAdvance.toLocaleString('en-IN')}`,
        'advance_collected'
      );
      setActiveEnquiryId(null);
      setAmountReceived(0);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalPendingSum = paymentDues.reduce(
    (sum, e) => sum + Number(e.balance_amount || 0),
    0
  );

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
          <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center shadow-xs">
            <Wallet className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0A6FAE] leading-tight">
              Payment Dues & Balances
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Outstanding fees collection for confirmed departures
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Due</span>
          <span className="font-bold text-rose-600 font-mono text-xs">
            ₹{totalPendingSum.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Body List */}
      <div className="p-4 flex-1">
        {paymentDues.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 italic">
            🎉 All expedition balances are cleared! Zero payment dues.
          </div>
        ) : (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {paymentDues.slice(0, 10).map((enq) => {
              const isCollecting = activeEnquiryId === enq.id;

              return (
                <div
                  key={enq.id}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-rose-400/50 transition-all text-xs space-y-2 hover:bg-[#EFF8FD]/30"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block text-[13px]">{enq.name}</span>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-medium text-slate-700">{enq.tour_name}</span>
                        <span>•</span>
                        <span className="text-sky-600 font-semibold">{enq.date_of_travel}</span>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-xs font-bold text-rose-600 block">
                        ₹{Number(enq.balance_amount).toLocaleString('en-IN')} Due
                      </span>
                      <span className="text-[10px] text-emerald-700 font-medium">
                        Paid: ₹{Number(enq.advance_paid).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-200/60">
                    <span className="text-slate-600">
                      Total: ₹{Number(enq.total_amount).toLocaleString('en-IN')} ({enq.total_people} Pax)
                    </span>
                    <button
                      onClick={() => setActiveEnquiryId(isCollecting ? null : enq.id)}
                      className="font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                    >
                      {isCollecting ? 'Cancel' : '+ Collect Payment'}
                    </button>
                  </div>

                  {/* Inline Collect Payment Modal / Form */}
                  {isCollecting && (
                    <div className="pt-2 border-t border-slate-200 space-y-2">
                      <div className="flex gap-2 items-center">
                        <div className="relative flex-1">
                          <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-bold">₹</span>
                          <input
                            type="number"
                            placeholder="Amount collected now..."
                            value={amountReceived || ''}
                            onChange={(e) => setAmountReceived(Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 rounded-md pl-6 pr-2 py-1 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#0A6FAE]"
                          />
                        </div>
                        <button
                          type="button"
                          disabled={loading || !amountReceived}
                          onClick={() => handleUpdatePayment(enq)}
                          className="bg-[#0A6FAE] hover:bg-[#0A6FAE] text-white px-3 py-1 rounded-md text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Record
                        </button>
                      </div>
                    </div>
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
