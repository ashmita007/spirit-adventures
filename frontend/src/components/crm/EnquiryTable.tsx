'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Ticket,
  Bed,
  Users,
  Wallet,
  MessageSquare,
  ChevronRight,
  Phone,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Edit,
  Send,
  CalendarDays,
  IndianRupee,
  X,
  Tag,
  AlertTriangle,
  Trash2,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { Enquiry, User, EnquiryComment } from '@/lib/crm/types';
import { api } from '@/lib/crm/api';
import { useAuth } from '@/components/crm/auth-context';

interface EnquiryTableProps {
  enquiries: Enquiry[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  accommodationFilter: string;
  setAccommodationFilter: (a: string) => void;
  salespersonFilter: string;
  setSalespersonFilter: (sp: string) => void;
  salespersons: User[];
  onSelectEnquiry: (id: number) => void;
  onOpenNewModal: () => void;
  onRefresh?: () => void;
  page?: number;
  onPageChange?: (newPage: number) => void;
  perPage?: number;
  onPerPageChange?: (newPerPage: number) => void;
  totalCount?: number;
  totalPages?: number;
}

export const EnquiryTable: React.FC<EnquiryTableProps> = ({
  enquiries,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  accommodationFilter,
  setAccommodationFilter,
  salespersonFilter,
  setSalespersonFilter,
  salespersons,
  onSelectEnquiry,
  onOpenNewModal,
  onRefresh,
  page = 1,
  onPageChange,
  perPage = 10,
  onPerPageChange,
  totalCount = 0,
  totalPages = 1,
}) => {
  const auth = useAuth();
  // Modal states for the 4 modals
  const [dateModalEnquiry, setDateModalEnquiry] = useState<Enquiry | null>(null);
  const [newFollowupDate, setNewFollowupDate] = useState<string>('');

  const [statusModalEnquiry, setStatusModalEnquiry] = useState<Enquiry | null>(null);
  const [newStatus, setNewStatus] = useState<string>('contacted');
  const [statusNote, setStatusNote] = useState<string>('');

  const [commentsModalEnquiry, setCommentsModalEnquiry] = useState<Enquiry | null>(null);
  const [modalCommentInput, setModalCommentInput] = useState<string>('');
  const [modalCommentStatus, setModalCommentStatus] = useState<string>('connected');

  const [paymentModalEnquiry, setPaymentModalEnquiry] = useState<Enquiry | null>(null);
  const [paymentTargetFees, setPaymentTargetFees] = useState<number>(0);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentDueDate, setPaymentDueDate] = useState<string>('');

  // Inline row quick comment inputs: { [enquiryId]: string }
  const [rowComments, setRowComments] = useState<{ [id: number]: string }>({});
  const [submittingAction, setSubmittingAction] = useState(false);

  const statusTabs = [
    { key: 'all', label: 'All Enquiries' },
    { key: 'new', label: 'Fresh Leads' },
    { key: 'contacted', label: 'In Follow-up' },
    { key: 'booked', label: 'Joined / Booked' },
    { key: 'travelled', label: 'Travelled' },
    { key: 'cancelled', label: 'Cancelled / Lost' },
  ];

  // Handlers for Modals
  const handleOpenDateModal = (e: React.MouseEvent, enq: Enquiry) => {
    e.stopPropagation();
    setDateModalEnquiry(enq);
    setNewFollowupDate(enq.followup_date || new Date().toISOString().split('T')[0]);
  };

  const handleSaveFollowupDate = async () => {
    if (!dateModalEnquiry || !newFollowupDate) return;
    setSubmittingAction(true);
    try {
      await api.updateFollowupDate(dateModalEnquiry.id, newFollowupDate);
      setDateModalEnquiry(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      alert('Failed to update follow-up date');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleOpenStatusModal = (e: React.MouseEvent, enq: Enquiry) => {
    e.stopPropagation();
    setStatusModalEnquiry(enq);
    setNewStatus(enq.status || 'contacted');
    setStatusNote('');
  };

  const handleSaveStatus = async () => {
    if (!statusModalEnquiry) return;
    setSubmittingAction(true);
    try {
      await api.updateStatus(statusModalEnquiry.id, newStatus, statusNote);
      setStatusModalEnquiry(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleOpenCommentsModal = async (e: React.MouseEvent, enq: Enquiry) => {
    e.stopPropagation();
    setCommentsModalEnquiry(enq);
    setModalCommentInput('');
    try {
      const fresh = await api.getEnquiry(enq.id);
      setCommentsModalEnquiry(fresh);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddModalComment = async () => {
    if (!commentsModalEnquiry || !modalCommentInput.trim()) return;
    setSubmittingAction(true);
    try {
      await api.addComment(commentsModalEnquiry.id, modalCommentInput.trim(), modalCommentStatus);
      // Reload comments for this enquiry
      const updated = await api.getEnquiry(commentsModalEnquiry.id);
      setCommentsModalEnquiry(updated);
      setModalCommentInput('');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      alert('Failed to add comment');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleOpenPaymentModal = (e: React.MouseEvent, enq: Enquiry) => {
    e.stopPropagation();
    setPaymentModalEnquiry(enq);
    setPaymentTargetFees(Number(enq.total_amount) || 0);
    setPaymentAmount(0);
    setPaymentDueDate(enq.date_of_travel || '');
  };

  const handleSavePayment = async () => {
    if (!paymentModalEnquiry || paymentAmount <= 0) return;
    setSubmittingAction(true);
    try {
      const newAdvance = Number(paymentModalEnquiry.advance_paid || 0) + Number(paymentAmount);
      await api.updatePayment(paymentModalEnquiry.id, newAdvance);
      await api.addComment(
        paymentModalEnquiry.id,
        `Payment recorded: ₹${paymentAmount.toLocaleString('en-IN')}. New advance: ₹${newAdvance.toLocaleString('en-IN')}. Balance: ₹${Math.max(0, paymentTargetFees - newAdvance).toLocaleString('en-IN')}`,
        'advance_collected'
      );
      setPaymentModalEnquiry(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      alert('Failed to record payment');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleRowCommentSubmit = async (e: React.FormEvent, enqId: number) => {
    e.preventDefault();
    e.stopPropagation();
    const comment = rowComments[enqId];
    if (!comment || !comment.trim()) return;

    try {
      await api.addComment(enqId, comment.trim(), 'general_note');
      setRowComments((prev) => ({ ...prev, [enqId]: '' }));
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

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
          <div className="w-10 h-10 rounded-xl bg-[#0A6FAE] text-white flex items-center justify-center shadow-xs">
            <Filter className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0A6FAE] tracking-tight m-0">
              Smart Enquiry Dashboard & Ledger
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Tap any status, date, comment or amount to edit it in place
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenNewModal}
            className="flex items-center gap-2 bg-[#0A6FAE] hover:bg-[#0A6FAE] text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            + Add New Enquiry
          </button>
        </div>
      </div>

      {/* Filter and Search Controls Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Rounded Search Bar */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Traveler Name, Phone, PNR Up/Down, Tour City..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0A6FAE] focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Accommodation & Salesperson Dropdowns */}
          <div className="flex items-center gap-2">
            <select
              value={accommodationFilter}
              onChange={(e) => setAccommodationFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-none focus:border-[#0A6FAE]"
            >
              <option value="all">All Accommodations</option>
              <option value="sharing">👥 Sharing Room</option>
              <option value="private_room">🔒 Private Room</option>
              <option value="tent">⛺ Tent / Camping</option>
            </select>

            {auth.isSalesPerson ? (
              <div className="bg-emerald-50 border border-emerald-200 text-xs rounded-lg px-3 py-2 text-emerald-800 font-bold flex items-center gap-1.5 shadow-2xs">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Assigned to: {auth.user?.display_name || 'You'}</span>
              </div>
            ) : (
              <select
                value={salespersonFilter}
                onChange={(e) => setSalespersonFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-none focus:border-[#0A6FAE]"
              >
                <option value="all">All Counsellors ({salespersons.length})</option>
                {salespersons.map((sp) => (
                  <option key={sp.id} value={sp.id.toString()}>
                    👤 {sp.display_name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-t border-slate-100 pt-3">
          {statusTabs.map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#0A6FAE] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#0A6FAE] hover:bg-[#EFF8FD]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-xl bg-white border border-slate-200/90 shadow-sm">
        {/* Phones: one card per lead with the actions a rep needs on the go */}
        <ul className="md:hidden divide-y divide-slate-100" aria-label="Enquiries">
          {enquiries.length === 0 ? (
            <li className="px-4 py-12 text-center">
              <p className="text-sm font-semibold text-slate-600 mb-1">No enquiries found</p>
              <p className="text-xs text-slate-400">Adjust your filters or add a new enquiry.</p>
            </li>
          ) : (
            enquiries.map((enq) => {
              const urgent = Boolean(enq.followup_date && enq.followup_date <= todayStr);
              const tone =
                enq.status === 'booked' || enq.status === 'travelled'
                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                  : enq.status === 'cancelled'
                  ? 'bg-rose-50 text-rose-700 ring-rose-200'
                  : 'bg-amber-50 text-amber-800 ring-amber-200';
              const phone = (enq.contact || '').replace(/\D/g, '');
              return (
                <li key={enq.id} data-crm-row className="p-4 active:bg-sky-50/60">
                  <button
                    type="button"
                    onClick={() => onSelectEnquiry(enq.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-bold text-[15px] text-slate-900 truncate">{enq.name}</p>
                        <p className="text-xs text-slate-500 truncate">{enq.tour_name}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ring-1 ${tone}`}>
                        {enq.status}
                      </span>
                    </div>
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                      <span>✈ {enq.date_of_travel}</span>
                      <span>👥 {enq.total_people} pax</span>
                      <span className={urgent ? 'font-bold text-rose-600' : ''}>
                        ⏰ {enq.followup_date || 'No follow-up'}
                      </span>
                      {enq.source === 'website' && (
                        <span className="rounded-full bg-sky-50 px-1.5 py-px text-[9px] font-bold uppercase text-sky-700 ring-1 ring-sky-200">
                          Website
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-slate-500">{enq.sales_person_name}</span>
                      <span className="font-semibold text-slate-800">
                        ₹{Number(enq.total_amount || 0).toLocaleString('en-IN')}
                        {Number(enq.balance_amount) > 0 && (
                          <span className="ml-1.5 font-bold text-rose-600">
                            Due ₹{Number(enq.balance_amount).toLocaleString('en-IN')}
                          </span>
                        )}
                      </span>
                    </div>
                  </button>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <a
                      href={`tel:${enq.contact}`}
                      className="flex h-10 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-700 active:scale-95 transition"
                    >
                      Call
                    </a>
                    <a
                      href={`https://wa.me/${phone.length === 10 ? `91${phone}` : phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 items-center justify-center rounded-xl bg-[#25D366] text-xs font-bold text-white active:scale-95 transition"
                    >
                      WhatsApp
                    </a>
                    <button
                      type="button"
                      onClick={() => onSelectEnquiry(enq.id)}
                      className="flex h-10 items-center justify-center rounded-xl bg-[#0A6FAE] text-xs font-bold text-white active:scale-95 transition"
                    >
                      Open
                    </button>
                  </div>
                </li>
              );
            })
          )}
        </ul>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            {/* Navy Table Header */}
            <thead className="bg-[#062B49] text-white text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Name</th>
                <th className="px-4 py-3.5">Contact</th>
                <th className="px-4 py-3.5">Tour / Course</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Counsellor</th>
                <th className="px-4 py-3.5">Follow Up</th>
                <th className="px-4 py-3.5">Comments</th>
                <th className="px-4 py-3.5">Group Segregation</th>
                <th className="px-4 py-3.5">Payment</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enquiries.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center text-slate-400">
                    <p className="text-sm font-semibold text-slate-600 mb-1">No enquiries found</p>
                    <p className="text-xs">Adjust your search filters or click <strong>+ Add New Enquiry</strong>.</p>
                  </td>
                </tr>
              ) : (
                enquiries.map((enq) => {
                  const isUrgentFollowup = enq.followup_date && enq.followup_date <= todayStr;
                  const latestComment = enq.comments && enq.comments.length > 0 ? enq.comments[0] : null;

                  // Status Badge Class
                  let badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
                  if (enq.status === 'booked' || enq.status === 'travelled') {
                    badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                  } else if (enq.status === 'cancelled') {
                    badgeClass = 'bg-rose-100 text-rose-800 border-rose-300';
                  }

                  return (
                    <tr
                      key={enq.id}
                      className="hover:bg-[#EFF8FD]/50 transition-colors group"
                    >
                      {/* 1. Name */}
                      <td className="px-4 py-3">
                        <div
                          onClick={() => onSelectEnquiry(enq.id)}
                          className="font-bold text-slate-900 group-hover:text-[#0A6FAE] transition-colors text-[13px] cursor-pointer"
                        >
                          {enq.name}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                          {enq.departure_city || 'India'}
                          {enq.source === 'website' && (
                            <span
                              title="Came in from the Spirit Adventures website"
                              className="rounded-full bg-sky-50 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-sky-700 ring-1 ring-sky-200"
                            >
                              Website
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 2. Contact & WhatsApp */}
                      <td className="px-4 py-3 font-mono">
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                          <Phone className="h-3 w-3 text-[#0A6FAE]" />
                          <span>{enq.contact}</span>
                        </div>
                      </td>

                      {/* 3. Tour / Course */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800 truncate max-w-[150px]">
                          {enq.tour_name}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-sky-700 font-mono mt-0.5">
                          <Calendar className="h-3 w-3" />
                          {enq.date_of_travel}
                        </div>
                      </td>

                      {/* 4. Status (Click opens Status Modal!) */}
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => handleOpenStatusModal(e, enq)}
                          title="Click to update status"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border shadow-2xs hover:scale-105 transition-transform cursor-pointer ${badgeClass}`}
                        >
                          <Tag className="h-3 w-3" />
                          <span>{enq.status}</span>
                        </button>
                      </td>

                      {/* 5. Counsellor */}
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {enq.sales_person_name || 'Unassigned'}
                        </span>
                      </td>

                      {/* 6. Follow Up (Click opens Date Picker Modal!) */}
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => handleOpenDateModal(e, enq)}
                          title="Click to change follow-up date"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                            isUrgentFollowup
                              ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                              : 'bg-sky-50 text-[#0A6FAE] border-sky-200 hover:bg-[#0A6FAE] hover:text-white'
                          }`}
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            {enq.followup_date
                              ? new Date(enq.followup_date).toLocaleDateString('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : 'Set Date'}
                          </span>
                        </button>
                      </td>

                      {/* 7. Comments (Preview + Inline Input) */}
                      <td className="px-4 py-3 min-w-[200px]">
                        <div
                          onClick={(e) => handleOpenCommentsModal(e, enq)}
                          title="Click to view full comment timeline"
                          className="text-[11px] text-slate-600 truncate max-w-[200px] cursor-pointer hover:text-[#0A6FAE] font-medium mb-1"
                        >
                          {latestComment ? (
                            <span>💬 {latestComment.comment_text}</span>
                          ) : (
                            <span className="text-slate-400 italic">No comments yet</span>
                          )}
                        </div>

                        {/* Inline quick comment box (style) */}
                        <form
                          onSubmit={(e) => handleRowCommentSubmit(e, enq.id)}
                          className="flex items-center gap-1"
                        >
                          <input
                            type="text"
                            placeholder="Add comment..."
                            value={rowComments[enq.id] || ''}
                            onChange={(e) =>
                              setRowComments({ ...rowComments, [enq.id]: e.target.value })
                            }
                            className="bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-[11px] text-slate-800 placeholder-slate-400 w-full focus:outline-none focus:border-[#0A6FAE]"
                          />
                          <button
                            type="submit"
                            title="Post comment"
                            className="bg-[#0A6FAE] hover:bg-[#0A6FAE] text-white p-1 rounded transition-colors shrink-0"
                          >
                            <Send className="h-3 w-3" />
                          </button>
                        </form>
                      </td>

                      {/* 8. Group Segregation */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-800 text-[11px]">
                          {enq.total_people} Pax
                        </div>
                        <div className="flex items-center gap-1 text-[10px] mt-0.5">
                          {enq.boys_count > 0 && (
                            <span className="bg-blue-50 text-blue-700 border border-blue-200 px-1 py-0.2 rounded font-bold">
                              👦{enq.boys_count}
                            </span>
                          )}
                          {enq.girls_count > 0 && (
                            <span className="bg-rose-50 text-rose-700 border border-rose-200 px-1 py-0.2 rounded font-bold">
                              👧{enq.girls_count}
                            </span>
                          )}
                          {enq.couples_count > 0 && (
                            <span className="bg-purple-50 text-purple-700 border border-purple-200 px-1 py-0.2 rounded font-bold">
                              💑{enq.couples_count}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 9. Payment (Click opens Payment Modal!) */}
                      <td className="px-4 py-3 font-mono text-[11px]">
                        <button
                          onClick={(e) => handleOpenPaymentModal(e, enq)}
                          title="Click to record payment"
                          className="text-left group/pay cursor-pointer block"
                        >
                          <div className="text-emerald-700 font-bold flex items-center gap-0.5 group-hover/pay:underline">
                            <IndianRupee className="h-3 w-3" />
                            {Number(enq.advance_paid).toLocaleString('en-IN')}
                          </div>
                          <div className="text-[#0A6FAE] font-semibold text-[10px]">
                            Bal: ₹{Number(enq.balance_amount).toLocaleString('en-IN')}
                          </div>
                        </button>
                      </td>

                      {/* 10. Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* WhatsApp Button */}
                          <a
                            href={`https://wa.me/91${enq.contact.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Chat on WhatsApp"
                            onClick={(e) => e.stopPropagation()}
                            className="w-7 h-7 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-xs transition-transform hover:scale-110"
                          >
                            <Phone className="h-3.5 w-3.5" />
                          </a>

                          {/* View Details Eye Button */}
                          <button
                            onClick={() => onSelectEnquiry(enq.id)}
                            title="View Details"
                            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-[#0A6FAE] hover:text-white text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete Lead Button (Manager Only) */}
                          {auth.canDelete && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (!confirm(`Are you sure you want to delete lead #${enq.id} (${enq.name})?`)) return;
                                try {
                                  await api.deleteEnquiry(enq.id);
                                  if (onRefresh) onRefresh();
                                } catch (err: any) {
                                  alert(err.message || 'Failed to delete lead');
                                }
                              }}
                              title="Delete Lead (Manager Only)"
                              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-rose-500 hover:text-white text-rose-500 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Signature DataTables Pagination Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white border-t border-slate-200 text-xs">
          {/* Left: Info & Length selector */}
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-slate-600 font-medium">
              Showing <strong className="text-slate-900">{totalCount > 0 ? (page - 1) * perPage + 1 : 0}</strong> to{' '}
              <strong className="text-slate-900">{Math.min(page * perPage, totalCount || enquiries.length)}</strong> of{' '}
              <strong className="text-[#0A6FAE] font-bold">{totalCount || enquiries.length}</strong> entries
            </span>

            {onPerPageChange && (
              <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                <span>Show</span>
                <select
                  value={perPage}
                  onChange={(e) => onPerPageChange(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#0A6FAE]"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>entries</span>
              </div>
            )}
          </div>

          {/* Right: Page Buttons */}
          {onPageChange && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-[#EFF8FD] hover:text-[#0A6FAE] font-semibold disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      p === page
                        ? 'text-white shadow-xs'
                        : 'text-slate-700 border border-slate-200 hover:bg-[#EFF8FD] hover:text-[#0A6FAE]'
                    }`}
                    style={
                      p === page
                        ? {
                            background: 'linear-gradient(to right, #0A6FAE, #7DD3FC)',
                          }
                        : undefined
                    }
                  >
                    {p}
                  </button>
                ))}

              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-[#EFF8FD] hover:text-[#0A6FAE] font-semibold disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: DATE PICKER MODAL (#datePickerModal)
         ========================================================================= */}
      {dateModalEnquiry && (
        <div data-crm-fade className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div data-crm-pop className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div
              className="px-5 py-3.5 text-white flex items-center justify-between"
              style={{
                background: 'linear-gradient(45deg, #0A6FAE, #062B49)',
              }}
            >
              <h5 className="font-bold text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Set Follow-up Date
              </h5>
              <button
                onClick={() => setDateModalEnquiry(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-600">
                Reschedule follow-up call for <strong>{dateModalEnquiry.name}</strong>:
              </p>
              <input
                type="date"
                value={newFollowupDate}
                onChange={(e) => setNewFollowupDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#0A6FAE]"
              />
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDateModalEnquiry(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingAction || !newFollowupDate}
                onClick={handleSaveFollowupDate}
                className="px-4 py-2 rounded-lg bg-[#0A6FAE] hover:bg-[#0A6FAE] text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: STATUS UPDATE MODAL (#statusModal)
         ========================================================================= */}
      {statusModalEnquiry && (
        <div data-crm-fade className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div data-crm-pop className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div
              className="px-5 py-3.5 text-white flex items-center justify-between"
              style={{
                background: 'linear-gradient(45deg, #0A6FAE, #062B49)',
              }}
            >
              <h5 className="font-bold text-sm flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Update Status
              </h5>
              <button
                onClick={() => setStatusModalEnquiry(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#0A6FAE]"
                >
                  <option value="new">Fresh Lead</option>
                  <option value="contacted">In Follow-up</option>
                  <option value="booked">Joined / Booked</option>
                  <option value="travelled">Travelled</option>
                  <option value="cancelled">Dropout / Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status Note (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Add a note about this status change..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-[#0A6FAE]"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setStatusModalEnquiry(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingAction}
                onClick={handleSaveStatus}
                className="px-4 py-2 rounded-lg bg-[#0A6FAE] hover:bg-[#0A6FAE] text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: COMMENTS MODAL (#commentsModal)
         ========================================================================= */}
      {commentsModalEnquiry && (
        <div data-crm-fade className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div data-crm-pop className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div
              className="px-5 py-3.5 text-white flex items-center justify-between"
              style={{
                background: 'linear-gradient(45deg, #0A6FAE, #062B49)',
              }}
            >
              <h5 className="font-bold text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Enquiry Comments — {commentsModalEnquiry.name}
              </h5>
              <button
                onClick={() => setCommentsModalEnquiry(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body: Comments Timeline */}
            <div className="p-5 space-y-3">
              <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                {commentsModalEnquiry.comments && commentsModalEnquiry.comments.length > 0 ? (
                  commentsModalEnquiry.comments.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-lg bg-slate-50 border-l-[3px] border-l-[#0A6FAE] border border-slate-200 text-xs space-y-1 shadow-2xs hover:translate-x-0.5 transition-transform"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#0A6FAE]">{c.author_name}</span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          {new Date(c.created_at).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-slate-700">{c.comment_text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-6 text-center italic">
                    No comments recorded yet.
                  </p>
                )}
              </div>

              {/* Input Group to Post Comment */}
              <div className="pt-2 border-t border-slate-200 flex gap-2">
                <input
                  type="text"
                  placeholder="Type your comment..."
                  value={modalCommentInput}
                  onChange={(e) => setModalCommentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddModalComment();
                  }}
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0A6FAE]"
                />
                <button
                  type="button"
                  disabled={submittingAction || !modalCommentInput.trim()}
                  onClick={handleAddModalComment}
                  className="bg-[#0A6FAE] hover:bg-[#0A6FAE] text-white px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: RECORD PAYMENT MODAL (#paymentModal)
         ========================================================================= */}
      {paymentModalEnquiry && (
        <div data-crm-fade className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div data-crm-pop className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div
              className="px-5 py-3.5 text-white flex items-center justify-between"
              style={{
                background: 'linear-gradient(45deg, #0A6FAE, #062B49)',
              }}
            >
              <h5 className="font-bold text-sm flex items-center gap-2">
                <IndianRupee className="h-4 w-4" />
                Record Initial / Partial Payment
              </h5>
              <button
                onClick={() => setPaymentModalEnquiry(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-3.5">
              {/* Target Fees */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Fees (Total Tour Package Cost)
                </label>
                <input
                  type="number"
                  min="0"
                  value={paymentTargetFees}
                  onChange={(e) => setPaymentTargetFees(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold text-slate-800"
                />
              </div>

              {/* Payment Amount */}
              <div>
                <label className="block text-xs font-bold text-emerald-700 mb-1">
                  Payment Amount Received Now <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Enter amount collected..."
                  value={paymentAmount || ''}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full bg-white border border-emerald-400 rounded-lg p-2 text-xs font-mono font-bold text-emerald-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Remaining Balance (Auto-calculated) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Remaining Balance (Auto-Calculated)
                </label>
                <input
                  type="number"
                  readOnly
                  value={Math.max(
                    0,
                    paymentTargetFees - (Number(paymentModalEnquiry.advance_paid || 0) + paymentAmount)
                  )}
                  className="w-full bg-sky-50 border border-sky-200 rounded-lg p-2 text-xs font-mono font-bold text-[#0A6FAE]"
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={paymentDueDate}
                  onChange={(e) => setPaymentDueDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#0A6FAE]"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPaymentModalEnquiry(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingAction || paymentAmount <= 0}
                onClick={handleSavePayment}
                className="px-4 py-2 rounded-lg bg-[#0A6FAE] hover:bg-[#0A6FAE] text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
