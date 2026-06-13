"use client";

import Link from "next/link";
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { PlatformAnnouncement } from "@/lib/platform/announcements/types";

interface DisplayProps {
  announcement: PlatformAnnouncement;
  onDismiss?: () => void;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
}

function animationClass(style: PlatformAnnouncement["animationStyle"]): string {
  switch (style) {
    case "fade":
      return "sb-promo-anim-fade";
    case "slide_up":
      return "sb-promo-anim-slide-up";
    default:
      return "sb-promo-scale-in";
  }
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
  className = "",
  onClick,
}: {
  announcement: PlatformAnnouncement;
  variant?: "primary" | "secondary";
  className?: string;
  onClick?: () => void;
}) {
  if (!announcement.destinationHref || !announcement.buttonText) return null;
  return (
    <Button
      href={announcement.destinationHref}
      variant={variant}
      className={`shrink-0 ${className}`.trim()}
      onClick={onClick}
    >
      {announcement.buttonText}
    </Button>
  );
}

function SecondaryCta({
  announcement,
  onClick,
}: {
  announcement: PlatformAnnouncement;
  onClick?: () => void;
}) {
  if (!announcement.secondaryDestinationHref || !announcement.secondaryButtonText) return null;
  return (
    <Button
      href={announcement.secondaryDestinationHref}
      variant="secondary"
      className="w-full min-h-[48px]"
      onClick={onClick}
    >
      {announcement.secondaryButtonText}
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
    <div className="sb-card sb-announcement-toast sb-announcement-enter p-4 max-w-sm shadow-2xl border border-white/10">
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
    </div>
  );
}

export function AnnouncementWelcomePopup({
  announcement,
  onDismiss,
  onPrimaryClick,
  onSecondaryClick,
}: DisplayProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = announcement.imageUrl?.trim() ?? "";
  const showImage = Boolean(imageUrl) && !imageFailed;
  const hasFooterCopy =
    Boolean(announcement.title) ||
    Boolean(announcement.subtitle) ||
    Boolean(announcement.buttonText);

  const imageContent = showImage ? (
    <img
      src={imageUrl}
      alt={announcement.title}
      className="sb-promo-image"
      onError={() => setImageFailed(true)}
    />
  ) : (
    <div className="sb-promo-image-fallback">
      <p className="text-xs uppercase tracking-[0.2em] text-sb-purple-light mb-3">SquareBoards</p>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">
        {announcement.title}
      </h2>
      {announcement.subtitle ? (
        <p className="text-white/75 text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
          {announcement.subtitle}
        </p>
      ) : null}
    </div>
  );

  return (
    <div className="sb-promo-overlay sb-announcement-fade" role="dialog" aria-modal="true">
      <div className={`sb-promo-modal ${animationClass(announcement.animationStyle)}`}>
        {announcement.dismissible && onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="sb-promo-close"
            aria-label="Close promotion"
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        ) : null}

        <div className="sb-promo-media">
          {showImage && announcement.destinationHref ? (
            <Link href={announcement.destinationHref} className="block sb-promo-image-link">
              {imageContent}
            </Link>
          ) : (
            imageContent
          )}

          {showImage && hasFooterCopy ? (
            <div className="sb-promo-caption">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-1">{announcement.title}</h2>
              {announcement.subtitle ? (
                <p className="text-white/75 text-sm leading-relaxed">{announcement.subtitle}</p>
              ) : null}
            </div>
          ) : null}
        </div>

        {(announcement.buttonText && announcement.destinationHref) ||
        (announcement.secondaryButtonText && announcement.secondaryDestinationHref) ||
        announcement.dismissible ? (
          <div className="sb-promo-actions">
            {announcement.buttonText && announcement.destinationHref ? (
              <AnnouncementCta
                announcement={announcement}
                className="w-full min-h-[52px] text-base"
                onClick={onPrimaryClick}
              />
            ) : null}
            <SecondaryCta announcement={announcement} onClick={onSecondaryClick} />
            {announcement.dismissible && onDismiss ? (
              <button type="button" onClick={onDismiss} className="sb-promo-decline">
                No thanks
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
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
    <div className="sb-card p-4 border border-sb-purple/20 bg-sb-purple/5">
      <p className="text-xs uppercase tracking-wider text-sb-purple-light mb-1">Platform</p>
      <p className="text-white font-semibold">{announcement.title}</p>
      {announcement.subtitle ? (
        <p className="text-sb-muted text-sm mt-1">{announcement.subtitle}</p>
      ) : null}
    </div>
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
