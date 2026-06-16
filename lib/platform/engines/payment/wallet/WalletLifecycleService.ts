import { insertWallet, findWalletByEmail } from "./repository";
import type { SquareWalletRecord } from "./types";

/** Auto-create wallet + SquareBank account on signup with $0 balances and Active status. */
export async function ensureSquareWallet(email: string): Promise<SquareWalletRecord> {
  const existing = await findWalletByEmail(email);
  if (existing) {
    const { ensureBankAccount } = await import("@/lib/platform/engines/squareBank/AccountService");
    await ensureBankAccount(email).catch(() => undefined);
    return existing;
  }
  const wallet = await insertWallet(email);
  const { ensureBankAccount } = await import("@/lib/platform/engines/squareBank/AccountService");
  await ensureBankAccount(email).catch(() => undefined);
  return wallet;
}

export async function getWalletStatus(email: string): Promise<SquareWalletRecord | null> {
  return findWalletByEmail(email);
}

export async function suspendWallet(email: string): Promise<void> {
  const wallet = await findWalletByEmail(email);
  if (!wallet) return;
  const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
  await getSupabaseAdmin()
    .from("square_wallets")
    .update({ status: "suspended", updated_at: new Date().toISOString() })
    .eq("id", wallet.id);
}
