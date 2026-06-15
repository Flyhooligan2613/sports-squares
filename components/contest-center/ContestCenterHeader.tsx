"use client";

import { PLATFORM_TERMS } from "@/lib/platform/legacy/competitiveLanguage";

const SECTION_LINKS = [
  { id: "cc-live-contests", label: "Today's Live Contests" },
  { id: "cc-trending-contests", label: "Trending Contests" },
  { id: "cc-featured-contests", label: "Featured Competitions" },
  { id: "cc-friends-playing", label: "Friends Playing" },
] as const;

export default function ContestCenterHeader() {
  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <header className="cc-header sb-xp-hero-enter">
      <p className="cc-header-badge">🏆 {PLATFORM_TERMS.contestCenter}</p>
      <h1 className="cc-header-title">{PLATFORM_TERMS.contestCenterTitle}</h1>
      <div className="cc-header-taglines">
        <p>{PLATFORM_TERMS.contestCenterTagline}</p>
        <p>{PLATFORM_TERMS.contestCenterTagline2}</p>
        <p>{PLATFORM_TERMS.contestCenterTagline3}</p>
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
