import type { Metadata } from "next";
import TeamManager from "./team-manager";

export const metadata: Metadata = {
  title: "Team | Spirit Adventures Owner HQ",
  robots: { index: false, follow: false },
};

export default function OwnerTeamPage() {
  return <TeamManager />;
}
