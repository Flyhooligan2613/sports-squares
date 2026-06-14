import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { PlatformEvent } from "@/lib/events/types";

const EVENTS_TABLE = "platform_events";
const FAILURES_TABLE = "platform_event_failures";

export async function persistPlatformEvent(event: PlatformEvent): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();
    const idempotencyKey =
      typeof event.metadata.idempotencyKey === "string"
        ? event.metadata.idempotencyKey
        : null;

    const { error } = await supabase.from(EVENTS_TABLE).insert({
      event_id: event.eventId,
      idempotency_key: idempotencyKey,
      event_type: event.type,
      priority: event.priority,
      occurred_at: event.occurredAt,
      actor_email: event.actorEmail,
      actor_role: event.actorRole,
      entity_type: event.entityType,
      entity_id: event.entityId,
      game_type: event.gameType,
      summary: event.summary,
      payload: event.payload,
      metadata: event.metadata,
    });

    if (error?.code === "23505") return false;
    if (error) {
      console.error("[EventEngine] persist failed:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[EventEngine] persist error:", err);
    return false;
  }
}

export async function isDuplicatePlatformEvent(input: {
  eventId?: string;
  idempotencyKey?: string;
}): Promise<boolean> {
  if (!input.eventId && !input.idempotencyKey) return false;

  try {
    const supabase = getSupabaseAdmin();
    if (input.idempotencyKey) {
      const { data } = await supabase
        .from(EVENTS_TABLE)
        .select("event_id")
        .eq("idempotency_key", input.idempotencyKey)
        .maybeSingle();
      if (data) return true;
    }
    if (input.eventId) {
      const { data } = await supabase
        .from(EVENTS_TABLE)
        .select("event_id")
        .eq("event_id", input.eventId)
        .maybeSingle();
      if (data) return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function logPlatformEventHandlerFailure(input: {
  eventId: string;
  handlerName: string;
  errorMessage: string;
}): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from(FAILURES_TABLE).insert({
      event_id: input.eventId,
      handler_name: input.handlerName,
      error_message: input.errorMessage.slice(0, 2000),
    });
  } catch (err) {
    console.error("[EventEngine] failure log error:", err);
  }
}
