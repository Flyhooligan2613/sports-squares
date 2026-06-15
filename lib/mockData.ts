import type {
  AdminStats,
  EspnSport,
  Participant,
  PlayerInviteInfo,
  Pool,
} from "./types";
import type { ClaimResult } from "./types";
import {
  createParticipantWithCredits,
  normalizePoolParticipants,
  syncParticipantCredits,
} from "./credits";
import { buildPayoutConfig, resolvePoolPayoutPercentages } from "./payoutTemplates";
import {
  createEmptySquares,
  generateId,
  generateInviteToken,
  getDuplicatePoolName,
  getInitials,
  pickColor,
  shuffleInnerSquareNumbers,
} from "./utils";

const STORAGE_KEY = "sports-squares-pools";

function createDemoPool(): Pool {
  const participants: Participant[] = [
    {
      id: "p1",
      name: "Alex",
      initials: "AL",
      color: pickColor(0),
      inviteToken: "demo-token-alex-0001",
      creditsPurchased: 10,
      creditsUsed: 0,
      creditsRemaining: 10,
    },
    {
      id: "p2",
      name: "Jordan",
      initials: "JO",
      color: pickColor(1),
      inviteToken: "demo-token-jordan-002",
      creditsPurchased: 10,
      creditsUsed: 0,
      creditsRemaining: 10,
    },
  ];

  const squares = createEmptySquares();
  [0, 1, 2, 10, 11, 22, 33, 44].forEach((id, index) => {
    const owner = participants[index % participants.length];
    squares[id] = { id, claimed: true, owner };
  });

  const pool: Pool = {
    id: "demo-pool",
    name: "Super Bowl Squares",
    homeTeam: "Chiefs",
    awayTeam: "49ers",
    inviteCode: "DEMO2024",
    status: "open",
    participants,
    squares,
  };

  return normalizePoolParticipants(pool);
}

function readAllPools(): Map<string, Pool> {
  const map = new Map<string, Pool>();

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored: Pool[] = JSON.parse(raw);
        for (const pool of stored) {
          map.set(pool.id, normalizePoolParticipants(pool));
        }
      }
    } catch {
      // ignore corrupt storage
    }
  }

  if (!map.has("demo-pool")) {
    map.set("demo-pool", createDemoPool());
  }

  return map;
}

function writeAllPools(pools: Map<string, Pool>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(pools.values())));
}

function mutatePool(
  poolId: string,
  mutator: (pool: Pool) => void
): Pool | undefined {
  const pools = readAllPools();
  const pool = pools.get(poolId);
  if (!pool) return undefined;

  mutator(pool);
  normalizePoolParticipants(pool);
  pools.set(poolId, pool);
  writeAllPools(pools);
  return structuredClone(pool);
}

function savePoolToStorage(pool: Pool): void {
  const pools = readAllPools();
  normalizePoolParticipants(pool);
  pools.set(pool.id, pool);
  writeAllPools(pools);
}

export const mockDB = {
  importPool(pool: Pool): void {
    savePoolToStorage(pool);
  },

  listPools(): Pool[] {
    return Array.from(readAllPools().values()).map((p) => structuredClone(p));
  },

  getPool(id: string): Pool | undefined {
    const pool = readAllPools().get(id);
    return pool ? structuredClone(pool) : undefined;
  },

  duplicatePool(poolId: string): Pool | undefined {
    const pools = readAllPools();
    const source = pools.get(poolId);
    if (!source) return undefined;

    const id = generateId();
    const pool: Pool = {
      id,
      name: getDuplicatePoolName(source.name),
      homeTeam: source.homeTeam,
      awayTeam: source.awayTeam,
      inviteCode: generateId().toUpperCase().slice(0, 8),
      status: "open",
      participants: [],
      squares: createEmptySquares(),
      espnGameId: source.espnGameId,
      espnSport: source.espnSport,
      costPerSquare: source.costPerSquare,
      serviceFeePercent: source.serviceFeePercent,
      payoutTemplate: source.payoutTemplate ?? "standard",
      payoutPercentages: resolvePoolPayoutPercentages(source),
    };

    pools.set(id, pool);
    writeAllPools(pools);
    return structuredClone(pool);
  },

  createPool(data: {
    name: string;
    homeTeam: string;
    awayTeam: string;
  }): Pool {
    const pools = readAllPools();
    const id = generateId();
    const pool: Pool = {
      id,
      name: data.name,
      homeTeam: data.homeTeam,
      awayTeam: data.awayTeam,
      inviteCode: generateId().toUpperCase().slice(0, 8),
      status: "open",
      participants: [],
      squares: createEmptySquares(),
    };
    pools.set(id, pool);
    writeAllPools(pools);
    return structuredClone(pool);
  },

  createPlayer(
    poolId: string,
    name: string,
    creditsPurchased: number,
    contact?: import("./types").PlayerContactInput
  ): Pool | undefined {
    const trimmed = name.trim();
    if (!trimmed || creditsPurchased < 0) return undefined;

    const pools = readAllPools();
    const pool = pools.get(poolId);
    if (!pool) return undefined;

    if (
      pool.participants.some(
        (p) => p.name.toLowerCase() === trimmed.toLowerCase()
      )
    ) {
      return undefined;
    }

    const player = createParticipantWithCredits(
      trimmed,
      creditsPurchased,
      contact
    );
    player.color = pickColor(pool.participants.length);
    pool.participants.push(player);
    normalizePoolParticipants(pool);
    pools.set(poolId, pool);
    writeAllPools(pools);
    return structuredClone(pool);
  },

  updatePlayer(
    poolId: string,
    playerId: string,
    data: {
      creditsPurchased?: number;
      email?: string | null;
      phone?: string | null;
    }
  ): Pool | undefined {
    if (data.creditsPurchased !== undefined && data.creditsPurchased < 0) {
      return undefined;
    }

    const pools = readAllPools();
    const pool = pools.get(poolId);
    if (!pool) return undefined;

    const player = pool.participants.find((p) => p.id === playerId);
    if (!player) return undefined;

    const squaresOwned = pool.squares.filter(
      (s) => s.owner?.id === playerId
    ).length;
    const creditsPurchased = data.creditsPurchased ?? player.creditsPurchased;

    if (creditsPurchased < squaresOwned) return undefined;

    player.creditsPurchased = creditsPurchased;
    if (data.email !== undefined) {
      player.email = data.email?.trim() || undefined;
    }
    if (data.phone !== undefined) {
      player.phone = data.phone?.trim() || undefined;
    }
    Object.assign(player, syncParticipantCredits(player, squaresOwned));
    normalizePoolParticipants(pool);
    pools.set(poolId, pool);
    writeAllPools(pools);
    return structuredClone(pool);
  },

  updatePlayerCredits(
    poolId: string,
    playerId: string,
    creditsPurchased: number
  ): Pool | undefined {
    if (creditsPurchased < 0) return undefined;

    const pools = readAllPools();
    const pool = pools.get(poolId);
    if (!pool) return undefined;

    const player = pool.participants.find((p) => p.id === playerId);
    if (!player) return undefined;

    const squaresOwned = pool.squares.filter(
      (s) => s.owner?.id === playerId
    ).length;

    if (creditsPurchased < squaresOwned) return undefined;

    player.creditsPurchased = creditsPurchased;
    Object.assign(player, syncParticipantCredits(player, squaresOwned));
    normalizePoolParticipants(pool);
    pools.set(poolId, pool);
    writeAllPools(pools);
    return structuredClone(pool);
  },

  claimSquares(
    poolId: string,
    squareIds: number[],
    participantId: string
  ): ClaimResult {
    const pools = readAllPools();
    const pool = pools.get(poolId);
    if (!pool || pool.status !== "open") {
      return { ok: false, error: "Pool is not open for claiming." };
    }

    const player = pool.participants.find((p) => p.id === participantId);
    if (!player) {
      return { ok: false, error: "Player not registered. Ask admin to add you." };
    }

    if (squareIds.length === 0) {
      return { ok: false, error: "Select at least one square." };
    }

    if (squareIds.length > player.creditsRemaining) {
      return { ok: false, error: "Not enough credits remaining." };
    }

    for (const squareId of squareIds) {
      const square = pool.squares[squareId];
      if (!square || square.claimed) {
        return { ok: false, error: "One or more squares are already claimed." };
      }
    }

    for (const squareId of squareIds) {
      const square = pool.squares[squareId];
      square!.claimed = true;
      square!.owner = { ...player };
    }

    const squaresOwned = pool.squares.filter(
      (s) => s.owner?.id === player.id
    ).length;
    Object.assign(player, syncParticipantCredits(player, squaresOwned));

    normalizePoolParticipants(pool);
    pools.set(poolId, pool);
    writeAllPools(pools);
    return { ok: true, pool: structuredClone(pool) };
  },

  lockPool(poolId: string): Pool | undefined {
    const pools = readAllPools();
    const pool = pools.get(poolId);
    if (!pool || pool.status !== "open") return undefined;

    pool.status = "locked";
    pools.set(poolId, pool);
    writeAllPools(pools);
    return structuredClone(pool);
  },

  storePendingNumbers(
    poolId: string,
    topNumbers: number[],
    sideNumbers: number[],
    innerNumbers?: number[]
  ): Pool | undefined {
    return mutatePool(poolId, (pool) => {
      if (pool.status !== "locked") return;
      pool.topNumbers = topNumbers;
      pool.sideNumbers = sideNumbers;
      pool.innerNumbers =
        innerNumbers?.length === 100
          ? innerNumbers
          : pool.innerNumbers?.length === 100
            ? pool.innerNumbers
            : shuffleInnerSquareNumbers();
    });
  },

  finalizeNumberDraw(poolId: string): Pool | undefined {
    return mutatePool(poolId, (pool) => {
      if (
        pool.status !== "locked" ||
        !pool.topNumbers ||
        !pool.sideNumbers ||
        pool.innerNumbers?.length !== 100
      ) {
        return;
      }
      pool.status = "numbers-drawn";
    });
  },

  updatePool(
    poolId: string,
    data: Partial<Pick<Pool, "name" | "homeTeam" | "awayTeam">>
  ): Pool | undefined {
    return mutatePool(poolId, (pool) => {
      if (pool.status === "archived") return;
      if (data.name?.trim()) pool.name = data.name.trim();
      if (data.homeTeam?.trim()) pool.homeTeam = data.homeTeam.trim();
      if (data.awayTeam?.trim()) pool.awayTeam = data.awayTeam.trim();
    });
  },

  updateEspnGameId(poolId: string, espnGameId: string | null): Pool | undefined {
    return mockDB.updateEspnSettings(poolId, { espnGameId });
  },

  updateEspnSettings(
    poolId: string,
    settings: {
      espnGameId?: string | null;
      espnSport?: EspnSport;
    }
  ): Pool | undefined {
    return mutatePool(poolId, (pool) => {
      if (pool.status === "archived") return;
      if (settings.espnGameId !== undefined) {
        pool.espnGameId = settings.espnGameId?.trim() || undefined;
      }
      if (settings.espnSport !== undefined) {
        pool.espnSport = settings.espnSport;
        if ((pool.payoutTemplate ?? "standard") !== "custom") {
          const config = buildPayoutConfig(
            pool.payoutTemplate ?? "standard",
            settings.espnSport
          );
          pool.payoutTemplate = config.template;
          pool.payoutPercentages = config.percentages;
        }
      }
    });
  },

  updatePoolFinancials(
    poolId: string,
    data: { costPerSquare?: number; serviceFeePercent?: number }
  ): Pool | undefined {
    return mutatePool(poolId, (pool) => {
      if (pool.status === "archived") return;
      if (data.costPerSquare !== undefined) {
        pool.costPerSquare = Math.max(0, data.costPerSquare);
      }
      if (data.serviceFeePercent !== undefined) {
        pool.serviceFeePercent = Math.min(
          100,
          Math.max(0, data.serviceFeePercent)
        );
      }
      normalizePoolParticipants(pool);
    });
  },

  updatePoolPayoutSettings(
    poolId: string,
    data: {
      payoutTemplate: import("./types").PayoutTemplate;
      payoutPercentages: import("./types").PayoutPercentages;
    }
  ): Pool | undefined {
    return mutatePool(poolId, (pool) => {
      if (pool.status === "archived") return;
      pool.payoutTemplate = data.payoutTemplate;
      pool.payoutPercentages = data.payoutPercentages;
    });
  },

  updatePlayerPayment(
    poolId: string,
    playerId: string,
    status: "paid" | "unpaid"
  ): Pool | undefined {
    return mutatePool(poolId, (pool) => {
      const player = pool.participants.find((p) => p.id === playerId);
      if (!player) return;
      const cost = pool.costPerSquare ?? 0;
      const amountDue = player.creditsPurchased * cost;
      if (status === "paid") {
        player.amountPaid = amountDue;
        player.paymentStatus = "paid";
      } else {
        player.amountPaid = 0;
        player.paymentStatus = "unpaid";
      }
      normalizePoolParticipants(pool);
    });
  },

  updateWinnerPayoutStatus(
    poolId: string,
    quarter: import("./types").ScoringPeriod,
    status: import("./types").PayoutStatus
  ): void {
    if (typeof window === "undefined") return;
    const key = `sports-squares-winners-${poolId}`;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const history = JSON.parse(raw) as Record<string, { payoutStatus?: string }>;
      if (history[quarter]) {
        history[quarter].payoutStatus = status;
        localStorage.setItem(key, JSON.stringify(history));
      }
    } catch {
      // ignore
    }
  },

  closePool(poolId: string): Pool | undefined {
    const pools = readAllPools();
    const pool = pools.get(poolId);
    if (!pool || pool.status === "archived") return undefined;

    if (pool.status === "open") {
      pool.status = "locked";
    } else if (pool.status === "numbers-drawn") {
      pool.status = "completed";
    } else {
      return undefined;
    }

    pools.set(poolId, pool);
    writeAllPools(pools);
    return structuredClone(pool);
  },

  archivePool(poolId: string): Pool | undefined {
    return mutatePool(poolId, (pool) => {
      pool.status = "archived";
    });
  },

  adminDrawNumbers(poolId: string): Pool | undefined {
    const pools = readAllPools();
    const pool = pools.get(poolId);
    if (!pool || pool.status === "archived" || pool.status === "completed") {
      return undefined;
    }

    if (pool.status === "open") {
      pool.status = "locked";
    }

    pools.set(poolId, pool);
    writeAllPools(pools);
    return structuredClone(pool);
  },

  ensureInviteToken(poolId: string, playerId: string): string | undefined {
    const pools = readAllPools();
    const pool = pools.get(poolId);
    if (!pool) return undefined;

    const player = pool.participants.find((p) => p.id === playerId);
    if (!player) return undefined;

    if (player.inviteToken) return player.inviteToken;

    player.inviteToken = generateInviteToken();
    pools.set(poolId, pool);
    writeAllPools(pools);
    return player.inviteToken;
  },

  getPlayerByInviteToken(inviteToken: string): PlayerInviteInfo | undefined {
    for (const pool of Array.from(readAllPools().values())) {
      const player = pool.participants.find((p) => p.inviteToken === inviteToken);
      if (player) {
        return {
          player: structuredClone(player),
          poolId: pool.id,
          poolName: pool.name,
          homeTeam: pool.homeTeam,
          awayTeam: pool.awayTeam,
          poolStatus: pool.status,
        };
      }
    }
    return undefined;
  },

  getAdminStats(): AdminStats {
    const pools = Array.from(readAllPools().values());
    const activeStatuses = new Set(["open", "locked", "numbers-drawn"]);

    return {
      totalPools: pools.length,
      activePools: pools.filter((p) => activeStatuses.has(p.status)).length,
      completedPools: pools.filter((p) => p.status === "completed").length,
      totalPlayers: pools.reduce((sum, p) => sum + p.participants.length, 0),
    };
  },
};
