import type { Metadata } from "next";
import OffersManager from "./offers-manager";

export const metadata: Metadata = {
  title: "Events & Offers | Spirit Adventures Owner HQ",
  robots: { index: false, follow: false },
};

export default function OwnerOffersPage() {
  return <OffersManager />;
}
