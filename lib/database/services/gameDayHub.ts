import { getActionCenterData } from "@/lib/database/services/actionCenter";
import { getPlayerDashboard } from "@/lib/database/services/playerDashboard";
import { getLiveWinnersCenterData } from "@/lib/database/services/liveWinnersCenter";
import { mapLiveWinnersToActivity } from "@/lib/liveActivity/adapters/liveWinners";
import { resolveGameDayAtmosphere } from "@/lib/gameDay/atmosphere";
import { buildGameDayMissions } from "@/lib/gameDay/missions";
import {
  buildRewardDropReady,
  buildSurvivorReminder,
  buildTierPushNotification,
  toEmotionalNotifications,
} from "@/lib/gameDay/notifications";
import { buildContinuePlaying } from "@/lib/gameDay/continuePlaying";
import { buildWelcomeGreeting } from "@/lib/gameDay/greeting";
import { buildSnapshotCards } from "@/lib/gameDay/snapshot";
import { isGameDaySurface, resolveGameDayPhase } from "@/lib/gameDay/phases";
import type {
  GameDayCommunityMoment,
  GameDayFriendActivity,
  GameDayHubData,
  GameDayPhase,
  GameDayRecap,
  GameDayStatusItem,
  GameDayTimelineSection,
} from "@/lib/gameDay/types";
import { buildWhatsNext } from "@/lib/gameDay/whatsNext";
import { getUnifiedHuddleFeed } from "@/lib/huddle/unifiedFeed";
import { getPlayerPublicIdentity } from "@/lib/player/publicIdentity";
import { normalizeEmail } from "@/lib/player/statsCore";
import { ensureCurrentPickemContest } from "@/lib/pickem/engine/syncContest";
import { buildPickemWeekView } from "@/lib/pickem/weekView";
import { getEcosystemDashboard } from "@/lib/platform/ecosystem/dashboard";
import { evaluateAchievements } from "@/lib/platform/ecosystem/achievements/catalog";
import { getWeeklyDropStatus } from "@/lib/platform/ecosystem/weeklyRewardDrop";
import { getPlayerLegacy } from "@/lib/database/services/playerLegacy";
import { TABLES } from "@/lib/database/config";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getGlobalClassicLeague } from "@/lib/survivor/db/leagues";
import { getSurvivorEntry } from "@/lib/survivor/db/entries";
import { getPickForWeek } from "@/lib/survivor/db/picks";
import { getSurvivorWeek } from "@/lib/survivor/db/weeks";
import type { TimelineEvent } from "@/lib/actionCenter/types";

const PHASE_TIMELINE_HINTS: Record<
  GameDayPhase,
  { label: string; emoji: string; kinds: TimelineEvent["kind"][] }
> = {
  morning: {
    label: "Morning",
    emoji: "🌅",
    kinds: ["board_open", "kickoff"],
  },
  afternoon: {
    label: "Afternoon",
    emoji: "🏈",
    kinds: ["kickoff", "quarter_winner", "halftime"],
  },
  evening: {
    label: "Evening",
    emoji: "🏆",
    kinds: ["quarter_winner", "final", "payout"],
  },
  night: {
    label: "Night",
    emoji: "🌙",
    kinds: ["final", "payout"],
  },
};

function startOfToday(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

async function listFollowingEmails(email: string): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("huddle_player_follows")
    .select("following_email")
    .eq("follower_email", normalizeEmail(email));

  if (error) throw error;
  return (data ?? []).map((row) => row.following_email as string);
}

async function countNewFollowersToday(email: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("huddle_player_follows")
    .select("*", { count: "exact", head: true })
    .eq("following_email", normalizeEmail(email))
    .gte("created_at", startOfToday());

  if (error) throw error;
  return count ?? 0;
}

async function countFriendsPlayingToday(
  followingEmails: string[],
  contestId: string | null
): Promise<number> {
  if (!followingEmails.length) return 0;

  const supabase = getSupabaseAdmin();
  const normalized = followingEmails.map(normalizeEmail);
  let count = 0;

  if (contestId) {
    const { data: picks } = await supabase
      .from("pickem_picks")
      .select("email")
      .eq("contest_id", contestId)
      .in("email", normalized);

    const pickEmails = new Set((picks ?? []).map((r) => normalizeEmail(r.email as string)));
    count += pickEmails.size;
  }

  const { data: players } = await supabase
    .from(TABLES.players)
    .select("email, pool_id")
    .in("email", normalized);

  if (players?.length) {
    const poolIds = Array.from(new Set(players.map((p) => p.pool_id as string)));
    const { data: pools } = await supabase
      .from(TABLES.pools)
      .select("id, kickoff_at")
      .in("id", poolIds);

    const todayPoolIds = new Set(
      (pools ?? [])
        .filter((p) => p.kickoff_at && isToday(p.kickoff_at as string))
        .map((p) => p.id as string)
    );

    const activeFriends = new Set<string>();
    for (const row of players) {
      if (todayPoolIds.has(row.pool_id as string)) {
        activeFriends.add(normalizeEmail(row.email as string));
      }
    }
    count = Math.max(count, activeFriends.size);
  }

  return count;
}

async function countHighlightSquaresActive(poolIds: string[]): Promise<number> {
  if (!poolIds.length) return 0;
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("pool_highlight_squares")
    .select("*", { count: "exact", head: true })
    .in("pool_id", poolIds);

  if (error) return 0;
  return count ?? 0;
}

function buildTimelineSections(
  events: TimelineEvent[],
  phase: GameDayPhase
): GameDayTimelineSection[] {
  const phases: GameDayPhase[] = ["morning", "afternoon", "evening", "night"];

  return phases.map((p) => {
    const hint = PHASE_TIMELINE_HINTS[p];
    const filtered =
      p === phase
        ? events.slice(0, 12)
        : events.filter((e) => hint.kinds.includes(e.kind)).slice(0, 6);

    return {
      phase: p,
      label: hint.label,
      emoji: hint.emoji,
      events: filtered,
      active: p === phase,
    };
  });
}

function startOfWeek(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function buildStatusItems(input: {
  activeSquares: number;
  pickemSubmitted: number;
  pickemTotal: number;
  survivorWaiting: boolean;
  weeklyDropAvailable: boolean;
  friendsPlaying: number;
  highlightSquares: number;
  tierProgressPct: number;
  tierLabel: string;
  newFollowers: number;
  achievementNear: string | null;
  legacyBoardsPlayed: number;
  currentWinStreak: number;
  notificationCount: number;
}): GameDayStatusItem[] {
  const items: GameDayStatusItem[] = [
    {
      id: "squares",
      emoji: "📋",
      label: "Active Squares",
      value: String(input.activeSquares),
      href: "/my-games",
    },
    {
      id: "pickem",
      emoji: "🏈",
      label: "Pick'em Cards",
      value:
        input.pickemTotal > 0
          ? `${input.pickemSubmitted}/${input.pickemTotal} Submitted`
          : "Not entered",
      href: "/pickem",
      highlight: input.pickemTotal > 0 && input.pickemSubmitted < input.pickemTotal,
    },
    {
      id: "survivor",
      emoji: "🛡️",
      label: "Survivor X™",
      value: input.survivorWaiting ? "Pick Waiting" : "Pick Locked",
      href: "/survivor",
      highlight: input.survivorWaiting,
    },
    {
      id: "drop",
      emoji: "🎁",
      label: "Weekly Reward Drop",
      value: input.weeklyDropAvailable ? "Available" : "Opened / Pending",
      href: "/my-games/rewards/square-drop",
      highlight: input.weeklyDropAvailable,
    },
    {
      id: "friends",
      emoji: "👥",
      label: "Friends Playing Today",
      value: String(input.friendsPlaying),
      href: "/huddle",
    },
    {
      id: "highlights",
      emoji: "⭐",
      label: "Highlight Squares",
      value: String(input.highlightSquares),
      href: "/live-winners",
    },
    {
      id: "tier",
      emoji: "⭐",
      label: `${input.tierLabel} Progress`,
      value: `${input.tierProgressPct}%`,
      href: "/my-games/rewards/tier",
    },
    {
      id: "legacy",
      emoji: "📈",
      label: "Legacy Progress",
      value: `${input.legacyBoardsPlayed} boards played`,
      href: "/my-games/profile",
    },
    {
      id: "streak",
      emoji: "🔥",
      label: "Win Streak",
      value:
        input.currentWinStreak > 0
          ? `${input.currentWinStreak} in a row`
          : "Start a streak",
      href: "/my-games/profile",
      highlight: input.currentWinStreak >= 3,
    },
  ];

  if (input.notificationCount > 0) {
    items.push({
      id: "notifications",
      emoji: "🔔",
      label: "Community Notifications",
      value: String(input.notificationCount),
      href: "/my-games",
      highlight: true,
    });
  }

  if (input.newFollowers > 0) {
    items.push({
      id: "followers",
      emoji: "💫",
      label: "New Followers",
      value: String(input.newFollowers),
      href: "/my-games/profile",
    });
  }

  if (input.achievementNear) {
    items.push({
      id: "achievement",
      emoji: "🏅",
      label: "Achievement Close",
      value: input.achievementNear,
      href: "/my-games/rewards/achievements",
      highlight: true,
    });
  }

  return items;
}

function buildRecap(input: {
  phase: GameDayPhase;
  winsToday: number;
  tierProgressPct: number;
  tierLabel: string;
  newFollowers: number;
  xpToday: number;
  rewardsCents: number;
}): GameDayRecap | null {
  if (input.phase !== "evening" && input.phase !== "night") return null;

  return {
    wins: input.winsToday,
    losses: 0,
    rewardsEarnedCents: input.rewardsCents,
    xpGained: input.xpToday,
    tierProgressPct: input.tierProgressPct,
    tierLabel: input.tierLabel,
    newFollowers: input.newFollowers,
    achievementsUnlocked: 0,
    communityActivityCount: 0,
    headline:
      input.winsToday > 0
        ? "You made today count — here's your Game Day summary."
        : "Game day isn't over yet — here's where you stand.",
  };
}

export async function getGameDayHubData(email: string): Promise<GameDayHubData> {
  const now = new Date();
  const phase = resolveGameDayPhase(now);
  const atmosphere = resolveGameDayAtmosphere(now);
  const normalized = normalizeEmail(email);

  const [
    identity,
    dashboard,
    ecosystem,
    actionCenter,
    liveWinners,
    weeklyDrop,
    pickemContest,
    legacy,
    followingEmails,
    newFollowers,
    huddleFeed,
  ] = await Promise.all([
    getPlayerPublicIdentity(normalized),
    getPlayerDashboard(normalized),
    getEcosystemDashboard(normalized),
    getActionCenterData().catch(() => null),
    getLiveWinnersCenterData().catch(() => null),
    getWeeklyDropStatus(normalized).catch(() => null),
    ensureCurrentPickemContest("nfl").catch(() => null),
    getPlayerLegacy(normalized).catch(() => null),
    listFollowingEmails(normalized).catch(() => [] as string[]),
    countNewFollowersToday(normalized).catch(() => 0),
    getUnifiedHuddleFeed({ sort: "trending", viewerEmail: normalized, limit: 8 }).catch(
      () => ({ items: [], pickOfWeek: null })
    ),
  ]);

  const displayName = dashboard?.publicLabel ?? identity.publicLabel;
  const avatarEmoji = dashboard?.avatarEmoji ?? identity.avatarEmoji ?? "🏈";

  let pickemSubmitted = 0;
  let pickemTotal = 0;
  let pickemEntered = false;
  let pickemRemaining = 0;

  if (pickemContest) {
    const weekView = await buildPickemWeekView({
      contest: pickemContest,
      email: normalized,
    }).catch(() => null);

    if (weekView) {
      pickemSubmitted = weekView.progress.completed;
      pickemTotal = weekView.progress.total;
      pickemRemaining = weekView.progress.remaining;
      pickemEntered = weekView.entry.paid;
    }
  }

  const seasonYear = new Date().getFullYear();
  const survivorLeague = await getGlobalClassicLeague(seasonYear, "nfl").catch(() => null);
  let survivorPickWaiting = false;
  let eliminatedFromSurvivor = false;

  if (survivorLeague) {
    const entry = await getSurvivorEntry(survivorLeague.id, normalized).catch(() => null);
    if (entry) {
      eliminatedFromSurvivor = entry.status === "eliminated";
      if (entry.status === "active") {
        const week = await getSurvivorWeek(
          survivorLeague.id,
          survivorLeague.currentWeek
        ).catch(() => null);
        if (week) {
          const pick = await getPickForWeek(entry.id, week.id).catch(() => null);
          survivorPickWaiting = !pick;
        }
      }
    }
  }

  const poolIds = Array.from(
    new Set([
      ...(dashboard?.activeGames.map((g) => g.poolId) ?? []),
      ...(dashboard?.upcomingGames.map((g) => g.poolId) ?? []),
    ])
  );

  const [friendsPlaying, highlightSquares] = await Promise.all([
    countFriendsPlayingToday(followingEmails, pickemContest?.id ?? null),
    countHighlightSquaresActive(poolIds),
  ]);

  const activeSquares =
    (dashboard?.activeGames.reduce((sum, g) => sum + g.ownedSquares.length, 0) ?? 0) +
    (dashboard?.upcomingGames.reduce((sum, g) => sum + g.ownedSquareCount, 0) ?? 0);

  const winsToday =
    dashboard?.recentWins.filter((w) => isToday(w.wonAt)).length ?? 0;

  const xpToday = ecosystem.recentCreditActivity
    .filter((a) => isToday(a.createdAt) && a.entryType === "earn" && a.creditKind === "tier")
    .reduce((sum, a) => sum + a.amount, 0);

  const rewardsCentsToday = dashboard?.recentWins
    .filter((w) => isToday(w.wonAt) && w.payoutStatus === "paid")
    .reduce((sum, w) => sum + w.amount * 100, 0) ?? 0;

  const achievementCtx = {
    legacy: legacy?.stats ?? {
      lifetimeWinnings: 0,
      lifetimeWins: 0,
      squaresWon: 0,
      boardsPlayed: 0,
      totalSquaresPurchased: 0,
      seasonsPlayed: 0,
      yearsPlayed: 0,
      currentWinStreak: 0,
      longestWinStreak: 0,
    },
    mysteryBoxesOpened: ecosystem.account.mysteryBoxesOpened,
    qualifiedReferrals: ecosystem.referral.qualifiedReferrals,
    loginStreakDays: 0,
    lifetimeTierCredits: ecosystem.account.lifetimeTierCredits,
  };

  const supabase = getSupabaseAdmin();
  const { data: profileRow } = await supabase
    .from("player_profiles")
    .select("login_streak_days")
    .eq("email", normalized)
    .maybeSingle();

  const loginStreakDays = Number(profileRow?.login_streak_days ?? 0);
  achievementCtx.loginStreakDays = loginStreakDays;

  const achievements = evaluateAchievements(achievementCtx);
  const nearUnlock = achievements
    .filter((a) => !a.unlocked && a.progress)
    .sort((a, b) => {
      const pctA = a.progress!.current / a.progress!.target;
      const pctB = b.progress!.current / b.progress!.target;
      return pctB - pctA;
    })[0];

  const achievementNear = nearUnlock?.progress
    ? `${Math.round((nearUnlock.progress.current / nearUnlock.progress.target) * 100)}% to ${nearUnlock.title}`
    : null;

  const statusItems = buildStatusItems({
    activeSquares,
    pickemSubmitted,
    pickemTotal,
    survivorWaiting: survivorPickWaiting,
    weeklyDropAvailable: weeklyDrop?.hasUnopenedDrop ?? false,
    friendsPlaying,
    highlightSquares,
    tierProgressPct: ecosystem.tierProgressPct,
    tierLabel: ecosystem.tier.displayName,
    newFollowers,
    achievementNear,
    legacyBoardsPlayed: legacy?.stats.boardsPlayed ?? 0,
    currentWinStreak: legacy?.stats.currentWinStreak ?? 0,
    notificationCount: dashboard?.notifications.length ?? 0,
  });

  const missions = buildGameDayMissions({
    activeSquares,
    pickemCardsSubmitted: pickemSubmitted,
    pickemCardsTotal: pickemTotal,
    survivorPickWaiting,
    weeklyDropAvailable: weeklyDrop?.hasUnopenedDrop ?? false,
    followingCount: followingEmails.length,
    hasJoinedBoardToday: activeSquares > 0,
    xpEarnedToday: xpToday,
  });

  const whatsNext = buildWhatsNext({
    activeSquares,
    upcomingGames: dashboard?.upcomingGames.length ?? 0,
    survivorPickWaiting,
    weeklyDropAvailable: weeklyDrop?.hasUnopenedDrop ?? false,
    pickemRemaining,
    pickemEntered,
    tierProgressPct: ecosystem.tierProgressPct,
    creditsToNextTier: ecosystem.creditsToNextTier,
    liveGamesCount: actionCenter?.nowHappening.length ?? 0,
    recentWinToday: winsToday > 0,
    eliminatedFromSurvivor,
  });

  const notifications = toEmotionalNotifications(dashboard?.notifications ?? []);
  if (survivorPickWaiting) {
    notifications.unshift(buildSurvivorReminder());
  }
  if (weeklyDrop?.hasUnopenedDrop) {
    notifications.unshift(buildRewardDropReady());
  }
  if (ecosystem.creditsToNextTier > 0 && ecosystem.creditsToNextTier <= 50 && ecosystem.nextTier) {
    notifications.unshift(
      buildTierPushNotification(ecosystem.creditsToNextTier, ecosystem.nextTier.displayName)
    );
  }

  const friendActivity: GameDayFriendActivity[] = huddleFeed.items
    .filter((item) => {
      const authorEmail =
        item.kind === "pickem" ? item.post.email : item.post.email;
      return followingEmails.some((f) => normalizeEmail(f) === normalizeEmail(authorEmail));
    })
    .slice(0, 6)
    .map((item) => {
      if (item.kind === "pickem") {
        return {
          id: item.post.id,
          emoji: "🏈",
          name: item.post.author.username,
          action: "shared a Pick Card",
          at: item.publishedAt,
          href: "/huddle",
        };
      }
      return {
        id: item.post.id,
        emoji: "🛡️",
        name: item.post.author.username,
        action: `locked ${item.post.teamAbbr} for ${item.post.weekLabel}`,
        at: item.publishedAt,
        href: "/huddle",
      };
    });

  const communityMoments: GameDayCommunityMoment[] = [];

  if (huddleFeed.pickOfWeek) {
    communityMoments.push({
      id: "pick-of-week",
      emoji: "⭐",
      title: "Pick of the Week",
      detail: `${huddleFeed.pickOfWeek.author.username} — ${huddleFeed.pickOfWeek.weeklyRecord ?? "hot card"}`,
      href: "/huddle",
    });
  }

  if (liveWinners?.bigWin) {
    communityMoments.push({
      id: "big-win",
      emoji: "🔥",
      title: "Big Win Today",
      detail: `$${liveWinners.bigWin.amount.toLocaleString()} on ${liveWinners.bigWin.awayTeam} vs ${liveWinners.bigWin.homeTeam}`,
      href: "/live-winners",
    });
  }

  if (liveWinners?.platform.playersOnline) {
    communityMoments.push({
      id: "players-active",
      emoji: "🟢",
      title: "Community Active",
      detail: `${liveWinners.platform.playersOnline.toLocaleString()} players active right now`,
      href: "/action-center",
    });
  }

  const timelineEvents = actionCenter?.timeline ?? [];
  const timeline = buildTimelineSections(timelineEvents, phase);

  const liveActivity = liveWinners
    ? mapLiveWinnersToActivity(liveWinners).slice(0, 20)
    : [];

  const recap = buildRecap({
    phase,
    winsToday,
    tierProgressPct: ecosystem.tierProgressPct,
    tierLabel: ecosystem.tier.displayName,
    newFollowers,
    xpToday,
    rewardsCents: rewardsCentsToday,
  });

  const weeklyXpEarned = ecosystem.recentCreditActivity
    .filter(
      (a) =>
        a.createdAt >= startOfWeek() &&
        a.entryType === "earn" &&
        a.creditKind === "tier"
    )
    .reduce((sum, a) => sum + a.amount, 0);

  const achievementsUnlocked = achievements.filter((a) => a.unlocked).length;

  const snapshotCards = buildSnapshotCards({
    pickemRemaining,
    pickemEntered,
    survivorPickWaiting,
    weeklyDropAvailable: weeklyDrop?.hasUnopenedDrop ?? false,
    highlightSquares,
    activeSquares,
    upcomingGames: dashboard?.upcomingGames.length ?? 0,
    tierProgressPct: ecosystem.tierProgressPct,
    creditsToNextTier: ecosystem.creditsToNextTier,
    liveGamesCount: actionCenter?.nowHappening.length ?? 0,
  });

  const continuePlaying = buildContinuePlaying({
    survivorPickWaiting,
    weeklyDropAvailable: weeklyDrop?.hasUnopenedDrop ?? false,
    notificationCount: dashboard?.notifications.length ?? 0,
    missionsIncomplete: missions.filter((m) => !m.completed).length,
    pendingReferrals: ecosystem.referral.pendingReferrals,
    pickemRemaining,
    pickemEntered,
    unopenedMysteryBox: ecosystem.unopenedMysteryBox,
  });

  const firstName = displayName.split(" ")[0] ?? displayName;

  return {
    updatedAt: now.toISOString(),
    displayName,
    avatarEmoji,
    greeting: buildWelcomeGreeting(phase, firstName, atmosphere.emoji),
    phase,
    phaseLabel: PHASE_TIMELINE_HINTS[phase].label,
    atmosphere,
    isGameDay: isGameDaySurface(now),
    statusItems,
    missions,
    whatsNext,
    notifications: notifications.slice(0, 8),
    friendActivity,
    communityMoments,
    timeline,
    liveActivity,
    hotGames: actionCenter?.hotGames ?? [],
    recap,
    tier: {
      slug: ecosystem.tier.slug,
      label: ecosystem.tier.displayName,
      progressPct: ecosystem.tierProgressPct,
    },
    snapshotCards,
    continuePlaying,
    todaysGames: {
      active: dashboard?.activeGames ?? [],
      upcoming: dashboard?.upcomingGames ?? [],
    },
    progressCenter: {
      tierSlug: ecosystem.tier.slug,
      tierLabel: ecosystem.tier.displayName,
      tierProgressPct: ecosystem.tierProgressPct,
      creditsToNextTier: ecosystem.creditsToNextTier,
      nextTierLabel: ecosystem.nextTier?.displayName ?? null,
      lifetimeWins: legacy?.stats.lifetimeWins ?? 0,
      lifetimeWinnings: legacy?.stats.lifetimeWinnings ?? 0,
      currentWinStreak: legacy?.stats.currentWinStreak ?? 0,
      longestWinStreak: legacy?.stats.longestWinStreak ?? 0,
      achievementsUnlocked,
      achievementsTotal: achievements.length,
      achievementNear,
      weeklyXpEarned,
      loginStreakDays,
      legacyHeadline: legacy?.headline ?? "Your legacy is just getting started.",
      boardsPlayed: legacy?.stats.boardsPlayed ?? 0,
    },
  };
}
