"use client";

import Link from "next/link";
import { X } from "lucide-react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import type { PlatformAnnouncement } from "@/lib/platform/announcements/types";

interface DisplayProps {
  announcement: PlatformAnnouncement;
  onDismiss?: () => void;
}

function DismissButton({ onDismiss }: { onDismiss?: () => void }) {
  if (!onDismiss) return null;
  return (
    <button
      type="button"
      onClick={onDismiss}
      className="sb-announcement-dismiss"
      aria-label="Dismiss"
    >
      <X className="w-4 h-4" />
    </button>
  );
}

function AnnouncementCta({
  announcement,
  variant = "primary",
}: {
  announcement: PlatformAnnouncement;
  variant?: "primary" | "secondary";
}) {
  if (!announcement.destinationHref || !announcement.buttonText) return null;
  return (
    <Button href={announcement.destinationHref} variant={variant} className="shrink-0">
      {announcement.buttonText}
    </Button>
  );
}

export function AnnouncementTopBanner({ announcement, onDismiss }: DisplayProps) {
  return (
    <div className="sb-announcement-top-banner sb-announcement-enter" role="status">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-3">
        {announcement.imageUrl ? (
          <img
            src={announcement.imageUrl}
            alt=""
            width={28}
            height={28}
            className="rounded-md shrink-0 hidden sm:block w-7 h-7 object-cover"
          />
        ) : null}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{announcement.title}</p>
          {announcement.subtitle ? (
            <p className="text-xs text-white/70 truncate">{announcement.subtitle}</p>
          ) : null}
        </div>
        <AnnouncementCta announcement={announcement} variant="secondary" />
        {announcement.dismissible ? <DismissButton onDismiss={onDismiss} /> : null}
      </div>
    </div>
  );
}

export function AnnouncementScrollingTicker({ announcement }: DisplayProps) {
  const label = [announcement.title, announcement.subtitle].filter(Boolean).join(" · ");
  return (
    <div className="sb-announcement-ticker sb-announcement-enter" aria-live="polite">
      <div className="sb-announcement-ticker-track">
        <span>{label}</span>
        <span aria-hidden>{label}</span>
      </div>
    </div>
  );
}

export function AnnouncementLiveEventBanner({ announcement, onDismiss }: DisplayProps) {
  return (
    <div className="sb-announcement-live sb-announcement-enter" role="status">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
        <span className="sb-announcement-live-dot" aria-hidden />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white">{announcement.title}</p>
          {announcement.subtitle ? (
            <p className="text-xs text-emerald-200/80">{announcement.subtitle}</p>
          ) : null}
        </div>
        <AnnouncementCta announcement={announcement} />
        {announcement.dismissible ? <DismissButton onDismiss={onDismiss} /> : null}
      </div>
    </div>
  );
}

export function AnnouncementFloatingToast({ announcement, onDismiss }: DisplayProps) {
  return (
    <LandingGlassCard className="sb-announcement-toast sb-announcement-enter p-4 max-w-sm shadow-2xl">
      {announcement.imageUrl ? (
        <img
          src={announcement.imageUrl}
          alt=""
          className="w-full h-24 object-cover rounded-xl mb-3"
        />
      ) : null}
      <p className="text-white font-semibold text-sm mb-1">{announcement.title}</p>
      {announcement.subtitle ? (
        <p className="text-sb-muted text-xs mb-3 leading-relaxed">{announcement.subtitle}</p>
      ) : null}
      <div className="flex items-center gap-2">
        <AnnouncementCta announcement={announcement} />
        {announcement.dismissible ? (
          <button
            type="button"
            onClick={onDismiss}
            className="text-xs text-sb-muted hover:text-white px-2 py-1"
          >
            Dismiss
          </button>
        ) : null}
      </div>
    </LandingGlassCard>
  );
}

export function AnnouncementWelcomePopup({ announcement, onDismiss }: DisplayProps) {
  return (
    <div className="sb-announcement-overlay sb-announcement-fade" role="dialog" aria-modal="true">
      <LandingGlassCard className="sb-announcement-popup sb-announcement-enter p-6 sm:p-8 max-w-md w-full mx-4 relative">
        {announcement.dismissible ? (
          <button
            type="button"
            onClick={onDismiss}
            className="absolute top-4 right-4 sb-announcement-dismiss"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        ) : null}
        {announcement.imageUrl ? (
          <img
            src={announcement.imageUrl}
            alt=""
            className="w-full h-36 sm:h-44 object-cover rounded-xl mb-5"
          />
        ) : null}
        <p className="text-xs uppercase tracking-widest text-sb-purple-light mb-2">Welcome</p>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{announcement.title}</h2>
        {announcement.subtitle ? (
          <p className="text-sb-muted text-sm leading-relaxed mb-6">{announcement.subtitle}</p>
        ) : null}
        <AnnouncementCta announcement={announcement} />
      </LandingGlassCard>
    </div>
  );
}

export function AnnouncementHomeHero({ announcement }: { announcement: PlatformAnnouncement }) {
  return (
    <section className="sb-announcement-hero landing-cta-banner sb-announcement-enter mx-4 sm:mx-6 mb-6">
      <div className="relative z-10">
        {announcement.imageUrl ? (
          <img
            src={announcement.imageUrl}
            alt=""
            className="w-full max-h-48 object-cover rounded-xl mb-5 mx-auto"
          />
        ) : null}
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{announcement.title}</h2>
        {announcement.subtitle ? (
          <p className="text-sb-muted text-sm sm:text-base max-w-xl mx-auto mb-5">
            {announcement.subtitle}
          </p>
        ) : null}
        {announcement.destinationHref && announcement.buttonText ? (
          <Button href={announcement.destinationHref}>{announcement.buttonText}</Button>
        ) : null}
      </div>
    </section>
  );
}

export function AnnouncementNotificationCard({
  announcement,
  href,
}: {
  announcement: PlatformAnnouncement;
  href?: string;
}) {
  const content = (
    <LandingGlassCard className="p-4 border border-sb-purple/20 bg-sb-purple/5">
      <p className="text-xs uppercase tracking-wider text-sb-purple-light mb-1">Platform</p>
      <p className="text-white font-semibold">{announcement.title}</p>
      {announcement.subtitle ? (
        <p className="text-sb-muted text-sm mt-1">{announcement.subtitle}</p>
      ) : null}
    </LandingGlassCard>
  );

  if (href) {
    return (
      <Link href={href} className="block hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }
  return content;
}
