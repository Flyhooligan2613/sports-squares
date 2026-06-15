"use client";

import { CONTEST_CENTER } from "@/lib/platform/language";

const SECTION_LINKS = [
  { id: "cc-live-contests", label: CONTEST_CENTER.todaysLiveContests },
  { id: "cc-trending-contests", label: CONTEST_CENTER.trendingContests },
  { id: "cc-featured-contests", label: CONTEST_CENTER.featuredCompetitions },
  { id: "cc-friends-playing", label: CONTEST_CENTER.friendsPlaying },
] as const;

export default function ContestCenterHeader() {
  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <header className="cc-header sb-xp-hero-enter">
      <p className="cc-header-badge">🏆 {CONTEST_CENTER.shortTitle}</p>
      <h1 className="cc-header-title">{CONTEST_CENTER.shortTitle}</h1>
      <div className="cc-header-taglines">
        <p>{CONTEST_CENTER.tagline}</p>
        <p>{CONTEST_CENTER.tagline2}</p>
        <p>{CONTEST_CENTER.tagline3}</p>
      </div>
      <nav className="cc-header-nav" aria-label="Contest Center sections">
        {SECTION_LINKS.map((link, index) => (
          <span key={link.id} className="cc-header-nav-item">
            {index > 0 ? <span aria-hidden>·</span> : null}
            <button
              type="button"
              className="cc-header-nav-link"
              onClick={() => scrollToSection(link.id)}
            >
              {link.label}
            </button>
          </span>
        ))}
      </nav>
    </header>
  );
}
