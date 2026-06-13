"use client";

import Link from "next/link";
import AppMenuBar from "@/components/nav/AppMenuBar";
import AmbientBackground from "@/components/ui/AmbientBackground";
import ProfileSocialView from "@/components/player/social/ProfileSocialView";
import type { PublicPlayerProfile } from "@/lib/player/publicProfileTypes";

export default function PublicPlayerView({
  profile,
}: {
  profile: PublicPlayerProfile;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <AppMenuBar />
      <main className="flex-1 relative overflow-hidden">
        <AmbientBackground />
        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-purple-400/80 mb-6 text-center sm:text-left">
            SquareBoards Player
          </p>
          <ProfileSocialView profile={profile} />
          <div className="mt-10 flex flex-wrap gap-3 justify-center border-t border-white/10 pt-8">
            <Link
              href="/huddle"
              className="text-sm text-purple-300 hover:text-purple-200 transition-colors"
            >
              👥 The Huddle
            </Link>
            <Link
              href="/leaderboards"
              className="text-sm text-sb-muted hover:text-white transition-colors"
            >
              Leaderboards
            </Link>
            {!profile.isOwner ? (
              <Link
                href="/games/nfl"
                className="text-sm text-sb-muted hover:text-white transition-colors"
              >
                Play Squares
              </Link>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
