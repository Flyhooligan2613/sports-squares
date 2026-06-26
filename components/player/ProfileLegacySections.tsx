import LandingGlassCard from "@/components/landing/LandingGlassCard";
import PlayerStatsGrid from "@/components/player/PlayerStatsGrid";
import type { PublicPlayerProfile } from "@/lib/player/publicProfileTypes";
import type { PlayerAchievement } from "@/lib/player/legacyTypes";

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

const FEATURED_ACHIEVEMENT_IDS = [
  "first_board",
  "first_win",
  "ten_wins",
  "hot_streak",
  "streak_legend",
  "big_winner",
  "veteran",
  "squares_champion",
];

function sortAchievements(achievements: PlayerAchievement[]): PlayerAchievement[] {
  const featured = FEATURED_ACHIEVEMENT_IDS.map((id) =>
    achievements.find((a) => a.id === id)
  ).filter((a): a is PlayerAchievement => Boolean(a));

  const rest = achievements.filter((a) => !FEATURED_ACHIEVEMENT_IDS.includes(a.id));
  return [...featured, ...rest];
}

export default function ProfileLegacySections({
  profile,
}: {
  profile: PublicPlayerProfile;
}) {
  const sorted = sortAchievements(profile.achievements);
  const unlockedCount = sorted.filter((a) => a.unlocked).length;

  return (
    <section className="space-y-6 mb-10" aria-label="Legacy and achievements">
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sb-muted">
          Member since {formatMemberSince(profile.memberSince)}
        </span>
        {profile.isVerified ? (
          <span className="rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1.5 text-sky-200">
            ✓ Verified
          </span>
        ) : null}
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-emerald-200">
          {unlockedCount}/{sorted.length} achievements
        </span>
      </div>

      <PlayerStatsGrid profile={profile} />

      <LandingGlassCard className="p-5 sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-sb-muted mb-4">
          Achievements
        </h2>
        <ul className="grid sm:grid-cols-2 gap-3" role="list">
          {sorted.map((achievement) => (
            <li
              key={achievement.id}
              className={[
                "flex items-start gap-3 rounded-xl border p-3 sb-card-lift transition-opacity",
                achievement.unlocked
                  ? "border-white/8 bg-white/[0.03]"
                  : "border-white/5 bg-white/[0.01] opacity-50",
              ].join(" ")}
              aria-label={`${achievement.title}${achievement.unlocked ? "" : " (locked)"}`}
            >
              <span className="text-2xl grayscale-[0.3]" aria-hidden>
                {achievement.unlocked ? achievement.emoji : "🔒"}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{achievement.title}</p>
                <p className="text-xs text-sb-muted leading-relaxed">{achievement.description}</p>
                {!achievement.unlocked ? (
                  <p className="text-[10px] uppercase tracking-wider text-sb-muted mt-1">Locked</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </LandingGlassCard>
    </section>
  );
}
