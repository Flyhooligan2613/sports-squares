"use client";

import { useEffect, useState } from "react";
import { CreditCard, ShieldCheck, Zap } from "lucide-react";
import Alert from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { CONTEST_CTAS } from "@/lib/platform/language";
import FastPurchaseConfirmModal from "@/components/player/FastPurchaseConfirmModal";
import PlayEligibilityBanner, {
  usePlayEligible,
} from "@/components/player/PlayEligibilityBanner";
import type { Pool } from "@/lib/types";
import { fetchAuthBootstrap } from "@/lib/auth/security/webauthnClient";
import PlatformHostingFeeNote from "@/components/platform/PlatformHostingFeeNote";
import { normalizeEntryTierCents } from "@/lib/platform/core/entryTiers";
import { PLATFORM_TERMS } from "@/lib/platform/legacy/competitiveLanguage";
import { TRUST_MESSAGES } from "@/lib/platform/core/trustMessages";

interface PoolPurchaseFormProps {
  pool: Pool;
}

export default function PoolPurchaseForm({ pool }: PoolPurchaseFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [squaresCount, setSquaresCount] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedPaymentLabel, setSavedPaymentLabel] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [showFastConfirm, setShowFastConfirm] = useState(false);
  const { eligible: playEligible, loading: eligibilityLoading } = usePlayEligible();

  const costPerSquare = pool.costPerSquare ?? 0;
  const entryTierCents = normalizeEntryTierCents(
    pool.entryTierCents ?? Math.round(costPerSquare * 100)
  );
  const count = parseInt(squaresCount, 10) || 0;
  const total = count > 0 ? count * costPerSquare : 0;
  const totalCents = Math.round(total * 100);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const data = await fetchAuthBootstrap();
      if (cancelled || !data.authenticated || !data.email) return;

      setAuthenticated(true);
      setEmail(data.email);
      if (!name.trim()) setName(data.email.split("@")[0] ?? "");

      const walletRes = await fetch("/api/player/wallet", {
        cache: "no-store",
        credentials: "include",
      });
      if (!walletRes.ok) return;
      const wallet = (await walletRes.json()) as {
        savedPayment?: { label?: string } | null;
        fastCheckoutAvailable?: boolean;
      };
      if (cancelled) return;
      if (wallet.fastCheckoutAvailable && wallet.savedPayment?.label) {
        setSavedPaymentLabel(wallet.savedPayment.label);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  async function startStripeCheckout() {
    setError("");
    const squares = parseInt(squaresCount, 10);
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }

    if (!Number.isInteger(squares) || squares < 1 || squares > 100) {
      setError("Enter between 1 and 100 squares.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/purchase/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poolId: pool.id,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          squaresCount: squares,
        }),
      });

      const raw = await response.text();
      let payload: {
        url?: string;
        error?: string;
        needsFunds?: boolean;
        addFundsUrl?: string;
        ok?: boolean;
        inviteUrl?: string;
        fundedViaWallet?: boolean;
      } = {};
      try {
        payload = raw
          ? (JSON.parse(raw) as typeof payload)
          : {};
      } catch {
        payload = {};
      }

      if (payload.needsFunds && payload.addFundsUrl) {
        window.location.href = payload.addFundsUrl;
        return;
      }

      if (payload.ok && payload.inviteUrl) {
        window.location.href = payload.inviteUrl;
        return;
      }

      if (!response.ok || !payload.url) {
        setError(
          payload.error ||
            (response.status === 503
              ? "Checkout is not available yet. Please contact SquareBoards support."
              : `Could not start checkout (HTTP ${response.status}).`)
        );
        setLoading(false);
        return;
      }

      window.location.href = payload.url;
    } catch {
      setError("Could not start checkout. Please try again.");
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!authenticated) {
      setError("Sign in and set up your cash-out account before purchasing squares.");
      return;
    }
    if (playEligible === false) {
      setError(`Set up your cash-out account on ${PLATFORM_TERMS.contestWinnings} before entering contests.`);
      return;
    }
    if (savedPaymentLabel && authenticated) {
      setShowFastConfirm(true);
      return;
    }
    await startStripeCheckout();
  }

  async function executeFastCheckout(stepUpToken: string) {
    setShowFastConfirm(false);
    setLoading(true);
    setError("");

    const squares = parseInt(squaresCount, 10);
    try {
      const response = await fetch("/api/purchase/fast-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-step-up-token": stepUpToken,
        },
        credentials: "include",
        body: JSON.stringify({
          poolId: pool.id,
          name: name.trim(),
          squaresCount: squares,
          phone: phone.trim() || undefined,
        }),
      });

      const payload = (await response.json()) as {
        inviteUrl?: string;
        error?: string;
        needsFunds?: boolean;
        addFundsUrl?: string;
        ok?: boolean;
      };
      if (payload.needsFunds && payload.addFundsUrl) {
        window.location.href = payload.addFundsUrl;
        return;
      }
      if (!response.ok || !payload.inviteUrl) {
        setError(payload.error ?? "Fast checkout failed.");
        setLoading(false);
        return;
      }

      window.location.href = payload.inviteUrl;
    } catch {
      setError("Fast checkout failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <Card variant="elevated" glow className="p-5 sm:p-6 border-sb-success/20">
        <CardHeader
          title="Purchase Squares"
          subtitle={
            !authenticated
              ? "Sign in and connect your SquareWallet™ cash-out account before purchasing."
              : savedPaymentLabel
                ? "Confirm instantly with biometrics or use SquareWallet checkout."
                : TRUST_MESSAGES.squareWalletCheckout
          }
        />

        <PlayEligibilityBanner compact className="mb-4" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              aria-label="Your name"
            />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              aria-label="Email"
              readOnly={authenticated}
            />
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone (optional)"
              aria-label="Phone"
            />
            <Input
              type="number"
              min={1}
              max={100}
              value={squaresCount}
              onChange={(e) => setSquaresCount(e.target.value)}
              placeholder="Number of squares"
              required
              aria-label="Number of squares"
            />
          </div>

          <div className="sb-card-glass rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sb-muted text-xs uppercase tracking-wider font-medium mb-1">
                Total
              </p>
              <p className="text-2xl font-bold text-sb-success tabular-nums">
                ${total.toFixed(2)}
              </p>
              <p className="text-sb-muted text-xs mt-0.5">
                ${costPerSquare.toFixed(2)} per square
              </p>
              {savedPaymentLabel ? (
                <p className="text-xs text-sb-muted mt-2">Saved: {savedPaymentLabel}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-2 text-sb-muted text-xs">
              <ShieldCheck className="w-4 h-4 text-sb-success" />
              {TRUST_MESSAGES.squareWalletSecured}
            </div>
          </div>

          {totalCents > 0 ? (
            <PlatformHostingFeeNote
              entryTierCents={entryTierCents}
              grossCents={totalCents}
              productType="squares"
            />
          ) : null}

          {savedPaymentLabel && authenticated ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                variant="primary"
                className="w-full sm:w-auto sm:min-w-[220px]"
                disabled={loading || eligibilityLoading || playEligible === false || !authenticated}
              >
                <Zap className="w-4 h-4 mr-2" />
                {loading ? "Processing…" : "Confirm with biometrics"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={loading || eligibilityLoading || playEligible === false || !authenticated}
                onClick={() => void startStripeCheckout()}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Use different card
              </Button>
            </div>
          ) : (
            <Button
              type="submit"
              variant="primary"
              className="w-full sm:w-auto sm:min-w-[220px]"
              disabled={loading || eligibilityLoading || playEligible === false || !authenticated}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {loading ? "Redirecting..." : "Continue to Checkout"}
            </Button>
          )}
        </form>

        {error && (
          <Alert variant="error" className="mt-4">
            {error}
          </Alert>
        )}
      </Card>

      <FastPurchaseConfirmModal
        open={showFastConfirm}
        email={email}
        title={CONTEST_CTAS.lockInYourContest}
        subtitle="Confirm with biometrics or Quick PIN"
        amountLabel={`$${total.toFixed(2)}`}
        onClose={() => setShowFastConfirm(false)}
        onConfirmed={executeFastCheckout}
      />
    </>
  );
}
