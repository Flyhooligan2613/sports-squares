import { getDailyMotivation } from "@/lib/platform/engines/genesis/DailyMotivationService";
import {
  GENESIS_MISSIONS,
  GENESIS_STARTER_ACHIEVEMENTS,
  GENESIS_STARTING_COMPETITOR_SCORE,
} from "@/lib/platform/engines/genesis/config";
import { buildRookieSeasonState } from "@/lib/platform/engines/genesis/RookieSeasonService";
import {
  fetchGenesisProfile,
  fetchMissionProgress,
  patchGenesisProfile,
  seedMissionRows,
  upsertMissionProgress,
} from "@/lib/platform/engines/genesis/repository";
import { earnTierCredits } from "@/lib/platform/ecosystem/credits";
import { addInventoryItem } from "@/lib/platform/ecosystem/inventory";
import { updateEcosystemProfile } from "@/lib/platform/ecosystem/account";
import { DEFAULT_AVATAR } from "@/lib/platform/ecosystem/avatars";
import { getPlayerLegacy } from "@/lib/database/services/playerLegacy";
import { normalizeEmail } from "@/lib/player/statsCore";
import type {
  GenesisCompleteMissionResult,
  GenesisMissionId,
  GenesisMissionProgress,
  GenesisProgressSnapshot,
  GenesisStarterAchievement,
} from "@/lib/platform/engines/genesis/types";
import { computeRookieSeasonEnd } from "@/lib/platform/engines/genesis/RookieSeasonService";
import {
  GENESIS_MISSION_MAP,
  GENESIS_STARTER_ACHIEVEMENT_IDS,
  GENESIS_MISSIONS as MISSION_DEFS,
} from "@/lib/platform/engines/genesis/config";
import { computeCareerProgress } from "@/lib/platform/engines/genesis/CareerProgressService";

function isMissionUnlocked(
  missionId: GenesisMissionId,
  completed: Set<GenesisMissionId>
): boolean {
  const def = GENESIS_MISSION_MAP[missionId];
  if (!def.unlockAfter?.length) return true;
  return def.unlockAfter.every((id) => completed.has(id));
}

function mapStarterAchievements(
  ids: string[],
  initializedAt: string
): GenesisStarterAchievement[] {
  return ids
    .filter((id): id is keyof typeof GENESIS_STARTER_ACHIEVEMENTS => id in GENESIS_STARTER_ACHIEVEMENTS)
    .map((id) => ({
      ...GENESIS_STARTER_ACHIEVEMENTS[id],
      unlockedAt: initializedAt,
    }));
}

async function grantMissionRewards(
  email: string,
  missionId: GenesisMissionId
): Promise<{ xpAwarded: number; rewardMetadata: Record<string, unknown> }> {
  const def = GENESIS_MISSION_MAP[missionId];
  let xpAwarded = 0;
  const rewardMetadata: Record<string, unknown> = { rewards: [] as string[] };

  for (const reward of def.rewards) {
    if (reward.type === "xp" && reward.amount) {
      xpAwarded += reward.amount;
      await earnTierCredits({
        email,
        amount: reward.amount,
        source: "genesis_mission",
        metadata: { missionId },
      });
      (rewardMetadata.rewards as string[]).push(reward.label);
    }

    if (reward.type === "badge" && reward.itemId) {
      await addInventoryItem({
        email,
        itemType: "badge",
        title: reward.label,
        metadata: { badgeId: reward.itemId, missionId },
        source: "genesis_mission",
      });
      (rewardMetadata.rewards as string[]).push(reward.label);
    }

    if (reward.type === "avatar_frame" && reward.itemId) {
      await addInventoryItem({
        email,
        itemType: "cosmetic",
        title: reward.label,
        metadata: { frameId: reward.itemId, missionId },
        source: "genesis_mission",
      });
      await updateEcosystemProfile(email, { profile_frame_id: reward.itemId });
      (rewardMetadata.rewards as string[]).push(reward.label);
    }
  }

  return { xpAwarded, rewardMetadata };
}

export async function initializeGenesisAccount(email: string): Promise<void> {
  const normalized = normalizeEmail(email);
  const existing = await fetchGenesisProfile(normalized);
  if (existing?.genesisInitializedAt) return;

  const now = new Date();
  const startedAt = now.toISOString();
  const endsAt = computeRookieSeasonEnd(now);

  await updateEcosystemProfile(normalized, {
    genesis_initialized_at: startedAt,
    rookie_season_started_at: startedAt,
    rookie_season_ends_at: endsAt,
    genesis_achievements: GENESIS_STARTER_ACHIEVEMENT_IDS,
    genesis_customization_unlocked: true,
    genesis_missions_completed: 0,
  });

  await seedMissionRows(
    normalized,
    MISSION_DEFS.map((m) => m.id)
  );
}

export async function syncAutoCompletableMissions(email: string): Promise<void> {
  const normalized = normalizeEmail(email);
  const [profile, progress, legacy] = await Promise.all([
    fetchGenesisProfile(normalized),
    fetchMissionProgress(normalized),
    getPlayerLegacy(normalized),
  ]);

  if (!profile?.genesisInitializedAt) return;

  const completed = new Set(
    progress.filter((p) => p.status === "completed").map((p) => p.missionId)
  );

  const checks: Partial<Record<GenesisMissionId, boolean>> = {
    complete_profile: profile.usernameCustomized && profile.profileBio.trim().length >= 8,
    upload_profile_picture:
      profile.avatarEmoji !== DEFAULT_AVATAR || Boolean(profile.profileFrameId),
    follow_three_competitors: profile.followingCount >= 3,
    join_first_contest: (legacy?.stats.boardsPlayed ?? 0) >= 1,
    complete_first_contest: (legacy?.stats.boardsPlayed ?? 0) >= 1,
  };

  for (const [missionId, shouldComplete] of Object.entries(checks) as [
    GenesisMissionId,
    boolean | undefined,
  ][]) {
    if (!shouldComplete || completed.has(missionId)) continue;
    if (!isMissionUnlocked(missionId, completed)) continue;
    await completeGenesisMission(normalized, missionId);
  }
}

export async function completeGenesisMission(
  email: string,
  missionId: GenesisMissionId
): Promise<GenesisCompleteMissionResult> {
  const normalized = normalizeEmail(email);
  const profile = await fetchGenesisProfile(normalized);
  if (!profile?.genesisInitializedAt) {
    return { ok: false, error: "Genesis not initialized." };
  }

  const progress = await fetchMissionProgress(normalized);
  const existing = progress.find((p) => p.missionId === missionId);
  if (existing?.status === "completed") {
    return { ok: true, mission: existing, alreadyCompleted: true };
  }

  const completed = new Set(
    progress.filter((p) => p.status === "completed").map((p) => p.missionId)
  );
  if (!isMissionUnlocked(missionId, completed)) {
    return { ok: false, error: "Mission locked — complete prior missions first." };
  }

  const { xpAwarded, rewardMetadata } = await grantMissionRewards(normalized, missionId);
  const completedAt = new Date().toISOString();

  await upsertMissionProgress(normalized, missionId, {
    status: "completed",
    completedAt,
    xpAwarded,
    rewardMetadata,
  });

  await patchGenesisProfile(normalized, {
    genesis_missions_completed: profile.genesisMissionsCompleted + 1,
  });

  const mission: GenesisMissionProgress = {
    missionId,
    status: "completed",
    completedAt,
    xpAwarded,
    rewardMetadata,
  };

  return { ok: true, mission, xpAwarded };
}

export async function getGenesisProgress(email: string): Promise<GenesisProgressSnapshot | null> {
  const normalized = normalizeEmail(email);
  await syncAutoCompletableMissions(normalized);

  const profile = await fetchGenesisProfile(normalized);
  if (!profile?.genesisInitializedAt) return null;

  const progress = await fetchMissionProgress(normalized);
  const missions = GENESIS_MISSIONS.map((def) => {
    const row = progress.find((p) => p.missionId === def.id);
    return (
      row ?? {
        missionId: def.id,
        status: "pending" as const,
        completedAt: null,
        xpAwarded: 0,
        rewardMetadata: {},
      }
    );
  });

  const rookieSeason = buildRookieSeasonState(
    profile.rookieSeasonStartedAt,
    profile.rookieSeasonEndsAt
  );

  const starterAchievements = mapStarterAchievements(
    profile.genesisAchievements,
    profile.genesisInitializedAt
  );

  const legacy = await getPlayerLegacy(normalized);

  return {
    initialized: true,
    rookieSeason,
    missions,
    starterAchievements,
    career: computeCareerProgress(missions),
    motivation: getDailyMotivation(normalized),
    customizationUnlocked: profile.genesisCustomizationUnlocked,
    startingCompetitorScore: GENESIS_STARTING_COMPETITOR_SCORE,
    firstWinPendingCelebration:
      (legacy?.stats.lifetimeWins ?? 0) >= 1 && !profile.firstWinCelebratedAt,
    firstLossPendingEncouragement: false,
  };
}

export function listGenesisMissions() {
  return GENESIS_MISSIONS;
}
