'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Bed,
  Users,
  CreditCard,
  MessageSquare,
  Send,
  ExternalLink,
  Edit,
  Clock,
  User,
  Trash2,
  CheckCircle2,
  Train,
  Compass,
  AlertCircle
} from 'lucide-react';
import { Enquiry } from '@/lib/crm/types';
import { api } from '@/lib/crm/api';
import { useAuth } from '@/components/crm/auth-context';

interface EnquiryDetailDrawerProps {
  enquiryId: number | null;
  onClose: () => void;
  onRefresh: () => void;
}

export const EnquiryDetailDrawer: React.FC<EnquiryDetailDrawerProps> = ({
  enquiryId,
  onClose,
  onRefresh,
}) => {
  const auth = useAuth();
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [callStatus, setCallStatus] = useState('connected');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Modals state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusVal, setStatusVal] = useState('');
  const [statusNote, setStatusNote] = useState('');

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState('upi');
  const [payNote, setPayNote] = useState('');

  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [followupDateVal, setFollowupDateVal] = useState('');

  useEffect(() => {
    if (enquiryId) {
      loadDetails(enquiryId);
    }
  }, [enquiryId]);

  const loadDetails = async (id: number) => {
    setLoading(true);
    try {
      const data = await api.getEnquiry(id);
      setEnquiry(data);
      setStatusVal(data.status);
      setFollowupDateVal(data.followup_date || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!enquiryId) return null;

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !enquiry) return;

    setSubmittingComment(true);
    try {
      await api.addComment(enquiry.id, newComment.trim(), callStatus);
      setNewComment('');
      await loadDetails(enquiry.id);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiry || !statusVal) return;
    try {
      await api.updateStatus(enquiry.id, statusVal, statusNote.trim() || undefined);
      setShowStatusModal(false);
      setStatusNote('');
      await loadDetails(enquiry.id);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiry || !payAmount) return;
    const added = parseFloat(payAmount);
    if (isNaN(added) || added <= 0) return;

    try {
      const currentAdv = parseFloat(String(enquiry.advance_paid || 0));
      const totalAmt = parseFloat(String(enquiry.total_amount || 0));
      const newAdv = currentAdv + added;

      await api.updatePayment(enquiry.id, newAdv);
      const noteStr = payNote.trim() ? ` (${payNote.trim()})` : '';
      await api.addComment(
        enquiry.id,
        `Payment Recorded: ₹${added.toLocaleString()} via ${payMode.toUpperCase()}${noteStr}. Advance: ₹${newAdv.toLocaleString()} / Balance: ₹${Math.max(0, totalAmt - newAdv).toLocaleString()}`,
        'payment_followup'
      );

      setShowPaymentModal(false);
      setPayAmount('');
      setPayNote('');
      await loadDetails(enquiry.id);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiry || !followupDateVal) return;
    try {
      await api.updateFollowupDate(enquiry.id, followupDateVal);
      setShowFollowupModal(false);
      await loadDetails(enquiry.id);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!enquiry || !confirm(`Are you sure you want to delete enquiry for ${enquiry.name}?`)) return;
    try {
      await api.deleteEnquiry(enquiry.id);
      onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const totalAmount = parseFloat(String(enquiry?.total_amount || 0));
  const advancePaid = parseFloat(String(enquiry?.advance_paid || 0));
  const balanceAmount = parseFloat(String(enquiry?.balance_amount || 0));
  const paidPercent = totalAmount > 0 ? Math.min(100, Math.round((advancePaid / totalAmount) * 100)) : 0;
  const isFullyPaid = totalAmount > 0 && advancePaid >= totalAmount;

  return (
    <div data-crm-fade className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/50 backdrop-blur-xs">
      <div data-crm-drawer className="relative w-full max-w-2xl h-full bg-[#f8f9fa] border-l border-slate-200 shadow-2xl flex flex-col text-slate-800">
        {/* Profile Header */}
        <div
          className="p-5 text-white relative shrink-0"
          style={{
            background: 'linear-gradient(135deg, #0A6FAE 0%, #062B49 100%)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/20 text-white border border-white/30">
                ENQ #{enquiry?.id}
              </span>
              <span
                className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full shadow-xs ${
                  enquiry?.status === 'booked' || enquiry?.status === 'travelled'
                    ? 'bg-emerald-500 text-white'
                    : enquiry?.status === 'cancelled'
                    ? 'bg-rose-600 text-white'
                    : 'bg-white text-[#0A6FAE]'
                }`}
              >
                {enquiry?.status}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {enquiry && (
                <Link
                  href={`/crm/enquiry/${enquiry.id}`}
                  className="p-1.5 rounded-md text-white/90 hover:text-white hover:bg-white/20 transition-all flex items-center gap-1 text-xs font-semibold"
                  title="Open Full Page Profile"
                >
                  <ExternalLink className="h-4 w-4" /> Full Profile
                </Link>
              )}
              {auth.canDelete && (
                <button
                  onClick={handleDelete}
                  className="p-1.5 rounded-md text-white/80 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
                  title="Delete Enquiry (Manager Only)"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-md text-white/80 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Profile identity info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white text-[#0A6FAE] flex items-center justify-center font-bold text-2xl shadow-md border-3 border-white shrink-0">
              <User className="w-8 h-8 text-[#062B49]" />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold tracking-tight text-white truncate">
                {enquiry?.name || 'Loading details...'}
              </h2>
              {enquiry && (
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                  <span className="flex items-center gap-1 text-white/90 font-medium">
                    <Phone className="w-3 h-3 transform rotate-90" />
                    {enquiry.contact}
                  </span>
                  <a
                    href={`tel:${enquiry.contact}`}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white text-slate-800 rounded font-semibold hover:bg-slate-100 shadow-2xs"
                  >
                    <Phone className="w-2.5 h-2.5 text-emerald-600" /> Call
                  </a>
                  <a
                    href={`https://wa.me/91${enquiry.contact.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white text-slate-800 rounded font-semibold hover:bg-slate-100 shadow-2xs"
                  >
                    <MessageSquare className="w-2.5 h-2.5 text-emerald-600" /> WhatsApp
                  </a>
                  <button
                    onClick={() => setShowStatusModal(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white text-slate-800 rounded font-semibold hover:bg-slate-100 shadow-2xs"
                  >
                    <Edit className="w-2.5 h-2.5 text-[#0A6FAE]" /> Edit Status
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading || !enquiry ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-sm">
              <div className="w-8 h-8 border-3 border-[#062B49] border-t-transparent rounded-full animate-spin mb-3"></div>
              Loading enquiry profile...
            </div>
          ) : (
            <>
              {/* Traveler & Tour Information Card */}
              <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-[#0A6FAE]" />
                    Expedition & Traveler Details
                  </span>
                  <span className="text-slate-500 font-medium">
                    Counsellor: <strong className="text-slate-800">{enquiry.sales_person_name || 'Unassigned'}</strong>
                  </span>
                </div>

                <div className="p-4 space-y-2.5 text-xs">
                  <div className="flex border-b border-slate-100 pb-2">
                    <span className="w-36 font-semibold text-slate-500 shrink-0">Subject / Tour</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1 text-sm">
                      {enquiry.tour_name}
                    </span>
                  </div>

                  <div className="flex border-b border-slate-100 pb-2">
                    <span className="w-36 font-semibold text-slate-500 shrink-0">Departure City</span>
                    <span className="text-slate-700 flex items-center gap-1 font-medium">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {enquiry.departure_city || 'Not specified'}
                    </span>
                  </div>

                  <div className="flex border-b border-slate-100 pb-2">
                    <span className="w-36 font-semibold text-slate-500 shrink-0">Accommodation</span>
                    <span className="capitalize font-medium text-slate-800 flex items-center gap-1">
                      <Bed className="w-3 h-3 text-slate-400" />
                      {enquiry.accommodation_type || 'Sharing'}
                    </span>
                  </div>

                  <div className="flex border-b border-slate-100 pb-2">
                    <span className="w-36 font-semibold text-slate-500 shrink-0">Date of Travel</span>
                    <span className="font-medium text-slate-800 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#062B49]" />
                      {enquiry.date_of_travel}
                    </span>
                  </div>

                  <div className="flex border-b border-slate-100 pb-2">
                    <span className="w-36 font-semibold text-slate-500 shrink-0">PNR Numbers</span>
                    <div className="flex items-center gap-3">
                      <span>Up: <code className="font-mono bg-slate-100 px-1 rounded text-sky-700 font-bold">{enquiry.pnr_up || '—'}</code></span>
                      <span>Down: <code className="font-mono bg-slate-100 px-1 rounded text-teal-700 font-bold">{enquiry.pnr_down || '—'}</code></span>
                    </div>
                  </div>

                  <div className="flex border-b border-slate-100 pb-2">
                    <span className="w-36 font-semibold text-slate-500 shrink-0">Group Segregation</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 font-bold text-slate-700">
                        {enquiry.total_people} Total
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                        👦 {enquiry.boys_count} Boys
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-pink-50 text-pink-700 font-medium">
                        👧 {enquiry.girls_count} Girls
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-medium">
                        💑 {enquiry.couples_count} Couples
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-0.5">
                    <div className="flex items-center">
                      <span className="w-36 font-semibold text-slate-500 shrink-0">Follow-up Date</span>
                      <span className="font-bold text-slate-800">
                        {enquiry.followup_date || 'Not scheduled'}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowFollowupModal(true)}
                      className="px-2 py-0.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded flex items-center gap-1"
                    >
                      <Edit className="w-2.5 h-2.5 text-[#0A6FAE]" /> Edit
                    </button>
                  </div>
                </div>
              </div>

              {/* Payment Information Card */}
              <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#0A6FAE]" />
                    Payment Information
                  </span>
                  {isFullyPaid ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Paid in Full
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                      Pending
                    </span>
                  )}
                </div>

                <div className="p-4">
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-4 mb-3 overflow-hidden shadow-inner">
                    <div
                      className="bg-[#17a2b8] h-full text-white text-[10px] font-bold flex items-center justify-center transition-all duration-300"
                      style={{ width: `${paidPercent}%` }}
                    >
                      {paidPercent}%
                    </div>
                  </div>

                  {/* 3 Metrics */}
                  <div className="grid grid-cols-3 gap-2 text-center py-2 border-y border-slate-100 mb-3 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Target Fees</div>
                      <div className="text-sm font-bold text-slate-800 mt-0.5">₹{totalAmount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Advance Paid</div>
                      <div className="text-sm font-bold text-emerald-600 mt-0.5">₹{advancePaid.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Balance Due</div>
                      <div className="text-sm font-bold text-rose-600 mt-0.5">₹{balanceAmount.toLocaleString()}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full py-2 px-3 bg-[#0A6FAE] hover:bg-[#062B49] text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" /> + Record Payment
                  </button>
                </div>
              </div>

              {/* Comments & Follow-up History */}
              <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#0A6FAE]" />
                    Comments & Follow-up History ({enquiry.comments?.length || 0})
                  </span>
                </div>

                <div className="p-4">
                  {/* Add Comment Form */}
                  <form onSubmit={handleAddComment} className="mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                      <div>
                        <select
                          value={callStatus}
                          onChange={(e) => setCallStatus(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-hidden focus:border-[#062B49]"
                        >
                          <option value="connected">📞 Connected</option>
                          <option value="interested">⭐ Interested</option>
                          <option value="call_busy">⏳ Call Busy</option>
                          <option value="call_not_picked">❌ Not Picked</option>
                          <option value="callback_requested">🔄 Callback Req</option>
                          <option value="whatsapp_sent">💬 WhatsApp Sent</option>
                          <option value="advance_collected">💰 Advance Collected</option>
                          <option value="payment_followup">💳 Payment Followup</option>
                          <option value="general_note">📝 General Note</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add comment or note about this enquiry..."
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-hidden focus:border-[#062B49]"
                          required
                        />
                      </div>
                    </div>

                    <div className="text-right">
                      <button
                        type="submit"
                        disabled={submittingComment || !newComment.trim()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#0A6FAE] to-[#062B49] text-white font-bold rounded text-xs hover:opacity-95 disabled:opacity-50 cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        {submittingComment ? 'Posting...' : 'Add Comment'}
                      </button>
                    </div>
                  </form>

                  {/* Comments Timeline */}
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {enquiry.comments && enquiry.comments.length > 0 ? (
                      enquiry.comments.map((c) => (
                        <div
                          key={c.id}
                          className="bg-[#f9f9fb] border border-[#dee2e6] rounded-lg p-2.5 text-xs shadow-2xs hover:bg-white transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[#0A6FAE]">{c.author_name || 'Team Member'}</span>
                              <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 text-[10px] font-semibold">
                                {c.call_status.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {new Date(c.created_at).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                              })}{' '}
                              {new Date(c.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-slate-800 leading-snug">{c.comment_text}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-slate-400 text-xs">
                        No comments yet. Add the first comment above!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Drawer Action Footer */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <button
            onClick={() => setShowStatusModal(true)}
            className="px-3 py-1.5 border border-[#0A6FAE] text-[#0A6FAE] font-semibold rounded hover:bg-sky-50 flex items-center gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Update Status
          </button>

          {enquiry && (
            <Link
              href={`/crm/enquiry/${enquiry.id}`}
              className="px-4 py-1.5 bg-[#0A6FAE] hover:bg-[#062B49] text-white font-bold rounded flex items-center gap-1.5 shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open Full Profile
            </Link>
          )}
        </div>
      </div>

      {/* DRAWER MODAL 1: STATUS */}
      {showStatusModal && (
        <div data-crm-fade className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div data-crm-pop className="bg-white rounded-xl shadow-xl w-full max-w-sm border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 font-bold text-sm text-slate-800">
              <span>Update Status</span>
              <button onClick={() => setShowStatusModal(false)}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleUpdateStatus} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-800"
                >
                  <option value="new">New Lead</option>
                  <option value="contacted">Contacted</option>
                  <option value="booked">Booked</option>
                  <option value="travelled">Travelled</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Note (Optional)</label>
                <textarea
                  rows={2}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-800"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-3 py-1.5 bg-slate-200 rounded text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#0A6FAE] text-white rounded font-bold"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER MODAL 2: PAYMENT */}
      {showPaymentModal && (
        <div data-crm-fade className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div data-crm-pop className="bg-white rounded-xl shadow-xl w-full max-w-sm border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 font-bold text-sm text-slate-800">
              <span>Record Payment</span>
              <button onClick={() => setShowPaymentModal(false)}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleRecordPayment} className="p-4 space-y-3 text-xs">
              <div className="bg-slate-50 p-2 rounded border border-slate-200 flex justify-between">
                <span>Remaining: <strong className="text-rose-600">₹{balanceAmount.toLocaleString()}</strong></span>
                <span>Total: <strong className="text-slate-800">₹{totalAmount.toLocaleString()}</strong></span>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount to Add (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-bold"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Mode</label>
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                >
                  <option value="upi">UPI</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card">Card</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Note</label>
                <input
                  type="text"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  placeholder="Optional note / transaction ID"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-3 py-1.5 bg-slate-200 rounded text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#0A6FAE] text-white rounded font-bold"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER MODAL 3: FOLLOWUP DATE */}
      {showFollowupModal && (
        <div data-crm-fade className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div data-crm-pop className="bg-white rounded-xl shadow-xl w-full max-w-xs border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 font-bold text-sm text-slate-800">
              <span>Update Follow-up Date</span>
              <button onClick={() => setShowFollowupModal(false)}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleUpdateFollowup} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Next Follow-up Date</label>
                <input
                  type="date"
                  value={followupDateVal}
                  onChange={(e) => setFollowupDateVal(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFollowupModal(false)}
                  className="px-3 py-1.5 bg-slate-200 rounded text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#0A6FAE] text-white rounded font-bold"
                >
                  Save Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
