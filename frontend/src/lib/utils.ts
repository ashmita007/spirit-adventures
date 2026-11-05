import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Owner portal and CRM pages: no public-site navbar, footer, WhatsApp button or scroll effects. */
export function isPortalPath(pathname?: string | null): boolean {
  return Boolean(pathname && (pathname.startsWith("/owner") || pathname.startsWith("/crm")));
}
