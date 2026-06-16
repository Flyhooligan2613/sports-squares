import {
  completeGenesisMission,
  getGenesisProgress,
  initializeGenesisAccount,
  listGenesisMissions,
  syncAutoCompletableMissions,
} from "@/lib/platform/engines/genesis/MissionCenterService";
import { resolveNextStep } from "@/lib/platform/engines/genesis/NextStepEngine";
import { computeCareerProgress } from "@/lib/platform/engines/genesis/CareerProgressService";
import { getDailyMotivation } from "@/lib/platform/engines/genesis/DailyMotivationService";
import {
  buildFirstWinCelebration,
  markFirstWinCelebrated,
} from "@/lib/platform/engines/genesis/FirstWinExperience";
import {
  buildFirstLossEncouragement,
  markFirstLossEncouraged,
} from "@/lib/platform/engines/genesis/FirstLossExperience";
import { buildRookieSeasonState } from "@/lib/platform/engines/genesis/RookieSeasonService";
import { fetchGenesisProfile } from "@/lib/platform/engines/genesis/repository";
import type { GenesisMissionId, GenesisScreenContext } from "@/lib/platform/engines/genesis/types";

/** Project Genesis™ — first 30 minutes rookie experience orchestrator. */
export const GenesisEngine = {
  initializeAccount: initializeGenesisAccount,
  getProgress: getGenesisProgress,
  syncMissions: syncAutoCompletableMissions,
  completeMission: completeGenesisMission,
  listMissions: listGenesisMissions,
  getNextStep: async (email: string, context: GenesisScreenContext) => {
    const progress = await getGenesisProgress(email);
    if (!progress) return null;
    return resolveNextStep(context, progress.missions);
  },
  getCareerProgress: async (email: string) => {
    const progress = await getGenesisProgress(email);
    return progress?.career ?? computeCareerProgress([]);
  },
  getDailyMotivation,
  getRookieSeason: async (email: string) => {
    const profile = await fetchGenesisProfile(email);
    if (!profile) return buildRookieSeasonState(null, null);
    return buildRookieSeasonState(profile.rookieSeasonStartedAt, profile.rookieSeasonEndsAt);
  },
  celebrateFirstWin: markFirstWinCelebrated,
  buildFirstWinCelebration,
  encourageFirstLoss: markFirstLossEncouraged,
  buildFirstLossEncouragement,
  isGenesisAccount: async (email: string) => {
    const profile = await fetchGenesisProfile(email);
    return Boolean(profile?.genesisInitializedAt);
  },
  trackPageVisit: async (email: string, missionId: GenesisMissionId) => {
    const visitMissions: GenesisMissionId[] = [
      "visit_trophy_room",
      "open_community_feed",
      "view_todays_contests",
    ];
    if (!visitMissions.includes(missionId)) {
      return { ok: false, error: "Not a visit-tracked mission." };
    }
    return completeGenesisMission(email, missionId);
  },
};

export type GenesisEngineType = typeof GenesisEngine;
