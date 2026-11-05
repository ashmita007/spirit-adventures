import type { Metadata } from "next";
import { AuthProvider } from "@/components/crm/auth-context";
import CrmMotion from "@/components/crm/crm-motion";
import "./crm.css";

export const metadata: Metadata = {
  title: "Sales CRM",
  robots: { index: false, follow: false },
};

/** Built-in sales CRM. Same login as the owner portal; Django checks role on every call. */
export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CrmMotion />
      <div className="min-h-screen bg-[#f8f9fa] text-slate-800 -mb-16 md:mb-0">{children}</div>
    </AuthProvider>
  );
}
