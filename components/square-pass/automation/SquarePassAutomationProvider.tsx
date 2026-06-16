"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type {
  SquarePassExperienceId,
  SquarePassExperienceStep,
} from "@/lib/platform/engines/squarePass/automation/types";
import WelcomeCelebrationModal from "./WelcomeCelebrationModal";
import MysterySquarePassModal from "./MysterySquarePassModal";
import WelcomeRewardRevealModal from "./WelcomeRewardRevealModal";
import FounderRecognitionModal from "./FounderRecognitionModal";
import WhatsNextModal from "./WhatsNextModal";
import ProfileCustomizationPrompt from "./ProfileCustomizationPrompt";
import DailySquarePassModal from "./DailySquarePassModal";
import FlashEventModal from "./FlashEventModal";
import SurpriseRewardModal from "./SurpriseRewardModal";

interface AutomationContextValue {
  queue: SquarePassExperienceStep[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const AutomationContext = createContext<AutomationContextValue | null>(null);

async function completeStep(
  step: SquarePassExperienceId,
  metadata?: { flashCampaignSlug?: string; surpriseSlug?: string }
) {
  await fetch("/api/square-pass/automation/complete-step", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ step, ...metadata }),
  });
}

export function SquarePassAutomationProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<SquarePassExperienceStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/square-pass/automation/queue", {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) {
        setQueue([]);
        return;
      }
      const json = (await res.json()) as { queue?: SquarePassExperienceStep[] };
      setQueue(json.queue ?? []);
      setCurrentIndex(0);
    } catch {
      setQueue([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const current = queue[currentIndex] ?? null;

  const advance = useCallback(async () => {
    setCurrentIndex((i) => i + 1);
  }, []);

  const handleComplete = useCallback(
    async (
      step: SquarePassExperienceId,
      metadata?: { flashCampaignSlug?: string; surpriseSlug?: string }
    ) => {
      await completeStep(step, metadata);
      await advance();
    },
    [advance]
  );

  const value = useMemo(
    () => ({ queue, loading, refresh }),
    [queue, loading, refresh]
  );

  if (loading || !current) {
    return (
      <AutomationContext.Provider value={value}>{children}</AutomationContext.Provider>
    );
  }

  return (
    <AutomationContext.Provider value={value}>
      {children}

      <WelcomeCelebrationModal
        open={current.id === "welcome"}
        onContinue={() => void handleComplete("welcome")}
      />

      <MysterySquarePassModal
        open={current.id === "mystery"}
        onRevealed={() => undefined}
        onContinue={() => void handleComplete("mystery")}
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

      <WhatsNextModal
        open={current.id === "whats_next"}
        missions={current.payload?.missions}
        onContinue={() => void handleComplete("whats_next")}
      />

      <ProfileCustomizationPrompt
        open={current.id === "profile_customization"}
        onContinue={() => void handleComplete("profile_customization")}
      />

      <DailySquarePassModal
        open={current.id === "daily_bonus"}
        onContinue={() => void handleComplete("daily_bonus")}
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

      <SurpriseRewardModal
        open={current.id === "surprise"}
        surpriseSlug={current.payload?.surpriseSlug}
        onContinue={() =>
          void handleComplete("surprise", {
            surpriseSlug: current.payload?.surpriseSlug ?? "rookie_surprise_day1",
          })
        }
      />
    </AutomationContext.Provider>
  );
}

export function useSquarePassAutomation() {
  const ctx = useContext(AutomationContext);
  if (!ctx) {
    throw new Error("useSquarePassAutomation must be used within SquarePassAutomationProvider");
  }
  return ctx;
}

export function useSquarePassAutomationOptional() {
  return useContext(AutomationContext);
}
