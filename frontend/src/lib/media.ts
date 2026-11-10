"use client";

import { useEffect, useState } from "react";

const DESKTOP_VIDEO = "w_1280,c_limit,q_auto:good,vc_h264,br_1500k";
const MOBILE_VIDEO = "w_720,c_limit,q_auto:eco,vc_h264,br_600k";

type NetInfo = { saveData?: boolean; effectiveType?: string };

function connection(): NetInfo | undefined {
  return (navigator as Navigator & { connection?: NetInfo }).connection;
}

/**
 * Pick a video rendition for this device, or null when the visitor is on
 * Data Saver or a 2G link (the poster image stays instead).
 * Phones and 3G links get a 720px / 600 kbps encode (about a third of the size).
 */
export function pickVideoUrl(url: string): string | null {
  const net = connection();
  if (net?.saveData || /(^|-)2g$/.test(net?.effectiveType ?? "")) return null;
  const small = window.matchMedia("(max-width: 767px)").matches || net?.effectiveType === "3g";
  return small ? url.replace(DESKTOP_VIDEO, MOBILE_VIDEO) : url;
}

/**
 * Returns the video URL to mount, only after the page has finished loading so the
 * video never competes with the HTML, CSS, fonts and hero poster. Null until then.
 */
export function useDeferredVideo(url: string | undefined | null): string | null {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setSrc(null);
      return;
    }
    let cancelled = false;
    const start = () => {
      if (!cancelled) setSrc(pickVideoUrl(url));
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
  }, [url]);

  return src;
}
