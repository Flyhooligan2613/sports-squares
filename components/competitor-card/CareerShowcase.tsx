"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { COMPETITOR_CARD_COPY } from "@/lib/competitorCard/copy";
import type { CareerShowcaseItem } from "@/lib/competitorCard/types";
import { CONTEST_CTAS } from "@/lib/platform/language";
import { SectionCard, SectionEmpty } from "./shared";

interface CareerShowcaseProps {
  items: CareerShowcaseItem[];
}

export default function CareerShowcase({ items }: CareerShowcaseProps) {
  return (
    <SectionCard id="career-showcase" title={COMPETITOR_CARD_COPY.careerShowcase}>
      {items.length === 0 ? (
        <SectionEmpty
          emoji="⭐"
          title={COMPETITOR_CARD_COPY.empty.showcase.title}
          body={COMPETITOR_CARD_COPY.empty.showcase.body}
          actionLabel={CONTEST_CTAS.joinTheContest}
          actionHref="/games/nfl"
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {items.map((item, index) => (
            <LandingGlassCard
              key={item.id}
              className="p-4 sm:p-5 flex gap-3 admin-stat-enter"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <span className="text-2xl" aria-hidden>
                {item.emoji}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-white truncate">{item.title}</p>
                <p className="text-sm text-sb-muted mt-0.5">{item.subtitle}</p>
              </div>
            </LandingGlassCard>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
