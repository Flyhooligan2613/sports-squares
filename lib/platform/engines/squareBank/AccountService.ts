import { ensureSquareWallet } from "@/lib/platform/engines/payment/wallet/WalletLifecycleService";
import { findAccountByEmail, insertBankAccount, linkWalletToAccount } from "./repository";
import type { SquareBankAccountRecord } from "./types";

/** Auto-create financial account on registration; links to SquareWallet presentation layer. */
export async function ensureBankAccount(email: string): Promise<SquareBankAccountRecord> {
  const existing = await findAccountByEmail(email);
  if (existing) {
    if (!existing.walletId) {
      const wallet = await ensureSquareWallet(email);
      await linkWalletToAccount(existing.id, wallet.id);
      return { ...existing, walletId: wallet.id };
    }
    return existing;
  }

  const wallet = await ensureSquareWallet(email);
  const account = await insertBankAccount({ email, walletId: wallet.id });
  return account;
}

export async function getBankAccountStatus(email: string): Promise<SquareBankAccountRecord | null> {
  return findAccountByEmail(email);
}

export async function suspendBankAccount(email: string): Promise<void> {
  const account = await findAccountByEmail(email);
  if (!account) return;
  const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
  await getSupabaseAdmin()
    .from("square_bank_accounts")
    .update({ status: "suspended", updated_at: new Date().toISOString() })
    .eq("id", account.id);
}
