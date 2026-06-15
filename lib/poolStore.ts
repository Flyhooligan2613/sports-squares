import { normalizeEspnSport } from "@/lib/espn/sports";
import type {
  AdminStats,
  ClaimResult,
  EspnSport,
  Participant,
  PayoutPercentages,
  PayoutStatus,
  PayoutTemplate,
  PlayerContactInput,
  PlayerInviteInfo,
  Pool,
  ScoringPeriod,
} from "@/lib/types";
import { isDatabaseConfigured } from "@/lib/database/client";
import { isPhase2Read } from "@/lib/database/config";
import { dbSyncSquaresFromPool } from "@/lib/database/services/squares";
import { buildPayoutConfig } from "@/lib/payoutTemplates";
import { applyPayoutsToHistory, poolHasFinancials } from "@/lib/poolFinance";
import { shuffleInnerSquareNumbers } from "@/lib/utils";
import type { PoolLoadOptions } from "@/lib/database/services/pools";
import {
  dbCreatePlayer,
  dbEnsureInviteToken,
  dbUpdatePlayer,
  dbUpdatePlayerCredits,
  dbUpdatePlayerPayment,
} from "@/lib/database/services/players";
import {
  dbCreatePool,
  dbDuplicatePool,
  dbGetPool,
  dbListPools,
  dbSyncSquareDigits,
  dbUpdatePoolFields,
  dbUpsertPool,
} from "@/lib/database/services/pools";
import { dbMigratePoolSnapshot } from "@/lib/database/services/migrate";
import {
  dbRecalculateWinnerPayouts,
  dbUpdateWinnerPayoutStatus,
} from "@/lib/database/services/winners";
import { completePayoutJobManually } from "@/lib/payouts/payoutJobs";
import { loadWinnerHistory } from "@/lib/winnerStorage";
import { mockDB } from "@/lib/mockData";

async function writeLocal(pool: Pool): Promise<void> {
  if (isPhase2Read()) return;
  mockDB.importPool(pool);
}

async function recalculateWinnerPayoutsForPool(
  poolId: string,
  pool: Pool
): Promise<void> {
  try {
    const history = await loadWinnerHistory(poolId);
    const withPayouts = applyPayoutsToHistory(history, pool);
    await dbRecalculateWinnerPayouts(poolId, withPayouts);
  } catch {
    // Best-effort — migrations may be pending.
  }
}

async function persistPool(pool: Pool): Promise<void> {
  if (isDatabaseConfigured()) {
    await dbUpsertPool(pool);
    await dbSyncSquaresFromPool(pool);
  }
  await writeLocal(pool);
}

async function readPool(
  id: string,
  options: PoolLoadOptions = {}
): Promise<Pool | undefined> {
  if (isDatabaseConfigured()) {
    try {
      const fromDb = await dbGetPool(id, options);
      if (fromDb) return fromDb;

      if (!isPhase2Read()) {
        const local = mockDB.getPool(id);
        if (local) {
          await dbMigratePoolSnapshot(local).catch(() => undefined);
          return local;
        }
      }
      return undefined;
    } catch {
      if (!isPhase2Read()) return mockDB.getPool(id);
      return undefined;
    }
  }

  return mockDB.getPool(id);
}

async function readAllPools(): Promise<Pool[]> {
  if (isDatabaseConfigured()) {
    try {
      const fromDb = await dbListPools();

      if (isPhase2Read()) return fromDb;

      const localPools = mockDB.listPools();
      const merged = new Map<string, Pool>();

      for (const pool of localPools) {
        merged.set(pool.id, pool);
      }
      for (const pool of fromDb) {
        merged.set(pool.id, pool);
      }

      return Array.from(merged.values());
    } catch {
      return mockDB.listPools();
    }
  }

  return mockDB.listPools();
}

export const poolStore = {
  async listPools(): Promise<Pool[]> {
    return readAllPools();
  },

  async getPool(
    id: string,
    options: PoolLoadOptions = {}
  ): Promise<Pool | undefined> {
    return readPool(id, options);
  },

  async duplicatePool(poolId: string): Promise<Pool | undefined> {
    if (isDatabaseConfigured()) {
      try {
        const duplicated = await dbDuplicatePool(poolId);
        if (!duplicated) return undefined;
        await writeLocal(duplicated);
        return duplicated;
      } catch {
        return undefined;
      }
    }

    return mockDB.duplicatePool(poolId);
  },

  async createPool(data: {
    name: string;
    homeTeam: string;
    awayTeam: string;
  }): Promise<Pool> {
    if (isDatabaseConfigured()) {
      try {
        const pool = await dbCreatePool(data);
        await writeLocal(pool);
        return pool;
      } catch {
        // fall through to localStorage
      }
    }

    const pool = mockDB.createPool(data);
    if (isDatabaseConfigured()) {
      await dbMigratePoolSnapshot(pool).catch(() => undefined);
    }
    return pool;
  },

  async createPlayer(
    poolId: string,
    name: string,
    creditsPurchased: number,
    contact?: PlayerContactInput
  ): Promise<Pool | undefined> {
    if (isDatabaseConfigured()) {
      try {
        const updated = await dbCreatePlayer(
          poolId,
          name,
          creditsPurchased,
          contact
        );
        if (updated) {
          await writeLocal(updated);
          if (poolHasFinancials(updated)) {
            await recalculateWinnerPayoutsForPool(poolId, updated);
          }
          return updated;
        }
        return undefined;
      } catch {
        // fall through
      }
    }

    const updated = mockDB.createPlayer(
      poolId,
      name,
      creditsPurchased,
      contact
    );
    if (updated && isDatabaseConfigured()) {
      await persistPool(updated).catch(() => undefined);
    }
    return updated;
  },

  async updatePlayerCredits(
    poolId: string,
    playerId: string,
    creditsPurchased: number
  ): Promise<Pool | undefined> {
    return poolStore.updatePlayer(poolId, playerId, { creditsPurchased });
  },

  async updatePlayer(
    poolId: string,
    playerId: string,
    data: {
      creditsPurchased?: number;
      email?: string | null;
      phone?: string | null;
    }
  ): Promise<Pool | undefined> {
    if (isDatabaseConfigured()) {
      try {
        const updated = await dbUpdatePlayer(poolId, playerId, data);
        if (updated) {
          await writeLocal(updated);
          if (poolHasFinancials(updated) && data.creditsPurchased !== undefined) {
            await recalculateWinnerPayoutsForPool(poolId, updated);
          }
          return updated;
        }
        return undefined;
      } catch {
        // fall through
      }
    }

    const updated = mockDB.updatePlayer(poolId, playerId, data);
    if (updated && isDatabaseConfigured()) {
      await persistPool(updated).catch(() => undefined);
    }
    return updated;
  },

  async claimSquares(
    poolId: string,
    squareIds: number[],
    participantId: string,
    inviteToken?: string
  ): Promise<ClaimResult> {
    if (isDatabaseConfigured()) {
      if (!inviteToken?.trim()) {
        return {
          ok: false,
          error: "Open your personal invite link to claim squares.",
        };
      }

      try {
        const response = await fetch("/api/squares/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            poolId,
            squareIds,
            playerId: participantId,
            inviteToken,
          }),
        });

        const payload = (await response.json()) as {
          ok?: boolean;
          pool?: Pool;
          error?: string;
        };

        if (!response.ok || !payload.ok || !payload.pool) {
          return {
            ok: false,
            error: payload.error || "Failed to claim squares.",
          };
        }

        await writeLocal(payload.pool);
        return { ok: true, pool: payload.pool };
      } catch {
        return { ok: false, error: "Failed to claim squares." };
      }
    }

    const result = mockDB.claimSquares(poolId, squareIds, participantId);
    if (result.ok && isDatabaseConfigured()) {
      await persistPool(result.pool).catch(() => undefined);
    }
    return result;
  },

  async lockPool(poolId: string): Promise<Pool | undefined> {
    return poolStore.mutateStatus(poolId, "locked");
  },

  async storePendingNumbers(
    poolId: string,
    topNumbers: number[],
    sideNumbers: number[]
  ): Promise<Pool | undefined> {
    const current = await readPool(poolId);
    if (!current || current.status !== "locked") return undefined;

    const innerNumbers =
      current.innerNumbers?.length === 100
        ? current.innerNumbers
        : shuffleInnerSquareNumbers();

    if (isDatabaseConfigured()) {
      try {
        await dbUpdatePoolFields(poolId, {
          top_numbers: topNumbers,
          side_numbers: sideNumbers,
          inner_numbers: innerNumbers,
        });
        await dbSyncSquareDigits(poolId, topNumbers, sideNumbers);
        const refreshed = await dbGetPool(poolId);
        if (refreshed) {
          await writeLocal(refreshed);
          return refreshed;
        }
      } catch {
        // fall through
      }
    }

    const updated = mockDB.storePendingNumbers(
      poolId,
      topNumbers,
      sideNumbers,
      innerNumbers
    );
    if (updated && isDatabaseConfigured()) {
      await persistPool(updated).catch(() => undefined);
    }
    return updated;
  },

  async finalizeNumberDraw(poolId: string): Promise<Pool | undefined> {
    const current = await readPool(poolId);
    if (
      current?.status === "locked" &&
      current.topNumbers?.length === 10 &&
      current.sideNumbers?.length === 10 &&
      current.innerNumbers?.length !== 100
    ) {
      await poolStore.storePendingNumbers(
        poolId,
        current.topNumbers,
        current.sideNumbers
      );
    }

    const updated = await poolStore.mutateStatus(poolId, "numbers-drawn", (pool) => {
      if (
        pool.status !== "locked" ||
        !pool.topNumbers?.length ||
        !pool.sideNumbers?.length ||
        pool.innerNumbers?.length !== 100
      ) {
        return false;
      }
      return true;
    });

    if (updated) {
      try {
        const { assignHighlightSquaresForPool } = await import(
          "@/lib/highlight/assign"
        );
        await assignHighlightSquaresForPool(poolId);
      } catch {
        // Best-effort — migration may be pending.
      }
    }

    return updated;
  },

  async updateEspnGameId(
    poolId: string,
    espnGameId: string | null
  ): Promise<Pool | undefined> {
    return poolStore.updateEspnSettings(poolId, { espnGameId });
  },

  async updateEspnSettings(
    poolId: string,
    settings: { espnGameId?: string | null; espnSport?: EspnSport }
  ): Promise<Pool | undefined> {
    const fields: Record<string, string | null | number | object> = {};
    const localSettings: {
      espnGameId?: string | null;
      espnSport?: EspnSport;
    } = {};

    if (settings.espnGameId !== undefined) {
      const normalized = settings.espnGameId?.trim() || null;
      fields.espn_game_id = normalized;
      localSettings.espnGameId = normalized;
    }

    if (settings.espnSport !== undefined) {
      const sport = normalizeEspnSport(settings.espnSport);
      fields.espn_sport = sport;
      localSettings.espnSport = sport;

      const current = await readPool(poolId);
      if (current && (current.payoutTemplate ?? "standard") !== "custom") {
        const config = buildPayoutConfig(
          current.payoutTemplate ?? "standard",
          sport
        );
        Object.assign(fields, {
          payout_template: config.template,
          payout_percentages: config.percentages,
        });
      }
    }

    if (isDatabaseConfigured() && Object.keys(fields).length > 0) {
      try {
        const updated = await dbUpdatePoolFields(poolId, fields);
        if (updated) {
          await writeLocal(updated);
          if (settings.espnSport !== undefined) {
            await recalculateWinnerPayoutsForPool(poolId, updated);
          }
          return (await readPool(poolId)) ?? updated;
        }
      } catch {
        // fall through
      }
    }

    const updated = mockDB.updateEspnSettings(poolId, localSettings);
    if (updated && isDatabaseConfigured()) {
      await persistPool(updated).catch(() => undefined);
    }
    return updated;
  },

  async updatePoolFinancials(
    poolId: string,
    _data: { costPerSquare?: number; serviceFeePercent?: number }
  ): Promise<Pool | undefined> {
    void poolId;
    void _data;
    return undefined;
  },

  async updatePoolPayoutSettings(
    poolId: string,
    data: {
      payoutTemplate: PayoutTemplate;
      payoutPercentages?: PayoutPercentages;
    }
  ): Promise<Pool | undefined> {
    const current = await readPool(poolId);
    if (!current) return undefined;

    let config;
    try {
      config = buildPayoutConfig(
        data.payoutTemplate,
        current.espnSport,
        data.payoutPercentages
      );
    } catch {
      return undefined;
    }

    const fields = {
      payout_template: config.template,
      payout_percentages: config.percentages,
    };

    if (isDatabaseConfigured()) {
      try {
        const updated = await dbUpdatePoolFields(poolId, fields);
        if (!updated) return undefined;

        await writeLocal(updated);
        await recalculateWinnerPayoutsForPool(poolId, updated);
        return (await readPool(poolId)) ?? updated;
      } catch {
        return undefined;
      }
    }

    return mockDB.updatePoolPayoutSettings(poolId, {
      payoutTemplate: config.template,
      payoutPercentages: config.percentages,
    });
  },

  async updatePlayerPayment(
    poolId: string,
    playerId: string,
    status: "paid" | "unpaid"
  ): Promise<Pool | undefined> {
    if (isDatabaseConfigured()) {
      try {
        const updated = await dbUpdatePlayerPayment(poolId, playerId, status);
        if (updated) {
          await writeLocal(updated);
          return updated;
        }
      } catch {
        // fall through
      }
    }

    const updated = mockDB.updatePlayerPayment(poolId, playerId, status);
    if (updated && isDatabaseConfigured()) {
      await persistPool(updated).catch(() => undefined);
    }
    return updated;
  },

  async updateWinnerPayoutStatus(
    poolId: string,
    quarter: ScoringPeriod,
    status: PayoutStatus
  ): Promise<void> {
    if (isDatabaseConfigured()) {
      try {
        await dbUpdateWinnerPayoutStatus(poolId, quarter, status);
        if (status === "paid") {
          await completePayoutJobManually(poolId, quarter).catch(() => undefined);
        }
      } catch {
        // fall through
      }
    }
    mockDB.updateWinnerPayoutStatus(poolId, quarter, status);
  },

  async updatePool(
    poolId: string,
    data: Partial<Pick<Pool, "name" | "homeTeam" | "awayTeam">>
  ): Promise<Pool | undefined> {
    if (isDatabaseConfigured()) {
      try {
        const fields: Record<string, string> = {};
        if (data.name?.trim()) fields.name = data.name.trim();
        if (data.homeTeam?.trim()) fields.home_team = data.homeTeam.trim();
        if (data.awayTeam?.trim()) fields.away_team = data.awayTeam.trim();

        const updated = await dbUpdatePoolFields(poolId, fields);
        if (updated) {
          await writeLocal(updated);
          return updated;
        }
      } catch {
        // fall through
      }
    }

    const updated = mockDB.updatePool(poolId, data);
    if (updated && isDatabaseConfigured()) {
      await persistPool(updated).catch(() => undefined);
    }
    return updated;
  },

  async closePool(poolId: string): Promise<Pool | undefined> {
    const pool = await readPool(poolId);
    if (!pool || pool.status === "archived") return undefined;

    const nextStatus =
      pool.status === "open"
        ? ("locked" as const)
        : pool.status === "numbers-drawn"
          ? ("completed" as const)
          : null;

    if (!nextStatus) return undefined;

    if (isDatabaseConfigured()) {
      try {
        const updated = await dbUpdatePoolFields(poolId, { status: nextStatus });
        if (updated) {
          await writeLocal(updated);
          return updated;
        }
      } catch {
        // fall through
      }
    }

    const updated = mockDB.closePool(poolId);
    if (updated && isDatabaseConfigured()) {
      await persistPool(updated).catch(() => undefined);
    }
    return updated;
  },

  async archivePool(poolId: string): Promise<Pool | undefined> {
    return poolStore.mutateStatus(poolId, "archived");
  },

  async adminDrawNumbers(poolId: string): Promise<Pool | undefined> {
    const pool = await readPool(poolId);
    if (!pool || pool.status === "archived" || pool.status === "completed") {
      return undefined;
    }

    if (pool.status === "open") {
      return poolStore.mutateStatus(poolId, "locked");
    }

    return pool;
  },

  async getAdminStats(): Promise<AdminStats> {
    const pools = await readAllPools();
    const activeStatuses = new Set(["open", "locked", "numbers-drawn"]);

    return {
      totalPools: pools.length,
      activePools: pools.filter((p) => activeStatuses.has(p.status)).length,
      completedPools: pools.filter((p) => p.status === "completed").length,
      totalPlayers: pools.reduce((sum, p) => sum + p.participants.length, 0),
    };
  },

  async ensurePlayerInviteToken(
    poolId: string,
    playerId: string
  ): Promise<string | undefined> {
    if (!isDatabaseConfigured()) {
      return mockDB.ensureInviteToken(poolId, playerId);
    }

    try {
      const token = await dbEnsureInviteToken(poolId, playerId);
      if (token) {
        const pool = await readPool(poolId, { includeSensitive: true });
        if (pool) await writeLocal(pool);
        return token;
      }
    } catch {
      return undefined;
    }

    return undefined;
  },

  async getPlayerByInviteToken(
    inviteToken: string
  ): Promise<PlayerInviteInfo | undefined> {
    if (!isDatabaseConfigured()) {
      return mockDB.getPlayerByInviteToken(inviteToken);
    }

    try {
      const response = await fetch(
        `/api/invite/resolve?token=${encodeURIComponent(inviteToken)}`
      );
      const payload = (await response.json()) as {
        error?: string;
        poolId?: string;
        poolName?: string;
        homeTeam?: string;
        awayTeam?: string;
        poolStatus?: Pool["status"];
        player?: Participant;
      };

      if (!response.ok || !payload.player || !payload.poolId) {
        return undefined;
      }

      return {
        player: payload.player,
        poolId: payload.poolId,
        poolName: payload.poolName ?? "",
        homeTeam: payload.homeTeam ?? "",
        awayTeam: payload.awayTeam ?? "",
        poolStatus: payload.poolStatus ?? "open",
      };
    } catch {
      return undefined;
    }
  },

  async mutateStatus(
    poolId: string,
    status: Pool["status"],
    predicate?: (pool: Pool) => boolean
  ): Promise<Pool | undefined> {
    const current = await readPool(poolId);
    if (!current) return undefined;
    if (predicate && !predicate(current)) return undefined;

    if (isDatabaseConfigured()) {
      try {
        const updated = await dbUpdatePoolFields(poolId, { status });
        if (updated) {
          await writeLocal(updated);
          return updated;
        }
      } catch {
        // fall through
      }
    }

    const localMutators: Record<string, () => Pool | undefined> = {
      locked: () => mockDB.lockPool(poolId),
      "numbers-drawn": () => mockDB.finalizeNumberDraw(poolId),
      archived: () => mockDB.archivePool(poolId),
      completed: () => mockDB.closePool(poolId),
    };

    const updated = localMutators[status]?.();
    if (updated && isDatabaseConfigured()) {
      await persistPool(updated).catch(() => undefined);
    }
    return updated;
  },
};
