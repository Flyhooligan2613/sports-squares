"use client";

import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import type { SmartRecommendation } from "@/lib/actionCenter/types";

interface SmartRecommendationsProps {
  recommendations: SmartRecommendation[];
}

export default function SmartRecommendations({
  recommendations,
}: SmartRecommendationsProps) {
  return (
    <section>
      <h2 className="ac-section-title">Smart Recommendations</h2>
      {recommendations.length === 0 ? (
        <LandingGlassCard className="p-6 text-center">
          <p className="text-sb-muted text-sm">
            Personalized picks will appear as games heat up.
          </p>
        </LandingGlassCard>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {recommendations.map((rec) => (
            <LandingGlassCard key={rec.id} glow className="ac-rec-card p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-sb-glow mb-2">
                {rec.reason}
              </p>
              <p className="text-base font-bold text-white mb-1">{rec.title}</p>
              <p className="text-sm text-sb-muted mb-4">{rec.detail}</p>
              <Link href={rec.playUrl}>
                <Button size="sm" className="ac-btn-play">
                  {rec.ctaLabel}
                </Button>
              </Link>
            </LandingGlassCard>
          ))}
        </div>
      )}
    </section>
  );
}
