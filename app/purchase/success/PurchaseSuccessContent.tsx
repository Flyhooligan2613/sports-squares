"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import Logo from "@/components/Logo";
import Alert from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";

type PurchaseStatus =
  | { state: "loading" }
  | { state: "pending" }
  | { state: "error"; message: string }
  | {
      state: "fulfilled";
      invitePath: string;
      inviteUrl: string;
      inviteDeliveryStatus: string;
    };

export default function PurchaseSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<PurchaseStatus>({ state: "loading" });

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
        inviteUrl?: string;
        invitePath?: string;
        inviteDeliveryStatus?: string;
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

      if (payload.status === "fulfilled" && payload.inviteUrl) {
        const invitePath =
          payload.invitePath ||
          new URL(payload.inviteUrl, window.location.origin).pathname;
        setStatus({
          state: "fulfilled",
          inviteUrl: payload.inviteUrl,
          invitePath,
          inviteDeliveryStatus: payload.inviteDeliveryStatus ?? "pending",
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
          "Payment received. Your access link is still processing — refresh this page shortly.",
      });
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const emailFailed =
    status.state === "fulfilled" &&
    status.inviteDeliveryStatus === "failed";

  return (
    <main className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12 sb-page-enter">
      <Card variant="elevated" glow className="w-full max-w-md p-6 sm:p-8 text-center">
        {status.state === "loading" || status.state === "pending" ? (
          <>
            <Spinner className="mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">
              Processing your purchase
            </h1>
            <p className="text-sb-muted text-sm">
              Setting up your player account and access link...
            </p>
          </>
        ) : null}

        {status.state === "fulfilled" ? (
          <>
            <div className="flex justify-center mb-5">
              <span className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sb-success/10 border border-sb-success/25">
                <CheckCircle2 className="w-8 h-8 text-sb-success" />
              </span>
            </div>
            <div className="flex justify-center mb-4">
              <Logo variant="icon" href={undefined} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-3">
              Purchase Complete
            </h1>
            <p className="text-sb-secondary text-sm mb-2">
              Your squares have been reserved successfully.
            </p>
            <p className="text-sb-muted text-sm mb-6 leading-relaxed">
              Your personal access link has been created. Use the button below
              to access and manage your squares.
            </p>

            {emailFailed && (
              <Alert variant="warning" className="mb-4 text-left">
                Email delivery is still being configured. Your access link is
                available below.
              </Alert>
            )}

            {status.inviteDeliveryStatus === "sent" && (
              <Alert variant="success" className="mb-4">
                A confirmation email has been sent to your inbox.
              </Alert>
            )}

            <Button href={status.invitePath} variant="primary" className="w-full mb-4">
              Open My Squares
            </Button>
            <a
              href={status.inviteUrl}
              className="text-xs text-sb-muted hover:text-sb-glow break-all block transition-colors"
            >
              {status.inviteUrl}
            </a>
          </>
        ) : null}

        {status.state === "error" ? (
          <>
            <h1 className="text-xl font-bold text-white mb-2">
              Purchase status
            </h1>
            <p className="text-sb-muted text-sm mb-6">{status.message}</p>
            <Button href="/" variant="secondary">
              Back to Home
            </Button>
          </>
        ) : null}
      </Card>
    </main>
  );
}
