import type { PlatformAuditActorRole, PlatformAuditEventType } from "@/lib/platform/core/auditLog";

export type EventPriority = "critical" | "high" | "normal" | "low" | "background";

/** Known platform event types — sport moments use `sport.{sportId}.{slug}` via registry. */
export type PlatformEventType =
  | "player.registered"
  | "player.logged_in"
  | "player.logged_out"
  | "player.username_changed"
  | "player.referral_used"
  | "player.followed"
  | "player.unfollowed"
  | "player.profile_updated"
  | "player.avatar_changed"
  | "player.tier_promoted"
  | "game.board_created"
  | "game.board_filled"
  | "game.numbers_assigned"
  | "game.started"
  | "game.checkpoint_completed"
  | "game.player_won"
  | "game.finished"
  | "game.extra_innings_started"
  | "game.suspended"
  | "game.rain_delay"
  | "game.resumed"
  | "game.cancelled"
  | "game.payout_queued"
  | "game.payout_completed"
  | "game.payout_failed"
  | "reward.earned"
  | "reward.opened"
  | "reward.weekly_drop_claimed"
  | "reward.tier_credits_awarded"
  | "reward.marketplace_purchase"
  | "reward.bonus_square_granted"
  | "reward.expired"
  | "reward.redeemed"
  | "community.follower_added"
  | "community.pick_shared"
  | "community.pick_copied"
  | "community.profile_viewed"
  | "community.achievement_shared"
  | "community.milestone_shared"
  | "community.hall_of_fame_entry"
  | "legacy.career_milestone"
  | "legacy.wins_milestone"
  | "legacy.perfect_pickem_week"
  | "legacy.streak_updated"
  | "legacy.hall_of_fame_promotion"
  | "legacy.record_broken"
  | "highlight.activated"
  | "survivor.pick_locked"
  | "survivor.survived"
  | "survivor.eliminated"
  | "survivor.week_complete"
  | "survivor.champion_crowned"
  | "survivor.league_joined"
  | "survivor.shield_activated"
  | "survivor.shield_depleted"
  | "survivor.life_lost"
  | "system.push_notification"
  | "system.email_notification"
  | "system.sms_notification"
  | "system.live_activity_update"
  | "system.leaderboard_refresh"
  | "system.security_log"
  | "system.analytics"
  | "system.audit"
  | "system.webhook"
  | "system.cron";

export interface PlatformEvent {
  eventId: string;
  type: string;
  priority: EventPriority;
  occurredAt: string;
  actorEmail: string | null;
  actorRole: PlatformAuditActorRole;
  entityType: string | null;
  entityId: string | null;
  gameType: string | null;
  summary: string | null;
  payload: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export interface PublishPlatformEventInput {
  type: string;
  priority?: EventPriority;
  occurredAt?: string;
  actorEmail?: string | null;
  actorRole?: PlatformAuditActorRole;
  entityType?: string | null;
  entityId?: string | null;
  gameType?: string | null;
  summary?: string | null;
  payload?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  /** Unique id for this event instance (defaults to random UUID). */
  eventId?: string;
  /** Skip duplicate publish + handler dispatch when the same key was seen. */
  idempotencyKey?: string;
}

export interface PublishPlatformEventResult {
  eventId: string;
  duplicate: boolean;
  persisted: boolean;
  handlersRun: number;
  handlerErrors: string[];
}

export type PlatformEventHandler = (
  event: PlatformEvent
) => void | Promise<void>;

export interface SportEventDefinition {
  id: string;
  sportId: string;
  slug: string;
  label: string;
  description?: string;
  enabled?: boolean;
}

/** Maps legacy audit log types → EventEngine types for backward compatibility. */
export const AUDIT_TO_PLATFORM_EVENT: Record<PlatformAuditEventType, PlatformEventType> = {
  "board.created": "game.board_created",
  "board.guarantee_triggered": "game.board_filled",
  "board.guarantee_completed": "game.board_filled",
  "board.kickoff_locked": "game.numbers_assigned",
  "board.quarter_winner": "game.player_won",
  "board.final_winner": "game.player_won",
  "payout.queued": "game.payout_queued",
  "payout.completed": "game.payout_completed",
  "payout.failed": "game.payout_failed",
  "payout.growth_fund": "game.payout_completed",
  "pickem.locked": "game.started",
  "pickem.graded": "game.checkpoint_completed",
  "pickem.leaderboard_updated": "system.leaderboard_refresh",
  "pickem.week_complete": "game.finished",
  "pickem.entry_paid": "reward.marketplace_purchase",
  "support.ticket_submitted": "system.audit",
  "stripe.webhook": "system.webhook",
  "automation.cron": "system.cron",
  "player.suspended": "system.security_log",
  "announcement.published": "system.audit",
  "announcement.updated": "system.audit",
  "announcement.deleted": "system.audit",
  "push.daily_digest": "system.push_notification",
  "push.manual_send": "system.push_notification",
};

export const AUDIT_EVENT_PRIORITY: Partial<Record<PlatformAuditEventType, EventPriority>> = {
  "payout.completed": "critical",
  "payout.failed": "critical",
  "stripe.webhook": "critical",
  "player.suspended": "critical",
  "board.quarter_winner": "high",
  "board.final_winner": "high",
  "payout.queued": "high",
  "pickem.entry_paid": "high",
  "automation.cron": "background",
  "push.daily_digest": "background",
};
