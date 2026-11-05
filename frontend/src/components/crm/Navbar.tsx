'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  Home,
  List,
  BarChart3,
  CreditCard,
  Users2,
  Calendar,
  Search,
  PlusCircle,
  FileSpreadsheet,
  Upload,
  Download,
  CalendarClock,
  CalendarCheck,
  UserCheck,
  UserX,
  Clock,
  PieChart,
  Briefcase,
  CalendarDays,
  AlertCircle,
  History,
  UserPlus,
  Target,
  Layers,
  ChevronDown,
  UserCircle2,
  Key,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { MonthlyTargetData, User } from '@/lib/crm/types';
import { useAuth } from '@/components/crm/auth-context';

interface NavbarProps {
  activeTab: 'enquiries' | 'followups' | 'dues' | 'calendar' | 'team';
  setActiveTab: (tab: 'enquiries' | 'followups' | 'dues' | 'calendar' | 'team') => void;
  targetData: MonthlyTargetData | null;
  currentUser: User | null;
  allUsers: User[];
  onSwitchUser: (user: User) => void;
  onOpenNewModal: () => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  onFilterStatus?: (status: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  targetData,
  currentUser,
  allUsers,
  onSwitchUser,
  onOpenNewModal,
  searchQuery = '',
  setSearchQuery,
  onFilterStatus,
}) => {
  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isMarqueePaused, setIsMarqueePaused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const auth = useAuth();
  const effectiveUser = auth.user || currentUser;

  const handleDropdownClick = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
    setUserMenuOpen(false);
  };

  const handleAction = (callback: () => void) => {
    callback();
    setOpenDropdown(null);
    setUserMenuOpen(false);
  };

  // Marquee metrics
  const targetAmount = targetData ? Number(targetData.target_amount) : 450000;
  const collectedAmount = targetData ? Number(targetData.actual_collected) : 312500;
  const remainingAmount = targetData ? Number(targetData.remaining) : 137500;
  const percentage = targetData ? targetData.percentage : 69.4;
  const daysRemaining = targetData ? targetData.days_remaining : 17;
  const counselorName = targetData?.sales_person_name || currentUser?.display_name || 'All Counsellors';

  const marqueeText = `🎯 Monthly Target: ₹${targetAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | 💵 Collected: ₹${collectedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | 💸 Remaining: ₹${remainingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | 📊 Progress: ${percentage}% Complete | 📅 ${daysRemaining} days remaining (${counselorName})`;

  return (
    <div data-crm-nav className="sticky top-0 z-50 w-full" ref={dropdownRef}>
      {/* =========================================================================
          CRM TOP NAVBAR (Spirit Adventures navy -> ocean)
         ========================================================================= */}
      <nav
        className="w-full text-white shadow-lg relative border-b-[3px] border-[#38BDF8]"
        style={{
          background: 'linear-gradient(120deg, #062B49 0%, #08406B 55%, #0A6FAE 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
        }}
      >
        <div className="max-w-[1500px] mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-3">
          {/* Brand Logo - Spirit JEnquiry style with pulse-on-hover */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                setActiveTab('enquiries');
                if (onFilterStatus) onFilterStatus('all');
              }}
              className="flex items-center gap-2 group text-white transition-transform text-left cursor-pointer select-none"
            >
              <span className="bg-white rounded-xl px-2.5 py-1.5 shadow-md ring-1 ring-white/40 transition-transform duration-300 group-hover:scale-[1.04]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/logo.png" alt="Spirit Adventures" width={564} height={149} className="h-6 sm:h-7 w-auto" />
              </span>
              <span className="hidden sm:block leading-tight">
                <span className="block font-extrabold text-base tracking-tight text-white">Sales CRM</span>
                <span className="block whitespace-nowrap text-[10px] text-sky-200/90 font-semibold uppercase tracking-[0.12em]">Leads · Bookings · Payments</span>
              </span>
            </button>

            {/* Desktop Navigation Links & Dropdowns (Exact Spirit Structure) */}
            <div className="hidden lg:flex items-center gap-1 text-[13.5px] font-medium">
              {/* 1. Home */}
              <button
                onClick={() => {
                  setActiveTab('enquiries');
                  if (onFilterStatus) onFilterStatus('all');
                  setOpenDropdown(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all cursor-pointer ${
                  activeTab === 'enquiries'
                    ? 'bg-white/20 font-semibold shadow-inner'
                    : 'text-white/90 hover:text-white hover:bg-white/15'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </button>

              {/* 2. Enquiries Dropdown */}
              <div className="relative">
                <button
                  onClick={() => handleDropdownClick('enquiries')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all cursor-pointer ${
                    openDropdown === 'enquiries'
                      ? 'bg-white/20 text-white font-semibold'
                      : 'text-white/90 hover:text-white hover:bg-white/15'
                  }`}
                >
                  <List className="h-4 w-4" />
                  <span>Enquiries</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-80" />
                </button>

                {openDropdown === 'enquiries' && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-2xl py-2 border-t-[3px] border-[#38BDF8] z-50 slide-in-from-top-1 duration-150">
                    <button
                      onClick={() =>
                        handleAction(() => {
                          setActiveTab('enquiries');
                          if (onFilterStatus) onFilterStatus('all');
                        })
                      }
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[#0A6FAE] hover:bg-[#062B49] hover:text-white flex items-center gap-2.5 transition-all hover:translate-x-1"
                    >
                      <List className="h-4 w-4 text-[#062B49] group-hover:text-white" />
                      All Enquiries
                    </button>
                    <button
                      onClick={() =>
                        handleAction(() => {
                          setActiveTab('enquiries');
                          alert('Merge Enquiries tool: Select duplicate contacts to merge booking history.');
                        })
                      }
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[#0A6FAE] hover:bg-[#062B49] hover:text-white flex items-center gap-2.5 transition-all hover:translate-x-1"
                    >
                      <UserPlus className="h-4 w-4" />
                      Merge Enquiries
                    </button>
                    <button
                      onClick={() => handleAction(() => onOpenNewModal())}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[#0A6FAE] hover:bg-[#062B49] hover:text-white flex items-center gap-2.5 transition-all hover:translate-x-1 bg-amber-50/50"
                    >
                      <PlusCircle className="h-4 w-4 text-emerald-600" />
                      <span className="font-bold">Add Enquiry</span>
                    </button>
                    <button
                      onClick={() =>
                        handleAction(() => {
                          alert('Bulk CSV Upload is ready in Django Ninja endpoint /api/enquiries/');
                        })
                      }
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[#0A6FAE] hover:bg-[#062B49] hover:text-white flex items-center gap-2.5 transition-all hover:translate-x-1"
                    >
                      <Upload className="h-4 w-4" />
                      Bulk Upload
                    </button>
                    <button
                      onClick={() =>
                        handleAction(() => {
                          window.open('/api/v1/docs', '_blank');
                        })
                      }
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[#0A6FAE] hover:bg-[#062B49] hover:text-white flex items-center gap-2.5 transition-all hover:translate-x-1"
                    >
                      <Download className="h-4 w-4" />
                      Download Template
                    </button>
                    <div className="border-t border-[#38BDF8]/30 my-1.5" />
                    <button
                      onClick={() =>
                        handleAction(() => {
                          window.open('/api/v1/crm/today-enquiries/', '_blank');
                        })
                      }
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[#0A6FAE] hover:bg-[#062B49] hover:text-white flex items-center gap-2.5 transition-all hover:translate-x-1"
                    >
                      <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                      Export Today's Enquiries
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Reports Dropdown */}
              <div className="relative">
                <button
                  onClick={() => handleDropdownClick('reports')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all cursor-pointer ${
                    openDropdown === 'reports'
                      ? 'bg-white/20 text-white font-semibold'
                      : 'text-white/90 hover:text-white hover:bg-white/15'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Reports</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-80" />
                </button>

                {openDropdown === 'reports' && (
                  <div className="absolute left-0 mt-2 w-60 bg-white rounded-lg shadow-2xl py-2 border-t-[3px] border-[#38BDF8] z-50 slide-in-from-top-1 duration-150">
                    <button
                      onClick={() => handleAction(() => setActiveTab('followups'))}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[#0A6FAE] hover:bg-[#062B49] hover:text-white flex items-center gap-2.5 transition-all hover:translate-x-1"
                    >
                      <CalendarClock className="h-4 w-4 text-amber-500" />
                      Today's Followups
                    </button>
                    <button
                      onClick={() =>
                        handleAction(() => {
                          setActiveTab('enquiries');
                          if (onFilterStatus) onFilterStatus('all');
                        })
                      }
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[#0A6FAE] hover:bg-[#062B49] hover:text-white flex items-center gap-2.5 transition-all hover:translate-x-1"
                    >
                      <CalendarCheck className="h-4 w-4 text-blue-500" />
                      Today's Enquiries
                    </button>
                    <button
                      onClick={() =>
                        handleAction(() => {
                          setActiveTab('enquiries');
                          if (onFilterStatus) onFilterStatus('won');
                        })
                      }
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[#0A6FAE] hover:bg-[#062B49] hover:text-white flex items-center gap-2.5 transition-all hover:translate-x-1"
                    >
                      <UserCheck className="h-4 w-4 text-emerald-600" />
                      Joined / Booked Travelers
                    </button>
                    <button
                      onClick={() =>
                        handleAction(() => {
                          setActiveTab('enquiries');
                          if (onFilterStatus) onFilterStatus('lost');
                        })
                      }
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[#0A6FAE] hover:bg-[#062B49] hover:text-white flex items-center gap-2.5 transition-all hover:translate-x-1"
                    >
                      <UserX className="h-4 w-4 text-rose-500" />
                      Dropout / Cancelled
                    </button>
                    <button
                      onClick={() =>
                        handleAction(() => {
                          setActiveTab('enquiries');
                          if (onFilterStatus) onFilterStatus('pending');
                        })
                      }
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[#0A6FAE] hover:bg-[#062B49] hover:text-white flex items-center gap-2.5 transition-all hover:translate-x-1"
                    >
                      <Clock className="h-4 w-4 text-amber-600" />
                      Pending Enquiries
                    </button>
                    <div className="border-t border-[#38BDF8]/30 my-1.5" />
                    <button
                      onClick={() => handleAction(() => setActiveTab('team'))}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[#0A6FAE] hover:bg-[#062B49] hover:text-white flex items-center gap-2.5 transition-all hover:translate-x-1"
                    >
                      <PieChart className="h-4 w-4 text-purple-600" />
                      Monthly Summary
                    </button>
                    <button
                      onClick={() => handleAction(() => setActiveTab('team'))}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[#0A6FAE] hover:bg-[#062B49] hover:text-white flex items-center gap-2.5 transition-all hover:translate-x-1"
                    >
                      <Briefcase className="h-4 w-4 text-indigo-600" />
                      Counsellor Summary
                    </button>
                    <button
                      onClick={() => handleAction(() => setActiveTab('calendar'))}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[#0A6FAE] hover:bg-[#062B49] hover:text-white flex items-center gap-2.5 transition-all hover:translate-x-1"
                    >
                      <CalendarDays className="h-4 w-4 text-teal-600" />
                      Day-Wise Departures
                    </button>
                  </div>
                )}
              </div>

              {/* 4. Payment Due Dropdown */}
              <div className="relative">
                <button
                  onClick={() => handleDropdownClick('payments')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all cursor-pointer ${
                    activeTab === 'dues' || openDropdown === 'payments'
                      ? 'bg-white/20 text-white font-semibold'
                      : 'text-white/90 hover:text-white hover:bg-white/15'
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Payments</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-80" />
                </button>

                {openDropdown === 'payments' && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-2xl py-2 border-t-[3px] border-[#38BDF8] z-50 slide-in-from-top-1 duration-150">
                    <button
                      onClick={() => handleAction(() => setActiveTab('dues'))}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[#0A6FAE] hover:bg-[#062B49] hover:text-white flex items-center gap-2.5 transition-all hover:translate-x-1"
                    >
                      <Calendar className="h-4 w-4 text-amber-500" />
                      Waiting For Batch
                    </button>
                    <button
                      onClick={() => handleAction(() => setActiveTab('dues'))}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[#0A6FAE] hover:bg-[#062B49] hover:text-white flex items-center gap-2.5 transition-all hover:translate-x-1"
                    >
                      <AlertCircle className="h-4 w-4 text-rose-500" />
                      Today's Due
                    </button>
                    <button
                      onClick={() => handleAction(() => setActiveTab('dues'))}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[#0A6FAE] hover:bg-[#062B49] hover:text-white flex items-center gap-2.5 transition-all hover:translate-x-1"
                    >
                      <History className="h-4 w-4 text-sky-500" />
                      Past Due
                    </button>
                    <button
                      onClick={() => handleAction(() => setActiveTab('calendar'))}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[#0A6FAE] hover:bg-[#062B49] hover:text-white flex items-center gap-2.5 transition-all hover:translate-x-1"
                    >
                      <CalendarDays className="h-4 w-4 text-blue-500" />
                      Monthly Due Calendar
                    </button>
                  </div>
                )}
              </div>

              {/* 5. Management Dropdown */}
              <div className="relative">
                <button
                  onClick={() => handleDropdownClick('management')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all cursor-pointer ${
                    activeTab === 'team' || openDropdown === 'management'
                      ? 'bg-white/20 text-white font-semibold'
                      : 'text-white/90 hover:text-white hover:bg-white/15'
                  }`}
                >
                  <Users2 className="h-4 w-4" />
                  <span>Management</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-80" />
                </button>

                {openDropdown === 'management' && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-2xl py-2 border-t-[3px] border-[#38BDF8] z-50 slide-in-from-top-1 duration-150">
                    <button
                      onClick={() => handleAction(() => setActiveTab('team'))}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[#0A6FAE] hover:bg-[#062B49] hover:text-white flex items-center gap-2.5 transition-all hover:translate-x-1"
                    >
                      <UserPlus className="h-4 w-4 text-emerald-600" />
                      Add Counsellor
                    </button>
                    <button
                      onClick={() => handleAction(() => setActiveTab('team'))}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[#0A6FAE] hover:bg-[#062B49] hover:text-white flex items-center gap-2.5 transition-all hover:translate-x-1"
                    >
                      <UserCheck className="h-4 w-4 text-blue-600" />
                      Approve Counsellors
                    </button>
                    <div className="border-t border-[#38BDF8]/30 my-1.5" />
                    <button
                      onClick={() => handleAction(() => setActiveTab('team'))}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[#0A6FAE] hover:bg-[#062B49] hover:text-white flex items-center gap-2.5 transition-all hover:translate-x-1"
                    >
                      <Target className="h-4 w-4 text-rose-500" />
                      Add Monthly Target
                    </button>
                  </div>
                )}
              </div>

              {/* 6. Batches Dropdown */}
              <div className="relative">
                <button
                  onClick={() => handleDropdownClick('batches')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all cursor-pointer ${
                    activeTab === 'calendar' || openDropdown === 'batches'
                      ? 'bg-white/20 text-white font-semibold'
                      : 'text-white/90 hover:text-white hover:bg-white/15'
                  }`}
                >
                  <Layers className="h-4 w-4" />
                  <span>Batches</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-80" />
                </button>

                {openDropdown === 'batches' && (
                  <div className="absolute left-0 mt-2 w-52 bg-white rounded-lg shadow-2xl py-2 border-t-[3px] border-[#38BDF8] z-50 slide-in-from-top-1 duration-150">
                    <button
                      onClick={() => handleAction(() => setActiveTab('calendar'))}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[#0A6FAE] hover:bg-[#062B49] hover:text-white flex items-center gap-2.5 transition-all hover:translate-x-1"
                    >
                      <Layers className="h-4 w-4 text-teal-600" />
                      Tour Batches
                    </button>
                    <button
                      onClick={() => handleAction(() => onOpenNewModal())}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[#0A6FAE] hover:bg-[#062B49] hover:text-white flex items-center gap-2.5 transition-all hover:translate-x-1"
                    >
                      <Compass className="h-4 w-4 text-blue-600" />
                      Add Tour Batch
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search Bar + User Profile (Exact Spirit Styling) */}
          <div className="flex items-center gap-3">
            {/* Spirit Rounded Pill Search Form */}
            {setSearchQuery && (
              <div className="relative hidden sm:block">
                <div className="bg-white rounded-full flex items-center overflow-hidden shadow-inner border border-white/40 pl-3 pr-1 py-0.5">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search enquiries..."
                    className="w-36 md:w-52 lg:w-64 text-xs bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none font-medium py-1"
                  />
                  <button
                    onClick={() => {
                      setActiveTab('enquiries');
                    }}
                    className="bg-white hover:bg-[#38BDF8] text-[#062B49] hover:text-white p-1 rounded-full transition-colors flex items-center justify-center h-6 w-6"
                    title="Search"
                  >
                    <Search className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Spirit Fixed User Profile Section */}
            <div className="border-l-2 border-white/20 pl-3.5 ml-1">
              <div className="relative">
                <button
                  onClick={() => {
                    setUserMenuOpen(!userMenuOpen);
                    setOpenDropdown(null);
                  }}
                  className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
                >
                  <div className="hidden md:block text-right">
                    <p className="text-xs font-bold text-white tracking-tight leading-none group-hover:text-amber-100 transition-colors">
                      Hello, {effectiveUser?.display_name || 'Counselor'}!
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded shadow-2xs ${
                        auth.isManager
                          ? 'bg-amber-400 text-slate-900'
                          : 'bg-emerald-400 text-slate-900'
                      }`}>
                        {auth.isManager ? 'Manager (Admin)' : 'Sales Rep'}
                      </span>
                    </div>
                  </div>

                  <div className="text-white hover:text-[#38BDF8] transition-all transform group-hover:scale-105">
                    <UserCircle2 className="h-8 w-8 stroke-[1.8]" />
                  </div>
                </button>

                {/* Profile Popup Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2.5 w-72 bg-white rounded-lg shadow-2xl py-2 border-t-[3px] border-[#38BDF8] z-50 slide-in-from-top-1 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-slate-800">
                          {effectiveUser?.display_name}
                        </span>
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          auth.isManager ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}>
                          {effectiveUser?.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono truncate">
                        {effectiveUser?.email}
                      </p>
                      {effectiveUser?.target_amount && (
                        <p className="text-[10px] text-slate-600 mt-1 font-semibold">
                          Target Quota: ₹{Number(effectiveUser.target_amount).toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          setActiveTab('team');
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-[#0A6FAE] hover:bg-[#062B49] hover:text-white flex items-center gap-2.5 transition-all"
                      >
                        <Target className="h-3.5 w-3.5" />
                        Monthly Targets & Team
                      </button>

                      <button
                        onClick={async () => {
                          setUserMenuOpen(false);
                          await auth.logout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-500 hover:text-white flex items-center gap-2.5 transition-all"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Logout Session
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Phones/tablets: the desktop menu is hidden, so give every tab a thumb-friendly pill */}
      <div className="lg:hidden bg-[#062B49] border-b border-white/10">
        <div className="flex gap-2 overflow-x-auto px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="CRM sections">
          {([
            ['enquiries', 'Enquiries'],
            ['followups', 'Follow-ups'],
            ['dues', 'Payments due'],
            ['calendar', 'Departures'],
            ['team', 'Team & targets'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={activeTab === key}
              onClick={() => setActiveTab(key)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition active:scale-95 ${
                activeTab === key ? 'bg-white text-[#062B49] shadow' : 'bg-white/10 text-white/85'
              }`}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={onOpenNewModal}
            className="shrink-0 rounded-full bg-[#38BDF8] px-4 py-2 text-xs font-bold text-[#062B49] active:scale-95 transition"
          >
            + New lead
          </button>
        </div>
      </div>

      {/* =========================================================================
          SPIRIT SIGNATURE MARQUEE BAR WITH RUNNING PROGRESS LINE
         ========================================================================= */}
      <div
        onClick={() => setIsMarqueePaused(!isMarqueePaused)}
        title="Click to pause or resume target updates"
        className="w-full bg-[#062B49] text-white py-2 overflow-hidden relative cursor-pointer select-none group border-b-[3px] border-[#0A6FAE]"
        style={{
          boxShadow: '0 2px 12px rgba(255, 127, 0, 0.25)',
          fontFamily: "'Outfit', 'Space Grotesk', system-ui, sans-serif",
        }}
      >
        <div className="flex items-center">
          {/* Animated Marquee Text */}
          <div
            className={`whitespace-nowrap flex items-center text-xs sm:text-sm font-semibold tracking-wide ${
              isMarqueePaused ? '' : 'animate-marquee'
            } group-hover:[animation-play-state:paused]`}
            style={{
              animationPlayState: isMarqueePaused ? 'paused' : undefined,
            }}
          >
            <span className="inline-block px-4">{marqueeText}</span>
            <span className="inline-block px-4">{marqueeText}</span>
            <span className="inline-block px-4">{marqueeText}</span>
          </div>
        </div>

        {/* Spirit Marquee Progress Bar Line Effect at Bottom */}
        <div className="absolute bottom-0 left-0 w-full h-[3px] overflow-hidden bg-black/20">
          <div
            className="h-full bg-gradient-to-r from-white via-[#EFF8FD] to-[#38BDF8] animate-marquee-progress"
            style={{
              animationPlayState: isMarqueePaused ? 'paused' : undefined,
            }}
          />
        </div>

        {/* Pause Indicator overlay on click */}
        {isMarqueePaused && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#0A6FAE] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-md flex items-center gap-1">
            <span>⏸️ PAUSED</span>
            <span className="opacity-80 font-normal hidden sm:inline">- Click to Resume</span>
          </div>
        )}
      </div>
    </div>
  );
};
