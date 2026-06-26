import { TABLES } from "@/lib/database/config";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type SupportCategory =
  | "general"
  | "payment"
  | "game"
  | "technical"
  | "gameplay"
  | "bug"
  | "feedback"
  | "feature";

export interface SupportThread {
  id: string;
  userEmail: string;
  subject: string;
  category: SupportCategory;
  status: string;
  priority?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportMessage {
  id: string;
  threadId: string;
  senderType: "player" | "staff";
  body: string;
  readByPlayer: boolean;
  createdAt: string;
}

export async function getUnreadSupportCount(email: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const normalized = email.trim().toLowerCase();

  const { data: threads, error: threadsError } = await supabase
    .from(TABLES.supportThreads)
    .select("id")
    .ilike("user_email", normalized);

  if (threadsError) throw threadsError;
  if (!threads?.length) return 0;

  const threadIds = threads.map((t) => t.id as string);
  const { count, error } = await supabase
    .from(TABLES.supportMessages)
    .select("*", { count: "exact", head: true })
    .in("thread_id", threadIds)
    .eq("read_by_player", false)
    .eq("sender_type", "staff");

  if (error) throw error;
  return count ?? 0;
}

function mapSupportThreadRow(row: Record<string, unknown>): SupportThread {
  return {
    id: row.id as string,
    userEmail: row.user_email as string,
    subject: row.subject as string,
    category: row.category as SupportCategory,
    status: row.status as string,
    priority: (row.priority as string | undefined) ?? "normal",
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function listSupportThreads(email: string): Promise<SupportThread[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLES.supportThreads)
    .select("*")
    .ilike("user_email", email.trim().toLowerCase())
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => mapSupportThreadRow(row as Record<string, unknown>));
}

export async function listSupportMessages(
  threadId: string,
  email: string
): Promise<SupportMessage[]> {
  const supabase = getSupabaseAdmin();
  const normalized = email.trim().toLowerCase();

  const { data: thread, error: threadError } = await supabase
    .from(TABLES.supportThreads)
    .select("id")
    .eq("id", threadId)
    .ilike("user_email", normalized)
    .maybeSingle();

  if (threadError) throw threadError;
  if (!thread) return [];

  await supabase
    .from(TABLES.supportMessages)
    .update({ read_by_player: true })
    .eq("thread_id", threadId)
    .eq("sender_type", "staff");

  const { data, error } = await supabase
    .from(TABLES.supportMessages)
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id as string,
    threadId: row.thread_id as string,
    senderType: row.sender_type as "player" | "staff",
    body: row.body as string,
    readByPlayer: row.read_by_player as boolean,
    createdAt: row.created_at as string,
  }));
}

export async function createSupportThread(input: {
  email: string;
  subject: string;
  category: SupportCategory;
  body: string;
}): Promise<{ threadId: string }> {
  const supabase = getSupabaseAdmin();
  const email = input.email.trim().toLowerCase();

  const { data: thread, error: threadError } = await supabase
    .from(TABLES.supportThreads)
    .insert({
      user_email: email,
      subject: input.subject.trim(),
      category: input.category,
    })
    .select("id")
    .single();

  if (threadError) throw threadError;

  const threadId = thread.id as string;
  const { error: messageError } = await supabase.from(TABLES.supportMessages).insert({
    thread_id: threadId,
    sender_type: "player",
    body: input.body.trim(),
    read_by_player: true,
    read_by_staff: false,
  });

  if (messageError) throw messageError;

  const { logPlatformAudit } = await import("@/lib/platform/core/auditLog");
  await logPlatformAudit({
    eventType: "support.ticket_submitted",
    summary: `Support ticket: ${input.subject}`,
    actorEmail: email,
    actorRole: "player",
    entityType: "support_thread",
    entityId: threadId,
    metadata: { category: input.category },
  });

  return { threadId };
}

export async function listAllSupportThreads(limit = 50): Promise<SupportThread[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLES.supportThreads)
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row) => mapSupportThreadRow(row as Record<string, unknown>));
}

export async function staffReplyToSupportThread(input: {
  threadId: string;
  body: string;
}): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { error: messageError } = await supabase.from(TABLES.supportMessages).insert({
    thread_id: input.threadId,
    sender_type: "staff",
    body: input.body.trim(),
    read_by_player: false,
    read_by_staff: true,
  });

  if (messageError) throw messageError;

  await supabase
    .from(TABLES.supportThreads)
    .update({ updated_at: new Date().toISOString(), status: "open" })
    .eq("id", input.threadId);
}

export async function listSupportMessagesForStaff(
  threadId: string
): Promise<SupportMessage[]> {
  const supabase = getSupabaseAdmin();

  await supabase
    .from(TABLES.supportMessages)
    .update({ read_by_staff: true })
    .eq("thread_id", threadId)
    .eq("sender_type", "player");

  const { data, error } = await supabase
    .from(TABLES.supportMessages)
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id as string,
    threadId: row.thread_id as string,
    senderType: row.sender_type as "player" | "staff",
    body: row.body as string,
    readByPlayer: row.read_by_player as boolean,
    createdAt: row.created_at as string,
  }));
}

export async function replyToSupportThread(input: {
  threadId: string;
  email: string;
  body: string;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const normalized = input.email.trim().toLowerCase();

  const { data: thread, error: threadError } = await supabase
    .from(TABLES.supportThreads)
    .select("id")
    .eq("id", input.threadId)
    .ilike("user_email", normalized)
    .maybeSingle();

  if (threadError) throw threadError;
  if (!thread) throw new Error("Thread not found.");

  const { error: messageError } = await supabase.from(TABLES.supportMessages).insert({
    thread_id: input.threadId,
    sender_type: "player",
    body: input.body.trim(),
    read_by_player: true,
    read_by_staff: false,
  });

  if (messageError) throw messageError;

  await supabase
    .from(TABLES.supportThreads)
    .update({ updated_at: new Date().toISOString() })
    .eq("id", input.threadId);
}
