import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import {
  COMMUNITY_LABELS,
  CONTEST_CTAS,
  PROFILE_LABELS,
  REWARD_LABELS,
} from "@/lib/platform/language";
import {
  ArrowRight,
  Grid3X3,
  ShoppingCart,
  History,
  Trophy,
  BarChart3,
  Gift,
  Users,
} from "lucide-react";

const ACTIONS = [
  {
    href: "/games/nfl",
    label: CONTEST_CTAS.browseContests,
    icon: Grid3X3,
    description: "Find your next contest",
  },
  {
    href: "/games/nfl",
    label: "Purchase More Squares",
    icon: ShoppingCart,
    description: "Secure checkout in seconds",
  },
  {
    href: "/leaderboards",
    label: COMMUNITY_LABELS.competitionRankings,
    icon: BarChart3,
    description: COMMUNITY_LABELS.worldwideRankings,
  },
  {
    href: "/my-games/rewards",
    label: REWARD_LABELS.myRewards,
    icon: Gift,
    description: "Credits, boxes & marketplace",
  },
  {
    href: "/my-games/referrals",
    label: "Refer & Earn",
    icon: Users,
    description: "Share your Competitor ID",
  },
  {
    href: "/my-games/profile#legacy",
    label: "Your Legacy",
    icon: Trophy,
    description: "Wins, streaks & achievements",
  },
  {
    href: "/my-games/history",
    label: PROFILE_LABELS.competitionHistory,
    icon: History,
    description: "Past wins & transfers",
  },
];

export default function QuickActions() {
  return (
    <LandingGlassCard className="p-4 sm:p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-sb-muted mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {ACTIONS.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="player-quick-action group"
          >
            <span className="player-quick-action-icon">
              <action.icon className="w-4 h-4" strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-white group-hover:text-sb-glow transition-colors">
                {action.label}
              </span>
              <span className="block text-xs text-sb-muted truncate">
                {action.description}
              </span>
            </span>
            <ArrowRight className="w-4 h-4 text-sb-muted group-hover:text-sb-glow group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        ))}
      </div>
    </LandingGlassCard>
  );
}
