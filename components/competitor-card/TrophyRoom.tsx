"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { COMPETITOR_CARD_COPY } from "@/lib/competitorCard/copy";
import type { TrophyItem } from "@/lib/competitorCard/types";
import { CONTEST_CTAS } from "@/lib/platform/language";
import { SectionCard, SectionEmpty } from "./shared";

const RARITY_CLASS: Record<TrophyItem["rarity"], string> = {
  common: "border-white/10",
  rare: "border-sky-400/30",
  epic: "border-purple-400/40",
  legendary: "border-sb-gold/50 shadow-[0_0_20px_rgba(246,196,83,0.15)]",
};

interface TrophyRoomProps {
  trophies: TrophyItem[];
}

export default function TrophyRoom({ trophies }: TrophyRoomProps) {
  return (
    <SectionCard id="trophy-room" title={COMPETITOR_CARD_COPY.trophyRoom}>
      {trophies.length === 0 ? (
        <SectionEmpty
          emoji="🏆"
          title={COMPETITOR_CARD_COPY.empty.trophies.title}
          body={COMPETITOR_CARD_COPY.empty.trophies.body}
          actionLabel={CONTEST_CTAS.joinTheContest}
          actionHref="/games/nfl"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {trophies.map((trophy, index) => (
            <LandingGlassCard
              key={trophy.id}
              className={`p-4 text-center admin-stat-enter ${RARITY_CLASS[trophy.rarity]}`}
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <span className="text-3xl block mb-2" aria-hidden>
                {trophy.emoji}
              </span>
              <p className="text-sm font-semibold text-white">{trophy.title}</p>
              <p className="text-xs text-sb-muted mt-1 line-clamp-2">{trophy.description}</p>
            </LandingGlassCard>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
