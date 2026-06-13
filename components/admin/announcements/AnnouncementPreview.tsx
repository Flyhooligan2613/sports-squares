"use client";

import { useMemo, useState } from "react";
import {
  AnnouncementFloatingToast,
  AnnouncementLiveEventBanner,
  AnnouncementTopBanner,
  AnnouncementWelcomePopup,
} from "@/components/announcements/AnnouncementDisplays";
import type {
  AnnouncementUpsertInput,
  PlatformAnnouncement,
} from "@/lib/platform/announcements/types";
import { resolvePriority } from "@/lib/platform/announcements/types";

type Device = "mobile" | "tablet" | "desktop";

const DEVICE_WIDTH: Record<Device, string> = {
  mobile: "375px",
  tablet: "768px",
  desktop: "1280px",
};

function draftToAnnouncement(form: AnnouncementUpsertInput): PlatformAnnouncement {
  const { priority } = resolvePriority(form);
  const now = new Date().toISOString();
  return {
    id: "preview",
    title: form.title || "Announcement Title",
    subtitle: form.subtitle?.trim() || null,
    imageUrl: form.imageUrl?.trim() || null,
    buttonText: form.buttonText?.trim() || null,
    destinationHref: form.destinationHref?.trim() || null,
    secondaryButtonText: form.secondaryButtonText?.trim() || null,
    secondaryDestinationHref: form.secondaryDestinationHref?.trim() || null,
    displayType: form.displayType,
    category: form.category,
    audience: form.audience,
    audienceRegions: form.audienceRegions ?? [],
    audienceEmails: form.audienceEmails ?? [],
    priority,
    priorityLevel: form.priorityLevel ?? "normal",
    dismissible: form.dismissible ?? true,
    frequency: form.frequency ?? "once",
    startsAt: form.startsAt ?? now,
    endsAt: form.endsAt ?? null,
    timezone: form.timezone ?? "America/New_York",
    animationStyle: form.animationStyle ?? "scale",
    active: true,
    createdBy: "preview",
    automationKey: null,
    templateKey: form.templateKey ?? null,
    source: "manual",
    createdAt: now,
    updatedAt: now,
  };
}

export default function AnnouncementPreview({ form }: { form: AnnouncementUpsertInput }) {
  const [device, setDevice] = useState<Device>("mobile");
  const announcement = useMemo(() => draftToAnnouncement(form), [form]);

  function renderDisplay() {
    switch (announcement.displayType) {
      case "welcome_popup":
        return <AnnouncementWelcomePopup announcement={announcement} onDismiss={() => {}} />;
      case "top_banner":
        return <AnnouncementTopBanner announcement={announcement} onDismiss={() => {}} />;
      case "live_event_banner":
        return <AnnouncementLiveEventBanner announcement={announcement} onDismiss={() => {}} />;
      case "floating_toast":
        return (
          <div className="fixed bottom-4 right-4 z-50">
            <AnnouncementFloatingToast announcement={announcement} onDismiss={() => {}} />
          </div>
        );
      default:
        return (
          <div className="p-8 text-center text-sb-muted text-sm">
            Preview for {announcement.displayType} appears on the live site layout.
          </div>
        );
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["mobile", "tablet", "desktop"] as Device[]).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDevice(d)}
            className={`text-xs px-3 py-1.5 rounded-lg border capitalize ${
              device === d
                ? "border-sb-purple/50 text-white bg-sb-purple/15"
                : "border-white/10 text-sb-muted hover:text-white"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#05070f] p-4 overflow-auto">
        <div
          className="relative mx-auto rounded-xl border border-white/10 overflow-hidden bg-sb-bg transition-all duration-300"
          style={{ width: DEVICE_WIDTH[device], minHeight: device === "mobile" ? "680px" : "520px" }}
        >
          <div className="h-10 border-b border-white/10 bg-black/40 flex items-center px-4">
            <p className="text-[10px] uppercase tracking-widest text-sb-muted">SquareBoards Preview</p>
          </div>
          <div className="relative min-h-[620px] bg-gradient-to-b from-sb-bg to-[#0a1020]">
            <div className="p-4 space-y-3 opacity-40 pointer-events-none">
              <div className="h-24 rounded-xl bg-white/5" />
              <div className="h-40 rounded-xl bg-white/5" />
              <div className="h-24 rounded-xl bg-white/5" />
            </div>
            <div className="absolute inset-0 pointer-events-auto">{renderDisplay()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
