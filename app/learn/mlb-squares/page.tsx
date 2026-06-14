import type { Metadata } from "next";
import LearnShell, { LearnCard } from "@/components/learn/LearnShell";
import { Button } from "@/components/ui/Button";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `How to Play MLB Squares | ${BRAND_NAME}`,
  description:
    "Learn how MLB Squares work on SquareBoards — inning checkpoints, Highlight Squares™, and automatic payouts.",
};

export default function MlbSquaresHowToPlayPage() {
  return (
    <LearnShell
      title="MLB Squares"
      subtitle="Baseball squares with inning checkpoints — same grid, different rhythm."
    >
      <LearnCard step={1} title="The 10×10 Grid">
        <p>
          Pick squares on a classic 10×10 board. Each square matches a unique pair
          of score digits — home team across the top, away team down the side.
          When numbers are drawn, your combination is locked for the whole game.
        </p>
      </LearnCard>
      <LearnCard step={2} title="Inning Checkpoints">
        <p>
          Instead of quarters, MLB Squares pay out at the end of the{" "}
          <strong>3rd</strong>, <strong>5th</strong>, and <strong>7th</strong>{" "}
          innings, plus the <strong>final score</strong>. We use cumulative runs
          through each checkpoint — the last digit of each team&apos;s score
          determines the winning square.
        </p>
      </LearnCard>
      <LearnCard step={3} title="Highlight Squares™">
        <p>
          When the board locks, a handful of occupied squares are secretly marked
          as Highlight Squares™ (look for the gold ⭐). Win a checkpoint on a
          highlight square and unlock bonus tier credits on top of your payout.
        </p>
      </LearnCard>
      <LearnCard step={4} title="Automatic Payouts">
        <p>
          Prize pools split across all four checkpoints using standard templates.
          Winnings calculate automatically and deposit to your wallet — no host
          required.
        </p>
      </LearnCard>
      <LearnCard step={5} title="Find a Board">
        <p>
          Browse live MLB games, pick your entry tier, and claim squares before
          first pitch.
        </p>
        <Button href="/games/mlb" className="mt-4 player-btn-glow">
          Browse MLB Games
        </Button>
      </LearnCard>
    </LearnShell>
  );
}
