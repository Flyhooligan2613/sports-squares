import LandingGlassCard from "@/components/landing/LandingGlassCard";
import type { PublicPlayerProfile } from "@/lib/player/publicProfileTypes";
import { COMMUNITY_LABELS } from "@/lib/platform/language";

function formatMemberSince(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function winRate(stats: PublicPlayerProfile["stats"]): string | null {
  if (stats.boardsPlayed <= 0) return null;
  const pct = Math.round((stats.lifetimeWins / stats.boardsPlayed) * 100);
  return `${pct}%`;
}

export default function ProfileLegacySections({
  profile,
}: {
  profile: PublicPlayerProfile;
}) {
  const rate = winRate(profile.stats);

  return (
    <section className="space-y-6 mb-10">
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sb-muted">
          Member since {formatMemberSince(profile.memberSince)}
        </span>
        {rate ? (
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-emerald-200">
            {rate} win rate
          </span>
        ) : null}
        {profile.ranks.length > 0 ? (
          profile.ranks.slice(0, 3).map((rank) => (
            <span
              key={rank.title}
              className="rounded-full border border-sb-purple/30 bg-sb-purple/10 px-3 py-1.5 text-purple-200"
            >
              #{rank.rank} {rank.title}
            </span>
          ))
        ) : null}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <LegacyTile label="Lifetime Wins" value={String(profile.stats.lifetimeWins)} />
        <LegacyTile label="Squares Won" value={String(profile.stats.squaresWon)} />
        <LegacyTile label="Seasons" value={String(profile.stats.seasonsPlayed)} />
        <LegacyTile
          label={COMMUNITY_LABELS.competitionRankings}
          value={profile.ranks[0] ? `#${profile.ranks[0].rank}` : "—"}
        />
      </div>

      {profile.achievements.length > 0 ? (
        <LandingGlassCard className="p-5 sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-sb-muted mb-4">
            Achievements
          </h2>
          <ul className="grid sm:grid-cols-2 gap-3">
            {profile.achievements.slice(0, 6).map((achievement) => (
              <li
                key={achievement.id}
                className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-3 sb-card-lift"
              >
                <span className="text-2xl" aria-hidden>
                  {achievement.emoji}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{achievement.title}</p>
                  <p className="text-xs text-sb-muted leading-relaxed">{achievement.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </LandingGlassCard>
      ) : null}
    </section>
  );
}

function LegacyTile({ label, value }: { label: string; value: string }) {
  return (
    <LandingGlassCard className="p-3 text-center sb-card-lift">
      <p className="text-lg font-bold text-white tabular-nums sb-balance-increment">{value}</p>
      <p className="text-[10px] text-sb-muted uppercase tracking-wider mt-0.5">{label}</p>
    </LandingGlassCard>
  );
}
