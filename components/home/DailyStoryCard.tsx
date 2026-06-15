"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import type { DailyStory } from "@/lib/dailyStory/types";
import { HUB_SECTION, hubSectionAnchorClassName } from "@/lib/home/hubSections";

export default function DailyStoryCard({ story }: { story: DailyStory }) {
  const lines = story.body.split("\n").filter(Boolean);

  return (
    <section
      id={HUB_SECTION.dailyStory}
      className={hubSectionAnchorClassName("mb-8 sm:mb-10 daily-story-section")}
      aria-labelledby="daily-story-heading"
    >
      <LandingGlassCard className={`daily-story-card daily-story-theme-${story.theme} p-5 sm:p-6`}>
        <div className="daily-story-accent" aria-hidden />
        <p id="daily-story-heading" className="daily-story-kicker">
          📖 Today&apos;s Story
        </p>
        <div className="daily-story-content">
          <span className="daily-story-emoji" aria-hidden>
            {story.emoji}
          </span>
          <blockquote className="daily-story-quote">
            {lines.map((line, index) => (
              <span key={index} className="daily-story-line">
                {line}
              </span>
            ))}
          </blockquote>
        </div>
      </LandingGlassCard>
    </section>
  );
}
