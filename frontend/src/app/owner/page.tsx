import React from "react";
import { Metadata } from "next";
import { getOwnerOverview } from "@/lib/api";
import OwnerOverviewClient from "./owner-overview-client";

export const metadata: Metadata = {
  title: "Owner HQ & Business Operations | Spirit Adventures",
  description: "Executive overview, multi-page CRM, itinerary studio, and regional demand intelligence.",
};

export default async function OwnerPage() {
  const overviewData = await getOwnerOverview();

  const defaultData = overviewData || {
    metrics: {
      total_leads: 10,
      converted_leads: 2,
      new_leads: 3,
      in_pipeline: 4,
      conversion_rate: 20.0,
      est_revenue: 148994,
      active_trips_count: 7,
      approved_reviews_count: 5,
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

  return <OwnerOverviewClient initialData={defaultData} />;
}
