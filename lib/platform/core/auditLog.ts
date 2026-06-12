import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type PlatformAuditActorRole = "system" | "admin" | "player" | "stripe";

export type PlatformAuditEventType =
  | "board.created"
  | "board.guarantee_triggered"
  | "board.guarantee_completed"
  | "board.kickoff_locked"
  | "board.quarter_winner"
  | "board.final_winner"
  | "payout.queued"
  | "payout.completed"
  | "payout.failed"
  | "payout.growth_fund"
  | "pickem.locked"
  | "pickem.graded"
  | "pickem.leaderboard_updated"
  | "pickem.week_complete"
  | "pickem.entry_paid"
  | "support.ticket_submitted"
  | "stripe.webhook"
  | "automation.cron"
  | "player.suspended"
  | "announcement.published"
  | "announcement.updated"
  | "announcement.deleted";

export interface PlatformAuditInput {
  eventType: PlatformAuditEventType;
  summary: string;
  gameType?: string;
  entityType?: string;
  entityId?: string;
  actorEmail?: string | null;
  actorRole?: PlatformAuditActorRole;
  metadata?: Record<string, unknown>;
}

const TABLE = "platform_audit_log";

export async function logPlatformAudit(input: PlatformAuditInput): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from(TABLE).insert({
      event_type: input.eventType,
      game_type: input.gameType ?? null,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      actor_email: input.actorEmail?.trim().toLowerCase() ?? null,
      actor_role: input.actorRole ?? "system",
      summary: input.summary,
      metadata: input.metadata ?? {},
    });

    if (error) console.error("[platform_audit]", error.message);
  } catch (err) {
    console.error("[platform_audit]", err);
  }
}

export interface PlatformAuditEntry {
  id: string;
  eventType: string;
  gameType: string | null;
  entityType: string | null;
  entityId: string | null;
  actorEmail: string | null;
  actorRole: string;
  summary: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export async function listPlatformAuditLog(input?: {
  limit?: number;
  eventType?: string;
}): Promise<PlatformAuditEntry[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(input?.limit ?? 100);

  if (input?.eventType) {
    query = query.eq("event_type", input.eventType);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id as string,
    eventType: row.event_type as string,
    gameType: (row.game_type as string | null) ?? null,
    entityType: (row.entity_type as string | null) ?? null,
    entityId: (row.entity_id as string | null) ?? null,
    actorEmail: (row.actor_email as string | null) ?? null,
    actorRole: row.actor_role as string,
    summary: row.summary as string,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: row.created_at as string,
  }));
}
