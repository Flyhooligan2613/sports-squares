import { listPlatformAuditLog } from "@/lib/platform/core/auditLog";
import type { CommandCenterAuditEntry } from "../types";

export async function fetchAuditLog(input?: {
  limit?: number;
  eventType?: string;
}): Promise<CommandCenterAuditEntry[]> {
  const entries = await listPlatformAuditLog({
    limit: input?.limit ?? 100,
    eventType: input?.eventType,
  });

  return entries.map((entry) => ({
    id: entry.id,
    eventType: entry.eventType,
    summary: entry.summary,
    gameType: entry.gameType,
    entityType: entry.entityType,
    entityId: entry.entityId,
    actorEmail: entry.actorEmail,
    actorRole: entry.actorRole,
    metadata: entry.metadata,
    createdAt: entry.createdAt,
  }));
}
