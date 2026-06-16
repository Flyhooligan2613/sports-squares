"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type { OnboardingModuleId, OnboardingQueueStep } from "@/lib/platform/engines/onboardingQueue";
import {
  ONBOARDING_DASHBOARD_HREF,
  POST_ONBOARDING_ENGAGEMENT_MODULES,
} from "@/lib/platform/engines/onboardingQueue/config";
import WelcomeCelebrationModal from "@/components/square-pass/automation/WelcomeCelebrationModal";
import MysterySquarePassModal from "@/components/square-pass/automation/MysterySquarePassModal";
import WelcomeRewardRevealModal from "@/components/square-pass/automation/WelcomeRewardRevealModal";
import FounderRecognitionModal from "@/components/square-pass/automation/FounderRecognitionModal";
import WhatsNextModal from "@/components/square-pass/automation/WhatsNextModal";
import ProfileCustomizationPrompt from "@/components/square-pass/automation/ProfileCustomizationPrompt";
import DailySquarePassModal from "@/components/square-pass/automation/DailySquarePassModal";
import FlashEventModal from "@/components/square-pass/automation/FlashEventModal";
import SurpriseRewardModal from "@/components/square-pass/automation/SurpriseRewardModal";
import ChooseJourneyModal from "./ChooseJourneyModal";
import CompetitorScoreOnboardingModal from "./CompetitorScoreOnboardingModal";
import BirthdayRewardModal from "./BirthdayRewardModal";
import SeasonEventModal from "./SeasonEventModal";
import NavigateDashboardModal from "./NavigateDashboardModal";
import { OnboardingQueueErrorBoundary } from "./OnboardingQueueErrorBoundary";

interface OnboardingQueueContextValue {
  current: OnboardingQueueStep | null;
  loading: boolean;
  debugMode: boolean;
  refresh: () => Promise<void>;
}

const OnboardingQueueContext = createContext<OnboardingQueueContextValue | null>(null);

const ENGAGEMENT_DEFER_MS = 900;
const REFRESH_MIN_MS = 2500;
const ENGAGEMENT_SET = new Set<string>(POST_ONBOARDING_ENGAGEMENT_MODULES);

function isPostOnboardingEngagement(id: OnboardingModuleId): boolean {
  return ENGAGEMENT_SET.has(id);
}

async function postComplete(
  moduleId: OnboardingModuleId,
  metadata?: Record<string, unknown>
): Promise<boolean> {
  try {
    const res = await fetch("/api/onboarding-queue/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ moduleId, metadata }),
    });
    if (!res.ok) {
      console.warn("[onboarding-queue] complete failed", moduleId, res.status);
    }
    return res.ok;
  } catch (err) {
    console.warn("[onboarding-queue] complete error", moduleId, err);
    return false;
  }
}

function OnboardingQueueProviderInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const mountedRef = useRef(true);
  const completingRef = useRef(false);
  const deferEngagementRef = useRef(false);
  const pendingEngagementRef = useRef<OnboardingQueueStep | null>(null);
  const engagementTimerRef = useRef<number | null>(null);
  const lastRefreshAtRef = useRef(0);

  const [current, setCurrent] = useState<OnboardingQueueStep | null>(null);
  const [loading, setLoading] = useState(true);
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (engagementTimerRef.current != null) {
        window.clearTimeout(engagementTimerRef.current);
      }
    };
  }, []);

  const applyQueueStep = useCallback((step: OnboardingQueueStep | null) => {
    if (!mountedRef.current) return;

    if (step && deferEngagementRef.current && isPostOnboardingEngagement(step.id)) {
      pendingEngagementRef.current = step;
      setCurrent(null);
      return;
    }

    pendingEngagementRef.current = null;
    setCurrent(step);
  }, []);

  const refresh = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - lastRefreshAtRef.current < REFRESH_MIN_MS) {
      return;
    }
    lastRefreshAtRef.current = now;

    try {
      const res = await fetch("/api/onboarding-queue/queue", {
        cache: "no-store",
        credentials: "include",
      });
      if (!mountedRef.current) return;
      if (!res.ok) {
        setCurrent(null);
        return;
      }
      const json = (await res.json()) as {
        nextModule?: OnboardingQueueStep | null;
        debugMode?: boolean;
      };
      const next = json.nextModule;
      if (next && typeof next.id !== "string") {
        applyQueueStep(null);
      } else {
        applyQueueStep(next ?? null);
      }
      setDebugMode(Boolean(json.debugMode));
    } catch (err) {
      console.warn("[onboarding-queue] refresh error", err);
      if (mountedRef.current) setCurrent(null);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [applyQueueStep]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const scheduleDeferredEngagement = useCallback(() => {
    if (engagementTimerRef.current != null) {
      window.clearTimeout(engagementTimerRef.current);
    }

    engagementTimerRef.current = window.setTimeout(() => {
      engagementTimerRef.current = null;
      if (!mountedRef.current) return;

      deferEngagementRef.current = false;
      const pending = pendingEngagementRef.current;
      if (pending) {
        pendingEngagementRef.current = null;
        setCurrent(pending);
        return;
      }
      void refresh(true);
    }, ENGAGEMENT_DEFER_MS);
  }, [refresh]);

  const handleComplete = useCallback(
    async (moduleId: OnboardingModuleId, metadata?: Record<string, unknown>) => {
      if (completingRef.current || !mountedRef.current) return;
      completingRef.current = true;

      try {
        const ok = await postComplete(moduleId, metadata);
        if (!ok || !mountedRef.current) return;

        if (moduleId === "navigate_dashboard") {
          deferEngagementRef.current = true;
          setCurrent(null);
        }

        await refresh(true);

        if (moduleId === "navigate_dashboard" && mountedRef.current) {
          router.replace(ONBOARDING_DASHBOARD_HREF);
          scheduleDeferredEngagement();
        }
      } finally {
        completingRef.current = false;
      }
    },
    [refresh, router, scheduleDeferredEngagement]
  );

  useEffect(() => {
    if (!deferEngagementRef.current || !pathname?.startsWith("/my-games")) return;
    scheduleDeferredEngagement();
  }, [pathname, scheduleDeferredEngagement]);

  const value = useMemo(
    () => ({ current, loading, debugMode, refresh }),
    [current, loading, debugMode, refresh]
  );

  const modals = current ? (
    <>
      <WelcomeCelebrationModal
        open={current.id === "welcome"}
        onContinue={() => void handleComplete("welcome")}
      />

      <MysterySquarePassModal
        open={current.id === "mystery_pass"}
        onRevealed={() => undefined}
        onContinue={() => void handleComplete("mystery_pass")}
      />

      <WelcomeRewardRevealModal
        open={current.id === "reward_reveal"}
        onContinue={() => void handleComplete("reward_reveal")}
      />

      <FounderRecognitionModal
        open={current.id === "founder"}
        founderNumber={current.payload?.founderNumber}
        founderLimit={current.payload?.founderLimit}
        onContinue={() => void handleComplete("founder")}
      />

      <BirthdayRewardModal
        open={current.id === "birthday"}
        rewardLabel={current.payload?.birthdayRewardLabel}
        onContinue={() => void handleComplete("birthday")}
      />

      <FlashEventModal
        open={current.id === "flash_event"}
        flashEndsAt={current.payload?.flashEndsAt}
        flashCampaignSlug={current.payload?.flashCampaignSlug}
        onContinue={() =>
          void handleComplete("flash_event", {
            flashCampaignSlug: current.payload?.flashCampaignSlug,
          })
        }
      />

      <SeasonEventModal
        open={current.id === "season_event"}
        title={current.payload?.seasonEventTitle}
        message={current.payload?.seasonEventMessage}
        onContinue={() => void handleComplete("season_event")}
      />

      <ProfileCustomizationPrompt
        open={current.id === "profile"}
        onContinue={() => void handleComplete("profile")}
      />

      <WhatsNextModal
        open={current.id === "missions"}
        missions={current.payload?.missions}
        onContinue={() => void handleComplete("missions")}
      />

      <CompetitorScoreOnboardingModal
        open={current.id === "competitor_score"}
        score={current.payload?.competitorScore}
        onContinue={() => void handleComplete("competitor_score")}
      />

      <ChooseJourneyModal
        open={current.id === "choose_journey"}
        options={current.payload?.journeyOptions}
        onSelect={(option) =>
          void handleComplete("choose_journey", { journeyHref: option.href, journeyId: option.id })
        }
      />

      <NavigateDashboardModal
        open={current.id === "navigate_dashboard"}
        onContinue={() => void handleComplete("navigate_dashboard")}
      />

      <DailySquarePassModal
        open={current.id === "daily_bonus"}
        onContinue={() => void handleComplete("daily_bonus")}
      />

      <SurpriseRewardModal
        open={current.id === "surprise"}
        surpriseSlug={current.payload?.surpriseSlug}
        onContinue={() =>
          void handleComplete("surprise", {
            surpriseSlug: current.payload?.surpriseSlug ?? "rookie_surprise_day1",
          })
        }
      />
    </>
  ) : null;

  return (
    <OnboardingQueueContext.Provider value={value}>
      {children}
      {!loading && current ? (
        <OnboardingQueueErrorBoundary name="OnboardingQueueModals">
          {modals}
        </OnboardingQueueErrorBoundary>
      ) : null}
    </OnboardingQueueContext.Provider>
  );
}

export function OnboardingQueueProvider({ children }: { children: React.ReactNode }) {
  return <OnboardingQueueProviderInner>{children}</OnboardingQueueProviderInner>;
}

export function useOnboardingQueue() {
  const ctx = useContext(OnboardingQueueContext);
  if (!ctx) {
    throw new Error("useOnboardingQueue must be used within OnboardingQueueProvider");
  }
  return ctx;
}

export function useOnboardingQueueOptional() {
  return useContext(OnboardingQueueContext);
}
