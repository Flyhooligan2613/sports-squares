import { listPlatformAuditLog } from "@/lib/platform/core/auditLog";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { ActivityCategory, ActivityFeedItem, AlertSeverity } from "../types";

function auditCategory(eventType: string): ActivityCategory {
  if (eventType.startsWith("payout.") || eventType.startsWith("pickem.entry_paid")) return "payment";
  if (eventType.startsWith("board.") || eventType.startsWith("pickem.")) return "contest";
  if (eventType.startsWith("support.")) return "support";
  if (eventType.startsWith("player.suspended")) return "fraud";
  if (eventType.startsWith("announcement.") || eventType.startsWith("push.")) return "community";
  if (eventType.startsWith("stripe.") || eventType.startsWith("automation.")) return "system";
  return "system";
}

function auditSeverity(eventType: string): AlertSeverity {
  if (eventType.includes("failed") || eventType === "player.suspended") return "critical";
  if (eventType.includes("queued") || eventType.includes("locked")) return "warning";
  return "info";
}

function paymentCategory(transactionType: string): ActivityCategory {
  if (transactionType === "reward_credit") return "reward";
  return "payment";
}

function paymentSeverity(status: string): AlertSeverity {
  if (status === "failed") return "critical";
  if (status === "pending") return "warning";
  return "info";
}

export async function fetchActivityFeed(input?: {
  limit?: number;
  since?: string;
}): Promise<ActivityFeedItem[]> {
  const limit = input?.limit ?? 50;
  const items: ActivityFeedItem[] = [];

  const auditEntries = await listPlatformAuditLog({ limit: Math.ceil(limit * 0.6) }).catch(
    () => []
  );

  for (const entry of auditEntries) {
    if (input?.since && entry.createdAt < input.since) continue;
    items.push({
      id: `audit:${entry.id}`,
      category: auditCategory(entry.eventType),
      title: entry.eventType,
      summary: entry.summary,
      severity: auditSeverity(entry.eventType),
      source: "platform_audit_log",
      entityType: entry.entityType,
      entityId: entry.entityId,
      actorEmail: entry.actorEmail,
      createdAt: entry.createdAt,
    });
  }

  if (isSupabaseAdminConfigured()) {
    const supabase = getSupabaseAdmin();
    let paymentQuery = supabase
      .from("payment_transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(Math.ceil(limit * 0.3));

    if (input?.since) {
      paymentQuery = paymentQuery.gte("created_at", input.since);
    }

    const { data: payments } = await paymentQuery;

    for (const row of payments ?? []) {
      items.push({
        id: `payment:${row.id}`,
        category: paymentCategory(row.transaction_type as string),
        title: `${row.transaction_type} · ${row.status}`,
        summary: `${row.player_email} — $${((row.amount_cents as number) / 100).toFixed(2)} (${row.provider})`,
        severity: paymentSeverity(row.status as string),
        source: "payment_transactions",
        entityType: "payment_transaction",
        entityId: row.id as string,
        actorEmail: row.player_email as string,
        createdAt: row.created_at as string,
      });
    }

    let supportQuery = supabase
      .from("support_threads")
      .select("id, subject, status, user_email, priority, created_at")
      .order("created_at", { ascending: false })
      .limit(Math.ceil(limit * 0.2));

    if (input?.since) {
      supportQuery = supportQuery.gte("created_at", input.since);
    }

    const { data: threads } = await supportQuery;

    for (const thread of threads ?? []) {
      items.push({
        id: `support:${thread.id}`,
        category: "support",
        title: `Support · ${thread.status}`,
        summary: (thread.subject as string) || "Support thread",
        severity: thread.priority === "high" ? "warning" : "info",
        source: "support_threads",
        entityType: "support_thread",
        entityId: thread.id as string,
        actorEmail: (thread.user_email as string | null) ?? null,
        createdAt: thread.created_at as string,
      });
    }
  }

  return items
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}
