import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import InboxClient from "./inbox-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Inbox | Spirit Adventures Owner HQ",
};

export default async function OwnerInboxPage({ searchParams }: { searchParams: Promise<{ to?: string; subject?: string }> }) {
  const jar = await cookies();
  if (!jar.get("sessionid")?.value) redirect("/owner/login?next=%2Fowner%2Finbox");
  const { to, subject } = await searchParams;
  return <InboxClient composeTo={to} composeSubject={subject} />;
}
