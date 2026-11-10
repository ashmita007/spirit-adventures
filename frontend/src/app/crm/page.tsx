'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/crm/Navbar';
import { QuickActionCards } from '@/components/crm/QuickActionCards';
import { StatsCards } from '@/components/crm/StatsCards';
import { EnquiryTable } from '@/components/crm/EnquiryTable';
import { TodayFollowupsWidget } from '@/components/crm/TodayFollowupsWidget';
import { PaymentDuesWidget } from '@/components/crm/PaymentDuesWidget';
import { EnquiryModal } from '@/components/crm/EnquiryModal';
import { EnquiryDetailDrawer } from '@/components/crm/EnquiryDetailDrawer';
import { CalendarView } from '@/components/crm/CalendarView';
import { SalesTeamView } from '@/components/crm/SalesTeamView';
import {
  Enquiry,
  TourPackage,
  DashboardStats,
  MonthlyTargetData,
  User,
  CalendarDepartureDay,
} from '@/lib/crm/types';
import { api } from '@/lib/crm/api';
import { useAuth } from '@/components/crm/auth-context';

export default function Home() {
  const auth = useAuth();
  const [activeTab, setActiveTab] = useState<'enquiries' | 'followups' | 'dues' | 'calendar' | 'team'>('enquiries');

  // Core Data States
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [followups, setFollowups] = useState<Enquiry[]>([]);
  const [paymentDues, setPaymentDues] = useState<Enquiry[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [targetData, setTargetData] = useState<MonthlyTargetData | null>(null);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [salespersons, setSalespersons] = useState<User[]>([]);
  const [departures, setDepartures] = useState<CalendarDepartureDay[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [accommodationFilter, setAccommodationFilter] = useState('all');
  const [salespersonFilter, setSalespersonFilter] = useState('all');

  // Pagination State (Server-Side Pagination)
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modals & Drawers
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<number | null>(null);

  // Loading States
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, [auth.user?.id]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [pkgsData, spsData, statsData, targetRes, depsData, followupsData, duesData] = await Promise.all([
        api.getPackages().catch(() => []),
        api.getSalespersons().catch(() => []),
        api.getDashboardStats().catch(() => null),
        api.getMonthlyTarget().catch(() => null),
        api.getCalendarDepartures().catch(() => []),
        api.getTodayFollowups().catch(() => []),
        api.getPaymentDues().catch(() => []),
      ]);

      setPackages(pkgsData);
      setSalespersons(spsData);
      setStats(statsData);
      setTargetData(targetRes);
      setDepartures(depsData);
      setFollowups(followupsData);
      setPaymentDues(duesData);

      if (spsData.length > 0 && !currentUser) {
        setCurrentUser(spsData[0]);
      }

      await refreshEnquiries(1, perPage);
    } catch (err) {
      console.error('Initial data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshEnquiries = async (targetPage = page, targetPerPage = perPage) => {
    try {
      const params: any = {
        page: targetPage,
        per_page: targetPerPage,
      };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (accommodationFilter !== 'all') params.accommodation_type = accommodationFilter;
      if (salespersonFilter !== 'all') params.sales_person_id = Number(salespersonFilter);
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.getPaginatedEnquiries(params);
      setEnquiries(res.items);
      setTotalCount(res.total);
      setTotalPages(res.total_pages);
      setPage(res.page);
    } catch (err) {
      console.error('Failed to load paginated enquiries:', err);
    }
  };

  // Re-fetch enquiries when filters change (reset to page 1)
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      refreshEnquiries(1, perPage);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, accommodationFilter, salespersonFilter]);

  // Re-fetch when page or perPage changes
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    refreshEnquiries(newPage, perPage);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1);
    refreshEnquiries(1, newPerPage);
  };

  const handleRefreshAll = async () => {
    try {
      const [statsData, targetRes, depsData, followupsData, duesData] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getMonthlyTarget().catch(() => null),
        api.getCalendarDepartures().catch(() => []),
        api.getTodayFollowups().catch(() => []),
        api.getPaymentDues().catch(() => []),
      ]);
      setStats(statsData);
      setTargetData(targetRes);
      setDepartures(depsData);
      setFollowups(followupsData);
      setPaymentDues(duesData);
      refreshEnquiries();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFilterBySalesperson = (spId: number) => {
    setSalespersonFilter(spId.toString());
    setActiveTab('enquiries');
  };

  return (
    <div className="min-h-dvh bg-[#f8f9fa] text-slate-800 flex flex-col font-sans selection:bg-[#0A6FAE] selection:text-white">
      {/* Top Navbar & Target Marquee */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        targetData={targetData}
        currentUser={currentUser}
        allUsers={salespersons}
        onSwitchUser={(user) => setCurrentUser(user)}
        onOpenNewModal={() => setIsNewModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onFilterStatus={(status) => setStatusFilter(status)}
      />

      {/* Main Content Area - Full Wide Content Container */}
      <main className="flex-1 max-w-[1550px] w-full mx-auto px-3 sm:px-6 py-5">
        {/* RBAC Active Role & Scope Banner */}
        {auth.user && (
          <div
            data-crm-reveal
            className={`mb-4 px-4 py-2.5 rounded-lg border text-xs flex flex-wrap items-center justify-between gap-2 shadow-2xs ${
              auth.isManager
                ? 'bg-amber-50/90 border-amber-200 text-amber-900'
                : 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-center flex-wrap gap-2">
              <span
                className={`px-2 py-0.5 rounded font-extrabold text-[10px] shadow-2xs ${
                  auth.isManager
                    ? 'bg-amber-400 text-slate-900'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {auth.isManager ? 'Admin / Manager Role' : 'Sales Representative Role'}
              </span>
              <span className="font-semibold">
                Active Session: <strong>{auth.user.display_name}</strong> ({auth.user.email})
              </span>
              <span className="text-slate-400 hidden sm:inline">|</span>
              <span className="text-[11px] opacity-90">
                {auth.isManager
                  ? 'Full Organizational Privileges: View all team enquiries, delete leads, reassign counsellors, configure targets.'
                  : 'Role-Scoped Access: Strictly viewing and managing your assigned traveler pipeline.'}
              </span>
            </div>

          </div>
        )}

        {/* View Switching */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 border-3 border-[#0A6FAE] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-bold text-[#0A6FAE]">Loading Spirit Adventures CRM...</p>
            
          </div>
        ) : (
          <>
            {/* 1. All Enquiries Tab (Exact Table View) */}
            {activeTab === 'enquiries' && (
              <EnquiryTable
                enquiries={enquiries}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                accommodationFilter={accommodationFilter}
                setAccommodationFilter={setAccommodationFilter}
                salespersonFilter={salespersonFilter}
                setSalespersonFilter={setSalespersonFilter}
                salespersons={salespersons}
                onSelectEnquiry={(id) => setSelectedEnquiryId(id)}
                onOpenNewModal={() => setIsNewModalOpen(true)}
                onRefresh={handleRefreshAll}
                page={page}
                onPageChange={handlePageChange}
                perPage={perPage}
                onPerPageChange={handlePerPageChange}
                totalCount={totalCount}
                totalPages={totalPages}
              />
            )}

            {/* 2. Today's Follow-ups Dedicated Tab */}
            {activeTab === 'followups' && (
              <TodayFollowupsWidget
                followups={followups}
                onSelectEnquiry={(id) => setSelectedEnquiryId(id)}
                onRefresh={handleRefreshAll}
              />
            )}

            {/* 3. Payment Dues Dedicated Tab */}
            {activeTab === 'dues' && (
              <PaymentDuesWidget
                paymentDues={paymentDues}
                onSelectEnquiry={(id) => setSelectedEnquiryId(id)}
                onRefresh={handleRefreshAll}
              />
            )}

            {/* 4. Departure Calendar Tab */}
            {activeTab === 'calendar' && (
              <CalendarView
                departures={departures}
                onSelectEnquiry={(id) => setSelectedEnquiryId(id)}
              />
            )}

            {/* 5. Sales Team Tab */}
            {activeTab === 'team' && (
              <SalesTeamView
                salespersons={salespersons}
                enquiries={enquiries}
                onFilterBySalesperson={handleFilterBySalesperson}
              />
            )}
          </>
        )}
      </main>

      {/* Signature Footer */}
      <footer className="mt-auto py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Spirit Adventures · Sales CRM</span>
          <a href="/owner" className="text-[#0A6FAE] font-semibold hover:underline">Owner portal</a>
        </div>
      </footer>

      {/* New Enquiry Modal */}
      <EnquiryModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={handleRefreshAll}
        packages={packages}
        salespersons={salespersons}
        defaultSalespersonId={currentUser?.id}
      />

      {/* Enquiry Detail Drawer */}
      <EnquiryDetailDrawer
        enquiryId={selectedEnquiryId}
        onClose={() => setSelectedEnquiryId(null)}
        onRefresh={handleRefreshAll}
      />
    </div>
  );
}
