"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, Loader2, Upload, X } from "lucide-react";
import { IMAGE_SIZE_GUIDES } from "@/lib/platform/announcements/types";
import { optimizeAnnouncementImageClient } from "@/lib/platform/announcements/clientOptimize";

interface AnnouncementImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

const UPLOAD_TIMEOUT_MS = 90_000;

async function readErrorFromResponse(res: Response): Promise<string> {
  const text = await res.text();
  if (!text) return `Upload failed (HTTP ${res.status}).`;

  try {
    const data = JSON.parse(text) as { error?: string };
    if (data.error) return data.error;
  } catch {
    // Not JSON — often a Vercel/proxy HTML error page.
  }

  if (res.status === 413) {
    return "Image is too large for the server. Try a smaller file — we compress automatically on upload.";
  }

  const snippet = text.replace(/\s+/g, " ").trim().slice(0, 120);
  return snippet
    ? `Upload failed (HTTP ${res.status}): ${snippet}`
    : `Upload failed (HTTP ${res.status}).`;
}

export default function AnnouncementImageUpload({
  value,
  onChange,
}: AnnouncementImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File) => {
      setUploading(true);
      setError(null);

      const previewUrl = URL.createObjectURL(file);
      setLocalPreview(previewUrl);

      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

      try {
        const { blob, contentType } = await optimizeAnnouncementImageClient(file);

        const urlRes = await fetch("/api/admin/announcements/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          signal: controller.signal,
          body: JSON.stringify({ contentType }),
        });

        if (!urlRes.ok) {
          setError(await readErrorFromResponse(urlRes));
          setLocalPreview(null);
          URL.revokeObjectURL(previewUrl);
          return;
        }

        let urlData: {
          signedUrl?: string;
          path?: string;
          token?: string;
          publicUrl?: string;
          contentType?: string;
          error?: string;
        };

        try {
          urlData = (await urlRes.json()) as typeof urlData;
        } catch {
          setError("Server returned an invalid response while preparing upload.");
          setLocalPreview(null);
          URL.revokeObjectURL(previewUrl);
          return;
        }

        if (!urlData.publicUrl || !urlData.path || !urlData.token) {
          setError(urlData.error ?? "Could not prepare storage upload.");
          setLocalPreview(null);
          URL.revokeObjectURL(previewUrl);
          return;
        }

        const uploadRes = await fetch(urlData.signedUrl!, {
          method: "PUT",
          headers: { "Content-Type": urlData.contentType ?? contentType },
          body: blob,
          signal: controller.signal,
        });

        if (!uploadRes.ok) {
          setError(`Storage upload failed (HTTP ${uploadRes.status}). Check Supabase bucket setup.`);
          setLocalPreview(null);
          URL.revokeObjectURL(previewUrl);
          return;
        }

        onChange(urlData.publicUrl);
        setLocalPreview(null);
        URL.revokeObjectURL(previewUrl);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          setError("Upload timed out. Try a smaller image or check your connection.");
        } else {
          setError(err instanceof Error ? err.message : "Upload failed.");
        }
        setLocalPreview(null);
        URL.revokeObjectURL(previewUrl);
      } finally {
        window.clearTimeout(timeout);
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [onChange]
  );

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) void upload(file);
  }

  const previewSrc = value || localPreview;

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`relative rounded-2xl border-2 border-dashed transition-colors ${
          dragging
            ? "border-sb-purple/60 bg-sb-purple/10"
            : "border-white/15 bg-white/[0.02]"
        }`}
      >
        {previewSrc ? (
          <div className="relative">
            <img
              src={previewSrc}
              alt="Announcement preview"
              className="w-full max-h-96 object-contain rounded-2xl bg-black/20"
            />
            {uploading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-black/60">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
                <p className="text-sm text-white">Optimizing & uploading…</p>
              </div>
            ) : null}
            {value && !uploading ? (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setLocalPreview(null);
                }}
                className="absolute top-3 right-3 inline-flex items-center justify-center w-9 h-9 rounded-full bg-black/60 text-white border border-white/20"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full px-6 py-10 flex flex-col items-center justify-center gap-3 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-sb-purple/15 border border-sb-purple/30 flex items-center justify-center">
              <ImagePlus className="w-7 h-7 text-sb-purple-light" />
            </div>
            <div>
              <p className="text-white font-semibold">Drag & drop promo artwork</p>
              <p className="text-xs text-sb-muted mt-1">JPG, PNG, or WEBP — auto-optimized to WebP</p>
            </div>
            <span className="inline-flex items-center gap-2 text-xs text-sb-purple-light mt-1">
              <Upload className="w-3.5 h-3.5" /> or browse files
            </span>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-2">
        {IMAGE_SIZE_GUIDES.map((guide) => (
          <div key={guide.label} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
            <p className="text-[11px] text-sb-muted">{guide.label}</p>
            <p className="text-xs text-white font-medium">{guide.size}</p>
          </div>
        ))}
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2">
          <p className="text-xs text-red-300">{error}</p>
        </div>
      ) : null}
    </div>
  );
}
