import { platformEventTypeToAuditType } from "@/lib/events/auditBridge";
import { insertPlatformAuditRow } from "@/lib/platform/core/auditLog";
import type { PlatformEvent, PlatformEventHandler } from "@/lib/events/types";

/** Writes to platform_audit_log for admin compatibility — never calls publish. */
export const legacyAuditHandler: PlatformEventHandler = async (event) => {
  const auditType = platformEventTypeToAuditType(
    event.type,
    typeof event.metadata.legacyAuditType === "string"
      ? event.metadata.legacyAuditType
      : null
  );

  if (!auditType) return;

  await insertPlatformAuditRow({
    eventType: auditType,
    summary: event.summary ?? event.type,
    gameType: event.gameType ?? undefined,
    entityType: event.entityType ?? undefined,
    entityId: event.entityId ?? undefined,
    actorEmail: event.actorEmail,
    actorRole: event.actorRole,
    metadata: {
      ...event.payload,
      ...event.metadata,
      eventEngineId: event.eventId,
    },
  });
};
