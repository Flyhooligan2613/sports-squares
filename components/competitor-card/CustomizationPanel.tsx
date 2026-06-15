"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { COMPETITOR_CARD_COPY } from "@/lib/competitorCard/copy";
import type { CustomizationState } from "@/lib/competitorCard/types";
import { SectionCard } from "./shared";

interface CustomizationPanelProps {
  customization: CustomizationState;
  isOwner: boolean;
}

export default function CustomizationPanel({ customization, isOwner }: CustomizationPanelProps) {
  if (!isOwner) return null;

  return (
    <SectionCard id="customization" title={COMPETITOR_CARD_COPY.customization}>
      <LandingGlassCard className="p-6 sm:p-8">
        <dl className="space-y-4">
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-sb-muted">Profile Frame</dt>
            <dd className="text-sm text-white mt-1">
              {customization.profileFrameId ?? "Default frame"}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-sb-muted">Featured Achievements</dt>
            <dd className="text-sm text-sb-muted mt-1">
              {customization.featuredAchievementIds.length > 0
                ? `${customization.featuredAchievementIds.length} featured — edit in Phase 2`
                : "Select achievements to showcase (coming soon)"}
            </dd>
          </div>
          {customization.favoriteTeam ? (
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-sb-muted">Favorite Team</dt>
              <dd className="text-sm text-white mt-1">{customization.favoriteTeam}</dd>
            </div>
          ) : null}
        </dl>
        <p className="text-xs text-sb-muted mt-4">
          Full customization editor ships in Phase 2. Profile frame and bio updates are available in settings.
        </p>
      </LandingGlassCard>
    </SectionCard>
  );
}
