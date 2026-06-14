"use client";

import AppMenuBar from "@/components/nav/AppMenuBar";
import LandingSection from "@/components/landing/LandingSection";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import AmbientBackground from "@/components/ui/AmbientBackground";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { SURVIVOR_X_PUBLIC_NAME } from "@/lib/survivor/config";
import { survivorPath } from "@/lib/survivor/routes";

const HOF_CATEGORIES = [
  { emoji: "👑", title: "Season Champions", desc: "Every crowned Survivor X™ champion." },
  { emoji: "🔥", title: "Longest Survival Streak", desc: "Weeks survived without elimination." },
  { emoji: "💎", title: "Perfect Seasons", desc: "Never missed a week — never wrong." },
  { emoji: "⚡", title: "Fastest Champion", desc: "Shortest path to the title." },
  { emoji: "🌎", title: "Community Favorites", desc: "Elite players the Huddle follows." },
  { emoji: "📅", title: "Most Seasons Played", desc: "Dedicated veterans of Survivor X™." },
];

export default function SurvivorHallOfFameClient() {
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
              subtitle="Achievements earned in Survivor X™ become part of your SquareBoards identity forever."
            />
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto mt-8">
            {HOF_CATEGORIES.map((cat, index) => (
              <ScrollReveal key={cat.title} delay={index * 40}>
                <div className="landing-glass-card p-5 sm:p-6 h-full text-center">
                  <p className="text-3xl mb-3" aria-hidden>
                    {cat.emoji}
                  </p>
                  <h3 className="text-base font-bold text-white mb-2">{cat.title}</h3>
                  <p className="text-xs text-sb-muted leading-relaxed">{cat.desc}</p>
                  <p className="text-[11px] text-sb-muted/70 mt-4 uppercase tracking-wider">
                    Inductees appear after Season 1
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button href={survivorPath()} variant="secondary">
              Back to {SURVIVOR_X_PUBLIC_NAME}
            </Button>
          </div>
        </LandingSection>
      </div>
    </div>
  );
}
