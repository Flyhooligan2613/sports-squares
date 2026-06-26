"use client";

import { useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import FastPurchaseConfirmModal from "@/components/player/FastPurchaseConfirmModal";
import { Button } from "@/components/ui/Button";
import { fetchAuthBootstrap } from "@/lib/auth/security/webauthnClient";
import { formatUserError } from "@/lib/errors/formatUserError";
import type { WithdrawalHoldReason } from "@/lib/platform/engines/payment/wallet/WithdrawalHoldService";
import { WALLET_COPY } from "@/lib/platform/language/walletLanguage";
import WalletTrustSignals from "./WalletTrustSignals";
import WithdrawalStatusTimeline, { type WithdrawalStage } from "./WithdrawalStatusTimeline";

interface WithdrawPanelProps {
  withdrawableCents: number;
  onComplete?: () => void;
}

function holdMessage(reason?: WithdrawalHoldReason): string {
  switch (reason) {
    case "rapid_deposit_withdraw":
      return WALLET_COPY.withdrawal.holdRapidDeposit;
    case "large_withdrawal":
      return WALLET_COPY.withdrawal.holdLargeWithdrawal;
    case "kyc_pending":
      return WALLET_COPY.withdrawal.holdKyc;
    default:
      return WALLET_COPY.withdrawal.holdLargeWithdrawal;
  }
}

export default function WithdrawPanel({ withdrawableCents, onComplete }: WithdrawPanelProps) {
  const [amountCents, setAmountCents] = useState(Math.min(withdrawableCents, 5000) || 1000);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [showStepUp, setShowStepUp] = useState(false);
  const [withdrawalStage, setWithdrawalStage] = useState<WithdrawalStage | null>(null);
  const [holdUntil, setHoldUntil] = useState<string | null>(null);

  useEffect(() => {
    void fetchAuthBootstrap().then((data) => {
      if (data.email) setEmail(data.email);
    });
  }, []);

  async function submitWithdrawal(stepUpToken?: string) {
    setLoading(true);
    setError(null);
    setMessage(null);
    setWithdrawalStage("requested");
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (stepUpToken) headers["x-step-up-token"] = stepUpToken;

      const res = await fetch("/api/square-wallet/withdraw", {
        method: "POST",
        headers,
        body: JSON.stringify({ amountCents }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        pendingReview?: boolean;
        reviewReason?: WithdrawalHoldReason;
        holdUntil?: string;
        error?: string;
        requiresStepUp?: boolean;
      };
      if (res.status === 403 && data.requiresStepUp) {
        setShowStepUp(true);
        setWithdrawalStage(null);
        return;
      }
      if (!res.ok || !data.ok) {
        setError(formatUserError(data.error ?? "withdraw failed", "withdraw"));
        setWithdrawalStage(null);
        return;
      }

      if (data.pendingReview) {
        setWithdrawalStage("processing");
        setHoldUntil(data.holdUntil ?? null);
        setMessage(holdMessage(data.reviewReason));
      } else {
        setWithdrawalStage("processing");
        setMessage("Withdrawal sent to your linked cash-out account.");
      }
      onComplete?.();
    } catch (err) {
      setError(formatUserError(err, "withdraw"));
      setWithdrawalStage(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleStepUpConfirmed(stepUpToken: string) {
    setShowStepUp(false);
    await submitWithdrawal(stepUpToken);
  }

  return (
    <>
      {email ? (
        <FastPurchaseConfirmModal
          open={showStepUp}
          email={email}
          purpose="payout_change"
          title="Confirm withdrawal"
          subtitle={WALLET_COPY.withdrawal.verificationRequired}
          kicker="SquareWallet™"
          pinTitle="Confirm withdrawal"
          pinSubtitle="Enter your Quick PIN to request this withdrawal."
          onClose={() => setShowStepUp(false)}
          onConfirmed={handleStepUpConfirmed}
        />
      ) : null}
      <LandingGlassCard
        className="p-4 sm:p-6 sb-card-lift"
        role="region"
        aria-labelledby="wallet-withdraw-heading"
        aria-busy={loading}
      >
        <h3
          id="wallet-withdraw-heading"
          className="text-sm font-semibold uppercase tracking-wider text-sb-muted mb-2"
        >
          Withdraw to Cash-out Account
        </h3>
        <p className="text-xs text-sb-muted mb-4">
          Withdrawable: ${(withdrawableCents / 100).toFixed(2)} · Sent via SquareWallet™ to your
          linked account.
        </p>

        {withdrawalStage ? (
          <div className="mb-5 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <WithdrawalStatusTimeline stage={withdrawalStage} holdUntil={holdUntil} />
          </div>
        ) : null}

        <label htmlFor="wallet-withdraw-amount" className="block text-xs text-sb-muted mb-1">
          Amount to withdraw
        </label>
        <p id="wallet-withdraw-amount-hint" className="sr-only">
          Minimum withdrawal is ten dollars. Available withdrawable balance is shown above.
        </p>
        <input
          id="wallet-withdraw-amount"
          type="number"
          min={10}
          step={1}
          disabled={loading}
          aria-describedby="wallet-withdraw-amount-hint"
          value={Math.round(amountCents / 100)}
          onChange={(e) => setAmountCents(Math.round(Number(e.target.value) * 100))}
          className="w-full mb-4 rounded-lg bg-black/30 border border-white/10 px-3 py-2.5 min-h-[44px] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-glow/40"
        />

        {error ? (
          <p className="text-sm text-amber-200/90 mb-2" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="text-sm text-emerald-300 mb-2" role="status">
            {message}
          </p>
        ) : null}

        <Button
          variant="secondary"
          onClick={() => void submitWithdrawal()}
          disabled={loading || withdrawableCents <= 0}
          aria-busy={loading}
          aria-label={
            loading
              ? "Processing withdrawal request"
              : `Request withdrawal of $${(amountCents / 100).toFixed(2)}`
          }
          className="w-full min-h-[44px] sb-btn-press"
        >
          {loading ? "Processing your request…" : "Request Withdrawal"}
        </Button>

        <WalletTrustSignals className="mt-5 pt-4 border-t border-white/[0.06]" />
      </LandingGlassCard>
    </>
  );
}
