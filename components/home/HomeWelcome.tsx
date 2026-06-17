"use client";

import Link from "next/link";
import PlayerAvatar from "@/components/player/PlayerAvatar";

export default function HomeWelcome({
  greeting,
  subtitle,
  avatarEmoji,
}: {
  greeting: string;
  subtitle: string;
  avatarEmoji: string;
}) {
  return (
    <header className="home-welcome mb-8 sm:mb-10">
      <div className="flex flex-wrap items-start gap-5 sm:gap-6">
        <PlayerAvatar emoji={avatarEmoji} size="lg" className="home-welcome-avatar shrink-0" />

        <div className="flex-1 min-w-0">
          <h1 className="home-greeting">{greeting}</h1>
          <p className="text-sb-muted text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        </div>

        <Link href="/action-center" className="home-quick-link hidden sm:inline-flex">
          Browse boards →
        </Link>
      </div>
    </header>
  );
}
