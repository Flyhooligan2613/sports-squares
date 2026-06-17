"use client";

import Link from "next/link";
import PlayerAvatar from "@/components/player/PlayerAvatar";
import { GAME_DAY_HREF } from "@/lib/home/hubSections";

export default function GameRoomHero({
  greeting,
  subtitle,
  avatarEmoji,
  isGameDay,
}: {
  greeting: string;
  subtitle: string;
  avatarEmoji: string;
  isGameDay: boolean;
}) {
  return (
    <header className="gameroom-hero mb-6 sm:mb-8">
      <div className="gameroom-hero-bg" aria-hidden>
        <span className="gameroom-orb gameroom-orb-a" />
        <span className="gameroom-orb gameroom-orb-b" />
        <span className="gameroom-orb gameroom-orb-c" />
        <div className="gameroom-hero-lights">
          {Array.from({ length: 12 }).map((_, index) => (
            <span
              key={index}
              className="gameroom-light-bulb"
              style={{ "--bulb-i": index } as React.CSSProperties}
            />
          ))}
        </div>
      </div>

      <div className="gameroom-hero-inner relative z-10">
        <div className="flex flex-wrap items-start gap-5 sm:gap-6 mb-5">
          <PlayerAvatar
            emoji={avatarEmoji}
            size="lg"
            className="gameroom-hero-avatar shrink-0"
          />

          <div className="flex-1 min-w-0">
            <p className="gameroom-neon-sign mb-3" aria-hidden>
              Game Room
            </p>
            <h1 className="gameroom-greeting">{greeting}</h1>
            <p className="text-sb-muted text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          </div>

          <Link href={GAME_DAY_HREF} className="gameroom-gameday-chip hidden sm:inline-flex">
            {isGameDay ? "🔴 Game Day Live" : "📅 Game Day"} →
          </Link>
        </div>
      </div>
    </header>
  );
}
