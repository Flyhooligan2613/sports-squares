import { randomUUID } from "crypto";
import {
  isDuplicatePlatformEvent,
  logPlatformEventHandlerFailure,
  persistPlatformEvent,
} from "@/lib/events/persist";
import { registerDefaultEventHandlers } from "@/lib/events/registerHandlers";
import { registerBuiltinSportEvents } from "@/lib/events/registry";
import type {
  EventPriority,
  PlatformEvent,
  PlatformEventHandler,
  PublishPlatformEventInput,
  PublishPlatformEventResult,
} from "@/lib/events/types";

interface HandlerRegistration {
  handler: PlatformEventHandler;
  name: string;
  priorities?: EventPriority[];
}

const handlersByType = new Map<string, HandlerRegistration[]>();
const wildcardHandlers: HandlerRegistration[] = [];

let bootstrapped = false;

function bootstrap(): void {
  if (bootstrapped) return;
  bootstrapped = true;
  registerBuiltinSportEvents();
  registerDefaultEventHandlers();
}

function matchesPriority(
  registration: HandlerRegistration,
  priority: EventPriority
): boolean {
  if (!registration.priorities?.length) return true;
  return registration.priorities.includes(priority);
}

function handlersForEvent(event: PlatformEvent): HandlerRegistration[] {
  const specific = handlersByType.get(event.type) ?? [];
  const sportWildcard = event.type.startsWith("sport.")
    ? handlersByType.get("sport.*") ?? []
    : [];

  return [...wildcardHandlers, ...sportWildcard, ...specific].filter((entry) =>
    matchesPriority(entry, event.priority)
  );
}

export function subscribeToPlatformEvent(
  type: string,
  handler: PlatformEventHandler,
  options?: { name?: string; priorities?: EventPriority[] }
): () => void {
  bootstrap();

  const registration: HandlerRegistration = {
    handler,
    name: options?.name ?? "anonymous",
    priorities: options?.priorities,
  };

  const bucket = type === "*" ? wildcardHandlers : handlersByType.get(type) ?? [];
  if (type !== "*") {
    handlersByType.set(type, [...bucket, registration]);
  } else {
    wildcardHandlers.push(registration);
  }

  return () => {
    const list = type === "*" ? wildcardHandlers : handlersByType.get(type);
    if (!list) return;
    const index = list.indexOf(registration);
    if (index >= 0) list.splice(index, 1);
  };
}

function buildEvent(input: PublishPlatformEventInput): PlatformEvent {
  const idempotencyKey = input.idempotencyKey ?? null;
  const metadata = {
    ...(input.metadata ?? {}),
    ...(idempotencyKey ? { idempotencyKey } : {}),
  };

  return {
    eventId: input.eventId ?? randomUUID(),
    type: input.type,
    priority: input.priority ?? "normal",
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    actorEmail: input.actorEmail?.trim().toLowerCase() ?? null,
    actorRole: input.actorRole ?? "system",
    entityType: input.entityType ?? null,
    entityId: input.entityId ?? null,
    gameType: input.gameType ?? null,
    summary: input.summary ?? null,
    payload: input.payload ?? {},
    metadata,
  };
}

async function dispatchHandlers(event: PlatformEvent): Promise<{
  handlersRun: number;
  handlerErrors: string[];
}> {
  const registrations = handlersForEvent(event);
  let handlersRun = 0;
  const handlerErrors: string[] = [];

  for (const registration of registrations) {
    handlersRun += 1;
    try {
      await registration.handler(event);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      handlerErrors.push(`${registration.name}: ${message}`);
      await logPlatformEventHandlerFailure({
        eventId: event.eventId,
        handlerName: registration.name,
        errorMessage: message,
      });
    }
  }

  return { handlersRun, handlerErrors };
}

export async function publishPlatformEvent(
  input: PublishPlatformEventInput
): Promise<PublishPlatformEventResult> {
  bootstrap();

  const event = buildEvent(input);

  const duplicate = await isDuplicatePlatformEvent({
    eventId: event.eventId,
    idempotencyKey: input.idempotencyKey,
  });

  if (duplicate) {
    return {
      eventId: event.eventId,
      duplicate: true,
      persisted: false,
      handlersRun: 0,
      handlerErrors: [],
    };
  }

  const persisted = await persistPlatformEvent(event);

  if (!persisted) {
    const stillDuplicate = await isDuplicatePlatformEvent({
      idempotencyKey: input.idempotencyKey,
    });
    if (stillDuplicate) {
      return {
        eventId: event.eventId,
        duplicate: true,
        persisted: false,
        handlersRun: 0,
        handlerErrors: [],
      };
    }
  }

  const { handlersRun, handlerErrors } = await dispatchHandlers(event);

  return {
    eventId: event.eventId,
    duplicate: false,
    persisted,
    handlersRun,
    handlerErrors,
  };
}

/** Alias for directive naming. */
export const EventEngine = {
  publish: publishPlatformEvent,
  subscribe: subscribeToPlatformEvent,
};
