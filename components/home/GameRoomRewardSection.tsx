import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import LandingSection from "@/components/landing/LandingSection";
import LandingSectionHeader from "@/components/landing/LandingSectionHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/Button";
import {
  WEEKLY_REWARD_DROP_EMOJI,
  WEEKLY_REWARD_DROP_PUBLIC_DESC,
  WEEKLY_REWARD_DROP_PUBLIC_NAME,
} from "@/lib/platform/ecosystem/squareDropBrand";

export default function GameRoomRewardSection() {
  return (
    <LandingSection variant="alt" className="gameroom-reward-section">
      <ScrollReveal>
        <LandingSectionHeader
          eyebrow="Rewards"
          title={`${WEEKLY_REWARD_DROP_EMOJI} ${WEEKLY_REWARD_DROP_PUBLIC_NAME}`}
          subtitle="Play across the platform — unlock drops, tier perks, and achievements."
          align="center"
        />
      </ScrollReveal>

      <ScrollReveal delay={80}>
        <LandingGlassCard glow className="home-reward-drop-card gameroom-reward-card p-8 sm:p-10 text-center max-w-3xl mx-auto">
          <div className="home-reward-drop-crate gameroom-reward-crate" aria-hidden>
            <span className="home-reward-drop-crate-emoji">{WEEKLY_REWARD_DROP_EMOJI}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
            Play. Unlock. Collect.
          </h3>
          <p className="text-sb-muted text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-6">
            {WEEKLY_REWARD_DROP_PUBLIC_DESC}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              href="/my-games/rewards/square-drop"
              variant="primary"
              className="sb-btn-spring hero-btn-premium"
            >
              Open Weekly Reward Drop
            </Button>
            <Button
              href="/my-games/rewards/achievements"
              variant="secondary"
              className="sb-btn-spring hero-btn-secondary-v2"
            >
              View Achievements
            </Button>
          </div>
          <p className="text-xs text-sb-muted mt-5">
            <Link href="/my-games/rewards" className="text-sb-glow hover:underline">
              My Rewards →
            </Link>
          </p>
        </LandingGlassCard>
      </ScrollReveal>
    </LandingSection>
  );
}
