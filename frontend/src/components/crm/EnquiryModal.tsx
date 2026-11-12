'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  MapPin,
  Users,
  Ticket,
  Bed,
  IndianRupee,
  UserCheck,
  ShieldAlert,
  Tent,
  Compass,
  Phone,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import { TourPackage, User } from '@/lib/crm/types';
import { api } from '@/lib/crm/api';
import { Select } from "@/components/ui/select";

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  packages: TourPackage[];
  salespersons: User[];
  defaultSalespersonId?: number;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  packages,
  salespersons,
  defaultSalespersonId,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [departureCity, setDepartureCity] = useState('Bangalore');
  const [tourPackageId, setTourPackageId] = useState<number | undefined>(packages[0]?.id);
  const [customTourName, setCustomTourName] = useState('');
  const [dateOfTravel, setDateOfTravel] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [followupDate, setFollowupDate] = useState(
    new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]
  );
  const [pnrUp, setPnrUp] = useState('');
  const [pnrDown, setPnrDown] = useState('');
  const [accommodationType, setAccommodationType] = useState<'sharing' | 'private_room' | 'tent'>('sharing');

  // Group Segregation (User requirement!)
  const [totalPeople, setTotalPeople] = useState(2);
  const [boysCount, setBoysCount] = useState(1);
  const [girlsCount, setGirlsCount] = useState(1);
  const [couplesCount, setCouplesCount] = useState(0);

  // Financials
  const [totalAmount, setTotalAmount] = useState<number>(30000);
  const [advancePaid, setAdvancePaid] = useState<number>(10000);
  const [balanceAmount, setBalanceAmount] = useState<number>(20000);
  const [salesPersonId, setSalesPersonId] = useState<number | undefined>(defaultSalespersonId || salespersons[0]?.id);
  const [notes, setNotes] = useState('');

  // Update total amount automatically when package or total people change
  useEffect(() => {
    if (tourPackageId) {
      const selectedPkg = packages.find((p) => p.id === tourPackageId);
      if (selectedPkg) {
        const computed = Number(selectedPkg.base_price) * totalPeople;
        setTotalAmount(computed);
      }
    }
  }, [tourPackageId, totalPeople, packages]);

  // Update balance amount automatically
  useEffect(() => {
    const bal = Math.max(0, (totalAmount || 0) - (advancePaid || 0));
    setBalanceAmount(bal);
  }, [totalAmount, advancePaid]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact || !dateOfTravel) {
      setError('Please provide traveler name, contact phone number, and travel date.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.createEnquiry({
        name,
        contact,
        email: email || null,
        departure_city: departureCity,
        tour_package_id: tourPackageId || null,
        custom_tour_name: customTourName || null,
        date_of_travel: dateOfTravel,
        followup_date: followupDate || null,
        pnr_up: pnrUp || null,
        pnr_down: pnrDown || null,
        accommodation_type: accommodationType,
        total_people: Number(totalPeople) || 1,
        boys_count: Number(boysCount) || 0,
        girls_count: Number(girlsCount) || 0,
        couples_count: Number(couplesCount) || 0,
        total_amount: Number(totalAmount) || 0,
        advance_paid: Number(advancePaid) || 0,
        sales_person_id: salesPersonId ? Number(salesPersonId) : null,
        notes: notes || null,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save enquiry. Please check API connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-crm-fade className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div data-crm-pop className="relative w-full max-w-4xl max-h-[92dvh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200">
        {/* Modal Header with warm gradient */}
        <div
          className="sticky top-0 z-20 px-6 py-4 flex items-center justify-between border-b-[3px] border-[#38BDF8]"
          style={{
            background: 'linear-gradient(135deg, #0A6FAE 0%, #062B49 100%)',
          }}
        >
          <div className="flex items-center gap-2.5 text-white">
            <Compass className="h-6 w-6 stroke-[2.2]" />
            <div>
              <h2 className="text-lg font-bold leading-tight">
                Add New Enquiry
              </h2>
              <p className="text-xs text-white/80 font-medium">
                Traveller details, PNRs, stay and group size
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Lead Traveler Info */}
          <div>
            <h3 className="text-xs font-bold text-[#0A6FAE] mb-3 pb-1 border-b border-sky-100 flex items-center gap-2">
              <Users className="h-4 w-4" /> 1. Traveler & Contact Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Traveler Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#0A6FAE] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Contact *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9845012345"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#0A6FAE] focus:bg-white transition font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="rahul@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#0A6FAE] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Departure City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bangalore, Mumbai"
                  value={departureCity}
                  onChange={(e) => setDepartureCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#0A6FAE] focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Tour Package & Travel Dates */}
          <div>
            <h3 className="text-xs font-bold text-[#0A6FAE] mb-3 pb-1 border-b border-sky-100 flex items-center gap-2">
              <MapPin className="h-4 w-4" /> 2. Tour Package & Departure Schedule
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tour Package
                </label>
                <Select
                  value={tourPackageId || ''}
                  onChange={(e) => setTourPackageId(Number(e.target.value) || undefined)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#0A6FAE] focus:bg-white"
                >
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} (₹{Number(pkg.base_price).toLocaleString('en-IN')})
                    </option>
                  ))}
                  <option value="">Other / Custom Tour</option>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Travel *
                </label>
                <input
                  type="date"
                  required
                  value={dateOfTravel}
                  onChange={(e) => setDateOfTravel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#0A6FAE] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Next Follow-up Date
                </label>
                <input
                  type="date"
                  value={followupDate}
                  onChange={(e) => setFollowupDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#0A6FAE] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Transport PNRs & Accommodation */}
          <div>
            <h3 className="text-xs font-bold text-[#0A6FAE] mb-3 pb-1 border-b border-sky-100 flex items-center gap-2">
              <Ticket className="h-4 w-4" /> 3. PNR Numbers & Accommodation Type
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  PNR Up (Outbound Ticket)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 4829104829"
                  value={pnrUp}
                  onChange={(e) => setPnrUp(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono font-semibold focus:outline-none focus:border-[#0A6FAE] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  PNR Down (Return Ticket)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 4829104830"
                  value={pnrDown}
                  onChange={(e) => setPnrDown(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono font-semibold focus:outline-none focus:border-[#0A6FAE] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Accommodation Preference
                </label>
                <Select
                  value={accommodationType}
                  onChange={(e: any) => setAccommodationType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#0A6FAE] focus:bg-white"
                >
                  <option value="sharing">Sharing Room</option>
                  <option value="private_room">Private Room</option>
                  <option value="tent">Tent / Camping</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Section 4: Group Segregation (Boys, Girls, Couples) */}
          <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-200/70">
            <h3 className="text-xs font-bold text-[#0A6FAE] mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" /> 4. Group Headcount & Segregation
              </span>
              <span className="text-[11px] font-bold text-slate-600 font-mono">
                Total Pax: {totalPeople}
              </span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Pax
                </label>
                <input
                  type="number"
                  min="1"
                  value={totalPeople}
                  onChange={(e) => setTotalPeople(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#0A6FAE]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-700 mb-1">
                  Boys Count
                </label>
                <input
                  type="number"
                  min="0"
                  value={boysCount}
                  onChange={(e) => setBoysCount(Number(e.target.value))}
                  className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-700 mb-1">
                  Girls Count
                </label>
                <input
                  type="number"
                  min="0"
                  value={girlsCount}
                  onChange={(e) => setGirlsCount(Number(e.target.value))}
                  className="w-full bg-white border border-rose-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-700 mb-1">
                  Couples Count
                </label>
                <input
                  type="number"
                  min="0"
                  value={couplesCount}
                  onChange={(e) => setCouplesCount(Number(e.target.value))}
                  className="w-full bg-white border border-purple-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Financials & Counsellor Assignment */}
          <div>
            <h3 className="text-xs font-bold text-[#0A6FAE] mb-3 pb-1 border-b border-sky-100 flex items-center gap-2">
              <IndianRupee className="h-4 w-4" /> 5. Commercials & Counsellor Assignment
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 mb-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Tour Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold font-mono focus:outline-none focus:border-[#0A6FAE] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-700 mb-1">
                  Advance Paid (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={advancePaid}
                  onChange={(e) => setAdvancePaid(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-emerald-300 rounded-lg px-3 py-2 text-xs text-emerald-800 font-bold font-mono focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0A6FAE] mb-1">
                  Balance Due (Auto) (₹)
                </label>
                <input
                  type="number"
                  readOnly
                  value={balanceAmount}
                  className="w-full bg-sky-50/70 border border-sky-200 rounded-lg px-3 py-2 text-xs text-[#0A6FAE] font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Counsellor
                </label>
                <Select
                  value={salesPersonId || ''}
                  onChange={(e) => setSalesPersonId(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#0A6FAE] focus:bg-white"
                >
                  {salespersons.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.display_name} ({sp.role})
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Counselor Notes / Traveler Requirements
              </label>
              <textarea
                rows={2}
                placeholder="Mention any custom dietary preferences, tent sharing requests, or transport pickup points..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#0A6FAE] focus:bg-white"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-[#0A6FAE] hover:bg-[#0A6FAE] text-white font-bold text-xs shadow-md hover:shadow-lg transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              {loading ? 'Creating Enquiry...' : 'Save & Create Enquiry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
