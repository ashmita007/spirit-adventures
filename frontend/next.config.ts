import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Docker image builds a self-contained server (node server.js); `next start` keeps working elsewhere
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  compress: true,
  poweredByHeader: false,
  skipTrailingSlashRedirect: true,
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
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days image caching
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
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
