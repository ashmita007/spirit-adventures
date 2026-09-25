import React from "react";
import { Metadata } from "next";
import { getOwnerOverview } from "@/lib/api";
import { AnalyticsClient } from "./analytics-client";

export const metadata: Metadata = {
  title: "Destination Demand & Revenue Breakdown Table | Spirit Adventures Owner HQ",
  description: "Tabular analytics and regional booking demand metrics.",
};

export default async function OwnerAnalyticsPage() {
  const overviewData = await getOwnerOverview();

  const data = overviewData || {
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
      whatsapp_number: "+91 96665 67551",
      support_email: "info@spiritadventures.in",
      currency: "INR",
      brand_name: "Spirit Adventures",
    },
  };

  return <AnalyticsClient data={data} />;
}
