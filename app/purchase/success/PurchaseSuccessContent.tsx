"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";

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
    <main className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 text-center">
        {status.state === "loading" || status.state === "pending" ? (
          <>
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-100 mb-2">
              Processing your purchase
            </h1>
            <p className="text-slate-500 text-sm">
              Setting up your player account and access link...
            </p>
          </>
        ) : null}

        {status.state === "fulfilled" ? (
          <>
            <div className="flex justify-center mb-4">
              <Logo variant="icon" href={undefined} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 mb-3">
              Purchase Complete
            </h1>
            <p className="text-slate-300 text-sm mb-2">
              Your squares have been reserved successfully.
            </p>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Your personal access link has been created. Use the button below
              to access and manage your squares.
            </p>

            {emailFailed && (
              <p className="text-amber-300/90 text-xs bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5 mb-4 text-left">
                Email delivery is still being configured. Your access link is
                available below.
              </p>
            )}

            {status.inviteDeliveryStatus === "sent" && (
              <p className="text-emerald-400/90 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2.5 mb-4">
                A confirmation email has been sent to your inbox.
              </p>
            )}

            <Link
              href={status.invitePath}
              className="inline-block w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors mb-3"
            >
              Open My Squares
            </Link>
            <a
              href={status.inviteUrl}
              className="text-xs text-slate-500 hover:text-slate-300 break-all block"
            >
              {status.inviteUrl}
            </a>
          </>
        ) : null}

        {status.state === "error" ? (
          <>
            <h1 className="text-xl font-bold text-slate-100 mb-2">
              Purchase status
            </h1>
            <p className="text-slate-500 text-sm mb-6">{status.message}</p>
            <Link
              href="/"
              className="inline-block text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-5 py-2.5 rounded-lg transition-colors"
            >
              Back to Home
            </Link>
          </>
        ) : null}
      </div>
    </main>
  );
}
