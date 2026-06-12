import type { Metadata } from "next";
import LearnShell, { LearnCard } from "@/components/learn/LearnShell";
import { Button } from "@/components/ui/Button";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Video Tutorials | ${BRAND_NAME}`,
};

export default function VideoTutorialsPage() {
  return (
    <LearnShell
      title="Video Tutorials"
      subtitle="Quick walkthroughs — coming soon in full production."
    >
      <LearnCard title="Buying Your First Squares">
        <p>Browse a game, pick your squares, and checkout in under a minute.</p>
        <div className="learn-video-placeholder mt-3">▶ Tutorial preview</div>
      </LearnCard>
      <LearnCard title="Tracking Live Games">
        <p>Follow scores and quarter winners from My Games on game day.</p>
        <div className="learn-video-placeholder mt-3">▶ Tutorial preview</div>
      </LearnCard>
      <Button href="/learn/how-to-play" variant="secondary" className="mt-2">
        Read step-by-step guide
      </Button>
    </LearnShell>
  );
}
