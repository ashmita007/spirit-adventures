'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Phone,
  MessageCircle,
  Edit,
  Info,
  CreditCard,
  MessageSquare,
  Send,
  Calendar as CalendarIcon,
  Clock,
  ArrowLeft,
  Trash2,
  CheckCircle,
  AlertCircle,
  Compass,
  MapPin,
  Bed,
  Train,
  CheckCircle2,
  X,
  Users
} from 'lucide-react';
import { Enquiry, EnquiryComment } from '@/lib/crm/types';
import { api } from '@/lib/crm/api';
import { useAuth } from '@/components/crm/auth-context';
import { Select } from "@/components/ui/select";

export default function EnquiryProfilePage() {
  const auth = useAuth();
  const params = useParams();
  const router = useRouter();
  const enquiryId = Number(params?.id);

  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Comment state
  const [commentText, setCommentText] = useState('');
  const [callStatus, setCallStatus] = useState('connected');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Modals state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('upi');
  const [paymentNote, setPaymentNote] = useState('');
  const [updatingPayment, setUpdatingPayment] = useState(false);

  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [newFollowupDate, setNewFollowupDate] = useState('');
  const [updatingFollowup, setUpdatingFollowup] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadEnquiry = async () => {
    if (!enquiryId || isNaN(enquiryId)) {
      setError('Invalid Enquiry ID');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await api.getEnquiry(enquiryId);
      setEnquiry(data);
      setNewStatus(data.status);
      setNewFollowupDate(data.followup_date || '');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load enquiry profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiry();
  }, [enquiryId]);

  // Handle Add Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !enquiry) return;

    setSubmittingComment(true);
    try {
      await api.addComment(enquiry.id, commentText.trim(), callStatus);
      setCommentText('');
      showToast('Comment added successfully!');
      await loadEnquiry();
    } catch (err: any) {
      console.error(err);
      showToast('Failed to add comment', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle Status Update
  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiry || !newStatus) return;

    setUpdatingStatus(true);
    try {
      await api.updateStatus(enquiry.id, newStatus, statusNote.trim() || undefined);
      setShowStatusModal(false);
      setStatusNote('');
      showToast(`Status updated to ${newStatus}!`);
      await loadEnquiry();
    } catch (err: any) {
      console.error(err);
      showToast('Failed to update status', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle Payment Update
  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiry || !paymentAmount) return;

    const added = parseFloat(paymentAmount);
    if (isNaN(added) || added <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setUpdatingPayment(true);
    try {
      const currentAdv = parseFloat(String(enquiry.advance_paid || 0));
      const totalAmount = parseFloat(String(enquiry.total_amount || 0));
      const newTotalAdvance = currentAdv + added;

      await api.updatePayment(enquiry.id, newTotalAdvance);

      // Also record payment log in comments
      const noteStr = paymentNote.trim() ? ` (${paymentNote.trim()})` : '';
      await api.addComment(
        enquiry.id,
        `Payment Recorded: ₹${added.toLocaleString()} via ${paymentMode.toUpperCase()}${noteStr}. Total Advance: ₹${newTotalAdvance.toLocaleString()} / Balance: ₹${Math.max(0, totalAmount - newTotalAdvance).toLocaleString()}`,
        'payment_followup'
      );

      setShowPaymentModal(false);
      setPaymentAmount('');
      setPaymentNote('');
      showToast(`Payment of ₹${added.toLocaleString()} recorded successfully!`);
      await loadEnquiry();
    } catch (err: any) {
      console.error(err);
      showToast('Failed to record payment', 'error');
    } finally {
      setUpdatingPayment(false);
    }
  };

  // Handle Follow-up Date Update
  const handleSaveFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiry || !newFollowupDate) return;

    setUpdatingFollowup(true);
    try {
      await api.updateFollowupDate(enquiry.id, newFollowupDate);
      setShowFollowupModal(false);
      showToast(`Follow-up date updated to ${newFollowupDate}!`);
      await loadEnquiry();
    } catch (err: any) {
      console.error(err);
      showToast('Failed to update follow-up date', 'error');
    } finally {
      setUpdatingFollowup(false);
    }
  };

  // Handle Delete Enquiry
  const handleDeleteEnquiry = async () => {
    if (!enquiry) return;
    setDeleting(true);
    try {
      await api.deleteEnquiry(enquiry.id);
      showToast('Enquiry deleted successfully');
      router.push('/crm');
    } catch (err: any) {
      console.error(err);
      showToast('Failed to delete enquiry', 'error');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-[#f8f9fa] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#062B49] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading Enquiry Profile...</p>
        </div>
      </div>
    );
  }

  if (error || !enquiry) {
    return (
      <div className="min-h-dvh bg-[#f8f9fa] p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xs border border-slate-200 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Enquiry Not Found</h2>
          <p className="text-slate-600 mb-6">{error || 'Could not find the requested enquiry.'}</p>
          <Link
            href="/crm"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#0A6FAE] to-[#062B49] text-white font-semibold rounded-lg shadow-sm hover:opacity-95"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Calculations for payment
  const totalAmount = parseFloat(String(enquiry.total_amount || 0));
  const advancePaid = parseFloat(String(enquiry.advance_paid || 0));
  const balanceAmount = parseFloat(String(enquiry.balance_amount || 0));
  const paidPercent = totalAmount > 0 ? Math.min(100, Math.round((advancePaid / totalAmount) * 100)) : 0;
  const isFullyPaid = totalAmount > 0 && advancePaid >= totalAmount;

  return (
    <div className="min-h-dvh bg-[#f8f9fa] text-slate-800 pb-16 font-sans">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 slide-in-from-top-4 duration-300">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-lg border text-sm font-semibold ${
              toastMessage.type === 'success'
                ? 'bg-[#d4edda] text-[#155724] border-[#c3e6cb]'
                : 'bg-[#f8d7da] text-[#721c24] border-[#f5c6cb]'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm text-slate-600" aria-label="breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/crm" className="text-[#0A6FAE] hover:underline font-medium">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/crm" className="text-[#0A6FAE] hover:underline font-medium">
                Enquiries
              </Link>
            </li>
            <li>/</li>
            <li className="text-slate-500 font-normal truncate max-w-xs">{enquiry.name}</li>
          </ol>
        </nav>

        {/* Profile Header Card */}
        <div className="bg-white rounded-t-xl shadow-xs border border-slate-200 overflow-hidden mb-6">
          <div
            className="p-6 text-white relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            style={{
              background: 'linear-gradient(135deg, #0A6FAE 0%, #062B49 100%)',
            }}
          >
            <div className="flex items-center gap-5">
              {/* Profile Picture Circle */}
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white text-[#0A6FAE] flex items-center justify-center font-bold text-3xl md:text-4xl shadow-md border-4 border-white shrink-0">
                <User className="w-10 h-10 md:w-12 md:h-12 text-[#062B49]" />
              </div>

              {/* Profile Info */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1 text-white">
                  {enquiry.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 text-white/90 text-sm">
                  <span className="flex items-center gap-1 font-medium">
                    <Phone className="w-3.5 h-3.5 transform rotate-90" />
                    {enquiry.contact}
                  </span>

                  <a
                    href={`tel:${enquiry.contact}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-slate-800 rounded-md text-xs font-semibold hover:bg-slate-100 transition-colors shadow-2xs"
                  >
                    <Phone className="w-3 h-3 text-emerald-600" /> Call
                  </a>

                  <a
                    href={`https://wa.me/91${enquiry.contact.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-slate-800 rounded-md text-xs font-semibold hover:bg-slate-100 transition-colors shadow-2xs"
                  >
                    <MessageCircle className="w-3 h-3 text-emerald-600" /> WhatsApp
                  </a>

                  <button
                    onClick={() => setShowStatusModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-slate-800 rounded-md text-xs font-semibold hover:bg-slate-100 transition-colors shadow-2xs"
                    title="Edit Status"
                  >
                    <Edit className="w-3 h-3 text-[#0A6FAE]" /> Edit Status
                  </button>
                </div>
              </div>
            </div>

            {/* Status Badge Top Right */}
            <div className="md:self-start">
              <span
                className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold shadow-xs ${
                  enquiry.status === 'booked' || enquiry.status === 'travelled'
                    ? 'bg-emerald-500 text-white'
                    : enquiry.status === 'cancelled'
                    ? 'bg-rose-600 text-white'
                    : 'bg-amber-400 text-slate-900'
                }`}
              >
                {enquiry.status}
              </span>
            </div>
          </div>
        </div>

        {/* Two-Column Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Card 1: Traveler & Expedition Information */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col h-full">
            <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center gap-2 font-bold text-slate-700 text-sm">
              <Info className="w-4 h-4 text-[#0A6FAE]" />
              Traveler & Expedition Information
            </div>

            <div className="p-5 flex-1 space-y-3 text-sm">
              <div className="flex border-b border-slate-100 pb-2.5">
                <span className="w-40 font-semibold text-slate-500 shrink-0">Subject / Tour</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#062B49]" />
                  {enquiry.tour_name}
                </span>
              </div>

              <div className="flex border-b border-slate-100 pb-2.5">
                <span className="w-40 font-semibold text-slate-500 shrink-0">Counsellor / Sales</span>
                <span className="text-slate-800 font-medium">{enquiry.sales_person_name || 'Unassigned'}</span>
              </div>

              <div className="flex border-b border-slate-100 pb-2.5">
                <span className="w-40 font-semibold text-slate-500 shrink-0">Departure City</span>
                <span className="text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {enquiry.departure_city || 'Not specified'}
                </span>
              </div>

              <div className="flex border-b border-slate-100 pb-2.5">
                <span className="w-40 font-semibold text-slate-500 shrink-0">Accommodation</span>
                <span className="text-slate-800 capitalize flex items-center gap-1.5 font-medium">
                  <Bed className="w-3.5 h-3.5 text-slate-400" />
                  {enquiry.accommodation_type || 'Sharing'}
                </span>
              </div>

              <div className="flex border-b border-slate-100 pb-2.5">
                <span className="w-40 font-semibold text-slate-500 shrink-0">Date of Travel</span>
                <span className="text-slate-800 font-medium">
                  {enquiry.date_of_travel
                    ? new Date(enquiry.date_of_travel).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Not specified'}
                </span>
              </div>

              <div className="flex border-b border-slate-100 pb-2.5">
                <span className="w-40 font-semibold text-slate-500 shrink-0">PNR (Outbound / Up)</span>
                <span className="font-mono text-slate-800 font-medium flex items-center gap-1.5">
                  <Train className="w-3.5 h-3.5 text-slate-400" />
                  {enquiry.pnr_up || '—'}
                </span>
              </div>

              <div className="flex border-b border-slate-100 pb-2.5">
                <span className="w-40 font-semibold text-slate-500 shrink-0">PNR (Return / Down)</span>
                <span className="font-mono text-slate-800 font-medium flex items-center gap-1.5">
                  <Train className="w-3.5 h-3.5 text-slate-400" />
                  {enquiry.pnr_down || '—'}
                </span>
              </div>

              <div className="flex border-b border-slate-100 pb-2.5">
                <span className="w-40 font-semibold text-slate-500 shrink-0">Group Breakdown</span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700 text-xs">
                    {enquiry.total_people} Total
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium text-xs">
                    {enquiry.boys_count} Boys
                  </span>
                  <span className="px-2 py-0.5 rounded bg-pink-50 text-pink-700 font-medium text-xs">
                    {enquiry.girls_count} Girls
                  </span>
                  <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-medium text-xs">
                    {enquiry.couples_count} Couples
                  </span>
                </div>
              </div>

              <div className="flex border-b border-slate-100 pb-2.5 items-center justify-between">
                <div className="flex items-center">
                  <span className="w-40 font-semibold text-slate-500 shrink-0">Follow-up Date</span>
                  <span className="text-slate-800 font-semibold">
                    {enquiry.followup_date || 'Not scheduled'}
                  </span>
                </div>
                <button
                  onClick={() => setShowFollowupModal(true)}
                  className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded flex items-center gap-1 transition-colors"
                  title="Update Follow-up Date"
                >
                  <Edit className="w-3 h-3 text-[#0A6FAE]" /> Edit
                </button>
              </div>

              <div className="flex items-center pt-1">
                <span className="w-40 font-semibold text-slate-500 shrink-0">Created On</span>
                <span className="text-slate-600">
                  {new Date(enquiry.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Payment Information */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col h-full">
            <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center gap-2 font-bold text-slate-700 text-sm">
              <CreditCard className="w-4 h-4 text-[#0A6FAE]" />
              Payment Information
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              {/* .payment-info container */}
              <div className="bg-[#f8f9fa] rounded-lg p-5 border border-slate-200/80 mb-5">
                {/* Progress Header */}
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-800 text-base">Payment Progress</h4>
                  {isFullyPaid ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      Paid in Full
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                      Pending
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 rounded-full h-5 mb-4 overflow-hidden relative shadow-inner">
                  <div
                    className="bg-[#17a2b8] h-full text-white text-[11px] font-bold flex items-center justify-center transition duration-500"
                    style={{ width: `${paidPercent}%` }}
                  >
                    {paidPercent}%
                  </div>
                </div>

                {/* Payment Breakdown 3 columns */}
                <div className="grid grid-cols-3 gap-2 text-center py-2 border-y border-slate-200">
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Target Fees</div>
                    <div className="text-base font-bold text-slate-800 mt-0.5">
                      ₹{totalAmount.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Fees Paid</div>
                    <div className="text-base font-bold text-emerald-600 mt-0.5">
                      ₹{advancePaid.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Balance</div>
                    <div className="text-base font-bold text-rose-600 mt-0.5">
                      ₹{balanceAmount.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Extra info lines */}
                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-500">Payment Status</span>
                    <span className="font-semibold text-slate-700">
                      {enquiry.payment_status || (isFullyPaid ? 'Paid' : 'Unpaid')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-500">Last Payment Date</span>
                    <span className="font-semibold text-slate-700">
                      {new Date(enquiry.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Add Payment Button */}
              <button
                onClick={() => setShowPaymentModal(true)}
                className="w-full py-2.5 px-4 bg-[#0A6FAE] hover:bg-[#062B49] text-white font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <CreditCard className="w-4 h-4" /> Add Payment
              </button>
            </div>
          </div>
        </div>

        {/* Full-Width Comments & Follow-ups Card */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden mb-6">
          <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-700 text-sm">
              <MessageSquare className="w-4 h-4 text-[#0A6FAE]" />
              Comments & Follow-ups
              <span className="ml-1 text-xs px-2 py-0.5 bg-slate-200 rounded-full text-slate-700 font-semibold">
                {enquiry.comments?.length || 0}
              </span>
            </div>
          </div>

          <div className="p-6">
            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <div className="md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Call / Follow-up Status
                  </label>
                  <Select
                    value={callStatus}
                    onChange={(e) => setCallStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:border-[#062B49]"
                  >
                    <option value="connected">Connected</option>
                    <option value="interested">Interested</option>
                    <option value="call_busy">Call Busy</option>
                    <option value="call_not_picked">Not Picked</option>
                    <option value="callback_requested">Callback Req</option>
                    <option value="whatsapp_sent">WhatsApp Sent</option>
                    <option value="advance_collected">Advance Collected</option>
                    <option value="payment_followup">Payment Followup</option>
                    <option value="general_note">General Note</option>
                  </Select>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Add Note or Follow-up Summary
                  </label>
                  <textarea
                    rows={2}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment or note about this enquiry..."
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:border-[#062B49] placeholder-slate-400"
                    required
                  />
                </div>
              </div>

              <div className="text-right">
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#0A6FAE] to-[#062B49] hover:opacity-95 text-white font-bold rounded-lg shadow-sm text-sm disabled:opacity-50 transition-opacity cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submittingComment ? 'Posting...' : 'Add Comment'}
                </button>
              </div>
            </form>

            {/* Comments Timeline */}
            <div className="space-y-3">
              {enquiry.comments && enquiry.comments.length > 0 ? (
                enquiry.comments.map((c) => (
                  <div
                    key={c.id}
                    className="bg-[#f9f9fb] border border-[#dee2e6] rounded-xl p-3.5 shadow-2xs hover:bg-white hover:shadow-xs transition"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#0A6FAE]">
                          {c.author_name || 'Team Member'}
                        </span>
                        <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-slate-200 text-slate-700 capitalize">
                          {c.call_status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          {new Date(c.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(c.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-800 text-sm whitespace-pre-wrap leading-relaxed">
                      {c.comment_text}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No comments yet. Add the first comment above!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowStatusModal(true)}
              className="px-4 py-2 border border-[#0A6FAE] text-[#0A6FAE] hover:bg-sky-50 font-semibold rounded-lg text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Update Status
            </button>
            <Link
              href="/crm"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-sm flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to List
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {auth.canDelete && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-3 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 font-semibold rounded-lg text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: UPDATE STATUS MODAL */}
      {showStatusModal && (
        <div data-crm-fade className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div data-crm-pop className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-base">Update Status</h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveStatus}>
              <div className="p-5 space-y-4 text-sm">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <Select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:border-[#062B49]"
                  >
                    <option value="new">New Lead</option>
                    <option value="contacted">Contacted / In Discussion</option>
                    <option value="booked">Booked / Advance Received</option>
                    <option value="travelled">Travelled / Completed</option>
                    <option value="cancelled">Cancelled / Dropout</option>
                  </Select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Note (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Add an optional status change note..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:border-[#062B49]"
                  />
                </div>
              </div>
              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="px-4 py-2 bg-[#0A6FAE] hover:bg-[#062B49] text-white font-semibold rounded-lg text-sm disabled:opacity-50"
                >
                  {updatingStatus ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD PAYMENT MODAL */}
      {showPaymentModal && (
        <div data-crm-fade className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div data-crm-pop className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-base">Add Payment</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSavePayment}>
              <div className="p-5 space-y-4 text-sm">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs flex justify-between">
                  <div>
                    <span className="text-slate-500">Current Balance:</span>{' '}
                    <span className="font-bold text-rose-600">₹{balanceAmount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Total Fee:</span>{' '}
                    <span className="font-bold text-slate-800">₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Payment Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:border-[#062B49] font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Payment Mode
                  </label>
                  <Select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:border-[#062B49]"
                  >
                    <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer (NEFT/IMPS)</option>
                    <option value="card">Credit / Debit Card</option>
                    <option value="cheque">Cheque</option>
                  </Select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Note (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    placeholder="Reference number, transaction ID, etc."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:border-[#062B49]"
                  />
                </div>
              </div>

              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingPayment}
                  className="px-4 py-2 bg-[#0A6FAE] hover:bg-[#062B49] text-white font-semibold rounded-lg text-sm disabled:opacity-50"
                >
                  {updatingPayment ? 'Saving...' : 'Save Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: UPDATE FOLLOW-UP DATE */}
      {showFollowupModal && (
        <div data-crm-fade className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div data-crm-pop className="bg-white rounded-xl shadow-xl w-full max-w-sm border border-slate-200 max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-base">Update Follow-up Date</h3>
              <button
                onClick={() => setShowFollowupModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveFollowup}>
              <div className="p-5 text-sm">
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Next Follow-up Date
                </label>
                <input
                  type="date"
                  value={newFollowupDate}
                  onChange={(e) => setNewFollowupDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:border-[#062B49]"
                  required
                />
              </div>
              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFollowupModal(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingFollowup}
                  className="px-4 py-2 bg-[#0A6FAE] hover:bg-[#062B49] text-white font-semibold rounded-lg text-sm disabled:opacity-50"
                >
                  {updatingFollowup ? 'Saving...' : 'Update Date'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: DELETE CONFIRMATION */}
      {showDeleteModal && (
        <div data-crm-fade className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div data-crm-pop className="bg-white rounded-xl shadow-xl w-full max-w-sm border border-slate-200 max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-base">Confirm Deletion</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 text-sm">
              <p className="text-slate-700 mb-2">
                Are you sure you want to delete the enquiry for <strong>{enquiry.name}</strong>?
              </p>
              <p className="text-rose-600 font-semibold text-xs">
                This action cannot be undone.
              </p>
            </div>
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteEnquiry}
                disabled={deleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-sm disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
