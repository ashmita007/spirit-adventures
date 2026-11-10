import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

/**
 * Old WordPress page URLs (spiritadventures.in, pre-2026) -> new pages, so Google
 * rankings and shared links carry over after the domain moves. 301-equivalent (308).
 */
const WP_TRIP_SLUGS = [
  "4d-3n-coorg-wayanad",
  "3d-2n-coorg",
  "3d-2n-chickmangalur",
  "2d-1n-dandeli",
  "2d-1n-gokarna-murudeshwar",
  "3d-2n-gokarna-jog-falls",
  "3d-2n-gokarna-udipi",
  "4d-3n-gokarna-dandeli-udipi",
  "4d-3n-gokarna-murudeshwar-udipi-jog-falls",
  "4d-3n-hampi-gokarna-dandeli",
  "5d-4n-gd-kukke-udipi-dharmastala",
  "2d-1n-hampi",
  "3d-2n-munnar",
  "4d-3n-munnar-thekkedy",
  "4d-3n-munnat-alleppey",
  "3d-2n-goa",
  "3d-2n-lonavala-andharban-devkund",
  "3d-2n-pondicherry",
  "4d-3n-isha-ooty-coonoor",
  "4d-3n-ooty-coonoor-mysore",
  "5d-4n-ooty-kodaikanal",
  "6d-5n-kodaikankal-ooty-mysore",
  "4d-3n-manali",
  "5d-4n-darjeeling",
  "5d-4n-kashmir",
  "5d-4n-meghalaya",
  "5d-4n-kerala",
  "5d-4n-manali-delhi",
  "5d-4n-shimla-manali",
  "3d-2n-ooty-coonoor",
  "3d-2n-wayanad",
  "3d-2n-isha-ooty",
  "3d-2n-gokarna-dandeli",
  "3d-2n-coorg-chickmangalur",
  "wayanad-couple-package",
  "ooty-isha-couple-package",
  "gokarna-dandeli-couple-package",
  "coorg-chikmagalur-couple-package",
  "ooty-coonoor-couple-package",
  "2d-1n-coorg",
];
const LEGACY_REDIRECTS = [
  ...WP_TRIP_SLUGS.map((slug) => ({ source: `/${slug}{/}?`, destination: `/trips/${slug}` })),
  { source: "/about-us{/}?", destination: "/about" },
  { source: "/contact-us{/}?", destination: "/contact" },
  { source: "/destinations/", destination: "/destinations" },
  { source: "/hello-world{/}?", destination: "/blog" },
  { source: "/category/:path*", destination: "/blog" },
  { source: "/author/:path*", destination: "/about" },
  { source: "/feed{/}?", destination: "/blog" },
  { source: "/wp-admin/:path*", destination: "/owner/login" },
  { source: "/wp-login.php", destination: "/owner/login" },
].map((r) => ({ ...r, permanent: true }));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Docker image builds a self-contained server (node server.js); `next start` keeps working elsewhere
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  compress: true,
  poweredByHeader: false,
  skipTrailingSlashRedirect: true,
  async redirects() {
    return LEGACY_REDIRECTS;
  },
  async rewrites() {
    return [
      {
        // Keep the trailing slash so Django doesn't 301 back into a loop
        source: "/api/:path*/",
        destination: `${BACKEND_URL}/api/:path*/`,
      },
      {
        source: "/admin/:path*/",
        destination: `${BACKEND_URL}/admin/:path*/`,
      },
      {
        // Django admin CSS/JS (served by Django/WhiteNoise)
        source: "/static/:path*",
        destination: `${BACKEND_URL}/static/:path*`,
      },
      {
        // Django media uploads
        source: "/media/:path*",
        destination: `${BACKEND_URL}/media/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: "/admin/:path*",
        destination: `${BACKEND_URL}/admin/:path*`,
      },
    ];
  },
  images: {
    // Cloudinary resizes its own images; see src/lib/image-loader.ts
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days image caching
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/videos/:all*(mp4|webm|jpg|jpeg|png|webp)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|ico|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
