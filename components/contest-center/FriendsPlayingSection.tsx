import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import type { ContestFriendActivity } from "@/lib/contestCenter/types";

export default function FriendsPlayingSection({
  items,
}: {
  items: ContestFriendActivity[];
}) {
  if (items.length === 0) {
    return (
      <section className="cc-section" aria-labelledby="cc-friends-heading">
        <h2 id="cc-friends-heading" className="cc-section-title">
          Friends Playing
        </h2>
        <LandingGlassCard className="cc-empty-panel p-6 sm:p-8">
          <p className="text-white font-medium mb-1">Your crew hasn&apos;t checked in yet.</p>
          <p className="text-sm text-sb-muted mb-4">
            Follow competitors in the Huddle to see who joins contests live.
          </p>
          <Link href="/huddle" className="cc-inline-link">
            Explore the Huddle →
          </Link>
        </LandingGlassCard>
      </section>
    );
  }

  return (
    <section className="cc-section" aria-labelledby="cc-friends-heading">
      <h2 id="cc-friends-heading" className="cc-section-title">
        🔥 Friends Playing
      </h2>
      <LandingGlassCard className="cc-friends-panel divide-y divide-white/5">
        {items.map((item) => {
          const inner = (
            <>
              <span className="cc-friend-emoji" aria-hidden>
                {item.emoji}
              </span>
              <p className="cc-friend-text">
                <span className="font-semibold text-white">{item.name}</span>{" "}
                <span className="text-sb-muted">{item.action}</span>
              </p>
              {item.href ? (
                <span className="cc-friend-join">Join</span>
              ) : null}
            </>
          );

          return item.href ? (
            <Link key={item.id} href={item.href} className="cc-friend-row">
              {inner}
            </Link>
          ) : (
            <div key={item.id} className="cc-friend-row">
              {inner}
            </div>
          );
        })}
      </LandingGlassCard>
    </section>
  );
}
