import { ownerFetch } from "@/lib/owner-fetch";

/**
 * Upload a photo or video from the owner portal straight to Cloudinary.
 * Django only signs the request (staff session required); the file itself
 * goes browser → Cloudinary, so large videos never touch our server.
 */
export type UploadFolder = "gallery" | "trips" | "videos" | "destinations" | "blog";
export type MediaKind = "image" | "video";

export const MAX_BYTES: Record<MediaKind, number> = {
  image: 10 * 1024 * 1024, // Cloudinary free plan limit per photo
  video: 100 * 1024 * 1024, // Cloudinary free plan limit per video
};

export interface UploadResult {
  url: string; // optimised delivery URL (f_auto,q_auto)
  posterUrl?: string; // for videos: a JPG frame to use as the poster
  width?: number;
  height?: number;
  bytes?: number;
}

export function kindOf(file: File): MediaKind | null {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return null;
}

/** Insert f_auto,q_auto so Cloudinary serves WebP/AVIF and right-sized quality. */
export function optimised(secureUrl: string): string {
  return secureUrl.replace(/\/(image|video)\/upload\//, "/$1/upload/f_auto,q_auto/");
}

export async function uploadToCloudinary(
  file: File,
  folder: UploadFolder,
  onProgress?: (pct: number) => void
): Promise<UploadResult> {
  const kind = kindOf(file);
  if (!kind) throw new Error(`${file.name}: only photos and videos can be uploaded.`);
  if (file.size > MAX_BYTES[kind]) {
    throw new Error(`${file.name} is ${(file.size / 1048576).toFixed(0)} MB. Max is ${MAX_BYTES[kind] / 1048576} MB for a ${kind}.`);
  }

  const res = await ownerFetch("/api/v1/owner/media/sign/", {
    method: "POST",
    body: JSON.stringify({ folder, resource_type: kind }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) throw new Error(json?.message || "Could not start the upload.");
  const s = json.data as { upload_url: string; api_key: string; timestamp: number; signature: string; folder: string };

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", s.api_key);
  form.append("timestamp", String(s.timestamp));
  form.append("signature", s.signature);
  form.append("folder", s.folder);

  const body = await new Promise<Record<string, unknown>>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", s.upload_url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let data: Record<string, unknown> = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        /* ignore */
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(data);
      else reject(new Error((data.error as { message?: string })?.message || `Upload failed (${xhr.status}).`));
    };
    xhr.onerror = () => reject(new Error("Network error while uploading. Check your connection."));
    xhr.send(form);
  });

  const secure = String(body.secure_url || "");
  if (!secure) throw new Error("Cloudinary did not return a link.");
  return {
    url: optimised(secure),
    posterUrl: kind === "video" ? optimised(secure).replace(/\.[a-z0-9]+$/i, ".jpg") : undefined,
    width: body.width as number | undefined,
    height: body.height as number | undefined,
    bytes: body.bytes as number | undefined,
  };
}
