"use client";

import { useEffect, useState } from "react";
import AppMenuBar from "@/components/nav/AppMenuBar";
import LandingSection from "@/components/landing/LandingSection";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import AmbientBackground from "@/components/ui/AmbientBackground";
import ScrollReveal from "@/components/ui/ScrollReveal";
import BrandedLoadingLabel from "@/components/ui/BrandedLoadingLabel";
import { Button } from "@/components/ui/Button";
import { SURVIVOR_X_PUBLIC_NAME } from "@/lib/survivor/config";
import { survivorApiUrl, survivorPath } from "@/lib/survivor/routes";
import type { SurvivorHofCategory } from "@/lib/survivor/types";

interface HofEntry {
  id: string;
  displayName: string;
  headline: string;
  detail: string | null;
  statValue: number | null;
  seasonYear: number;
  inductedAt: string;
}

interface HofView {
  seasonYear: number;
  byCategory: Partial<Record<SurvivorHofCategory, HofEntry[]>>;
  seasonLeaders: {
    email: string;
    displayName: string;
    value: number;
    label: string;
  }[];
  activeSeason: {
    playersRemaining: number;
    totalEntries: number;
    shieldsUsed: number;
  };
}

const CATEGORY_META: {
  key: SurvivorHofCategory;
  emoji: string;
  title: string;
}[] = [
  { key: "champion", emoji: "👑", title: "Season Champions" },
  { key: "untouchable", emoji: "💎", title: "Untouchable" },
  { key: "longest_streak", emoji: "🔥", title: "Longest Runs" },
  { key: "shield_savior", emoji: "🛡️", title: "Shield Legends" },
  { key: "perfect_season", emoji: "✨", title: "Perfect Seasons" },
];

export default function SurvivorHallOfFameClient() {
  const [view, setView] = useState<HofView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(survivorApiUrl("hall-of-fame"), { cache: "no-store" });
        if (!res.ok) throw new Error("Could not load Hall of Fame.");
        setView((await res.json()) as HofView);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const hasInductees = view
    ? Object.values(view.byCategory).some((list) => (list?.length ?? 0) > 0)
    : false;

  return (
    <div className="survivor-page min-h-screen relative overflow-x-hidden">
      <AmbientBackground className="survivor-ambient-amber" fixed />
      <AppMenuBar logoHref={survivorPath()} />

      <div className="relative z-10">
        <LandingSection variant="glow" className="pt-8 sm:pt-12">
          <ScrollReveal>
            <LandingSectionHeader
              eyebrow="Permanent legacy"
              title="Survivor Hall of Fame"
              subtitle="Champions, streaks, and shield legends — earned in Survivor X™ and preserved forever."
            />
          </ScrollReveal>

          {loading ? (
            <BrandedLoadingLabel context="survivor" />
          ) : null}

          {error ? (
            <p className="text-center text-red-400 text-sm py-8" role="alert">
              {error}
            </p>
          ) : null}

          {view ? (
            <>
              <LandingGlassCard className="max-w-3xl mx-auto p-5 sm:p-6 mb-8 mt-6">
                <p className="text-xs uppercase tracking-wider text-sb-muted mb-3">
                  {view.seasonYear} Global Classic — live season
                </p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-amber-400 font-mono">
                      {view.activeSeason.playersRemaining}
                    </p>
                    <p className="text-[10px] uppercase text-sb-muted mt-1">Still alive</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white font-mono">
                      {view.activeSeason.totalEntries}
                    </p>
                    <p className="text-[10px] uppercase text-sb-muted mt-1">Total entries</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-violet-300 font-mono">
                      {view.activeSeason.shieldsUsed}
                    </p>
                    <p className="text-[10px] uppercase text-sb-muted mt-1">Shields used</p>
                  </div>
                </div>
              </LandingGlassCard>

              {view.seasonLeaders.length > 0 ? (
                <div className="max-w-3xl mx-auto mb-10">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-sb-muted mb-3 text-center">
                    Season leaders
                  </h2>
                  <div className="space-y-2">
                    {view.seasonLeaders.slice(0, 8).map((leader) => (
                      <LandingGlassCard
                        key={`${leader.email}-${leader.label}`}
                        className="p-4 flex items-center justify-between gap-3"
                      >
                        <span className="text-white font-semibold">{leader.displayName}</span>
                        <span className="text-sm text-amber-400 font-mono tabular-nums">
                          {leader.value}{" "}
                          <span className="text-sb-muted font-sans text-xs">{leader.label}</span>
                        </span>
                      </LandingGlassCard>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                {CATEGORY_META.map((cat, index) => {
                  const inductees = view.byCategory[cat.key] ?? [];
                  return (
                    <ScrollReveal key={cat.key} delay={index * 40}>
                      <div className="landing-glass-card p-5 sm:p-6 h-full">
                        <p className="text-3xl mb-3 text-center" aria-hidden>
                          {cat.emoji}
                        </p>
                        <h3 className="text-base font-bold text-white mb-3 text-center">
                          {cat.title}
                        </h3>
                        {inductees.length > 0 ? (
                          <ul className="space-y-3">
                            {inductees.slice(0, 4).map((entry) => (
                              <li key={entry.id} className="text-left border-t border-white/8 pt-3 first:border-0 first:pt-0">
                                <p className="text-sm font-semibold text-white">{entry.headline}</p>
                                {entry.detail ? (
                                  <p className="text-xs text-sb-muted mt-0.5">{entry.detail}</p>
                                ) : null}
                                <p className="text-[10px] text-sb-muted/70 mt-1">
                                  {entry.seasonYear}
                                  {entry.statValue != null ? ` · ${entry.statValue}` : ""}
                                </p>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-sb-muted text-center leading-relaxed">
                            {hasInductees
                              ? "No inductees in this category yet."
                              : "Inductees appear as the season unfolds."}
                          </p>
                        )}
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>
            </>
          ) : null}

          <div className="text-center mt-10">
            <Button href={survivorPath("week")} className="mr-3">
              Play This Week
            </Button>
            <Button href={survivorPath()} variant="secondary">
              Back to {SURVIVOR_X_PUBLIC_NAME}
            </Button>
          </div>
        </LandingSection>
      </div>
    </div>
  );
}
