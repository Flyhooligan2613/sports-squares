"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { OnboardingModuleId, OnboardingQueueStep } from "@/lib/platform/engines/onboardingQueue";
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

interface OnboardingQueueContextValue {
  current: OnboardingQueueStep | null;
  loading: boolean;
  debugMode: boolean;
  refresh: () => Promise<void>;
}

const OnboardingQueueContext = createContext<OnboardingQueueContextValue | null>(null);

async function postComplete(
  moduleId: OnboardingModuleId,
  metadata?: Record<string, unknown>
) {
  await fetch("/api/onboarding-queue/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ moduleId, metadata }),
  });
}

export function OnboardingQueueProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [current, setCurrent] = useState<OnboardingQueueStep | null>(null);
  const [loading, setLoading] = useState(true);
  const [debugMode, setDebugMode] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/onboarding-queue/queue", {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) {
        setCurrent(null);
        return;
      }
      const json = (await res.json()) as {
        nextModule?: OnboardingQueueStep | null;
        debugMode?: boolean;
      };
      setCurrent(json.nextModule ?? null);
      setDebugMode(Boolean(json.debugMode));
    } catch {
      setCurrent(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleComplete = useCallback(
    async (moduleId: OnboardingModuleId, metadata?: Record<string, unknown>) => {
      await postComplete(moduleId, metadata);
      if (moduleId === "choose_journey" && metadata?.journeyHref) {
        router.push(String(metadata.journeyHref));
      }
      await refresh();
    },
    [refresh, router]
  );

  const value = useMemo(
    () => ({ current, loading, debugMode, refresh }),
    [current, loading, debugMode, refresh]
  );

  if (loading || !current) {
    return (
      <OnboardingQueueContext.Provider value={value}>{children}</OnboardingQueueContext.Provider>
    );
  }

  return (
    <OnboardingQueueContext.Provider value={value}>
      {children}

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
        onContinue={() => {
          void handleComplete("navigate_dashboard");
          router.push("/my-games");
        }}
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
    </OnboardingQueueContext.Provider>
  );
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
