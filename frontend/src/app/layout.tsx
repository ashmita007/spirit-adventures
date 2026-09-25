import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import WhatsAppButton from "@/components/whatsapp-button";
import MobileBottomNav from "@/components/mobile-nav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Spirit Adventures | Premium Nature & High Wilderness Travel",
  description:
    "Curated small-group mindful adventures across the Himalayas, Western Ghats, and coastal trails. Experience pure nature with certified mountain leaders.",
  keywords: [
    "Spirit Adventures",
    "Trekking in India",
    "Himalayan Treks",
    "South India Adventures",
    "Gokarna Beach Trek",
    "Dandeli River Rafting",
    "Coorg Coffee Trail",
    "Chikmagalur Trek",
    "Wayanad Waterfalls",
    "Ooty Nilgiris",
  ],
  authors: [{ name: "Spirit Adventures" }],
  openGraph: {
    title: "Spirit Adventures | Premium Nature & High Wilderness Travel",
    description:
      "Explore breathtaking places, unforgettable journeys and experiences beyond the ordinary.",
    url: "https://spiritadventures.in",
    siteName: "Spirit Adventures",
    images: [
      {
        url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Spirit Adventures Himalayas",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#062B49",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="min-h-screen flex flex-col antialiased selection:bg-brand-ocean selection:text-white pb-16 md:pb-0">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
        <WhatsAppButton />
        <MobileBottomNav />
      </body>
    </html>
  );
}
