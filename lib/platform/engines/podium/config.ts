import { getAdminConfig } from "@/lib/platform/ecosystem/adminConfig";
import type { EcosystemAdminConfig } from "@/lib/platform/ecosystem/config";
import type {
  PodiumConfig,
  PodiumContestKind,
  PodiumEngineConfig,
} from "@/lib/platform/engines/podium/types";

export type { PodiumEngineConfig } from "@/lib/platform/engines/podium/types";

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
  placement: {
    topN: 3,
    enabledPlacements: [1, 2, 3],
  },
};

export const DEFAULT_PODIUM_ENGINE_CONFIG: PodiumEngineConfig = {
  enabled: false,
  defaultConfig: DEFAULT_PODIUM_CONFIG,
  topN: {
    enabled: false,
    maxPlacements: 3,
  },
  ceremonyTemplates: {
    headline: "Podium Ceremony™ — {contest}",
    first: "{player} took 🥇 in {contest} — championship moment.",
    second: "{player} earned 🥈 in {contest} — podium finish.",
    third: "{player} claimed 🥉 in {contest} — premium rewards unlocked.",
    nearPerfect: "{player} earned Near Perfect™ in {contest} — so close to the podium.",
  },
  contestKindOverrides: {},
  geoChampionships: {
    enabled: false,
    scopes: ["global", "national", "regional", "league"],
  },
  seasonal: {
    enabled: true,
  },
  sponsoredEvents: {
    enabled: false,
  },
};

/** Huddle / feed highlight templates — scaffold for CommunityCore™. */
export const PODIUM_HUDDLE_TEMPLATES = DEFAULT_PODIUM_ENGINE_CONFIG.ceremonyTemplates;

type PodiumEngineConfigOverride = Omit<Partial<PodiumEngineConfig>, "defaultConfig"> & {
  defaultConfig?: Partial<PodiumConfig>;
};

function parseEnvPodiumEngineOverride(): PodiumEngineConfigOverride | null {
  const raw =
    process.env.PODIUM_ENGINE_CONFIG_JSON ?? process.env.PODIUM_CONFIG_JSON;
  if (!raw) {
    if (
      process.env.PODIUM_ENABLED === "true" ||
      process.env.PODIUM_ENGINE_ENABLED === "true"
    ) {
      return {
        enabled: true,
        defaultConfig: { ...DEFAULT_PODIUM_CONFIG, enabled: true },
      };
    }
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<PodiumEngineConfig> & Partial<PodiumConfig>;
    if ("defaultConfig" in parsed || "contestKindOverrides" in parsed) {
      return parsed as PodiumEngineConfigOverride;
    }
    return { defaultConfig: parsed as Partial<PodiumConfig> };
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
    placement: override.placement
      ? { ...base.placement!, ...override.placement }
      : base.placement,
  };
}

function mergePodiumEngineConfig(
  base: PodiumEngineConfig,
  override?: PodiumEngineConfigOverride | null
): PodiumEngineConfig {
  if (!override) return base;
  return {
    ...base,
    ...override,
    defaultConfig: mergePodiumConfig(base.defaultConfig, override.defaultConfig),
    topN: { ...base.topN, ...override.topN },
    ceremonyTemplates: { ...base.ceremonyTemplates, ...override.ceremonyTemplates },
    contestKindOverrides: {
      ...base.contestKindOverrides,
      ...override.contestKindOverrides,
    },
    geoChampionships: override.geoChampionships
      ? { ...base.geoChampionships, ...override.geoChampionships }
      : base.geoChampionships,
    seasonal: { ...base.seasonal, ...override.seasonal },
    sponsoredEvents: { ...base.sponsoredEvents, ...override.sponsoredEvents },
  };
}

/** Resolve full PodiumEngine™ admin config — env → admin JSON → defaults. */
export async function getPodiumEngineConfig(): Promise<PodiumEngineConfig> {
  const envOverride = parseEnvPodiumEngineOverride();
  let adminOverride: PodiumEngineConfigOverride | null = null;

  try {
    const engineAdmin = await getAdminConfig(
      "podiumEngine" as keyof EcosystemAdminConfig
    );
    if (engineAdmin && typeof engineAdmin === "object" && Object.keys(engineAdmin).length > 0) {
      adminOverride = engineAdmin as PodiumEngineConfigOverride;
    }
  } catch {
    /* admin table may not have podiumEngine key yet */
  }

  if (!adminOverride) {
    try {
      const legacyAdmin = await getAdminConfig("podium" as keyof EcosystemAdminConfig);
      if (legacyAdmin && typeof legacyAdmin === "object" && Object.keys(legacyAdmin).length > 0) {
        adminOverride = { defaultConfig: legacyAdmin as Partial<PodiumConfig> };
      }
    } catch {
      /* legacy podium key */
    }
  }

  const merged = mergePodiumEngineConfig(
    mergePodiumEngineConfig(DEFAULT_PODIUM_ENGINE_CONFIG, envOverride),
    adminOverride
  );

  if (merged.enabled && !merged.defaultConfig.enabled) {
    merged.defaultConfig = { ...merged.defaultConfig, enabled: true };
  }

  return merged;
}

/** Resolve effective podium config for a contest kind. */
export async function getPodiumConfig(
  kind?: PodiumContestKind
): Promise<PodiumConfig> {
  const engine = await getPodiumEngineConfig();
  const kindOverride = kind ? engine.contestKindOverrides[kind] : undefined;

  let config = mergePodiumConfig(engine.defaultConfig, kindOverride);

  if (engine.enabled && !config.enabled) {
    config = { ...config, enabled: true };
  }

  return config;
}

export function podiumRewardSource(
  kind: string,
  contestId: string,
  email: string,
  placement: number
): string {
  return `podium:${kind}:${contestId}:${email.toLowerCase()}:p${placement}`;
}
