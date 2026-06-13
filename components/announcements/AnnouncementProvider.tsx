"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  AnnouncementFloatingToast,
  AnnouncementLiveEventBanner,
  AnnouncementScrollingTicker,
  AnnouncementTopBanner,
  AnnouncementWelcomePopup,
} from "@/components/announcements/AnnouncementDisplays";
import type {
  AnnouncementEventType,
  PlatformAnnouncement,
} from "@/lib/platform/announcements/types";

const ANON_KEY = "sb-anon-id";

interface AnnouncementContextValue {
  announcements: PlatformAnnouncement[];
  homeHero: PlatformAnnouncement | null;
  refresh: () => Promise<void>;
}

const AnnouncementContext = createContext<AnnouncementContextValue | null>(null);

function getAnonymousId(): string {
  if (typeof window === "undefined") return "guest";
  let id = localStorage.getItem(ANON_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(ANON_KEY, id);
  }
  return id;
}

function pickHighestPriority(
  items: PlatformAnnouncement[],
  type: PlatformAnnouncement["displayType"]
): PlatformAnnouncement | null {
  return items.find((a) => a.displayType === type) ?? null;
}

function isAdminPath(pathname: string): boolean {
  return pathname.startsWith("/admin");
}

async function trackEvents(announcementId: string, eventTypes: AnnouncementEventType[]) {
  await fetch("/api/announcements/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      announcementId,
      anonymousId: getAnonymousId(),
      eventTypes,
    }),
  });
}

export function AnnouncementProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [announcements, setAnnouncements] = useState<PlatformAnnouncement[]>([]);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [showWelcome, setShowWelcome] = useState(false);
  const viewedRef = useRef<Set<string>>(new Set());

  const load = useCallback(async () => {
    if (isAdminPath(pathname)) {
      setAnnouncements([]);
      return;
    }

    const params = new URLSearchParams({ anonymousId: getAnonymousId() });
    const res = await fetch(`/api/announcements?${params}`, {
      cache: "no-store",
      credentials: "include",
    });
    if (!res.ok) {
      setAnnouncements([]);
      return;
    }
    const data = (await res.json()) as { announcements?: PlatformAnnouncement[] };
    setAnnouncements(data.announcements ?? []);
  }, [pathname]);

  useEffect(() => {
    void load();
  }, [load]);

  const dismiss = useCallback(
    async (id: string, frequency: PlatformAnnouncement["frequency"]) => {
      setHiddenIds((prev) => new Set(prev).add(id));
      void trackEvents(id, ["dismiss"]);

      if (frequency === "always" || frequency === "every_login") return;

      await fetch("/api/announcements/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          announcementId: id,
          anonymousId: getAnonymousId(),
        }),
      });
    },
    []
  );

  const visible = useMemo(
    () => announcements.filter((a) => !hiddenIds.has(a.id)),
    [announcements, hiddenIds]
  );

  useEffect(() => {
    for (const item of visible) {
      if (viewedRef.current.has(item.id)) continue;
      viewedRef.current.add(item.id);
      void trackEvents(item.id, ["view"]);
    }
  }, [visible]);

  const homeHero = useMemo(
    () => (pathname === "/" ? pickHighestPriority(visible, "homepage_hero") : null),
    [visible, pathname]
  );

  const topBanner = pickHighestPriority(visible, "top_banner");
  const ticker = pickHighestPriority(visible, "scrolling_ticker");
  const liveBanner = pickHighestPriority(visible, "live_event_banner");
  const welcomePopup = pickHighestPriority(visible, "welcome_popup");
  const floatingToast = pickHighestPriority(visible, "floating_toast");

  useEffect(() => {
    if (!welcomePopup) {
      setShowWelcome(false);
      return;
    }
    const timer = window.setTimeout(() => setShowWelcome(true), 600);
    return () => window.clearTimeout(timer);
  }, [welcomePopup?.id]);

  const value = useMemo(
    () => ({ announcements: visible, homeHero, refresh: load }),
    [visible, homeHero, load]
  );

  if (isAdminPath(pathname)) {
    return <>{children}</>;
  }

  return (
    <AnnouncementContext.Provider value={value}>
      {ticker ? <AnnouncementScrollingTicker announcement={ticker} /> : null}
      {topBanner ? (
        <AnnouncementTopBanner
          announcement={topBanner}
          onDismiss={
            topBanner.dismissible
              ? () => void dismiss(topBanner.id, topBanner.frequency)
              : undefined
          }
        />
      ) : null}
      {liveBanner ? (
        <AnnouncementLiveEventBanner
          announcement={liveBanner}
          onDismiss={
            liveBanner.dismissible
              ? () => void dismiss(liveBanner.id, liveBanner.frequency)
              : undefined
          }
        />
      ) : null}
      {children}
      {welcomePopup && showWelcome ? (
        <AnnouncementWelcomePopup
          announcement={welcomePopup}
          onDismiss={
            welcomePopup.dismissible
              ? () => void dismiss(welcomePopup.id, welcomePopup.frequency)
              : undefined
          }
          onPrimaryClick={() => void trackEvents(welcomePopup.id, ["click"])}
          onSecondaryClick={() => void trackEvents(welcomePopup.id, ["secondary_click"])}
        />
      ) : null}
      {floatingToast ? (
        <div className="fixed bottom-4 right-4 z-50 pointer-events-auto">
          <AnnouncementFloatingToast
            announcement={floatingToast}
            onDismiss={
              floatingToast.dismissible
                ? () => void dismiss(floatingToast.id, floatingToast.frequency)
                : undefined
            }
          />
        </div>
      ) : null}
    </AnnouncementContext.Provider>
  );
}

export function useAnnouncements(): AnnouncementContextValue {
  const ctx = useContext(AnnouncementContext);
  if (!ctx) {
    return { announcements: [], homeHero: null, refresh: async () => {} };
  }
  return ctx;
}
