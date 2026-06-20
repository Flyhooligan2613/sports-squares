import type { ReactNode } from "react";
import { OG_COLORS } from "./design";
import {
  OgAvatar,
  OgBadgeRow,
  OgBrandHeader,
  OgCanvas,
  OgCard,
  OgCta,
  OgEyebrow,
  OgFooter,
  OgStatPill,
  OgSubtitle,
  OgTitle,
} from "./layout";
import type {
  AchievementShareData,
  ContestShareData,
  HomeShareData,
  LeaderboardShareData,
  LevelUpShareData,
  ProfileShareData,
  ReferralShareData,
  SeasonShareData,
  StoryShareData,
  TrophyShareData,
  WinnerShareData,
} from "./types";

export function renderHomeCard(data: HomeShareData) {
  return (
    <OgCanvas glow padding={56}>
      <OgBrandHeader />
      <OgCard padding={48}>
        <div style={{ display: "flex", flex: 1, alignItems: "center", gap: 48 }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 16 }}>
            <OgTitle size={56}>{data.title}</OgTitle>
            <span style={{ color: OG_COLORS.glow, fontSize: 28, fontWeight: 700 }}>{data.tagline}</span>
            <OgSubtitle>{data.description}</OgSubtitle>
            <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
              <OgStatPill label="Games" value="12+" accent={OG_COLORS.cyan} />
              <OgStatPill label="Players" value="Live" accent={OG_COLORS.success} />
              <OgStatPill label="Rewards" value="Daily" accent={OG_COLORS.gold} />
            </div>
          </div>
          <div
            style={{
              width: 280,
              height: 420,
              borderRadius: 32,
              background: `linear-gradient(180deg, ${OG_COLORS.surfaceAlt}, ${OG_COLORS.bg})`,
              border: `2px solid ${OG_COLORS.borderStrong}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 60px rgba(91, 76, 247, 0.35)",
            }}
          >
            <span style={{ color: OG_COLORS.white, fontSize: 22, fontWeight: 700 }}>SB</span>
            <span style={{ color: OG_COLORS.white, fontSize: 22, fontWeight: 700 }}>Compete Anywhere</span>
            <span style={{ color: OG_COLORS.muted, fontSize: 16, marginTop: 8 }}>Mobile • Web • PWA</span>
          </div>
        </div>
      </OgCard>
      <OgFooter />
    </OgCanvas>
  );
}

export function renderProfileCard(data: ProfileShareData) {
  return (
    <OgCanvas padding={48}>
      <OgBrandHeader />
      <div style={{ display: "flex", flex: 1, gap: 40, alignItems: "center" }}>
        <OgCard padding={40}>
          <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
            <OgAvatar emoji={data.avatarEmoji} size={180} />
            <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <OgTitle size={48}>{data.displayName}</OgTitle>
                <span
                  style={{
                    color: OG_COLORS.gold,
                    fontSize: 18,
                    fontWeight: 700,
                    padding: "6px 16px",
                    borderRadius: 999,
                    background: "rgba(246, 196, 53, 0.12)",
                    border: "1px solid rgba(246, 196, 53, 0.35)",
                  }}
                >
                  {data.tierName} · Lv {data.level}
                </span>
              </div>
              <OgSubtitle>{data.headline}</OgSubtitle>
              <OgBadgeRow badges={data.badges} />
              <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
                <OgStatPill label="Competitor Score" value={data.competitorScore.toLocaleString()} accent={OG_COLORS.glow} />
                <OgStatPill label="World Rank" value={data.worldRankLabel} />
                <OgStatPill label="Win Streak" value={String(data.winStreak)} accent={OG_COLORS.gold} />
                <OgStatPill label="Followers" value={data.followers.toLocaleString()} />
              </div>
              {data.showcaseAchievement && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
                  <span style={{ fontSize: 28 }}>{data.showcaseAchievement.emoji}</span>
                  <span style={{ color: OG_COLORS.white, fontSize: 20, fontWeight: 700 }}>
                    {data.showcaseAchievement.title}
                  </span>
                </div>
              )}
            </div>
          </div>
        </OgCard>
      </div>
      <OgFooter />
    </OgCanvas>
  );
}

export function renderContestCard(data: ContestShareData) {
  return (
    <OgCanvas glow>
      <OgBrandHeader />
      <OgCard>
        <OgEyebrow>{data.sport} CONTEST</OgEyebrow>
        <OgTitle>{data.name}</OgTitle>
        <OgSubtitle>{data.countdownLabel}</OgSubtitle>
        <div style={{ display: "flex", gap: 16, marginTop: 24, flexWrap: "wrap" }}>
          <OgStatPill label="Prize Pool" value={data.prizePoolLabel} accent={OG_COLORS.gold} />
          <OgStatPill label="Entry Fee" value={data.entryFeeLabel} accent={OG_COLORS.success} />
          <OgStatPill label="Players" value={data.playerCount.toLocaleString()} />
          <OgStatPill label="Spots Left" value={data.spotsRemaining.toLocaleString()} accent={OG_COLORS.cyan} />
        </div>
        <OgCta label="Join Now" />
      </OgCard>
      <OgFooter />
    </OgCanvas>
  );
}

export function renderWinnerCard(data: WinnerShareData) {
  return (
    <OgCanvas glow>
      <OgBrandHeader />
      <OgCard>
        <OgEyebrow>🏆 Contest Victory</OgEyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 32, marginTop: 8 }}>
          <OgAvatar emoji={data.avatarEmoji} size={140} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <OgTitle size={40}>{data.displayName}</OgTitle>
            <OgSubtitle>{data.contestName}</OgSubtitle>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
          <OgStatPill label="Placement" value={data.placement} accent={OG_COLORS.gold} />
          <OgStatPill label="Prize Won" value={data.prizeLabel} accent={OG_COLORS.success} />
          <OgStatPill label="Win Streak" value={String(data.winStreak)} accent={OG_COLORS.glow} />
        </div>
      </OgCard>
      <OgFooter tagline="Your legacy continues." />
    </OgCanvas>
  );
}

export function renderLevelUpCard(data: LevelUpShareData) {
  return (
    <OgCanvas glow>
      <OgBrandHeader />
      <OgCard>
        <OgEyebrow color={OG_COLORS.glow}>LEVEL UP</OgEyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <OgAvatar emoji={data.avatarEmoji} size={120} />
          <OgTitle size={38}>{data.displayName}</OgTitle>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 24 }}>
          <span style={{ color: OG_COLORS.muted, fontSize: 28 }}>{data.oldTier}</span>
          <span style={{ color: OG_COLORS.glow, fontSize: 36 }}>→</span>
          <span style={{ color: OG_COLORS.gold, fontSize: 36, fontWeight: 700 }}>{data.newTier}</span>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
          <OgStatPill label="Competitor Score" value={data.competitorScore.toLocaleString()} accent={OG_COLORS.glow} />
          <OgStatPill label="Progress" value={`${Math.round(data.progressPct)}%`} />
        </div>
        <div
          style={{
            marginTop: 20,
            height: 12,
            borderRadius: 999,
            background: "rgba(255,255,255,0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${Math.min(100, data.progressPct)}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${OG_COLORS.purple}, ${OG_COLORS.glow})`,
            }}
          />
        </div>
      </OgCard>
      <OgFooter tagline="Your legacy continues." />
    </OgCanvas>
  );
}

export function renderAchievementCard(data: AchievementShareData) {
  return (
    <OgCanvas>
      <OgBrandHeader />
      <OgCard>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <span style={{ fontSize: 96 }}>{data.emoji}</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <OgEyebrow>Achievement Unlocked</OgEyebrow>
            <OgTitle size={36}>{data.achievementName}</OgTitle>
            <OgSubtitle>{data.description}</OgSubtitle>
            <span style={{ color: OG_COLORS.muted, fontSize: 18, marginTop: 8 }}>
              {data.displayName} · {data.unlockedLabel}
            </span>
          </div>
        </div>
      </OgCard>
      <OgFooter />
    </OgCanvas>
  );
}

export function renderTrophyCard(data: TrophyShareData) {
  return (
    <OgCanvas glow>
      <OgBrandHeader />
      <OgCard>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          <span style={{ fontSize: 88 }}>🏆</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <OgTitle size={36}>{data.trophyTitle}</OgTitle>
            <OgSubtitle>{data.competition}</OgSubtitle>
            <span style={{ color: OG_COLORS.white, fontSize: 22 }}>{data.displayName}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
          <OgStatPill label="Placement" value={data.placement} accent={OG_COLORS.gold} />
          <OgStatPill label="Prize" value={data.prizeLabel} accent={OG_COLORS.success} />
          <OgStatPill label="Date" value={data.dateLabel} />
        </div>
      </OgCard>
      <OgFooter />
    </OgCanvas>
  );
}

export function renderReferralCard(data: ReferralShareData) {
  return (
    <OgCanvas glow>
      <OgBrandHeader />
      <OgCard>
        <OgEyebrow>Invited by</OgEyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 8 }}>
          <OgAvatar emoji={data.avatarEmoji} size={100} />
          <OgTitle size={36}>{data.referrerName}</OgTitle>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
          <OgStatPill label="Referral Code" value={data.referralCode} accent={OG_COLORS.glow} />
          <OgStatPill label="Bonus" value={data.bonusLabel} accent={OG_COLORS.gold} />
        </div>
        <OgCta label="Join SquareBoards" />
      </OgCard>
      <OgFooter />
    </OgCanvas>
  );
}

export function renderLeaderboardCard(data: LeaderboardShareData) {
  return (
    <OgCanvas>
      <OgBrandHeader />
      <OgCard>
        <OgEyebrow>Leaderboard</OgEyebrow>
        <OgTitle size={38}>{data.periodLabel}</OgTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 24 }}>
          {data.topEntries.map((entry) => (
            <div
              key={entry.rank}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                borderRadius: 16,
                background: entry.rank === 1 ? "rgba(246, 196, 53, 0.1)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${OG_COLORS.border}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ color: OG_COLORS.gold, fontSize: 24, fontWeight: 700, width: 36 }}>
                  #{entry.rank}
                </span>
                <span style={{ color: OG_COLORS.white, fontSize: 22, fontWeight: 700 }}>{entry.name}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ color: OG_COLORS.glow, fontSize: 20, fontWeight: 700 }}>{entry.scoreLabel}</span>
                <span style={{ color: OG_COLORS.success, fontSize: 18 }}>{entry.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </OgCard>
      <OgFooter />
    </OgCanvas>
  );
}

export function renderStoryCard(data: StoryShareData) {
  return (
    <OgCanvas glow>
      <OgBrandHeader />
      <OgCard>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <OgAvatar emoji={data.avatarEmoji} size={100} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <OgTitle size={34}>{data.headline}</OgTitle>
            <OgSubtitle>{data.displayName}</OgSubtitle>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
          {data.highlights.map((line) => (
            <span key={line} style={{ color: OG_COLORS.white, fontSize: 24, fontWeight: 700 }}>
              {line}
            </span>
          ))}
        </div>
      </OgCard>
      <OgFooter />
    </OgCanvas>
  );
}

export function renderSeasonCard(data: SeasonShareData) {
  return (
    <OgCanvas glow>
      <OgBrandHeader />
      <OgCard>
        <OgEyebrow>Season Recap</OgEyebrow>
        <OgTitle size={36}>{data.displayName}</OgTitle>
        <OgSubtitle>{data.seasonLabel} Season</OgSubtitle>
        <div style={{ display: "flex", gap: 14, marginTop: 20, flexWrap: "wrap" }}>
          <OgStatPill label="Total Wins" value={String(data.totalWins)} accent={OG_COLORS.gold} />
          <OgStatPill label="Entries" value={String(data.totalEntries)} />
          <OgStatPill label="Prize Money" value={data.prizeMoneyLabel} accent={OG_COLORS.success} />
          <OgStatPill label="Best Sport" value={data.bestSport} accent={OG_COLORS.cyan} />
          <OgStatPill label="Achievements" value={String(data.achievementCount)} />
          <OgStatPill label="Legacy" value={`${Math.round(data.legacyProgressPct)}%`} accent={OG_COLORS.glow} />
        </div>
      </OgCard>
      <OgFooter tagline="Your legacy continues." />
    </OgCanvas>
  );
}

export function renderNotFoundCard(message: string) {
  return (
    <OgCanvas>
      <OgBrandHeader />
      <RowCenter>{message}</RowCenter>
      <OgFooter />
    </OgCanvas>
  );
}

function RowCenter({ children }: { children: ReactNode }) {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: OG_COLORS.muted, fontSize: 28 }}>
      {children}
    </div>
  );
}
