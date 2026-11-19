import type { Metadata } from "next";
import HomepageManager from "./homepage-manager";

export const metadata: Metadata = {
  title: "Landing page | Spirit Adventures Owner HQ",
  robots: { index: false, follow: false },
};

export default function OwnerHomepagePage() {
  return <HomepageManager />;
}
