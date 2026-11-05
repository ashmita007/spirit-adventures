import React from "react";
import { Metadata } from "next";
import { getOwnerOverviewForRequest } from "@/lib/owner-server";
import { AnalyticsClient } from "./analytics-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Destination Demand & Revenue Breakdown Table | Spirit Adventures Owner HQ",
  description: "Tabular analytics and regional booking demand metrics.",
};

export default async function OwnerAnalyticsPage() {
  const overviewData = await getOwnerOverviewForRequest("/owner/analytics");

  const data = overviewData || {
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
      whatsapp_number: "+91 96665 67551",
      support_email: "info@spiritadventures.in",
      currency: "INR",
      brand_name: "Spirit Adventures",
    },
  };

  return <AnalyticsClient data={data} />;
}
