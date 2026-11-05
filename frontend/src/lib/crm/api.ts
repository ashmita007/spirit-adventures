import {
  Enquiry,
  TourPackage,
  DashboardStats,
  MonthlyTargetData,
  User,
  CalendarDepartureDay,
  EnquiryComment,
  PaginatedResponse,
} from './types';

import { ownerFetch } from '@/lib/owner-fetch';

/**
 * CRM API client. The CRM lives in the same Django backend as the website
 * (/api/v1/crm/...) and uses the same signed-in session as the owner portal:
 * cookies + CSRF header via ownerFetch, no tokens in localStorage.
 */
const API_BASE = '/api/v1/crm';

function getApiBase(): string {
  return API_BASE;
}

// ownerFetch adds credentials + CSRF; keep the call sites below unchanged.
const fetch = ownerFetch;

function getAuthHeaders(): HeadersInit {
  return { 'Content-Type': 'application/json' };
}

export const api = {
  async getMe(): Promise<User | null> {
    const res = await fetch(`${getApiBase()}/auth/me`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  },

  async logout() {
    await fetch('/api/v1/auth/logout/', { method: 'POST' }).catch(() => undefined);
  },

  // Salespersons
  async getSalespersons(): Promise<User[]> {
    const res = await fetch(`${getApiBase()}/salespersons/`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch salespersons');
    return res.json();
  },

  // Tour Packages
  async getPackages(): Promise<TourPackage[]> {
    const res = await fetch(`${getApiBase()}/packages/`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch tour packages');
    return res.json();
  },

  // Enquiries List
  async getEnquiries(params?: {
    status?: string;
    sales_person_id?: number;
    search?: string;
    accommodation_type?: string;
  }): Promise<Enquiry[]> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.sales_person_id) query.set('sales_person_id', params.sales_person_id.toString());
    if (params?.search) query.set('search', params.search);
    if (params?.accommodation_type && params.accommodation_type !== 'all') {
      query.set('accommodation_type', params.accommodation_type);
    }

    const url = `${getApiBase()}/enquiries/${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url, { headers: getAuthHeaders(), cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch enquiries');
    return res.json();
  },

  // Enquiries Paginated (Couspro DataTables Server-Side Pagination)
  async getPaginatedEnquiries(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    sales_person_id?: number;
    search?: string;
    accommodation_type?: string;
  }): Promise<PaginatedResponse<Enquiry>> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.per_page) query.set('per_page', params.per_page.toString());
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.sales_person_id) query.set('sales_person_id', params.sales_person_id.toString());
    if (params?.search) query.set('search', params.search);
    if (params?.accommodation_type && params.accommodation_type !== 'all') {
      query.set('accommodation_type', params.accommodation_type);
    }

    const url = `${getApiBase()}/enquiries/paginated/${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url, { headers: getAuthHeaders(), cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch paginated enquiries');
    return res.json();
  },

  // Couspro: Today's Follow-ups
  async getTodayFollowups(salesPersonId?: number): Promise<Enquiry[]> {
    const query = salesPersonId ? `?sales_person_id=${salesPersonId}` : '';
    const res = await fetch(`${getApiBase()}/today-followups/${query}`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch today followups');
    return res.json();
  },

  // Couspro: Payment Dues List
  async getPaymentDues(): Promise<Enquiry[]> {
    const res = await fetch(`${getApiBase()}/payment-due/all/`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch payment dues');
    return res.json();
  },

  // Couspro: Monthly Summary by Salesperson
  async getMonthlySummaryBySalesperson(): Promise<any[]> {
    const res = await fetch(`${getApiBase()}/monthly-summary/salesperson/`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch monthly summary');
    return res.json();
  },

  // Single Enquiry
  async getEnquiry(id: number): Promise<Enquiry> {
    const res = await fetch(`${getApiBase()}/enquiries/${id}`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch enquiry details');
    return res.json();
  },

  // Create Enquiry
  async createEnquiry(payload: Partial<Enquiry>): Promise<Enquiry> {
    const res = await fetch(`${getApiBase()}/enquiries/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create enquiry');
    }
    return res.json();
  },

  // Update Enquiry
  async updateEnquiry(id: number, payload: Partial<Enquiry>): Promise<Enquiry> {
    const res = await fetch(`${getApiBase()}/enquiries/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update enquiry');
    return res.json();
  },

  // Delete Enquiry
  async deleteEnquiry(id: number): Promise<{ message: string }> {
    const res = await fetch(`${getApiBase()}/enquiries/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete enquiry');
    return res.json();
  },

  // Get Comments (Couspro /get-comments/)
  async getComments(enquiryId: number): Promise<EnquiryComment[]> {
    const res = await fetch(`${getApiBase()}/get-comments/?enquiry_id=${enquiryId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch comments');
    return res.json();
  },

  // Add Comment
  async addComment(enquiryId: number, commentText: string, callStatus: string = 'general_note'): Promise<EnquiryComment> {
    const res = await fetch(`${getApiBase()}/enquiries/${enquiryId}/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ comment_text: commentText, call_status: callStatus }),
    });
    if (!res.ok) throw new Error('Failed to add comment');
    return res.json();
  },

  // Couspro: Quick Status Update
  async updateStatus(enquiryId: number, status: string, statusNote?: string) {
    const noteParam = statusNote ? `&status_note=${encodeURIComponent(statusNote)}` : '';
    const res = await fetch(`${getApiBase()}/update-status/?enquiry_id=${enquiryId}&status=${status}${noteParam}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Couspro: Quick Follow-up Date Update
  async updateFollowupDate(enquiryId: number, followupDate: string) {
    const res = await fetch(`${getApiBase()}/update-followup-date/?enquiry_id=${enquiryId}&followup_date=${followupDate}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Couspro: Quick Payment Update
  async updatePayment(enquiryId: number, advancePaid: number) {
    const res = await fetch(`${getApiBase()}/update-payment/?enquiry_id=${enquiryId}&advance_paid=${advancePaid}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Dashboard Stats
  async getDashboardStats(salesPersonId?: number): Promise<DashboardStats> {
    const query = salesPersonId ? `?sales_person_id=${salesPersonId}` : '';
    const res = await fetch(`${getApiBase()}/dashboard/stats${query}`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  // Monthly Target
  async getMonthlyTarget(salesPersonId?: number): Promise<MonthlyTargetData> {
    const query = salesPersonId ? `?sales_person_id=${salesPersonId}` : '';
    const res = await fetch(`${getApiBase()}/monthly-target/${query}`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch monthly target');
    return res.json();
  },

  // Calendar Departures
  async getCalendarDepartures(): Promise<CalendarDepartureDay[]> {
    const res = await fetch(`${getApiBase()}/calendar/departures`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch calendar departures');
    return res.json();
  },
};
