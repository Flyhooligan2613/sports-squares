import type { Metadata } from "next";
import AppMenuBar from "@/components/nav/AppMenuBar";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import { BRAND_NAME } from "@/lib/brand";
import { CONTEST_CTAS } from "@/lib/platform/language";

export const metadata: Metadata = {
  title: `Favorites | ${BRAND_NAME}`,
  description: "Your saved games and boards.",
};

export default function FavoritesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppMenuBar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14 sb-page-enter">
        <p className="text-sb-glow text-xs font-bold uppercase tracking-[0.22em] mb-3">Play</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Favorites</h1>
        <LandingGlassCard className="p-8 text-center">
          <p className="text-4xl mb-3">❤️</p>
          <p className="text-white font-semibold mb-2">Coming soon</p>
          <p className="text-sb-muted text-sm mb-6">
            Save your favorite matchups and boards for quick access on game day.
          </p>
          <Button href="/games/nfl" variant="secondary">{CONTEST_CTAS.browseContests}</Button>
        </LandingGlassCard>
      </main>
    </div>
  );
}
