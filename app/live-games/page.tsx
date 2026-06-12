import type { Metadata } from "next";
import Link from "next/link";
import AppMenuBar from "@/components/nav/AppMenuBar";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Live Games | ${BRAND_NAME}`,
  description: "Watch live boards and games in progress.",
};

export default function LiveGamesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppMenuBar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14 sb-page-enter">
        <p className="text-sb-glow text-xs font-bold uppercase tracking-[0.22em] mb-3">Play</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Live Games</h1>
        <p className="text-sb-muted mb-8">
          Boards in play right now — scores updating live.
        </p>
        <LandingGlassCard glow className="p-8 text-center mb-4">
          <p className="text-4xl mb-3">🔥</p>
          <p className="text-white font-semibold mb-2">Your live boards live in My Games</p>
          <p className="text-sb-muted text-sm mb-6">
            Sign in to see active matchups, scores, and your squares in real time.
          </p>
          <Button href="/my-games" className="player-btn-glow">Open My Games</Button>
        </LandingGlassCard>
        <p className="text-center text-sm text-sb-muted">
          Looking for a new board?{" "}
          <Link href="/games/nfl" className="text-sb-glow hover:underline">
            Browse Games
          </Link>
        </p>
      </main>
    </div>
  );
}
