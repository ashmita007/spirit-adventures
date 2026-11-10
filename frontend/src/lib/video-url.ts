/** Video URL helpers shared by server and client components (no browser APIs here). */

// Cloudinary renditions. Any uploaded video (any Cloudinary account, .mp4 or a phone .mov)
// is re-encoded on Cloudinary's CDN to H.264 MP4, so the original 4K file is never sent.
export const FULL_HD_VIDEO = "w_1920,c_limit,q_auto:good,vc_h264,br_2500k";
export const DESKTOP_VIDEO = "w_1280,c_limit,q_auto:good,vc_h264,br_1500k";
export const MOBILE_VIDEO = "w_720,c_limit,q_auto:eco,vc_h264,br_600k";

const TRANSFORM_PART = /^(w|h|c|q|f|vc|ac|br|so|du|eo|e|g|ar|fl|b|t|dpr|o|r|sp|af|fps)_[^.]+$/;
const isTransformSegment = (seg: string) => seg.split(",").every((part) => TRANSFORM_PART.test(part));

export const isCloudinaryVideo = (url: string) => url.includes("res.cloudinary.com") && url.includes("/video/upload/");

/** True for a direct video file (not a YouTube link): Cloudinary video or .mp4/.webm/.mov/.m4v. */
export function isVideoUrl(url: string | null | undefined): url is string {
  return Boolean(url) && (isCloudinaryVideo(url!) || /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url!));
}

/**
 * ".../video/upload/<any transforms>/v123/x.mov" -> ".../video/upload/<transform>/v123/x.mp4".
 * Non-Cloudinary URLs are returned unchanged.
 */
export function cloudinaryVideo(url: string, transform: string): string {
  if (!isCloudinaryVideo(url)) return url;
  const [head, rest] = url.split("/video/upload/");
  const clean = rest.split(/[?#]/)[0];
  const versioned = clean.match(/(?:^|\/)(v\d+\/.*)$/);
  // Unversioned public ids: drop transform segments ("w_640,c_limit"), keep folders like "my_trips"
  const tail = versioned ? versioned[1] : clean.split("/").filter((seg) => !isTransformSegment(seg)).join("/");
  return `${head}/video/upload/${transform}/${tail.replace(/\.(mov|m4v|webm|mkv|avi|mp4)$/i, "")}.mp4`;
}

/** Small preview rendition for trip cards: first 8 seconds, about 640px, 600 kbps (~0.75 MB). */
export const CARD_VIDEO = "so_0,du_8,w_640,c_limit,q_auto:eco,vc_h264,br_600k";
