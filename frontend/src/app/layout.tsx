import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import WhatsAppButton from "@/components/whatsapp-button";
import MobileBottomNav from "@/components/mobile-nav";
import MotionProvider from "@/components/motion/motion-provider";
import MediaGovernor from "@/components/motion/media-governor";
import JsonLd from "@/components/json-ld";
import { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION, organizationJsonLd, websiteJsonLd } from "@/lib/seo";

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Spirit Adventures | Treks, Rafting & Himalayan Expeditions",
    template: "%s",
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Spirit Adventures",
    "trekking from Hyderabad",
    "weekend trips from Bangalore",
    "Gokarna beach trek",
    "Dandeli river rafting",
    "Coorg Tadiandamol trek",
    "Chikmagalur trek",
    "Kedarkantha trek",
    "Ladakh bike trip",
    "group adventure trips India",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: { canonical: "/" },
  icons: {
    icon: [{ url: "/images/favicon.png", type: "image/png", sizes: "100x100" }],
    shortcut: "/images/favicon.png",
    apple: "/images/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Spirit Adventures | Treks, Rafting & Himalayan Expeditions",
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Spirit Adventures | Treks, Rafting & Himalayan Expeditions",
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  category: "travel",
};

export const viewport: Viewport = {
  themeColor: "#062B49",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <head>
        {/* Lets CSS hold hero pieces for the GSAP intro (skipped for reduced motion) */}
        <script
          dangerouslySetInnerHTML={{
            __html: "if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('sa-js')",
          }}
        />
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      </head>
      <body className="min-h-screen flex flex-col antialiased selection:bg-brand-ocean selection:text-white pb-16 md:pb-0">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
        <WhatsAppButton />
        <MobileBottomNav />
        <MotionProvider />
        <MediaGovernor />
      </body>
    </html>
  );
}
