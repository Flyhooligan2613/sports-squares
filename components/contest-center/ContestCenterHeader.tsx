import { PLATFORM_TERMS } from "@/lib/platform/legacy/competitiveLanguage";

export default function ContestCenterHeader() {
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
        <span>Today&apos;s Live Contests</span>
        <span aria-hidden>·</span>
        <span>Trending Contests</span>
        <span aria-hidden>·</span>
        <span>Featured Competitions</span>
        <span aria-hidden>·</span>
        <span>Friends Playing</span>
      </nav>
    </header>
  );
}
