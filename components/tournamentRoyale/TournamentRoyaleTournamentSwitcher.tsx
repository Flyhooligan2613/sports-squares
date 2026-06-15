"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { parseTournamentKey, TOURNAMENT_DEFINITIONS } from "@/lib/tournamentRoyale/config";
import { tournamentRoyalePath } from "@/lib/tournamentRoyale/routes";

export default function TournamentRoyaleTournamentSwitcher() {
  const searchParams = useSearchParams();
  const active = parseTournamentKey(searchParams.get("tournament"));

  return (
    <div className="tr-tournament-switcher" role="tablist" aria-label="Select tournament">
      {TOURNAMENT_DEFINITIONS.filter((t) => t.available).map((t) => {
        const href =
          t.key === "ncaab_mens"
            ? tournamentRoyalePath()
            : `${tournamentRoyalePath()}?tournament=${t.key}`;
        const isActive = t.key === active;

        return (
          <Link
            key={t.key}
            href={href}
            role="tab"
            aria-selected={isActive}
            className={`tr-tournament-pill ${isActive ? "tr-tournament-pill-active" : ""}`}
          >
            <span aria-hidden>{t.emoji}</span>
            <span className="hidden sm:inline">{t.name.replace("NCAA ", "")}</span>
          </Link>
        );
      })}
    </div>
  );
}
