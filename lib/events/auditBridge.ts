import type { PlatformAuditEventType } from "@/lib/platform/core/auditLog";
import {
  AUDIT_EVENT_PRIORITY,
  AUDIT_TO_PLATFORM_EVENT,
  type PlatformEventType,
} from "@/lib/events/types";

const PLATFORM_TO_AUDIT: Partial<Record<PlatformEventType, PlatformAuditEventType>> =
  Object.fromEntries(
    Object.entries(AUDIT_TO_PLATFORM_EVENT).map(([audit, platform]) => [platform, audit])
  ) as Partial<Record<PlatformEventType, PlatformAuditEventType>>;

export function auditTypeToPlatformEventType(
  auditType: PlatformAuditEventType
): PlatformEventType {
  return AUDIT_TO_PLATFORM_EVENT[auditType] ?? "system.audit";
}

export function platformEventTypeToAuditType(
  type: string,
  legacyAuditType?: string | null
): PlatformAuditEventType | null {
  if (legacyAuditType && legacyAuditType in AUDIT_TO_PLATFORM_EVENT) {
    return legacyAuditType as PlatformAuditEventType;
  }
  return PLATFORM_TO_AUDIT[type as PlatformEventType] ?? null;
}

export function priorityForAuditEvent(auditType: PlatformAuditEventType) {
  return AUDIT_EVENT_PRIORITY[auditType] ?? "normal";
}
