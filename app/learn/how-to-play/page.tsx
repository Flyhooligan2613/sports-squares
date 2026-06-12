import type { Metadata } from "next";
import LearnShell, { LearnCard } from "@/components/learn/LearnShell";
import { Button } from "@/components/ui/Button";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `How to Play | ${BRAND_NAME}`,
  description: "Learn how sports squares work on SquareBoards.",
};

export default function HowToPlayPage() {
  return (
    <LearnShell
      title="How to Play"
      subtitle="Everything you need to go from checkout to kickoff — in minutes."
    >
      <LearnCard step={1} title="How Sports Squares Work">
        <p>
          Pick squares on a 10×10 grid. Each square matches a unique pair of score
          digits — one for each team. When the game ends a quarter, the last digit of
          each team&apos;s score determines the winning square.
        </p>
      </LearnCard>
      <LearnCard step={2} title="How Numbers Are Assigned">
        <p>
          After the board fills, digits 0–9 are randomly assigned to rows and columns.
          Your square&apos;s position locks in once numbers are drawn — that&apos;s your
          combination for every quarter.
        </p>
      </LearnCard>
      <LearnCard step={3} title="How Winners Are Determined">
        <p>
          At the end of each quarter (and often the final score), we look at the last
          digit of each team&apos;s score. The square at that intersection wins that
          period&apos;s prize.
        </p>
      </LearnCard>
      <LearnCard step={4} title="How Automatic Payouts Work">
        <p>
          Winnings are calculated from the prize pool automatically. Payouts deposit to
          the payment method on file — no host required, no manual collection.
        </p>
      </LearnCard>
      <LearnCard step={5} title="How to Access My Games">
        <p>
          After purchase, use the email from checkout to sign in at My Games. You&apos;ll
          see live scores, your squares, upcoming kickoffs, and your win history.
        </p>
        <Button href="/my-games" className="mt-4 player-btn-glow">
          Open My Games
        </Button>
      </LearnCard>
    </LearnShell>
  );
}
