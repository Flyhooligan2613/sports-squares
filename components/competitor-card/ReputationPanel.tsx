"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { COMPETITOR_CARD_COPY } from "@/lib/competitorCard/copy";
import type { ReputationPanelData } from "@/lib/competitorCard/types";
import { SectionCard } from "./shared";

interface ReputationPanelProps {
  reputation: ReputationPanelData;
}

export default function ReputationPanel({ reputation }: ReputationPanelProps) {
  return (
    <SectionCard id="reputation" title={COMPETITOR_CARD_COPY.reputation}>
      <LandingGlassCard className="p-6 sm:p-8">
        <div className="flex flex-wrap gap-2 mb-4">
          {reputation.titles.length > 0 ? (
            reputation.titles.map((title) => (
              <span
                key={title}
                className="text-xs px-3 py-1.5 rounded-full border border-sb-gold/30 bg-sb-gold/10 text-sb-gold font-medium"
              >
                {title}
              </span>
            ))
          ) : (
            <span className="text-sm text-sb-muted">Reputation titles unlock as you compete.</span>
          )}
        </div>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-sb-muted">Community Rep</dt>
            <dd className="text-xl font-bold text-white mt-1">{reputation.communityReputation}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-sb-muted">Followers</dt>
            <dd className="text-xl font-bold text-white mt-1">{reputation.followerCount.toLocaleString()}</dd>
          </div>
        </dl>
      </LandingGlassCard>
    </SectionCard>
  );
}
