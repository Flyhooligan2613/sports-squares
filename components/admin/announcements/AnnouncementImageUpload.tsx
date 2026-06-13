"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, Loader2, Upload, X } from "lucide-react";
import { IMAGE_SIZE_GUIDES } from "@/lib/platform/announcements/types";

interface AnnouncementImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export default function AnnouncementImageUpload({
  value,
  onChange,
}: AnnouncementImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File) => {
      setUploading(true);
      setError(null);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/announcements/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as {
        publicUrl?: string;
        width?: number;
        height?: number;
        error?: string;
      };

      setUploading(false);
      if (!res.ok || !data.publicUrl) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      onChange(data.publicUrl);
    },
    [onChange]
  );

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) void upload(file);
  }

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
        {value ? (
          <div className="relative">
            <img src={value} alt="Announcement preview" className="w-full max-h-80 object-cover rounded-2xl" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-3 right-3 inline-flex items-center justify-center w-9 h-9 rounded-full bg-black/60 text-white border border-white/20"
              aria-label="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full px-6 py-10 flex flex-col items-center justify-center gap-3 text-center"
          >
            {uploading ? (
              <Loader2 className="w-8 h-8 text-sb-purple-light animate-spin" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-sb-purple/15 border border-sb-purple/30 flex items-center justify-center">
                <ImagePlus className="w-7 h-7 text-sb-purple-light" />
              </div>
            )}
            <div>
              <p className="text-white font-semibold">
                {uploading ? "Optimizing & uploading…" : "Drag & drop promo artwork"}
              </p>
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
          accept="image/jpeg,image/png,image/webp"
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

      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
