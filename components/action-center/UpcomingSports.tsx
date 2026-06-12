"use client";

import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import type { SportSummary } from "@/lib/actionCenter/types";

interface UpcomingSportsProps {
  sports: SportSummary[];
}

export default function UpcomingSports({ sports }: UpcomingSportsProps) {
  return (
    <section>
      <h2 className="ac-section-title">Upcoming Sports</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sports.map((sport) => (
          <LandingGlassCard key={sport.sport} className="ac-sport-card p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-base font-bold text-white">{sport.label}</h3>
              {sport.comingSoon ? (
                <span className="text-[10px] uppercase tracking-wider text-sb-muted">
                  Coming Soon
                </span>
              ) : (
                <Link
                  href={`/games/${sport.sport}`}
                  className="text-xs font-semibold text-sb-glow hover:underline"
                >
                  Browse
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-sb-muted">
                  Games Today
                </p>
                <p className="font-bold text-white tabular-nums">{sport.gamesToday}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-sb-muted">
                  Boards Open
                </p>
                <p className="font-bold text-white tabular-nums">{sport.boardsOpen}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-sb-muted">
                  Players Waiting
                </p>
                <p className="font-bold text-white tabular-nums">{sport.playersWaiting}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-sb-muted">
                  Squares Left
                </p>
                <p className="font-bold text-white tabular-nums">
                  {sport.squaresRemaining}
                </p>
              </div>
            </div>
          </LandingGlassCard>
        ))}
      </div>
    </section>
  );
}
