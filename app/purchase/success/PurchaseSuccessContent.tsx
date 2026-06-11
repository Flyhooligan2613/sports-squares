"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

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
          "Payment received. Your invite is still processing — check your email shortly.",
      });
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <main className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
        {status.state === "loading" || status.state === "pending" ? (
          <>
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-100 mb-2">
              Processing your purchase
            </h1>
            <p className="text-slate-500 text-sm">
              Creating your player account and sending your invite...
            </p>
          </>
        ) : null}

        {status.state === "fulfilled" ? (
          <>
            <h1 className="text-xl font-bold text-slate-100 mb-2">
              Purchase complete
            </h1>
            <p className="text-slate-500 text-sm mb-6">
              {status.inviteDeliveryStatus === "sent"
                ? "Your invite has been emailed. You can also open it below."
                : status.inviteDeliveryStatus === "failed"
                  ? "Payment succeeded, but email delivery failed. Use your invite link below."
                  : "Your squares are ready. Use your invite link below."}
            </p>
            <Link
              href={status.invitePath}
              className="inline-block w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors mb-3"
            >
              Open My Invite
            </Link>
            <a
              href={status.inviteUrl}
              className="text-xs text-slate-500 hover:text-slate-300 break-all"
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
