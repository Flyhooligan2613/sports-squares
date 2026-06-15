"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function GameRoomBrowseStrip() {
  function scrollToEcosystem() {
    document.getElementById("ecosystem")?.scrollIntoView({ behavior: "smooth" });
  }

  function scrollToMarketplace() {
    document.getElementById("marketplace")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="gameroom-browse-strip" aria-label="Browse the Game Room">
      <ScrollReveal>
        <div className="gameroom-browse-strip-inner">
          <div className="gameroom-browse-strip-copy">
            <p className="gameroom-browse-kicker">Your playground</p>
            <h2 className="gameroom-browse-title">Pick your next challenge</h2>
            <p className="gameroom-browse-sub">
              Every game, board, and reward on SquareBoards lives here — jump in, run it back,
              and chase what&apos;s next.
            </p>
          </div>
          <div className="gameroom-browse-actions">
            <Button
              variant="primary"
              className="hero-btn-premium sb-btn-spring min-w-[200px] group"
              onClick={scrollToEcosystem}
            >
              Explore Games
              <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 ease-out group-hover:translate-x-1" />
            </Button>
            <Button
              variant="secondary"
              className="hero-btn-secondary-v2 sb-btn-spring min-w-[200px]"
              onClick={scrollToMarketplace}
            >
              Live Boards
            </Button>
            <Link href="/action-center" className="gameroom-browse-link">
              Action Center →
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
