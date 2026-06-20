import ShareLanding from "@/components/share/ShareLanding";
import { buildShareMetadata } from "@/lib/seo/og/metadata";
import {
  fetchAchievementShareData,
  fetchContestShareData,
  fetchLeaderboardShareData,
  fetchLevelUpShareData,
  fetchReferralShareData,
  fetchSeasonShareData,
  fetchStoryShareData,
  fetchTrophyShareData,
  fetchWinnerShareData,
} from "@/lib/seo/og/data";
import { shareUrls } from "@/lib/seo/shareUrls";
import { BRAND_NAME } from "@/lib/brand";

export async function contestSharePage(id: string) {
  const data = await fetchContestShareData(id);
  const title = data?.name ?? "Contest";
  const description = data
    ? `${data.sport} · ${data.prizePoolLabel} prize pool · ${data.playerCount} players`
    : `Join the competition on ${BRAND_NAME}`;

  return {
    metadata: buildShareMetadata({ title, description, path: shareUrls.contest(id) }),
    landing: (
      <ShareLanding
        title={title}
        description={description}
        ctaHref={data ? `/contest-center` : "/home"}
        ctaLabel="Join Contest"
      />
    ),
  };
}

export async function winnerSharePage(username: string, winId: string) {
  const data = await fetchWinnerShareData(username, winId);
  const title = data ? `🏆 ${data.displayName} won!` : "Contest Victory";
  const description = data
    ? `${data.contestName} · ${data.prizeLabel} · ${data.placement}`
    : `Celebrate on ${BRAND_NAME}`;

  return {
    metadata: buildShareMetadata({ title, description, path: shareUrls.winner(username, winId) }),
    landing: (
      <ShareLanding
        title={title}
        description={description}
        ctaHref={shareUrls.profile(username)}
        ctaLabel="View Profile"
      />
    ),
  };
}

export async function levelUpSharePage(username: string, tierSlug: string) {
  const data = await fetchLevelUpShareData(username, tierSlug);
  const title = data ? `LEVEL UP — ${data.displayName}` : "Level Up";
  const description = data
    ? `${data.oldTier} → ${data.newTier} · Score ${data.competitorScore.toLocaleString()}`
    : "Your legacy continues.";

  return {
    metadata: buildShareMetadata({ title, description, path: shareUrls.levelUp(username, tierSlug) }),
    landing: <ShareLanding title={title} description={description} ctaHref={shareUrls.profile(username)} />,
  };
}

export async function achievementSharePage(username: string, achievementId: string) {
  const data = await fetchAchievementShareData(username, achievementId);
  const title = data ? `${data.emoji} ${data.achievementName}` : "Achievement Unlocked";
  const description = data?.description ?? `Unlocked on ${BRAND_NAME}`;

  return {
    metadata: buildShareMetadata({
      title,
      description,
      path: shareUrls.achievement(username, achievementId),
    }),
    landing: <ShareLanding title={title} description={description} ctaHref={shareUrls.profile(username)} />,
  };
}

export async function trophySharePage(username: string, trophyId: string) {
  const data = await fetchTrophyShareData(username, trophyId);
  const title = data?.trophyTitle ?? "Trophy Earned";
  const description = data
    ? `${data.displayName} · ${data.competition} · ${data.placement}`
    : `Premium competition on ${BRAND_NAME}`;

  return {
    metadata: buildShareMetadata({ title, description, path: shareUrls.trophy(username, trophyId) }),
    landing: <ShareLanding title={title} description={description} ctaHref={shareUrls.profile(username)} />,
  };
}

export async function referralSharePage(code: string) {
  const data = await fetchReferralShareData(code);
  const title = data ? `Join ${data.referrerName} on SquareBoards` : "You're Invited";
  const description = data
    ? `${data.rewardLabel} · ${data.bonusLabel} · Code ${data.referralCode}`
    : `Compete. Build Your Legacy. Win Rewards.`;

  return {
    metadata: buildShareMetadata({ title, description, path: shareUrls.referral(code) }),
    landing: (
      <ShareLanding
        title={title}
        description={description}
        ctaHref="/my-games/login"
        ctaLabel="Join Now"
      />
    ),
  };
}

export async function leaderboardSharePage(period: string) {
  const data = await fetchLeaderboardShareData(period);
  const title = data?.periodLabel ?? "Leaderboard";
  const description = data
    ? `Top competitors on ${BRAND_NAME} — ${data.topEntries.map((e) => `#${e.rank} ${e.name}`).join(" · ")}`
    : `Climb the ranks on ${BRAND_NAME}`;

  return {
    metadata: buildShareMetadata({
      title,
      description,
      path: shareUrls.leaderboard(period as "weekly" | "monthly" | "all-time"),
    }),
    landing: <ShareLanding title={title} description={description} ctaHref="/leaderboards" ctaLabel="View Rankings" />,
  };
}

export async function storySharePage(username: string, storyId: string) {
  const data = await fetchStoryShareData(username, storyId);
  const title = data?.headline ?? "Player Story";
  const description = data?.highlights.join(" · ") ?? `Follow ${username} on ${BRAND_NAME}`;

  return {
    metadata: buildShareMetadata({ title, description, path: shareUrls.story(username, storyId) }),
    landing: <ShareLanding title={title} description={description} ctaHref={shareUrls.profile(username)} />,
  };
}

export async function seasonSharePage(username: string, seasonKey: string) {
  const data = await fetchSeasonShareData(username, seasonKey);
  const title = data ? `${data.displayName}'s ${data.seasonLabel} Recap` : "Season Recap";
  const description = data
    ? `${data.totalWins} wins · ${data.prizeMoneyLabel} · ${data.bestSport}`
    : `Your legacy on ${BRAND_NAME}`;

  return {
    metadata: buildShareMetadata({ title, description, path: shareUrls.season(username, seasonKey) }),
    landing: <ShareLanding title={title} description={description} ctaHref={shareUrls.profile(username)} />,
  };
}
