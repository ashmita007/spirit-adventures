"use client";

import React, { useRef, useState } from "react";
import { Loader2, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadToCloudinary, UploadFolder, UploadResult } from "@/lib/cloudinary-upload";

interface Props {
  folder: UploadFolder;
  accept?: "image" | "video" | "both";
  multiple?: boolean;
  label?: string;
  className?: string;
  /** Called once per file that uploaded successfully. */
  onUploaded: (result: UploadResult, file: File) => void;
  onError?: (message: string) => void;
  /** Called when every selected file has finished (ok or not). */
  onDone?: (okCount: number, failCount: number) => void;
}

/** Button that opens the file picker and uploads each file to Cloudinary with a progress bar. */
export default function MediaUploadButton({
  folder,
  accept = "image",
  multiple = false,
  label,
  className,
  onUploaded,
  onError,
  onDone,
}: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [pct, setPct] = useState(0);

  const acceptAttr = accept === "image" ? "image/*" : accept === "video" ? "video/*" : "image/*,video/*";

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    setBusy(true);
    let ok = 0;
    let fail = 0;
    for (let i = 0; i < list.length; i++) {
      const f = list[i];
      setStatus(list.length > 1 ? `Uploading ${i + 1} of ${list.length}` : "Uploading");
      setPct(0);
      try {
        const res = await uploadToCloudinary(f, folder, setPct);
        onUploaded(res, f);
        ok++;
      } catch (e) {
        fail++;
        onError?.(e instanceof Error ? e.message : "Upload failed.");
      }
    }
    setBusy(false);
    setStatus("");
    if (input.current) input.current.value = "";
    onDone?.(ok, fail);
  };

  return (
    <div className={cn("inline-flex flex-col gap-1.5", className)}>
      <input
        ref={input}
        type="file"
        accept={acceptAttr}
        multiple={multiple}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => input.current?.click()}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-ocean px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-navy disabled:cursor-wait disabled:opacity-80"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
        <span>{busy ? `${status} · ${pct}%` : label || (accept === "video" ? "Upload video" : multiple ? "Upload photos" : "Upload photo")}</span>
      </button>
      {busy && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-brand-ocean transition-[width] duration-200" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}
