import { getAdminConfig } from "@/lib/platform/ecosystem/adminConfig";
import type { EcosystemAdminConfig } from "@/lib/platform/ecosystem/config";
import type { PodiumConfig } from "@/lib/platform/podium/types";

export const DEFAULT_PODIUM_CONFIG: PodiumConfig = {
  enabled: false,
  usePodiumCashSplit: true,
  cashSplit: {
    firstPct: 80,
    secondPct: 20,
    thirdPct: 0,
  },
  thirdPlacePackage: {
    tierCredits: 150,
    xpBonus: 50,
    competitorScoreBonus: 25,
    inventoryBadge: "podium_bronze",
    achievementId: "podium_third",
  },
  firstPlaceBonus: {
    tierCredits: 100,
    xpBonus: 75,
    competitorScoreBonus: 50,
  },
  secondPlaceBonus: {
    tierCredits: 75,
    xpBonus: 50,
    competitorScoreBonus: 35,
  },
  nearPerfect: {
    enabled: true,
    maxRankGap: 1,
    maxScoreGap: 1,
    tierCredits: 40,
    competitorScoreBonus: 15,
  },
};

/** Huddle / feed highlight templates — scaffold for CommunityCore™. */
export const PODIUM_HUDDLE_TEMPLATES = {
  first: "{player} took 🥇 in {contest} — championship moment.",
  second: "{player} earned 🥈 in {contest} — podium finish.",
  third: "{player} claimed 🥉 in {contest} — premium rewards unlocked.",
  nearPerfect: "{player} earned Near Perfect™ in {contest} — so close to the podium.",
} as const;

function parseEnvPodiumOverride(): Partial<PodiumConfig> | null {
  const raw = process.env.PODIUM_CONFIG_JSON;
  if (!raw) {
    if (process.env.PODIUM_ENABLED === "true") {
      return { enabled: true };
    }
    return null;
  }
  try {
    return JSON.parse(raw) as Partial<PodiumConfig>;
  } catch {
    return null;
  }
}

function mergePodiumConfig(
  base: PodiumConfig,
  override?: Partial<PodiumConfig> | null
): PodiumConfig {
  if (!override) return base;
  return {
    ...base,
    ...override,
    cashSplit: { ...base.cashSplit, ...override.cashSplit },
    thirdPlacePackage: { ...base.thirdPlacePackage, ...override.thirdPlacePackage },
    firstPlaceBonus: { ...base.firstPlaceBonus, ...override.firstPlaceBonus },
    secondPlaceBonus: { ...base.secondPlaceBonus, ...override.secondPlaceBonus },
    nearPerfect: { ...base.nearPerfect, ...override.nearPerfect },
  };
}

/** Resolve podium config — env override → admin JSON → defaults. */
export async function getPodiumConfig(): Promise<PodiumConfig> {
  const envOverride = parseEnvPodiumOverride();
  let adminOverride: Partial<PodiumConfig> | null = null;

  try {
    const admin = await getAdminConfig("podium" as keyof EcosystemAdminConfig);
    if (admin && typeof admin === "object" && Object.keys(admin).length > 0) {
      adminOverride = admin as Partial<PodiumConfig>;
    }
  } catch {
    /* admin table may not have podium key yet */
  }

  return mergePodiumConfig(
    mergePodiumConfig(DEFAULT_PODIUM_CONFIG, envOverride),
    adminOverride
  );
}

export function podiumRewardSource(
  kind: string,
  contestId: string,
  email: string,
  placement: number
): string {
  return `podium:${kind}:${contestId}:${email.toLowerCase()}:p${placement}`;
}
