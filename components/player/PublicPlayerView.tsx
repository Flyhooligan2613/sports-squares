"use client";

import Link from "next/link";
import AppMenuBar from "@/components/nav/AppMenuBar";
import AmbientBackground from "@/components/ui/AmbientBackground";
import { CompetitorCardExperience } from "@/components/competitor-card";
import { Button } from "@/components/ui/Button";
import type { CompetitorCardData } from "@/lib/competitorCard/types";
import { COMMUNITY_LABELS, PLAYER_TERMS } from "@/lib/platform/language";

export default function PublicPlayerView({
  slug,
  initialCompetitorCard,
}: {
  slug: string;
  initialCompetitorCard: CompetitorCardData;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <AppMenuBar />
      <main className="flex-1 relative overflow-hidden">
        <AmbientBackground />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          {initialCompetitorCard.isOwner ? (
            <div className="mb-6 flex flex-wrap gap-2 justify-end">
              <Button href="/my-games/profile#settings" variant="secondary" size="sm">
                Edit Profile
              </Button>
              <Button href="/my-games/profile" variant="ghost" size="sm">
                {PLAYER_TERMS.competitorCard}
              </Button>
            </div>
          ) : null}
          <CompetitorCardExperience
            mode="public"
            slug={slug}
            initialData={initialCompetitorCard}
          />
          <div className="mt-10 flex flex-wrap gap-3 justify-center border-t border-white/10 pt-8">
            <Link
              href="/huddle"
              className="text-sm text-purple-300 hover:text-purple-200 transition-colors duration-300"
            >
              👥 The Huddle
            </Link>
            <Link
              href="/leaderboards"
              className="text-sm text-sb-muted hover:text-white transition-colors duration-300"
            >
              {COMMUNITY_LABELS.competitionRankings}
            </Link>
            {!initialCompetitorCard.isOwner ? (
              <Link
                href="/games/nfl"
                className="text-sm text-sb-muted hover:text-white transition-colors duration-300"
              >
                Join the Contest
              </Link>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
