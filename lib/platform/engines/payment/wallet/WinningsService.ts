import { recordPaymentTransaction } from "@/lib/platform/engines/payment/TransactionCenter";
import { getPaymentProviderId } from "@/lib/platform/engines/payment/config";
import { creditBalance, transferBalance } from "./WalletLedgerService";
import { ensureSquareWallet } from "./WalletLifecycleService";
import type { WinningsCreditInput } from "./types";

/** Credit contest winnings — pending first, optional immediate release to available. */
export async function creditWinnings(input: WinningsCreditInput): Promise<{ ok: boolean; ledgerId?: string }> {
  const amountCents = Math.floor(input.amountCents);
  if (amountCents <= 0) return { ok: false };

  const wallet = await ensureSquareWallet(input.email);

  const entry = await creditBalance({
    email: input.email,
    walletId: wallet.id,
    balanceType: input.releaseImmediately ? "available" : "pending_winnings",
    amountCents,
    entryType: "winnings_credit",
    referenceType: input.poolId ? "pool" : "contest",
    referenceId: input.poolId ?? input.contestId ?? null,
    description: input.description ?? "Contest winnings",
    lifetimeField: "lifetimeWinningsCents",
    metadata: {
      contestId: input.contestId,
      poolId: input.poolId,
    },
  });

  await recordPaymentTransaction({
    playerEmail: input.email,
    contestId: input.contestId ?? null,
    poolId: input.poolId ?? null,
    provider: getPaymentProviderId(),
    walletType: input.releaseImmediately ? "available" : "pending",
    transactionType: "prize_payout",
    amountCents,
    status: "completed",
    idempotencyKey: `winnings_${entry.id}`,
    auditAction: "square_wallet_winnings",
    auditDetail: input.description ?? "Winnings credited to SquareWallet",
  });

  return { ok: true, ledgerId: entry.id };
}

/** Move pending winnings to available (e.g. after verification window). */
export async function releasePendingWinnings(input: {
  email: string;
  amountCents: number;
  referenceId?: string;
}): Promise<void> {
  const amountCents = Math.floor(input.amountCents);
  if (amountCents <= 0) return;

  const wallet = await ensureSquareWallet(input.email);
  await transferBalance({
    email: input.email,
    walletId: wallet.id,
    from: "pending_winnings",
    to: "available",
    amountCents,
    entryType: "winnings_release",
    description: "Winnings available for withdrawal or contest entry",
  });
}

/** Post-win payload for celebration modals — never pushes withdrawal. */
export async function buildPostWinPayload(input: {
  email: string;
  amountCents: number;
  contestName: string;
  poolId?: string;
  contestId?: string;
}) {
  return {
    amountCents: input.amountCents,
    contestName: input.contestName,
    poolId: input.poolId ?? null,
    contestId: input.contestId ?? null,
    options: [
      { id: "keep_competing", label: "Keep Competing", href: "/contest-center" },
      { id: "view_rewards", label: "View Rewards", href: "/my-games/rewards" },
      { id: "save_wallet", label: "Save in SquareWallet", href: "/my-games/wallet" },
      { id: "withdraw_later", label: "Withdraw Later", href: "/my-games/wallet?tab=withdraw" },
    ],
  };
}
