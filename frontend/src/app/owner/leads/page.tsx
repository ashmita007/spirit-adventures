import React from "react";
import { Metadata } from "next";
import { getOwnerOverviewForRequest } from "@/lib/owner-server";
import LeadsClientPage from "./leads-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Customer Leads & CRM Pipeline | Spirit Adventures Owner HQ",
  description: "High-volume inquiry management, WhatsApp itinerary dispatch, and follow-up tracker.",
};

export default async function OwnerLeadsPage() {
  const overviewData = await getOwnerOverviewForRequest("/owner/leads");

  const defaultData = overviewData || {
    metrics: {
      total_leads: 0,
      converted_leads: 0,
      new_leads: 0,
      in_pipeline: 0,
      conversion_rate: 0,
      est_revenue: 0,
      active_trips_count: 0,
      approved_reviews_count: 0,
    },
    enquiries: [],
    trips: [],
    config: {
      whatsapp_number: "+91 98765 43210",
      support_email: "hello@spiritadventures.in",
      currency: "INR",
      brand_name: "Spirit Adventures",
    },
  };

  return <LeadsClientPage initialData={defaultData} />;
}
