import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { ALL_SQUARE_WALLET_BALANCE_TYPES } from "./config";
import type {
  LedgerDirection,
  LedgerEntryType,
  SquareWalletBalanceRow,
  SquareWalletBalanceType,
  SquareWalletBalances,
  SquareWalletLedgerEntry,
  SquareWalletRecord,
} from "./types";

const WALLETS = "square_wallets";
const BALANCES = "square_wallet_balances";
const LEDGER = "square_wallet_ledger_entries";

function mapWallet(row: Record<string, unknown>): SquareWalletRecord {
  return {
    id: row.id as string,
    playerEmail: row.player_email as string,
    status: row.status as SquareWalletRecord["status"],
    lifetimeDepositsCents: Number(row.lifetime_deposits_cents ?? 0),
    lifetimeWithdrawalsCents: Number(row.lifetime_withdrawals_cents ?? 0),
    lifetimeContestEntriesCents: Number(row.lifetime_contest_entries_cents ?? 0),
    lifetimeWinningsCents: Number(row.lifetime_winnings_cents ?? 0),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapLedger(row: Record<string, unknown>): SquareWalletLedgerEntry {
  return {
    id: row.id as string,
    walletId: row.wallet_id as string,
    playerEmail: row.player_email as string,
    balanceType: row.balance_type as SquareWalletBalanceType,
    direction: row.direction as LedgerDirection,
    amountCents: Number(row.amount_cents),
    runningBalanceCents:
      row.running_balance_cents != null ? Number(row.running_balance_cents) : null,
    entryType: row.entry_type as LedgerEntryType,
    referenceType: (row.reference_type as string | null) ?? null,
    referenceId: (row.reference_id as string | null) ?? null,
    paymentTransactionId: (row.payment_transaction_id as string | null) ?? null,
    description: (row.description as string | null) ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: row.created_at as string,
  };
}

export function emptyBalances(): SquareWalletBalances {
  return {
    available: 0,
    pendingWinnings: 0,
    pendingWithdrawals: 0,
    contestCredits: 0,
    bonusCredits: 0,
    rewardCredits: 0,
    promotional: 0,
    referral: 0,
  };
}

export function balancesFromRows(rows: SquareWalletBalanceRow[]): SquareWalletBalances {
  const b = emptyBalances();
  for (const row of rows) {
    switch (row.balanceType) {
      case "available":
        b.available = row.amountCents;
        break;
      case "pending_winnings":
        b.pendingWinnings = row.amountCents;
        break;
      case "pending_withdrawals":
        b.pendingWithdrawals = row.amountCents;
        break;
      case "contest_credits":
        b.contestCredits = row.amountCents;
        break;
      case "bonus_credits":
        b.bonusCredits = row.amountCents;
        break;
      case "reward_credits":
        b.rewardCredits = row.amountCents;
        break;
      case "promotional":
        b.promotional = row.amountCents;
        break;
      case "referral":
        b.referral = row.amountCents;
        break;
      default:
        break;
    }
  }
  return b;
}

export async function findWalletByEmail(email: string): Promise<SquareWalletRecord | null> {
  if (!isSupabaseAdminConfigured()) return null;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(WALLETS)
    .select("*")
    .eq("player_email", normalizeEmail(email))
    .maybeSingle();
  if (error) throw error;
  return data ? mapWallet(data as Record<string, unknown>) : null;
}

export async function insertWallet(email: string): Promise<SquareWalletRecord> {
  const supabase = getSupabaseAdmin();
  const normalized = normalizeEmail(email);
  const now = new Date().toISOString();

  const { data: wallet, error } = await supabase
    .from(WALLETS)
    .insert({
      player_email: normalized,
      status: "active",
      created_at: now,
      updated_at: now,
    })
    .select("*")
    .single();

  if (error?.code === "23505") {
    const existing = await findWalletByEmail(normalized);
    if (existing) return existing;
    throw error;
  }
  if (error) throw error;

  const walletRow = mapWallet(wallet as Record<string, unknown>);
  const balanceRows = ALL_SQUARE_WALLET_BALANCE_TYPES.map((balanceType) => ({
    wallet_id: walletRow.id,
    balance_type: balanceType,
    amount_cents: 0,
    updated_at: now,
  }));

  const { error: balError } = await supabase.from(BALANCES).insert(balanceRows);
  if (balError) throw balError;

  return walletRow;
}

export async function fetchBalanceRows(walletId: string): Promise<SquareWalletBalanceRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(BALANCES)
    .select("*")
    .eq("wallet_id", walletId);
  if (error) throw error;

  return (data ?? []).map((row) => ({
    balanceType: row.balance_type as SquareWalletBalanceType,
    amountCents: Number(row.amount_cents),
    updatedAt: row.updated_at as string,
  }));
}

export async function getBalanceCents(
  walletId: string,
  balanceType: SquareWalletBalanceType
): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(BALANCES)
    .select("amount_cents")
    .eq("wallet_id", walletId)
    .eq("balance_type", balanceType)
    .maybeSingle();
  if (error) throw error;
  return Number(data?.amount_cents ?? 0);
}

/** @deprecated All mutations route through SquareBank — kept for legacy callers. */
export async function applyLedgerMutation(input: {
  walletId: string;
  playerEmail: string;
  balanceType: import("./types").SquareWalletBalanceType;
  direction: import("./types").LedgerDirection;
  amountCents: number;
  entryType: import("./types").LedgerEntryType;
  referenceType?: string | null;
  referenceId?: string | null;
  paymentTransactionId?: string | null;
  description?: string | null;
  metadata?: Record<string, unknown>;
  lifetimeField?: keyof Pick<
    import("./types").SquareWalletRecord,
    | "lifetimeDepositsCents"
    | "lifetimeWithdrawalsCents"
    | "lifetimeContestEntriesCents"
    | "lifetimeWinningsCents"
  >;
}): Promise<import("./types").SquareWalletLedgerEntry> {
  const { creditBalance, debitBalance } = await import("./WalletLedgerService");
  const base = {
    email: input.playerEmail,
    walletId: input.walletId,
    balanceType: input.balanceType,
    amountCents: input.amountCents,
    entryType: input.entryType,
    referenceType: input.referenceType,
    referenceId: input.referenceId,
    paymentTransactionId: input.paymentTransactionId,
    description: input.description,
    metadata: input.metadata,
    lifetimeField: input.lifetimeField,
  };
  return input.direction === "credit" ? creditBalance(base) : debitBalance(base);
}

async function findWalletById(id: string): Promise<SquareWalletRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from(WALLETS).select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapWallet(data as Record<string, unknown>) : null;
}

export async function listLedgerEntries(input: {
  walletId: string;
  limit?: number;
  offset?: number;
  search?: string;
  entryTypes?: LedgerEntryType[];
  direction?: LedgerDirection;
}): Promise<SquareWalletLedgerEntry[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from(LEDGER)
    .select("*")
    .eq("wallet_id", input.walletId)
    .order("created_at", { ascending: false });

  if (input.entryTypes?.length) {
    query = query.in("entry_type", input.entryTypes);
  }
  if (input.direction) {
    query = query.eq("direction", input.direction);
  }
  if (input.search?.trim()) {
    query = query.or(
      `description.ilike.%${input.search.trim()}%,entry_type.ilike.%${input.search.trim()}%`
    );
  }

  const offset = input.offset ?? 0;
  const limit = input.limit ?? 50;
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row) => mapLedger(row as Record<string, unknown>));
}

export async function listAllLedgerEntries(input: {
  walletId: string;
  entryTypes?: LedgerEntryType[];
  direction?: LedgerDirection;
  search?: string;
  maxRows?: number;
}): Promise<SquareWalletLedgerEntry[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from(LEDGER)
    .select("*")
    .eq("wallet_id", input.walletId)
    .order("created_at", { ascending: false })
    .limit(input.maxRows ?? 500);

  if (input.entryTypes?.length) {
    query = query.in("entry_type", input.entryTypes);
  }
  if (input.direction) {
    query = query.eq("direction", input.direction);
  }
  if (input.search?.trim()) {
    query = query.or(
      `description.ilike.%${input.search.trim()}%,entry_type.ilike.%${input.search.trim()}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row) => mapLedger(row as Record<string, unknown>));
}

export async function fetchWalletAnalytics(): Promise<{
  totalWallets: number;
  avgAvailableCents: number;
  totalDepositsCents: number;
  totalWithdrawalsCents: number;
  utilizationPercent: number;
}> {
  if (!isSupabaseAdminConfigured()) {
    return {
      totalWallets: 0,
      avgAvailableCents: 0,
      totalDepositsCents: 0,
      totalWithdrawalsCents: 0,
      utilizationPercent: 0,
    };
  }

  const supabase = getSupabaseAdmin();
  const [walletsRes, availRes] = await Promise.all([
    supabase.from(WALLETS).select("lifetime_deposits_cents, lifetime_withdrawals_cents, lifetime_contest_entries_cents"),
    supabase.from(BALANCES).select("amount_cents").eq("balance_type", "available"),
  ]);

  const wallets = walletsRes.data ?? [];
  const availRows = availRes.data ?? [];
  const totalWallets = wallets.length;
  const totalDepositsCents = wallets.reduce(
    (s, w) => s + Number(w.lifetime_deposits_cents ?? 0),
    0
  );
  const totalWithdrawalsCents = wallets.reduce(
    (s, w) => s + Number(w.lifetime_withdrawals_cents ?? 0),
    0
  );
  const totalContestEntriesCents = wallets.reduce(
    (s, w) => s + Number(w.lifetime_contest_entries_cents ?? 0),
    0
  );
  const avgAvailableCents =
    availRows.length > 0
      ? availRows.reduce((s, r) => s + Number(r.amount_cents), 0) / availRows.length
      : 0;
  const utilizationPercent =
    totalDepositsCents > 0
      ? Math.round((totalContestEntriesCents / totalDepositsCents) * 100)
      : 0;

  return {
    totalWallets,
    avgAvailableCents: Math.round(avgAvailableCents),
    totalDepositsCents,
    totalWithdrawalsCents,
    utilizationPercent,
  };
}
