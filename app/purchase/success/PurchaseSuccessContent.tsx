"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Trophy } from "lucide-react";
import Logo from "@/components/Logo";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import PurchaseSuccessTimeline from "@/components/purchase/PurchaseSuccessTimeline";
import PurchaseSummaryCard from "@/components/purchase/PurchaseSummaryCard";
import { Button } from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { getPlayerSessionUser } from "@/lib/auth/playerAuthClient";
import { formatPlayerAuthError } from "@/lib/auth/formatPlayerAuthError";
import type { PurchaseSuccessSummary } from "@/lib/purchases/successSummary";

type PurchaseStatus =
  | { state: "loading" }
  | { state: "pending" }
  | { state: "error"; message: string }
  | {
      state: "fulfilled";
      invitePath: string;
      inviteDeliveryStatus: string;
      playerAccessUrl: string | null;
      summary: PurchaseSuccessSummary;
    };

export default function PurchaseSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<PurchaseStatus>({ state: "loading" });
  const [hasAuthSession, setHasAuthSession] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  const [resendState, setResendState] = useState<
    "idle" | "loading" | "sent" | "error"
  >("idle");
  const [resendError, setResendError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus({ state: "error", message: "Missing checkout session." });
      return;
    }

    let cancelled = false;
    let attempts = 0;

    async function poll() {
      attempts += 1;
      const response = await fetch(
        `/api/purchase/status?session_id=${encodeURIComponent(sessionId!)}`
      );
      const payload = (await response.json()) as {
        status?: string;
        invitePath?: string;
        inviteDeliveryStatus?: string;
        playerAccessUrl?: string | null;
        summary?: PurchaseSuccessSummary;
        error?: string;
      };

      if (cancelled) return;

      if (!response.ok) {
        setStatus({
          state: "error",
          message: payload.error || "Could not confirm your purchase.",
        });
        return;
      }

      if (payload.status === "fulfilled" && payload.summary) {
        setStatus({
          state: "fulfilled",
          invitePath: payload.invitePath ?? "/my-games",
          inviteDeliveryStatus: payload.inviteDeliveryStatus ?? "pending",
          playerAccessUrl: payload.playerAccessUrl ?? null,
          summary: payload.summary,
        });
        return;
      }

      if (attempts < 12) {
        setStatus({ state: "pending" });
        setTimeout(poll, 2000);
        return;
      }

      setStatus({
        state: "error",
        message:
          "Payment received. Your squares are still being reserved — refresh shortly.",
      });
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  useEffect(() => {
    if (status.state !== "fulfilled") return;

    getPlayerSessionUser().then((user) => {
      const purchaseEmail = status.summary.email.toLowerCase();
      if (user?.email?.toLowerCase() === purchaseEmail) {
        setHasAuthSession(true);
        setRedirectCountdown(5);
      }
    });
  }, [status]);

  useEffect(() => {
    if (redirectCountdown === null) return;
    if (redirectCountdown <= 0) {
      router.push("/my-games");
      return;
    }

    const timer = window.setTimeout(() => {
      setRedirectCountdown((value) => (value === null ? null : value - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [redirectCountdown, router]);

  async function handleResendMagicLink() {
    if (!sessionId) return;
    setResendState("loading");
    setResendError(null);

    const response = await fetch("/api/purchase/resend-magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });

    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
    };

    if (!response.ok) {
      setResendState("error");
      setResendError(formatPlayerAuthError(payload.error ?? "Could not resend link."));
      return;
    }

    setResendState("sent");
  }

  function handleOpenMyGames() {
    if (status.state !== "fulfilled") return;

    if (hasAuthSession) {
      router.push("/my-games");
      return;
    }

    if (status.playerAccessUrl) {
      window.location.href = status.playerAccessUrl;
      return;
    }

    router.push(`/my-games/login?email=${encodeURIComponent(status.summary.email)}`);
  }

  const isProcessing =
    status.state === "loading" || status.state === "pending";

  const timelineStep =
    status.state === "fulfilled"
      ? status.inviteDeliveryStatus === "sent" ||
        status.inviteDeliveryStatus === "skipped"
        ? "open"
        : "magic"
      : status.state === "pending"
        ? "squares"
        : "payment";

  return (
    <main className="purchase-success-page min-h-[calc(100vh-3.5rem)] relative overflow-hidden px-4 py-10 sm:py-14">
      <div className="purchase-success-glow" aria-hidden />
      <div className="purchase-success-particles" aria-hidden>
        {Array.from({ length: 18 }).map((_, index) => (
          <span key={index} className="purchase-success-particle" />
        ))}
      </div>

      <div className="relative z-10 max-w-lg mx-auto">
        <div className="flex justify-center mb-8 purchase-success-enter">
          <Logo href="/" className="sb-logo-nav" />
        </div>

        {isProcessing ? (
          <LandingGlassCard glow className="p-8 sm:p-10 text-center purchase-success-enter">
            <Spinner className="mx-auto mb-5" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Locking in your squares…
            </h1>
            <p className="text-sb-muted text-sm">
              Payment confirmed — setting up your board access.
            </p>
            <div className="mt-8">
              <PurchaseSuccessTimeline activeStep="squares" />
            </div>
          </LandingGlassCard>
        ) : null}

        {status.state === "fulfilled" ? (
          <div className="space-y-5">
            <LandingGlassCard
              glow
              className="p-6 sm:p-8 text-center purchase-success-card purchase-success-enter"
            >
              <div className="purchase-success-icon-wrap mx-auto mb-5">
                <span className="purchase-success-icon-glow" aria-hidden />
                <span className="purchase-success-icon">
                  <Trophy className="w-10 h-10 text-sb-glow" strokeWidth={1.75} />
                </span>
              </div>

              <p className="text-sb-glow text-xs font-bold uppercase tracking-[0.22em] mb-2">
                You&apos;re In
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
                Purchase Complete!
              </h1>
              <p className="text-sb-muted text-sm sm:text-base leading-relaxed mb-1">
                Your payment was successful.
              </p>
              <p className="text-sb-muted text-sm sm:text-base leading-relaxed mb-4">
                Your squares are now reserved.
              </p>
              <p className="text-sm text-sb-secondary leading-relaxed">
                We&apos;ve sent a secure access link to{" "}
                <span className="text-white font-semibold">{status.summary.email}</span>.
                Use that email anytime to instantly access your games.
              </p>

              {redirectCountdown !== null && redirectCountdown > 0 ? (
                <p className="mt-5 text-sm text-sb-glow font-medium">
                  Redirecting to My Games in {redirectCountdown}…
                </p>
              ) : null}

              <div className="mt-7 space-y-3">
                <Button
                  onClick={handleOpenMyGames}
                  className="w-full purchase-success-primary-btn player-btn-glow"
                >
                  Open My Games
                </Button>
                <button
                  type="button"
                  onClick={handleResendMagicLink}
                  disabled={resendState === "loading"}
                  className="purchase-success-resend-btn"
                >
                  {resendState === "loading"
                    ? "Sending…"
                    : resendState === "sent"
                      ? "Magic link sent again"
                      : "Resend Magic Link"}
                </button>
                {resendError ? (
                  <p className="text-xs text-red-400">{resendError}</p>
                ) : null}
              </div>
            </LandingGlassCard>

            <div className="purchase-success-enter purchase-success-enter-2">
              <PurchaseSummaryCard summary={status.summary} />
            </div>

            <div className="purchase-success-enter purchase-success-enter-3">
              <LandingGlassCard className="p-5 sm:p-6">
                <PurchaseSuccessTimeline activeStep={timelineStep} />
              </LandingGlassCard>
            </div>

            <p className="text-center text-xs text-sb-muted purchase-success-enter purchase-success-enter-4">
              Need your board now?{" "}
              <Link href={status.invitePath} className="text-sb-glow hover:underline">
                Open your board directly
              </Link>
            </p>
          </div>
        ) : null}

        {status.state === "error" ? (
          <LandingGlassCard className="p-8 text-center purchase-success-enter">
            <h1 className="text-2xl font-bold text-white mb-2">Almost there</h1>
            <p className="text-sb-muted text-sm mb-6">{status.message}</p>
            <Button href="/" variant="secondary">
              Back to Home
            </Button>
          </LandingGlassCard>
        ) : null}
      </div>
    </main>
  );
}
