"use client";

import { useEffect, useState } from "react";
import { CARD_VIDEO, DESKTOP_VIDEO, FULL_HD_VIDEO, MOBILE_VIDEO, cloudinaryVideo, isCloudinaryVideo } from "./video-url";

export { isVideoUrl, cloudinaryVideo } from "./video-url";

type NetInfo = { saveData?: boolean; effectiveType?: string };

function connection(): NetInfo | undefined {
  return (navigator as Navigator & { connection?: NetInfo }).connection;
}

/**
 * Pick a video rendition for this device, or null when the visitor is on
 * Data Saver or a 2G link (the poster image stays instead).
 * - phones and 3G: 720px, 600 kbps
 * - large screens (1440px+) on fast links: Full HD 1080p, 2.5 Mbps
 * - other desktops: 1280px, 1.5 Mbps
 */
export function pickVideoUrl(url: string, clip = ""): string | null {
  const net = connection();
  if (net?.saveData || /(^|-)2g$/.test(net?.effectiveType ?? "")) return null;
  if (!isCloudinaryVideo(url)) return url;
  const small = window.matchMedia("(max-width: 767px)").matches || net?.effectiveType === "3g";
  const pre = clip ? `${clip},` : "";
  if (small) return cloudinaryVideo(url, pre + MOBILE_VIDEO);
  const big = window.matchMedia("(min-width: 1440px)").matches && (!net?.effectiveType || net.effectiveType === "4g");
  return cloudinaryVideo(url, pre + (big ? FULL_HD_VIDEO : DESKTOP_VIDEO));
}

/**
 * Returns the video URL to mount, only after the page has finished loading so the
 * video never competes with the HTML, CSS, fonts and hero poster. Null until then.
 */
/** `clip` is an extra Cloudinary trim, e.g. "du_11" to send only the first 11 seconds. */
export function useDeferredVideo(url: string | undefined | null, clip = ""): string | null {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setSrc(null);
      return;
    }
    let cancelled = false;
    const start = () => {
      if (!cancelled) setSrc(pickVideoUrl(url, clip));
    };
    if (document.readyState === "complete") {
      start();
      return () => {
        cancelled = true;
      };
    }
    window.addEventListener("load", start, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", start);
    };
  }, [url, clip]);

  return src;
}


/**
 * Small preview rendition for trip cards: first 8 seconds, about 640px, 600 kbps (~0.75 MB).
 * ".../video/upload/<any transforms>/v123/x.mp4" -> ".../video/upload/w_640,.../v123/x.mp4"
 */
export function cardVideoUrl(url: string): string {
  return cloudinaryVideo(url, CARD_VIDEO);
}

/** False on Data Saver, 2G links and for visitors who asked for reduced motion. */
export function canPlayPreviews(): boolean {
  const net = connection();
  if (net?.saveData || /(^|-)2g$/.test(net?.effectiveType ?? "")) return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
