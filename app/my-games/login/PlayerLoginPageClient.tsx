"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import PlayerLoginForm from "@/components/player/PlayerLoginForm";

function LoginErrorBanner() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  if (!error) return null;

  const message =
    error === "sign_in_failed"
      ? "That sign-in link expired or isn't valid. Request a new email link below."
      : error === "session_expired"
        ? "Your session expired. Sign in again to pick up where you left off."
        : null;

  if (!message) return null;

  return (
    <div className="max-w-md mx-auto mb-4 px-4">
      <p className="text-sm text-amber-200/95 bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-3 text-center">
        {message}
      </p>
    </div>
  );
}

export default function PlayerLoginPageClient() {
  return (
    <>
      <Suspense fallback={null}>
        <LoginErrorBanner />
      </Suspense>
      <Suspense fallback={null}>
        <PlayerLoginForm />
      </Suspense>
    </>
  );
}
