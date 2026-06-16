import { GENESIS_MISSIONS } from "@/lib/platform/engines/genesis/config";
import type {
  GenesisMissionProgress,
  GenesisNextStep,
  GenesisScreenContext,
} from "@/lib/platform/engines/genesis/types";

const CONTEXT_PRIORITY: Record<GenesisScreenContext, GenesisNextStep[]> = {
  profile: [
    {
      title: "Complete your profile",
      body: "Add a username and bio so competitors recognize you in the arena.",
      ctaLabel: "Edit profile settings",
      ctaHref: "#settings",
      missionId: "complete_profile",
      emoji: "📝",
    },
    {
      title: "Check your missions",
      body: "Rookie Season missions reward XP, badges, and avatar frames.",
      ctaLabel: "View Mission Center",
      ctaHref: "#genesis-missions",
      emoji: "🎯",
    },
  ],
  my_games: [
    {
      title: "Join your first contest",
      body: "Live boards are waiting — every competition builds your legacy.",
      ctaLabel: "Browse contests",
      ctaHref: "/games/nfl",
      missionId: "join_first_contest",
      emoji: "🏈",
    },
    {
      title: "Visit Contest Center",
      body: "See everything live today across NFL, MLB, Pick'em, and more.",
      ctaLabel: "Contest Center",
      ctaHref: "/contest-center",
      missionId: "view_todays_contests",
      emoji: "📋",
    },
  ],
  contest_center: [
    {
      title: "Pick a contest and join",
      body: "Your Rookie Season progress starts with your first board.",
      ctaLabel: "Join the Contest",
      ctaHref: "/games/nfl",
      missionId: "join_first_contest",
      emoji: "🏆",
    },
  ],
  trophy_room: [
    {
      title: "Win your first trophy",
      body: "Compete in a live board — your trophy case is ready to fill.",
      ctaLabel: "Find a contest",
      ctaHref: "/games/nfl",
      emoji: "🏆",
    },
  ],
  community: [
    {
      title: "Follow three competitors",
      body: "Build your network and earn the Competitor Badge.",
      ctaLabel: "Explore The Huddle",
      ctaHref: "/huddle",
      missionId: "follow_three_competitors",
      emoji: "👥",
    },
  ],
  achievements: [
    {
      title: "Starter achievements unlocked",
      body: "You already earned genesis badges — keep completing missions for more.",
      ctaLabel: "View missions",
      ctaHref: "/my-games/profile#genesis-missions",
      emoji: "🎖️",
    },
  ],
  dashboard: [
    {
      title: "Start Rookie Season",
      body: "Complete guided missions in your first 30 minutes on SquareBoards.",
      ctaLabel: "Open profile",
      ctaHref: "/my-games/profile",
      emoji: "🚀",
    },
  ],
};

export function recommendNextStep(
  context: GenesisScreenContext,
  missions: GenesisMissionProgress[]
): GenesisNextStep {
  const completed = new Set(
    missions.filter((m) => m.status === "completed").map((m) => m.missionId)
  );

  const candidates = CONTEXT_PRIORITY[context] ?? CONTEXT_PRIORITY.dashboard;

  for (const step of candidates) {
    if (step.missionId && completed.has(step.missionId)) continue;
    return step;
  }

  const nextMission = GENESIS_MISSIONS.find((def) => !completed.has(def.id));
  if (nextMission) {
    return {
      title: nextMission.title,
      body: nextMission.description,
      ctaLabel: "Continue Rookie Season",
      ctaHref: "/my-games/profile#genesis-missions",
      missionId: nextMission.id,
      emoji: nextMission.emoji,
    };
  }

  return {
    title: "Keep building your legacy",
    body: "Rookie Season complete — explore contests, rewards, and The Huddle.",
    ctaLabel: "Contest Center",
    ctaHref: "/contest-center",
    emoji: "⭐",
  };
}

export function resolveNextStep(
  context: GenesisScreenContext,
  missions: GenesisMissionProgress[]
): GenesisNextStep {
  return recommendNextStep(context, missions);
}
