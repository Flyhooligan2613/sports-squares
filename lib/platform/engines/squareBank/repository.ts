import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { ALL_SQUARE_BANK_ACCOUNT_TYPES } from "./config";
import type {
  SquareBankAccountRecord,
  SquareBankAccountType,
  SquareBankDirection,
  SquareBankDisputeRecord,
  SquareBankLedgerEntry,
  SquareBankLedgerEntryType,
} from "./types";

const ACCOUNTS = "square_bank_accounts";
const BALANCES = "square_bank_balances";
const LEDGER = "square_bank_ledger";
const DISPUTES = "square_bank_disputes";
const RECONCILIATION = "square_bank_reconciliation_runs";

function mapAccount(row: Record<string, unknown>): SquareBankAccountRecord {
  return {
    id: row.id as string,
    playerEmail: row.player_email as string,
    walletId: (row.wallet_id as string | null) ?? null,
    status: row.status as SquareBankAccountRecord["status"],
    lifetimeDepositsCents: Number(row.lifetime_deposits_cents ?? 0),
    lifetimeWithdrawalsCents: Number(row.lifetime_withdrawals_cents ?? 0),
    lifetimeContestEntriesCents: Number(row.lifetime_contest_entries_cents ?? 0),
    lifetimeWinningsCents: Number(row.lifetime_winnings_cents ?? 0),
    kycStatus: row.kyc_status as SquareBankAccountRecord["kycStatus"],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function mapLedgerEntry(row: Record<string, unknown>): SquareBankLedgerEntry {
  return {
    id: row.id as string,
    accountId: row.account_id as string,
    playerEmail: row.player_email as string,
    accountType: row.account_type as SquareBankAccountType,
    direction: row.direction as SquareBankDirection,
    amountCents: Number(row.amount_cents),
    runningBalanceCents:
      row.running_balance_cents != null ? Number(row.running_balance_cents) : null,
    entryType: row.entry_type as SquareBankLedgerEntryType,
    referenceType: (row.reference_type as string | null) ?? null,
    referenceId: (row.reference_id as string | null) ?? null,
    paymentTransactionId: (row.payment_transaction_id as string | null) ?? null,
    description: (row.description as string | null) ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    module: (row.module as string | null) ?? null,
    adminEmail: (row.admin_email as string | null) ?? null,
    createdAt: row.created_at as string,
  };
}

function mapDispute(row: Record<string, unknown>): SquareBankDisputeRecord {
  return {
    id: row.id as string,
    ledgerEntryId: (row.ledger_entry_id as string | null) ?? null,
    playerEmail: row.player_email as string,
    status: row.status as SquareBankDisputeRecord["status"],
    disputeType: row.dispute_type as string,
    amountCents: Number(row.amount_cents ?? 0),
    contestId: (row.contest_id as string | null) ?? null,
    paymentTransactionId: (row.payment_transaction_id as string | null) ?? null,
    timeline: (row.timeline as SquareBankDisputeRecord["timeline"]) ?? [],
    resolutionNotes: (row.resolution_notes as string | null) ?? null,
    assignedAdminEmail: (row.assigned_admin_email as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    resolvedAt: (row.resolved_at as string | null) ?? null,
  };
}

export async function findAccountByEmail(email: string): Promise<SquareBankAccountRecord | null> {
  if (!isSupabaseAdminConfigured()) return null;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(ACCOUNTS)
    .select("*")
    .eq("player_email", normalizeEmail(email))
    .maybeSingle();
  if (error) throw error;
  return data ? mapAccount(data as Record<string, unknown>) : null;
}

export async function findAccountById(id: string): Promise<SquareBankAccountRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from(ACCOUNTS).select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapAccount(data as Record<string, unknown>) : null;
}

export async function insertBankAccount(input: {
  email: string;
  walletId?: string | null;
}): Promise<SquareBankAccountRecord> {
  const supabase = getSupabaseAdmin();
  const normalized = normalizeEmail(input.email);
  const now = new Date().toISOString();

  const { data: account, error } = await supabase
    .from(ACCOUNTS)
    .insert({
      player_email: normalized,
      wallet_id: input.walletId ?? null,
      status: "active",
      created_at: now,
      updated_at: now,
    })
    .select("*")
    .single();

  if (error?.code === "23505") {
    const existing = await findAccountByEmail(normalized);
    if (existing) return existing;
    throw error;
  }
  if (error) throw error;

  const accountRow = mapAccount(account as Record<string, unknown>);
  const balanceRows = ALL_SQUARE_BANK_ACCOUNT_TYPES.map((accountType) => ({
    account_id: accountRow.id,
    account_type: accountType,
    amount_cents: 0,
    updated_at: now,
  }));

  const { error: balError } = await supabase.from(BALANCES).insert(balanceRows);
  if (balError) throw balError;

  return accountRow;
}

export async function linkWalletToAccount(accountId: string, walletId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase
    .from(ACCOUNTS)
    .update({ wallet_id: walletId, updated_at: new Date().toISOString() })
    .eq("id", accountId)
    .is("wallet_id", null);
}

export async function fetchBalanceRows(accountId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from(BALANCES).select("*").eq("account_id", accountId);
  if (error) throw error;
  return (data ?? []).map((row) => ({
    accountType: row.account_type as SquareBankAccountType,
    amountCents: Number(row.amount_cents),
    updatedAt: row.updated_at as string,
  }));
}

export async function getBalanceCents(
  accountId: string,
  accountType: SquareBankAccountType
): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(BALANCES)
    .select("amount_cents")
    .eq("account_id", accountId)
    .eq("account_type", accountType)
    .maybeSingle();
  if (error) throw error;
  return Number(data?.amount_cents ?? 0);
}

export async function updateBalanceCents(input: {
  accountId: string;
  accountType: SquareBankAccountType;
  amountCents: number;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from(BALANCES)
    .update({ amount_cents: input.amountCents, updated_at: new Date().toISOString() })
    .eq("account_id", input.accountId)
    .eq("account_type", input.accountType);
  if (error) throw error;
}

export async function insertLedgerEntry(input: {
  id: string;
  accountId: string;
  playerEmail: string;
  accountType: SquareBankAccountType;
  direction: SquareBankDirection;
  amountCents: number;
  runningBalanceCents: number;
  entryType: SquareBankLedgerEntryType;
  referenceType?: string | null;
  referenceId?: string | null;
  paymentTransactionId?: string | null;
  description?: string | null;
  metadata?: Record<string, unknown>;
  module?: string;
  adminEmail?: string;
}): Promise<SquareBankLedgerEntry> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from(LEDGER)
    .insert({
      id: input.id,
      account_id: input.accountId,
      player_email: normalizeEmail(input.playerEmail),
      account_type: input.accountType,
      direction: input.direction,
      amount_cents: input.amountCents,
      running_balance_cents: input.runningBalanceCents,
      entry_type: input.entryType,
      reference_type: input.referenceType ?? null,
      reference_id: input.referenceId ?? null,
      payment_transaction_id: input.paymentTransactionId ?? null,
      description: input.description ?? null,
      metadata: input.metadata ?? {},
      module: input.module ?? null,
      admin_email: input.adminEmail ?? null,
      created_at: now,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapLedgerEntry(data as Record<string, unknown>);
}

export async function updateAccountLifetime(input: {
  accountId: string;
  field: keyof Pick<
    SquareBankAccountRecord,
    | "lifetimeDepositsCents"
    | "lifetimeWithdrawalsCents"
    | "lifetimeContestEntriesCents"
    | "lifetimeWinningsCents"
  >;
  deltaCents: number;
}): Promise<void> {
  const columnMap = {
    lifetimeDepositsCents: "lifetime_deposits_cents",
    lifetimeWithdrawalsCents: "lifetime_withdrawals_cents",
    lifetimeContestEntriesCents: "lifetime_contest_entries_cents",
    lifetimeWinningsCents: "lifetime_winnings_cents",
  } as const;

  const account = await findAccountById(input.accountId);
  if (!account) return;

  const current =
    input.field === "lifetimeDepositsCents"
      ? account.lifetimeDepositsCents
      : input.field === "lifetimeWithdrawalsCents"
        ? account.lifetimeWithdrawalsCents
        : input.field === "lifetimeContestEntriesCents"
          ? account.lifetimeContestEntriesCents
          : account.lifetimeWinningsCents;

  const supabase = getSupabaseAdmin();
  await supabase
    .from(ACCOUNTS)
    .update({
      [columnMap[input.field]]: current + input.deltaCents,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.accountId);

  if (account.walletId) {
    await supabase
      .from("square_wallets")
      .update({
        [columnMap[input.field]]: current + input.deltaCents,
        updated_at: new Date().toISOString(),
      })
      .eq("id", account.walletId);
  }
}

export async function listLedgerEntries(input: {
  accountId?: string;
  playerEmail?: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<SquareBankLedgerEntry[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from(LEDGER)
    .select("*")
    .order("created_at", { ascending: false })
    .range(input.offset ?? 0, (input.offset ?? 0) + (input.limit ?? 50) - 1);

  if (input.accountId) query = query.eq("account_id", input.accountId);
  if (input.playerEmail) query = query.eq("player_email", normalizeEmail(input.playerEmail));
  if (input.search?.trim()) {
    query = query.or(
      `description.ilike.%${input.search.trim()}%,entry_type.ilike.%${input.search.trim()}%,id.ilike.%${input.search.trim()}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row) => mapLedgerEntry(row as Record<string, unknown>));
}

export async function findLedgerEntryById(id: string): Promise<SquareBankLedgerEntry | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from(LEDGER).select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapLedgerEntry(data as Record<string, unknown>) : null;
}

export async function listDisputes(limit = 50): Promise<SquareBankDisputeRecord[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(DISPUTES)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row) => mapDispute(row as Record<string, unknown>));
}

export async function findDisputeById(id: string): Promise<SquareBankDisputeRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from(DISPUTES).select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapDispute(data as Record<string, unknown>) : null;
}

export async function insertDispute(input: {
  ledgerEntryId?: string;
  playerEmail: string;
  amountCents: number;
  disputeType?: string;
  contestId?: string;
  paymentTransactionId?: string;
}): Promise<SquareBankDisputeRecord> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const timeline = [{ at: now, action: "dispute_opened", note: "Case opened" }];

  const { data, error } = await supabase
    .from(DISPUTES)
    .insert({
      ledger_entry_id: input.ledgerEntryId ?? null,
      player_email: normalizeEmail(input.playerEmail),
      amount_cents: input.amountCents,
      dispute_type: input.disputeType ?? "transaction",
      contest_id: input.contestId ?? null,
      payment_transaction_id: input.paymentTransactionId ?? null,
      timeline,
      created_at: now,
      updated_at: now,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapDispute(data as Record<string, unknown>);
}

export async function updateDispute(
  id: string,
  patch: Partial<{
    status: SquareBankDisputeRecord["status"];
    resolutionNotes: string;
    assignedAdminEmail: string;
    timeline: SquareBankDisputeRecord["timeline"];
    resolvedAt: string;
  }>
): Promise<SquareBankDisputeRecord | null> {
  const supabase = getSupabaseAdmin();
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.status) update.status = patch.status;
  if (patch.resolutionNotes !== undefined) update.resolution_notes = patch.resolutionNotes;
  if (patch.assignedAdminEmail !== undefined) update.assigned_admin_email = patch.assignedAdminEmail;
  if (patch.timeline) update.timeline = patch.timeline;
  if (patch.resolvedAt) update.resolved_at = patch.resolvedAt;

  const { data, error } = await supabase
    .from(DISPUTES)
    .update(update)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data ? mapDispute(data as Record<string, unknown>) : null;
}

export async function insertReconciliationRun(input: {
  period: string;
  paymentEngineTotalCents?: number;
  ledgerTotalCents?: number;
  contestTotalCents?: number;
  mismatchCount?: number;
  mismatchDetails?: unknown[];
  status?: string;
}): Promise<string> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(RECONCILIATION)
    .insert({
      period: input.period,
      status: input.status ?? "completed",
      completed_at: new Date().toISOString(),
      payment_engine_total_cents: input.paymentEngineTotalCents ?? null,
      ledger_total_cents: input.ledgerTotalCents ?? null,
      contest_total_cents: input.contestTotalCents ?? null,
      mismatch_count: input.mismatchCount ?? 0,
      mismatch_details: input.mismatchDetails ?? [],
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}

export async function fetchBankAnalytics(): Promise<{
  totalAccounts: number;
  avgAvailableCashCents: number;
  totalDepositsCents: number;
  totalWithdrawalsCents: number;
  totalPendingCents: number;
}> {
  if (!isSupabaseAdminConfigured()) {
    return {
      totalAccounts: 0,
      avgAvailableCashCents: 0,
      totalDepositsCents: 0,
      totalWithdrawalsCents: 0,
      totalPendingCents: 0,
    };
  }

  const supabase = getSupabaseAdmin();
  const [accountsRes, availRes, pendingRes, reservedRes] = await Promise.all([
    supabase.from(ACCOUNTS).select("lifetime_deposits_cents, lifetime_withdrawals_cents"),
    supabase.from(BALANCES).select("amount_cents").eq("account_type", "available_cash"),
    supabase.from(BALANCES).select("amount_cents").eq("account_type", "pending_cash"),
    supabase.from(BALANCES).select("amount_cents").eq("account_type", "reserved_funds"),
  ]);

  const accounts = accountsRes.data ?? [];
  const availRows = availRes.data ?? [];
  const pendingRows = pendingRes.data ?? [];
  const reservedRows = reservedRes.data ?? [];

  return {
    totalAccounts: accounts.length,
    avgAvailableCashCents:
      availRows.length > 0
        ? Math.round(
            availRows.reduce((s, r) => s + Number(r.amount_cents), 0) / availRows.length
          )
        : 0,
    totalDepositsCents: accounts.reduce((s, a) => s + Number(a.lifetime_deposits_cents ?? 0), 0),
    totalWithdrawalsCents: accounts.reduce(
      (s, a) => s + Number(a.lifetime_withdrawals_cents ?? 0),
      0
    ),
    totalPendingCents:
      pendingRows.reduce((s, r) => s + Number(r.amount_cents), 0) +
      reservedRows.reduce((s, r) => s + Number(r.amount_cents), 0),
  };
}
