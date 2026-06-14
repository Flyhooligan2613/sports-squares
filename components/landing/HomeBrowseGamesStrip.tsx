"use client";

import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function HomeBrowseGamesStrip() {
  function scrollToMarketplace() {
    document.getElementById("marketplace")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="home-browse-strip" aria-label="Browse games">
      <ScrollReveal>
        <div className="home-browse-strip-inner">
          <div className="home-browse-strip-copy">
            <p className="home-browse-strip-kicker">Ready to play</p>
            <h2 className="home-browse-strip-title">Browse live boards</h2>
            <p className="home-browse-strip-sub">
              NFL, NBA, college, and more — pick your squares before kickoff.
            </p>
          </div>
          <div className="home-browse-strip-actions">
            <Button
              variant="primary"
              className="hero-btn-premium sb-btn-spring min-w-[220px] group"
              onClick={scrollToMarketplace}
            >
              Browse Games
              <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 ease-out group-hover:translate-x-1" />
            </Button>
            <Button
              variant="secondary"
              className="hero-btn-secondary-v2 sb-btn-spring min-w-[220px]"
              onClick={() =>
                document.getElementById("join")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Enter Invite Link
            </Button>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
