import type { Metadata } from "next";
import LearnShell, { LearnCard } from "@/components/learn/LearnShell";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Sports Squares Rules | ${BRAND_NAME}`,
};

export default function RulesPage() {
  return (
    <LearnShell
      title="Sports Squares Rules"
      subtitle="Standard quarter-based squares rules used across SquareBoards."
    >
      <LearnCard title="The Grid">
        <p>100 squares on a 10×10 board. Rows represent one team; columns represent the other.</p>
      </LearnCard>
      <LearnCard title="Number Draw">
        <p>Digits 0–9 are assigned randomly to each row and column after the board is full.</p>
      </LearnCard>
      <LearnCard title="Winning Squares">
        <p>
          Use the last digit of each team&apos;s score at the end of a quarter. Example: 17–14
          → digits 7 and 4 determine the winner.
        </p>
      </LearnCard>
      <LearnCard title="Prize Periods">
        <p>Most football boards pay out after Q1, Q2, Q3, and the final score. Prize splits vary by board.</p>
      </LearnCard>
    </LearnShell>
  );
}
