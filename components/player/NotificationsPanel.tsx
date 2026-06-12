import LandingGlassCard from "@/components/landing/LandingGlassCard";
import type { PlayerNotification } from "@/lib/player/dashboardTypes";

const ICONS: Record<PlayerNotification["type"], string> = {
  board_filled: "📋",
  numbers_assigned: "🔢",
  quarter_winner: "🎯",
  payment_sent: "💸",
  game_starting: "⏰",
  pickem_week_open: "🏈",
  pickem_pool_almost_full: "🔥",
  pickem_pool_full: "✅",
  pickem_sunday_complete: "📊",
  pickem_championship: "👑",
  pickem_prediction_due: "⏱",
  pickem_prediction_locked: "🔒",
  pickem_winner: "🏆",
  pickem_payout: "💰",
  pickem_streak: "🔥",
  pickem_rank_up: "📈",
  pickem_achievement: "⭐",
};

interface NotificationsPanelProps {
  notifications: PlayerNotification[];
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsPanel({
  notifications,
}: NotificationsPanelProps) {
  return (
    <LandingGlassCard className="p-4 sm:p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-sb-muted mb-4">
        Activity
      </h3>
      {notifications.length === 0 ? (
        <p className="text-sb-muted text-sm">You&apos;re all caught up.</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((item) => (
            <li key={item.id} className="player-notification-item">
              <span className="player-notification-icon" aria-hidden>
                {ICONS[item.type]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="text-xs text-sb-muted truncate">{item.detail}</p>
              </div>
              <span className="text-[10px] uppercase tracking-wide text-sb-muted/70 shrink-0">
                {timeAgo(item.at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </LandingGlassCard>
  );
}
