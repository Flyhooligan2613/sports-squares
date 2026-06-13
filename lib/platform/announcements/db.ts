import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type {
  AnnouncementAnalytics,
  AnnouncementEventType,
  AnnouncementTemplate,
  AnnouncementUpsertInput,
  PlatformAnnouncement,
} from "@/lib/platform/announcements/types";
import {
  priorityLevelFromValue,
  resolvePriority,
} from "@/lib/platform/announcements/types";

const TABLE = "platform_announcements";
const DISMISSALS = "platform_announcement_dismissals";
const EVENTS = "platform_announcement_events";
const TEMPLATES = "platform_announcement_templates";

function mapRow(row: Record<string, unknown>): PlatformAnnouncement {
  const priority = row.priority as number;
  return {
    id: row.id as string,
    title: row.title as string,
    subtitle: (row.subtitle as string | null) ?? null,
    imageUrl: (row.image_url as string | null) ?? null,
    buttonText: (row.button_text as string | null) ?? null,
    destinationHref: (row.destination_href as string | null) ?? null,
    secondaryButtonText: (row.secondary_button_text as string | null) ?? null,
    secondaryDestinationHref: (row.secondary_destination_href as string | null) ?? null,
    displayType: row.display_type as PlatformAnnouncement["displayType"],
    category: row.category as PlatformAnnouncement["category"],
    audience: row.audience as PlatformAnnouncement["audience"],
    audienceRegions: (row.audience_regions as string[] | null) ?? [],
    audienceEmails: (row.audience_emails as string[] | null) ?? [],
    priority,
    priorityLevel: priorityLevelFromValue(priority),
    dismissible: row.dismissible as boolean,
    frequency: row.frequency as PlatformAnnouncement["frequency"],
    startsAt: row.starts_at as string,
    endsAt: (row.ends_at as string | null) ?? null,
    timezone: (row.timezone as string) ?? "America/New_York",
    animationStyle: (row.animation_style as PlatformAnnouncement["animationStyle"]) ?? "scale",
    active: row.active as boolean,
    createdBy: (row.created_by as string | null) ?? null,
    automationKey: (row.automation_key as string | null) ?? null,
    templateKey: (row.template_key as string | null) ?? null,
    source: (row.source as PlatformAnnouncement["source"]) ?? "manual",
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function toRow(input: AnnouncementUpsertInput, createdBy?: string | null) {
  const { priority, priorityLevel } = resolvePriority({
    priority: input.priority,
    priorityLevel: input.priorityLevel,
  });

  return {
    title: input.title.trim(),
    subtitle: input.subtitle?.trim() || null,
    image_url: input.imageUrl?.trim() || null,
    button_text: input.buttonText?.trim() || null,
    destination_href: input.destinationHref?.trim() || null,
    secondary_button_text: input.secondaryButtonText?.trim() || null,
    secondary_destination_href: input.secondaryDestinationHref?.trim() || null,
    display_type: input.displayType,
    category: input.category,
    audience: input.audience,
    audience_regions: input.audienceRegions ?? [],
    audience_emails: input.audienceEmails ?? [],
    priority,
    dismissible: input.dismissible ?? true,
    frequency: input.frequency ?? "once",
    starts_at: input.startsAt ?? new Date().toISOString(),
    ends_at: input.endsAt ?? null,
    timezone: input.timezone ?? "America/New_York",
    animation_style: input.animationStyle ?? "scale",
    template_key: input.templateKey ?? null,
    active: input.active ?? true,
    created_by: createdBy ?? null,
    updated_at: new Date().toISOString(),
  };
}

export async function listAllAnnouncements(): Promise<PlatformAnnouncement[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("priority", { ascending: false })
    .order("starts_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}

export async function listScheduledAnnouncements(
  now = new Date()
): Promise<PlatformAnnouncement[]> {
  const supabase = getSupabaseAdmin();
  const iso = now.toISOString();
  const nowMs = now.getTime();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("active", true)
    .lte("starts_at", iso)
    .order("priority", { ascending: false })
    .order("starts_at", { ascending: false });

  if (error) throw error;

  return (data ?? [])
    .filter((row) => {
      const endsAt = row.ends_at as string | null;
      if (!endsAt) return true;
      return new Date(endsAt).getTime() >= nowMs;
    })
    .map((row) => mapRow(row as Record<string, unknown>));
}

export async function getAnnouncementById(
  id: string
): Promise<PlatformAnnouncement | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as Record<string, unknown>) : null;
}

export async function createAnnouncement(
  input: AnnouncementUpsertInput,
  createdBy: string
): Promise<PlatformAnnouncement> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .insert(toRow(input, createdBy))
    .select("*")
    .single();

  if (error) throw error;
  return mapRow(data as Record<string, unknown>);
}

export async function updateAnnouncement(
  id: string,
  input: Partial<AnnouncementUpsertInput>
): Promise<PlatformAnnouncement> {
  const supabase = getSupabaseAdmin();
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.subtitle !== undefined) patch.subtitle = input.subtitle?.trim() || null;
  if (input.imageUrl !== undefined) patch.image_url = input.imageUrl?.trim() || null;
  if (input.buttonText !== undefined) patch.button_text = input.buttonText?.trim() || null;
  if (input.destinationHref !== undefined) {
    patch.destination_href = input.destinationHref?.trim() || null;
  }
  if (input.secondaryButtonText !== undefined) {
    patch.secondary_button_text = input.secondaryButtonText?.trim() || null;
  }
  if (input.secondaryDestinationHref !== undefined) {
    patch.secondary_destination_href = input.secondaryDestinationHref?.trim() || null;
  }
  if (input.displayType !== undefined) patch.display_type = input.displayType;
  if (input.category !== undefined) patch.category = input.category;
  if (input.audience !== undefined) patch.audience = input.audience;
  if (input.audienceRegions !== undefined) patch.audience_regions = input.audienceRegions;
  if (input.audienceEmails !== undefined) patch.audience_emails = input.audienceEmails;
  if (input.priority !== undefined || input.priorityLevel !== undefined) {
    patch.priority = resolvePriority(input).priority;
  }
  if (input.dismissible !== undefined) patch.dismissible = input.dismissible;
  if (input.frequency !== undefined) patch.frequency = input.frequency;
  if (input.startsAt !== undefined) patch.starts_at = input.startsAt;
  if (input.endsAt !== undefined) patch.ends_at = input.endsAt;
  if (input.timezone !== undefined) patch.timezone = input.timezone;
  if (input.animationStyle !== undefined) patch.animation_style = input.animationStyle;
  if (input.templateKey !== undefined) patch.template_key = input.templateKey;
  if (input.active !== undefined) patch.active = input.active;

  const { data, error } = await supabase
    .from(TABLE)
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return mapRow(data as Record<string, unknown>);
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}

export async function listDismissalsForViewer(
  viewerKey: string
): Promise<{ announcementId: string; dismissedAt: string }[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(DISMISSALS)
    .select("announcement_id, dismissed_at")
    .eq("viewer_key", viewerKey);

  if (error) throw error;
  return (data ?? []).map((row) => ({
    announcementId: row.announcement_id as string,
    dismissedAt: row.dismissed_at as string,
  }));
}

export async function dismissAnnouncement(input: {
  announcementId: string;
  viewerKey: string;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from(DISMISSALS).upsert(
    {
      announcement_id: input.announcementId,
      viewer_key: input.viewerKey,
      dismissed_at: new Date().toISOString(),
    },
    { onConflict: "announcement_id,viewer_key" }
  );

  if (error) throw error;
}

export async function clearAnnouncementDismissals(announcementId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from(DISMISSALS)
    .delete()
    .eq("announcement_id", announcementId);
  if (error) throw error;
}

export async function recordAnnouncementEvents(input: {
  announcementId: string;
  viewerKey: string;
  eventTypes: AnnouncementEventType[];
}): Promise<void> {
  if (!input.eventTypes.length) return;
  const supabase = getSupabaseAdmin();
  const rows = input.eventTypes.map((eventType) => ({
    announcement_id: input.announcementId,
    viewer_key: input.viewerKey,
    event_type: eventType,
  }));
  const { error } = await supabase.from(EVENTS).insert(rows);
  if (error) throw error;
}

export async function listClickEventsForViewer(
  viewerKey: string
): Promise<{ announcementId: string }[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(EVENTS)
    .select("announcement_id")
    .eq("viewer_key", viewerKey)
    .in("event_type", ["click", "secondary_click"]);

  if (error) throw error;
  return (data ?? []).map((row) => ({
    announcementId: row.announcement_id as string,
  }));
}

export async function getAnnouncementAnalytics(
  announcementId: string
): Promise<AnnouncementAnalytics> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(EVENTS)
    .select("event_type, viewer_key")
    .eq("announcement_id", announcementId);

  if (error) throw error;

  const rows = data ?? [];
  const views = rows.filter((r) => r.event_type === "view").length;
  const dismissals = rows.filter((r) => r.event_type === "dismiss").length;
  const clicks = rows.filter((r) => r.event_type === "click").length;
  const secondaryClicks = rows.filter((r) => r.event_type === "secondary_click").length;
  const uniqueReach = new Set(rows.map((r) => r.viewer_key as string)).size;

  return {
    views,
    dismissals,
    clicks,
    secondaryClicks,
    uniqueReach,
    clickThroughRate: views > 0 ? Math.round(((clicks + secondaryClicks) / views) * 1000) / 10 : 0,
    conversionRate: uniqueReach > 0 ? Math.round(((clicks + secondaryClicks) / uniqueReach) * 1000) / 10 : 0,
  };
}

export async function listAnnouncementTemplates(): Promise<AnnouncementTemplate[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TEMPLATES)
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    payload: row.payload as AnnouncementUpsertInput,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }));
}

export async function upsertAnnouncementTemplate(input: {
  slug: string;
  name: string;
  description?: string | null;
  payload: AnnouncementUpsertInput;
}): Promise<AnnouncementTemplate> {
  const supabase = getSupabaseAdmin();
  const row = {
    slug: input.slug,
    name: input.name,
    description: input.description ?? null,
    payload: input.payload,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(TEMPLATES)
    .upsert(row, { onConflict: "slug" })
    .select("*")
    .single();

  if (error) throw error;
  return {
    id: data.id as string,
    slug: data.slug as string,
    name: data.name as string,
    description: (data.description as string | null) ?? null,
    payload: data.payload as AnnouncementUpsertInput,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}

export async function upsertAutomatedAnnouncement(input: {
  automationKey: string;
  payload: AnnouncementUpsertInput;
}): Promise<PlatformAnnouncement> {
  const supabase = getSupabaseAdmin();
  const row = {
    ...toRow(input.payload, "automation"),
    automation_key: input.automationKey,
    source: "automated",
    created_by: "automation",
  };

  const { data: existing } = await supabase
    .from(TABLE)
    .select("id")
    .eq("automation_key", input.automationKey)
    .maybeSingle();

  if (existing?.id) {
    const { data, error } = await supabase
      .from(TABLE)
      .update(row)
      .eq("id", existing.id as string)
      .select("*")
      .single();
    if (error) throw error;
    return mapRow(data as Record<string, unknown>);
  }

  const { data, error } = await supabase.from(TABLE).insert(row).select("*").single();
  if (error) throw error;
  return mapRow(data as Record<string, unknown>);
}

export async function deactivateAutomatedAnnouncementsExcept(
  activeKeys: string[]
): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { data: automated } = await supabase
    .from(TABLE)
    .select("id, automation_key")
    .eq("source", "automated")
    .eq("active", true);

  const toDeactivate = (automated ?? []).filter(
    (row) => row.automation_key && !activeKeys.includes(row.automation_key as string)
  );

  if (!toDeactivate.length) return 0;

  const ids = toDeactivate.map((row) => row.id as string);
  const { error } = await supabase
    .from(TABLE)
    .update({ active: false, updated_at: new Date().toISOString() })
    .in("id", ids);

  if (error) throw error;
  return ids.length;
}
