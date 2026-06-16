import type { OnboardingModuleId } from "./types";
import { upsertAutomationState } from "@/lib/platform/engines/squarePass/automation/repository";
import { grantFounderRecognition } from "@/lib/platform/engines/squarePass/automation/FounderRecognitionService";
import { grantFlashEventReward } from "@/lib/platform/engines/squarePass/automation/FlashEventService";
import { distributeRewards } from "@/lib/platform/engines/squarePass/RewardDistributionService";

const STEP_TIMESTAMP_MAP: Partial<
  Record<
    OnboardingModuleId,
    | "welcomeCompletedAt"
    | "mysteryRevealedAt"
    | "rewardRevealCompletedAt"
    | "founderClaimedAt"
    | "whatsNextCompletedAt"
    | "profileCustomizationCompletedAt"
  >
> = {
  welcome: "welcomeCompletedAt",
  mystery_pass: "mysteryRevealedAt",
  reward_reveal: "rewardRevealCompletedAt",
  founder: "founderClaimedAt",
  missions: "whatsNextCompletedAt",
  profile: "profileCustomizationCompletedAt",
};

const LEGACY_ID_MAP: Partial<Record<OnboardingModuleId, string>> = {
  mystery_pass: "mystery",
  profile: "profile_customization",
  missions: "whats_next",
};

export async function syncAutomationStateFromQueue(
  email: string,
  moduleId: OnboardingModuleId,
  metadata?: Record<string, unknown>
): Promise<void> {
  const now = new Date().toISOString();
  const legacyId = LEGACY_ID_MAP[moduleId] ?? moduleId;
  const patch: Parameters<typeof upsertAutomationState>[1] = {};

  const { fetchAutomationState } = await import(
    "@/lib/platform/engines/squarePass/automation/repository"
  );
  const existing = await fetchAutomationState(email);
  const completed = new Set(existing?.experiencesCompleted ?? []);
  completed.add(legacyId);
  patch.experiencesCompleted = Array.from(completed);

  const tsKey = STEP_TIMESTAMP_MAP[moduleId];
  if (tsKey) {
    (patch as Record<string, unknown>)[tsKey] = now;
  }

  if (moduleId === "founder") {
    await grantFounderRecognition(email);
    patch.founderClaimedAt = now;
  }

  if (moduleId === "flash_event" && metadata?.flashCampaignSlug) {
    patch.flashEventsSeen = [
      ...(existing?.flashEventsSeen ?? []),
      String(metadata.flashCampaignSlug),
    ];
    await grantFlashEventReward(email, String(metadata.flashCampaignSlug));
  }

  if (moduleId === "surprise" && metadata?.surpriseSlug) {
    patch.surprisesClaimed = [
      ...(existing?.surprisesClaimed ?? []),
      String(metadata.surpriseSlug),
    ];
    await distributeRewards(
      email,
      [{ type: "xp", amount: 75, label: "75 Surprise XP" }],
      `square_pass_surprise_${metadata.surpriseSlug}`
    );
  }

  if (moduleId === "daily_bonus") {
    patch.lastDailyBonusAt = now;
  }

  if (moduleId === "birthday") {
    completed.add("birthday");
    patch.experiencesCompleted = Array.from(completed);
  }

  await upsertAutomationState(email, patch);
}
