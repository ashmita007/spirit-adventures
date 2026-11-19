import type { SiteContent } from "./types";

/**
 * Company social profiles. The owner sets them in Owner HQ → Landing page; until then
 * NEXT_PUBLIC_INSTAGRAM_URL / NEXT_PUBLIC_YOUTUBE_URL apply, then the platforms' home pages.
 */
const INSTAGRAM_FALLBACK = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com";
const YOUTUBE_FALLBACK = process.env.NEXT_PUBLIC_YOUTUBE_URL || "https://youtube.com";

export interface SocialLinks {
  instagram: string;
  youtube: string;
}

export function socialLinks(content?: Pick<SiteContent, "instagram_url" | "youtube_url"> | null): SocialLinks {
  return {
    instagram: content?.instagram_url || INSTAGRAM_FALLBACK,
    youtube: content?.youtube_url || YOUTUBE_FALLBACK,
  };
}
