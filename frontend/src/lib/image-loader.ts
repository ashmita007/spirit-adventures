/**
 * next/image loader. Images are resized by the CDN that hosts them, so the small
 * Render instance never spends CPU (or seconds of latency) optimizing images.
 *
 * - Cloudinary uploads: Cloudinary transforms (width, AVIF/WebP, auto quality)
 * - /videos/** posters in /public: the identical copies on Cloudinary
 * - Unsplash: Unsplash's own resize parameters
 * - spiritadventures.in WordPress uploads (2-3 MB PNGs, and the WordPress host
 *   blocks image proxies): WebP mirrors in /public/img/wp, 640, 960 or 1280 wide
 * - anything else: served as is
 */
import { WP_MIRROR } from "./wp-mirror";

/** ".../wp-content/smush-webp/2026/06/COORG1-1.png.webp" -> "2026-06-coorg1-1" */
function wpKey(src: string): string | null {
  const i = src.indexOf("/wp-content/");
  if (i === -1 || !src.includes("spiritadventures.in")) return null;
  const key = src
    .slice(i + "/wp-content/".length)
    .split(/[?#]/)[0]
    .replace(/^(smush-webp|uploads)\//, "")
    .replace(/\.(png|jpe?g)\.webp$/i, "")
    .replace(/\.(png|jpe?g|webp)$/i, "")
    .replace(/\//g, "-")
    .toLowerCase();
  return WP_MIRROR.has(key) ? key : null;
}

const CLOUDINARY = "https://res.cloudinary.com/xvxaicfe/image/upload";

export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  const q = quality ? `q_${quality}` : "q_auto";

  if (src.includes("res.cloudinary.com") && src.includes("/image/upload/")) {
    return src.replace("/image/upload/", `/image/upload/w_${width},c_limit,f_auto,${q}/`);
  }

  if (src.startsWith("/videos/") && /\.(jpe?g|png|webp)$/i.test(src)) {
    return `${CLOUDINARY}/w_${width},c_limit,f_auto,${q}/spirit_adventures/${src.slice("/videos/".length)}`;
  }

  if (src.startsWith("https://images.unsplash.com/")) {
    const url = new URL(src);
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(quality || 65));
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "max");
    return url.toString();
  }

  const key = wpKey(src);
  if (key) return `/img/wp/${key}-${width <= 640 ? 640 : width <= 960 ? 960 : 1280}.webp`;

  return src;
}
