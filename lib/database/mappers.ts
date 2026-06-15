import { normalizeEspnSport } from "@/lib/espn/sports";
import { getTemplatePercentages } from "@/lib/payoutTemplates";
import type {
  Participant,
  PayoutTemplate,
  Pool,
  Square,
  WinnerHistory,
  WinnerResult,
} from "@/lib/types";
import { normalizePoolParticipants } from "@/lib/credits";
import type { PlayerRow, PoolRow, SquareRow, WinnerRow } from "./types";

const PAYOUT_TEMPLATES: PayoutTemplate[] = [
  "equal",
  "standard",
  "heavy_final",
  "custom",
];

function normalizePayoutTemplate(value: string | null | undefined): PayoutTemplate {
  if (value && PAYOUT_TEMPLATES.includes(value as PayoutTemplate)) {
    return value as PayoutTemplate;
  }
  return "standard";
}

function defaultPayoutPercentages(
  template: PayoutTemplate,
  sport: Pool["espnSport"]
) {
  if (template === "custom") return {};
  return getTemplatePercentages(template, sport);
}

export function playerRowToParticipant(row: PlayerRow): Participant {
  const creditsRemaining = row.credits_allocated - row.credits_used;
  return {
    id: row.id,
    name: row.name,
    initials: row.initials,
    color: row.color ?? undefined,
    inviteToken: row.invite_token ?? undefined,
    creditsPurchased: row.credits_allocated,
    creditsUsed: row.credits_used,
    creditsRemaining,
    amountPaid: row.amount_paid ?? 0,
    paymentStatus: row.payment_status ?? "unpaid",
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    inviteDeliveryStatus: row.invite_delivery_status ?? "pending",
    inviteSentAt: row.invite_sent_at ?? undefined,
    inviteDeliveryError: row.invite_delivery_error ?? undefined,
    smsDeliveryStatus: row.sms_delivery_status ?? "skipped",
    purchaseSource: row.purchase_source ?? "manual",
    stripeCheckoutSessionId: row.stripe_checkout_session_id ?? undefined,
  };
}

export function participantToPlayerRow(
  participant: Participant,
  poolId: string
): Omit<PlayerRow, "created_at"> {
  return {
    id: participant.id,
    pool_id: poolId,
    name: participant.name,
    credits_allocated: participant.creditsPurchased,
    credits_used: participant.creditsUsed,
    initials: participant.initials,
    color: participant.color ?? null,
    invite_token: participant.inviteToken ?? null,
    amount_paid: participant.amountPaid ?? 0,
    payment_status: participant.paymentStatus ?? "unpaid",
    email: participant.email?.trim() || null,
    phone: participant.phone?.trim() || null,
    invite_delivery_status:
      participant.inviteDeliveryStatus ??
      (participant.email ? "pending" : "skipped"),
    invite_sent_at: participant.inviteSentAt ?? null,
    invite_delivery_error: participant.inviteDeliveryError ?? null,
    sms_delivery_status:
      participant.smsDeliveryStatus ??
      (participant.phone ? "pending" : "skipped"),
    purchase_source: participant.purchaseSource ?? "manual",
    stripe_checkout_session_id: participant.stripeCheckoutSessionId ?? null,
  };
}

export function squareRowToSquare(
  row: SquareRow,
  participantsById: Map<string, Participant>
): Square {
  if (row.platform_owned) {
    return {
      id: row.square_number,
      claimed: true,
      platformOwned: true,
      owner: {
        id: "platform",
        name: "SquareBoards",
        initials: "SB",
        creditsPurchased: 0,
        creditsUsed: 0,
        creditsRemaining: 0,
      },
    };
  }

  const owner = row.player_id
    ? participantsById.get(row.player_id)
    : undefined;

  return {
    id: row.square_number,
    claimed: row.claimed,
    owner: owner ? { ...owner } : undefined,
  };
}

export function assemblePool(
  poolRow: PoolRow,
  playerRows: PlayerRow[],
  squareRows: SquareRow[]
): Pool {
  const participants = playerRows.map(playerRowToParticipant);
  const participantsById = new Map(participants.map((p) => [p.id, p]));

  const squares: Square[] = Array.from({ length: 100 }, (_, id) => ({
    id,
    claimed: false,
  }));

  for (const row of squareRows) {
    squares[row.square_number] = squareRowToSquare(row, participantsById);
  }

  const pool: Pool = {
    id: poolRow.id,
    name: poolRow.name,
    homeTeam: poolRow.home_team,
    awayTeam: poolRow.away_team,
    inviteCode: poolRow.invite_code,
    status: poolRow.status,
    participants,
    squares,
    topNumbers: poolRow.top_numbers ?? undefined,
    sideNumbers: poolRow.side_numbers ?? undefined,
    innerNumbers: poolRow.inner_numbers ?? undefined,
    espnGameId: poolRow.espn_game_id ?? undefined,
    espnSport: normalizeEspnSport(poolRow.espn_sport),
    costPerSquare: poolRow.cost_per_square ?? 0,
    serviceFeePercent: poolRow.service_fee_percent ?? 0,
    payoutTemplate: normalizePayoutTemplate(poolRow.payout_template),
    payoutPercentages:
      poolRow.payout_percentages &&
      Object.keys(poolRow.payout_percentages).length > 0
        ? poolRow.payout_percentages
        : defaultPayoutPercentages(
            normalizePayoutTemplate(poolRow.payout_template),
            normalizeEspnSport(poolRow.espn_sport)
          ),
    gameId: poolRow.game_id ?? undefined,
    boardIndex: poolRow.board_index ?? 1,
    kickoffAt: poolRow.kickoff_at ?? undefined,
    autoCreated: poolRow.auto_created ?? false,
    marketplaceVisible: poolRow.marketplace_visible ?? true,
    entryTierCents: poolRow.entry_tier_cents ?? undefined,
  };

  return normalizePoolParticipants(pool);
}

export function poolToPoolRow(pool: Pool): Omit<PoolRow, "created_at"> {
  return {
    id: pool.id,
    name: pool.name,
    home_team: pool.homeTeam,
    away_team: pool.awayTeam,
    invite_code: pool.inviteCode,
    status: pool.status,
    top_numbers: pool.topNumbers ?? null,
    side_numbers: pool.sideNumbers ?? null,
    inner_numbers: pool.innerNumbers ?? null,
    espn_game_id: pool.espnGameId ?? null,
    espn_sport: normalizeEspnSport(pool.espnSport),
    cost_per_square: pool.costPerSquare ?? 0,
    service_fee_percent: pool.serviceFeePercent ?? 0,
    payout_template: pool.payoutTemplate ?? "standard",
    payout_percentages: pool.payoutPercentages ?? {},
    game_id: pool.gameId ?? null,
    board_index: pool.boardIndex ?? 1,
    kickoff_at: pool.kickoffAt ?? null,
    auto_created: pool.autoCreated ?? false,
    locked_at: null,
    marketplace_visible: pool.marketplaceVisible ?? true,
    entry_tier_cents: pool.entryTierCents ?? null,
  };
}

export function winnerRowsToHistory(rows: WinnerRow[]): WinnerHistory {
  const history: WinnerHistory = {};
  for (const row of rows) {
    const homeDigit = Math.abs(Math.floor(row.home_score)) % 10;
    const awayDigit = Math.abs(Math.floor(row.away_score)) % 10;
    history[row.quarter] = {
      quarter: row.quarter,
      homeScore: row.home_score,
      awayScore: row.away_score,
      homeDigit,
      awayDigit,
      squareId: row.winning_square,
      ownerName: row.winning_player,
      recordedAt: row.created_at,
      payoutAmount: row.payout_amount ?? undefined,
      payoutStatus: row.payout_status ?? "pending",
    };
  }
  return history;
}

export function winnerResultToRow(
  poolId: string,
  result: WinnerResult,
  id: string
): Omit<WinnerRow, "created_at"> {
  return {
    id,
    pool_id: poolId,
    quarter: result.quarter,
    winning_square: result.squareId,
    winning_player: result.ownerName,
    home_score: result.homeScore,
    away_score: result.awayScore,
    payout_amount: result.payoutAmount ?? null,
    payout_status: result.payoutStatus ?? "pending",
  };
}
