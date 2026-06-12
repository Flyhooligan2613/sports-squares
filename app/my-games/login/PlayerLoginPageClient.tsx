"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import PlayerLoginForm from "@/components/player/PlayerLoginForm";

function LoginErrorBanner() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  if (error !== "sign_in_failed") return null;

  return (
    <div className="max-w-md mx-auto mb-4 px-4">
      <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-center">
        Sign-in link expired or invalid. Request a new magic link below.
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
      <PlayerLoginForm />
    </>
  );
}
