export interface TourPackage {
  id: number;
  name: string;
  destination: string;
  duration_days: number;
  base_price: string | number;
  is_active: boolean;
}

export interface EnquiryComment {
  id: number;
  author_name: string;
  call_status: string;
  comment_text: string;
  created_at: string;
}

export interface Enquiry {
  id: number;
  name: string;
  contact: string;
  email?: string | null;
  departure_city: string;
  tour_name: string;
  tour_package_id?: number | null;
  custom_tour_name?: string | null;
  date_of_travel: string;
  followup_date?: string | null;
  pnr_up?: string | null;
  pnr_down?: string | null;
  accommodation_type: 'sharing' | 'private_room' | 'tent';
  total_people: number;
  boys_count: number;
  girls_count: number;
  couples_count: number;
  total_amount: string | number;
  advance_paid: string | number;
  balance_amount: string | number;
  payment_status: 'unpaid' | 'advance_paid' | 'fully_paid';
  status: 'new' | 'contacted' | 'booked' | 'travelled' | 'cancelled' | 'lost';
  sales_person_id?: number | null;
  sales_person_name?: string | null;
  notes?: string | null;
  source?: 'manual' | 'website' | string;
  created_at: string;
  updated_at: string;
  comments_count: number;
  comments?: EnquiryComment[];
}

export interface DashboardStats {
  total_enquiries: number;
  new_leads: number;
  confirmed_bookings: number;
  total_revenue_booked: string | number;
  total_advance_collected: string | number;
  total_balance_pending: string | number;
  total_travelers: number;
  total_boys: number;
  total_girls: number;
  total_couples: number;
  conversion_rate: number;
  accommodation_breakdown: {
    sharing: number;
    private_room: number;
    tent: number;
  };
}

export interface MonthlyTargetData {
  year: number;
  month: number;
  month_name: string;
  target_amount: string | number;
  actual_collected: string | number;
  remaining: string | number;
  percentage: number;
  days_remaining: number;
  sales_person_id?: number | null;
  sales_person_name?: string | null;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  role: 'admin' | 'manager' | 'sales_person' | 'counselor';
  display_name: string;
  target_amount: string | number;
  is_approved: boolean;
  is_active: boolean;
  is_superuser: boolean;
  is_manager_or_admin: boolean;
  permissions?: string[];
}

export interface CalendarTrip {
  enquiry_id: number;
  lead_name: string;
  tour: string;
  departure_city: string;
  pnr_up?: string;
  accommodation: string;
  total_people: number;
  boys: number;
  girls: number;
  couples: number;
  status: string;
  payment_status: string;
}

export interface CalendarDepartureDay {
  date: string;
  total_departures: number;
  total_travelers: number;
  boys: number;
  girls: number;
  couples: number;
  trips: CalendarTrip[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

