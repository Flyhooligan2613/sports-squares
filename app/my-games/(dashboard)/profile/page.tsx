"use client";

import { useEffect, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import {
  getPlayerSessionUser,
  signOutPlayer,
} from "@/lib/auth/playerAuthClient";
import type { User } from "@supabase/supabase-js";

export default function MyGamesProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlayerSessionUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  async function handleSignOut() {
    await signOutPlayer();
    window.location.href = "/my-games/login";
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
        Profile
      </h1>
      <p className="text-sb-muted mb-8">Account and wallet settings.</p>

      <div className="space-y-5">
        <LandingGlassCard className="p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-sb-muted mb-4">
            Account
          </h2>
          {loading ? (
            <div className="player-skeleton-card h-10 w-48" />
          ) : (
            <p className="text-lg font-medium text-white">{user?.email}</p>
          )}
        </LandingGlassCard>

        <LandingGlassCard id="wallet" className="p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-sb-muted mb-2">
            Wallet
          </h2>
          <p className="text-sb-muted text-sm leading-relaxed mb-4">
            Automatic Stripe payouts are coming soon. Your quarter wins will
            deposit directly to the card on file.
          </p>
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sb-gold bg-sb-gold/10 border border-sb-gold/25 rounded-full px-3 py-1">
            Coming soon
          </span>
        </LandingGlassCard>

        <Button variant="ghost" onClick={handleSignOut} className="w-full sm:w-auto">
          Sign out
        </Button>
      </div>
    </div>
  );
}
