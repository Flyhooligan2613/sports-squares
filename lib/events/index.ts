export {
  EventEngine,
  publishPlatformEvent,
  subscribeToPlatformEvent,
} from "@/lib/events/engine";

export {
  registerSportEventDefinition,
  registerSportEventDefinitions,
  registerBuiltinSportEvents,
  getSportEventDefinition,
  listSportEventDefinitions,
  sportPlatformEventType,
} from "@/lib/events/registry";

export type {
  EventPriority,
  PlatformEvent,
  PlatformEventType,
  PlatformEventHandler,
  PublishPlatformEventInput,
  PublishPlatformEventResult,
  SportEventDefinition,
} from "@/lib/events/types";

export {
  auditTypeToPlatformEventType,
  platformEventTypeToAuditType,
  priorityForAuditEvent,
} from "@/lib/events/auditBridge";

export { registerDefaultEventHandlers } from "@/lib/events/registerHandlers";
