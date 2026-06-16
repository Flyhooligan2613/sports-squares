import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { BANK_TO_WALLET_BALANCE, WALLET_TO_BANK_BALANCE } from "./balanceMapping";
import { BANK_TO_WALLET_ENTRY_TYPE } from "./config";
import type { SquareBankLedgerEntry, SquareBankPostEntryInput } from "./types";
import { buildAuditAction, recordAuditTrail } from "./AuditTrailService";
import { applyBalanceDelta } from "./BalanceService";
import { ensureBankAccount } from "./AccountService";
import { checkComplianceForEntry } from "./ComplianceService";
import {
  findAccountByEmail,
  insertLedgerEntry,
  updateAccountLifetime,
} from "./repository";
import { generateSquareBankTransactionId } from "./TransactionIdService";

/** Sync bank posting to SquareWallet presentation tables (058). */
async function syncToWalletPresentation(
  entry: SquareBankPostEntryInput & { transactionId: string; runningBalanceCents: number },
  account: { walletId: string | null }
): Promise<void> {
  if (!account.walletId) return;

  const walletBalanceType = BANK_TO_WALLET_BALANCE[entry.accountType];
  if (!walletBalanceType) return;

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const walletEntryType = BANK_TO_WALLET_ENTRY_TYPE[entry.entryType] ?? entry.entryType;

  await supabase
    .from("square_wallet_balances")
    .update({ amount_cents: entry.runningBalanceCents, updated_at: now })
    .eq("wallet_id", account.walletId)
    .eq("balance_type", walletBalanceType);

  await supabase.from("square_wallet_ledger_entries").insert({
    id: entry.transactionId,
    wallet_id: account.walletId,
    player_email: normalizeEmail(entry.email),
    balance_type: walletBalanceType,
    direction: entry.direction,
    amount_cents: entry.amountCents,
    running_balance_cents: entry.runningBalanceCents,
    entry_type: walletEntryType,
    reference_type: entry.referenceType ?? null,
    reference_id: entry.referenceId ?? null,
    payment_transaction_id: entry.paymentTransactionId ?? null,
    description: entry.description ?? null,
    metadata: { ...entry.metadata, squareBankEntryType: entry.entryType },
    created_at: now,
  });

  if (entry.lifetimeField) {
    const columnMap = {
      lifetimeDepositsCents: "lifetime_deposits_cents",
      lifetimeWithdrawalsCents: "lifetime_withdrawals_cents",
      lifetimeContestEntriesCents: "lifetime_contest_entries_cents",
      lifetimeWinningsCents: "lifetime_winnings_cents",
    } as const;
    const bankAccount = await findAccountByEmail(entry.email);
    if (bankAccount) {
      const current =
        entry.lifetimeField === "lifetimeDepositsCents"
          ? bankAccount.lifetimeDepositsCents
          : entry.lifetimeField === "lifetimeWithdrawalsCents"
            ? bankAccount.lifetimeWithdrawalsCents
            : entry.lifetimeField === "lifetimeContestEntriesCents"
              ? bankAccount.lifetimeContestEntriesCents
              : bankAccount.lifetimeWinningsCents;

      await supabase
        .from("square_wallets")
        .update({
          [columnMap[entry.lifetimeField]]: current + entry.amountCents,
          updated_at: now,
        })
        .eq("id", account.walletId);
    }
  }
}

/** Append-only ledger posting — sole path for balance mutations. */
export async function postLedgerEntry(input: SquareBankPostEntryInput): Promise<SquareBankLedgerEntry> {
  if (input.amountCents <= 0) throw new Error("Ledger amount must be positive.");

  const account = await ensureBankAccount(input.email);
  if (account.status === "fraud_hold") {
    throw new Error("Account is on fraud hold.");
  }
  if (account.status !== "active" && input.direction === "debit") {
    throw new Error("SquareBank account is not active.");
  }

  const compliance = await checkComplianceForEntry(input, account.id);
  if (!compliance.allowed) {
    throw new Error(compliance.reason ?? "Compliance check failed.");
  }

  const transactionId = await generateSquareBankTransactionId();
  const { beforeCents, afterCents } = await applyBalanceDelta({
    accountId: account.id,
    accountType: input.accountType,
    direction: input.direction,
    amountCents: input.amountCents,
  });

  const entry = await insertLedgerEntry({
    id: transactionId,
    accountId: account.id,
    playerEmail: input.email,
    accountType: input.accountType,
    direction: input.direction,
    amountCents: input.amountCents,
    runningBalanceCents: afterCents,
    entryType: input.entryType,
    referenceType: input.referenceType,
    referenceId: input.referenceId,
    paymentTransactionId: input.paymentTransactionId,
    description: input.description,
    metadata: input.metadata,
    module: input.module,
    adminEmail: input.adminEmail,
  });

  await recordAuditTrail({
    ledgerEntryId: transactionId,
    playerEmail: input.email,
    action: buildAuditAction(input),
    amountCents: input.amountCents,
    balanceBeforeCents: beforeCents,
    balanceAfterCents: afterCents,
    accountType: input.accountType,
    referenceType: input.referenceType,
    referenceId: input.referenceId,
    module: input.module,
    adminEmail: input.adminEmail,
    deviceKey: input.audit?.deviceKey,
    ipAddress: input.audit?.ipAddress,
  });

  if (input.lifetimeField) {
    await updateAccountLifetime({
      accountId: account.id,
      field: input.lifetimeField,
      deltaCents: input.amountCents,
    });
  }

  await syncToWalletPresentation(
    { ...input, transactionId, runningBalanceCents: afterCents },
    account
  );

  return entry;
}

/** Transfer between account types within the same bank account. */
export async function postTransferEntry(input: {
  email: string;
  from: SquareBankPostEntryInput["accountType"];
  to: SquareBankPostEntryInput["accountType"];
  amountCents: number;
  entryType: SquareBankPostEntryInput["entryType"];
  description?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ debit: SquareBankLedgerEntry; credit: SquareBankLedgerEntry }> {
  const debit = await postLedgerEntry({
    email: input.email,
    accountType: input.from,
    direction: "debit",
    amountCents: input.amountCents,
    entryType: input.entryType,
    description: input.description ?? `Transfer from ${input.from}`,
    metadata: input.metadata,
  });

  const credit = await postLedgerEntry({
    email: input.email,
    accountType: input.to,
    direction: "credit",
    amountCents: input.amountCents,
    entryType: input.entryType,
    description: input.description ?? `Transfer to ${input.to}`,
    metadata: { ...input.metadata, pairedEntryId: debit.id },
  });

  return { debit, credit };
}

export { WALLET_TO_BANK_BALANCE };
