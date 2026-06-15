"use client";

import { JOIN_THE_CONTEST } from "@/lib/platform/legacy/competitiveLanguage";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  Eye,
  LayoutTemplate,
  Megaphone,
  Pencil,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { Button } from "@/components/ui/Button";
import AnnouncementImageUpload from "@/components/admin/announcements/AnnouncementImageUpload";
import AnnouncementPreview from "@/components/admin/announcements/AnnouncementPreview";
import {
  ANIMATION_STYLE_LABELS,
  AUDIENCE_LABELS,
  BUTTON_DESTINATION_PRESETS,
  CATEGORY_LABELS,
  DISPLAY_TYPE_LABELS,
  FREQUENCY_LABELS,
  PRIORITY_LEVEL_LABELS,
  type AnnouncementAnalytics,
  type AnnouncementAnimationStyle,
  type AnnouncementAudience,
  type AnnouncementCategory,
  type AnnouncementDisplayType,
  type AnnouncementFrequency,
  type AnnouncementPriorityLevel,
  type AnnouncementUpsertInput,
  type PlatformAnnouncement,
} from "@/lib/platform/announcements/types";
import type { AnnouncementPreset } from "@/lib/platform/announcements/templates/presets";

type StudioTab = "editor" | "preview" | "analytics";

const DISPLAY_TYPES = Object.keys(DISPLAY_TYPE_LABELS) as AnnouncementDisplayType[];
const CATEGORIES = Object.keys(CATEGORY_LABELS) as AnnouncementCategory[];
const AUDIENCES = Object.keys(AUDIENCE_LABELS) as AnnouncementAudience[];
const FREQUENCIES = Object.keys(FREQUENCY_LABELS) as AnnouncementFrequency[];
const PRIORITIES = Object.keys(PRIORITY_LEVEL_LABELS) as AnnouncementPriorityLevel[];
const ANIMATIONS = Object.keys(ANIMATION_STYLE_LABELS) as AnnouncementAnimationStyle[];

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "UTC",
];

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function nowLocalInput(): string {
  return toLocalInput(new Date().toISOString());
}

function scheduleStatus(item: PlatformAnnouncement) {
  if (!item.active) return { label: "Paused", tone: "paused" as const };
  const now = Date.now();
  const starts = new Date(item.startsAt).getTime();
  const ends = item.endsAt ? new Date(item.endsAt).getTime() : null;
  if (starts > now) return { label: "Scheduled", tone: "scheduled" as const };
  if (ends !== null && ends < now) return { label: "Expired", tone: "expired" as const };
  return { label: "Live on site", tone: "live" as const };
}

const EMPTY_FORM: AnnouncementUpsertInput = {
  title: "",
  subtitle: "",
  imageUrl: "",
  buttonText: "",
  destinationHref: "",
  secondaryButtonText: "",
  secondaryDestinationHref: "",
  displayType: "welcome_popup",
  category: "feature_release",
  audience: "all",
  audienceRegions: [],
  audienceEmails: [],
  priorityLevel: "normal",
  dismissible: true,
  frequency: "once",
  startsAt: nowLocalInput(),
  endsAt: "",
  timezone: "America/New_York",
  animationStyle: "scale",
  active: true,
};

function inputClassName() {
  return "w-full rounded-xl bg-white/5 border border-white/10 text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sb-purple/40";
}

function selectClassName() {
  return `${inputClassName()} sb-admin-select cursor-pointer`;
}

function formFromAnnouncement(a: PlatformAnnouncement): AnnouncementUpsertInput {
  return {
    title: a.title,
    subtitle: a.subtitle ?? "",
    imageUrl: a.imageUrl ?? "",
    buttonText: a.buttonText ?? "",
    destinationHref: a.destinationHref ?? "",
    secondaryButtonText: a.secondaryButtonText ?? "",
    secondaryDestinationHref: a.secondaryDestinationHref ?? "",
    displayType: a.displayType,
    category: a.category,
    audience: a.audience,
    audienceRegions: a.audienceRegions,
    audienceEmails: a.audienceEmails,
    priorityLevel: a.priorityLevel,
    dismissible: a.dismissible,
    frequency: a.frequency,
    startsAt: toLocalInput(a.startsAt),
    endsAt: toLocalInput(a.endsAt),
    timezone: a.timezone,
    animationStyle: a.animationStyle,
    active: a.active,
  };
}

export default function AnnouncementStudio() {
  const [announcements, setAnnouncements] = useState<PlatformAnnouncement[]>([]);
  const [presets, setPresets] = useState<AnnouncementPreset[]>([]);
  const [form, setForm] = useState<AnnouncementUpsertInput>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tab, setTab] = useState<StudioTab>("editor");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [regionsInput, setRegionsInput] = useState("");
  const [emailsInput, setEmailsInput] = useState("");
  const [startImmediately, setStartImmediately] = useState(true);
  const [runningAutomation, setRunningAutomation] = useState(false);
  const [analytics, setAnalytics] = useState<AnnouncementAnalytics | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<{
    configured?: boolean;
    publicAnonymousPopups?: number;
    publicAnonymousCount?: number;
    error?: string;
  } | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const loadDeliveryStatus = useCallback(async () => {
    const res = await fetch("/api/admin/announcements/delivery-status");
    if (res.ok) setDeliveryStatus(await res.json());
  }, []);

  const loadAnalytics = useCallback(async (id: string) => {
    const res = await fetch(`/api/admin/announcements/${id}/analytics`);
    if (!res.ok) return;
    const data = (await res.json()) as { analytics?: AnnouncementAnalytics };
    setAnalytics(data.analytics ?? null);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [listRes, templateRes] = await Promise.all([
      fetch("/api/admin/announcements"),
      fetch("/api/admin/announcements/templates"),
    ]);
    const listData = (await listRes.json()) as {
      announcements?: PlatformAnnouncement[];
      error?: string;
    };
    const templateData = (await templateRes.json()) as { presets?: AnnouncementPreset[] };

    if (!listRes.ok) {
      setError(listData.error ?? "Failed to load announcements.");
      setLoading(false);
      return;
    }

    setAnnouncements(listData.announcements ?? []);
    setPresets(templateData.presets ?? []);
    setLoading(false);
    void loadDeliveryStatus();
  }, [loadDeliveryStatus]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (editingId && tab === "analytics") void loadAnalytics(editingId);
  }, [editingId, tab, loadAnalytics]);

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setRegionsInput("");
    setEmailsInput("");
    setStartImmediately(true);
    setAnalytics(null);
    setTab("editor");
  }

  function applyPreset(preset: AnnouncementPreset) {
    setForm({ ...EMPTY_FORM, ...preset.payload, startsAt: nowLocalInput() });
    setEditingId(null);
    setStartImmediately(true);
    setTab("editor");
    showToast(`Loaded template: ${preset.name}`);
  }

  function handleEdit(item: PlatformAnnouncement) {
    if (item.source === "automated") {
      showToast("Automated announcements are managed by the NFL calendar engine.");
      return;
    }
    setEditingId(item.id);
    setForm(formFromAnnouncement(item));
    setRegionsInput(item.audienceRegions.join(", "));
    setEmailsInput(item.audienceEmails.join(", "));
    setStartImmediately(new Date(item.startsAt).getTime() <= Date.now());
    setTab("editor");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload: AnnouncementUpsertInput = {
      ...form,
      audienceRegions: regionsInput
        .split(",")
        .map((r) => r.trim().toUpperCase())
        .filter(Boolean),
      audienceEmails: emailsInput
        .split(/[\n,;]+/)
        .map((r) => r.trim().toLowerCase())
        .filter(Boolean),
      startsAt: startImmediately
        ? new Date().toISOString()
        : form.startsAt
          ? new Date(form.startsAt).toISOString()
          : undefined,
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
    };

    const url = editingId
      ? `/api/admin/announcements/${editingId}`
      : "/api/admin/announcements";
    const res = await fetch(url, {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { error?: string };

    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Save failed.");
      return;
    }

    showToast(editingId ? "Announcement updated." : "Announcement published.");
    resetForm();
    await load();
  }

  async function handleSaveTemplate() {
    const name = window.prompt("Template name");
    if (!name?.trim()) return;
    const res = await fetch("/api/admin/announcements/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, payload: form }),
    });
    if (!res.ok) {
      showToast("Could not save template.");
      return;
    }
    showToast("Template saved to library.");
    await load();
  }

  async function handleRunAutomation() {
    setRunningAutomation(true);
    const res = await fetch("/api/admin/announcements/automation", { method: "POST" });
    setRunningAutomation(false);
    if (!res.ok) {
      setError("Automation failed.");
      return;
    }
    showToast("Automation complete.");
    await load();
  }

  async function handleGoLiveNow(item: PlatformAnnouncement) {
    await fetch(`/api/admin/announcements/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: true, startsAt: new Date().toISOString(), endsAt: null }),
    });
    showToast("Announcement is live.");
    await load();
  }

  return (
    <div className="space-y-6">
      {toast ? (
        <div className="admin-toast-enter fixed bottom-6 right-6 z-50 sb-card px-4 py-3 text-sm text-white border border-emerald-500/30">
          {toast}
        </div>
      ) : null}

      {error ? (
        <LandingGlassCard className="p-4 border border-red-500/30">
          <p className="text-red-400 text-sm">{error}</p>
        </LandingGlassCard>
      ) : null}

      <LandingGlassCard className="p-5 border border-sb-purple/25 bg-sb-purple/5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-sb-purple-light" />
              <p className="text-lg font-semibold text-white">Announcement Studio</p>
            </div>
            <p className="text-xs text-sb-muted max-w-2xl leading-relaxed">
              Create premium full-screen promos, schedule them, preview on every device, and track
              performance — no code or manual image URLs required.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="sb-btn-motion sb-btn-secondary sb-btn-sm inline-flex items-center justify-center font-semibold min-h-[52px] px-6 py-3 rounded-xl"
            >
              Preview site
            </Link>
            <Button
              type="button"
              variant="secondary"
              disabled={runningAutomation}
              onClick={() => void handleRunAutomation()}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${runningAutomation ? "animate-spin" : ""}`} />
              Run NFL automation
            </Button>
          </div>
        </div>
      </LandingGlassCard>

      {deliveryStatus ? (
        <LandingGlassCard className="p-4 border border-white/10">
          <p className="text-sm font-semibold text-white mb-1">Live delivery</p>
          <p className="text-xs text-sb-muted">
            {(deliveryStatus.publicAnonymousPopups ?? 0) > 0
              ? `${deliveryStatus.publicAnonymousPopups} full-screen promo(s) active for visitors.`
              : deliveryStatus.error ??
                "No full-screen promos delivering — publish one with Display Type Full-Screen Popup."}
          </p>
        </LandingGlassCard>
      ) : null}

      <LandingGlassCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <LayoutTemplate className="w-4 h-4 text-sb-purple-light" />
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Template Library</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {presets.map((preset) => (
            <button
              key={preset.slug}
              type="button"
              onClick={() => applyPreset(preset)}
              className="sb-admin-option-tile text-left"
            >
              <p className="text-sm font-semibold text-white">{preset.name}</p>
              <p className="text-[11px] text-sb-muted mt-1 leading-relaxed">{preset.description}</p>
            </button>
          ))}
        </div>
      </LandingGlassCard>

      <LandingGlassCard className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-sb-purple-light" />
            <h2 className="text-lg font-semibold text-white">
              {editingId ? "Edit Announcement" : "Create Announcement"}
            </h2>
          </div>
          <div className="flex gap-2">
            {(["editor", "preview", ...(editingId ? (["analytics"] as StudioTab[]) : [])] as StudioTab[]).map(
              (t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`text-xs px-3 py-1.5 rounded-lg border capitalize ${
                    tab === t
                      ? "border-sb-purple/50 text-white bg-sb-purple/15"
                      : "border-white/10 text-sb-muted"
                  }`}
                >
                  {t === "analytics" ? (
                    <span className="inline-flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" /> Analytics
                    </span>
                  ) : t === "preview" ? (
                    <span className="inline-flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Preview
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <Pencil className="w-3 h-3" /> Editor
                    </span>
                  )}
                </button>
              )
            )}
          </div>
        </div>

        {tab === "preview" ? <AnnouncementPreview form={form} /> : null}

        {tab === "analytics" && analytics ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Views", value: analytics.views },
              { label: "Unique reach", value: analytics.uniqueReach },
              { label: "Clicks", value: analytics.clicks + analytics.secondaryClicks },
              { label: "Dismissals", value: analytics.dismissals },
              { label: "CTR", value: `${analytics.clickThroughRate}%` },
              { label: "Conversion", value: `${analytics.conversionRate}%` },
              { label: "Primary clicks", value: analytics.clicks },
              { label: "Secondary clicks", value: analytics.secondaryClicks },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] uppercase tracking-wider text-sb-muted">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
            ))}
          </div>
        ) : null}

        {tab === "editor" ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs text-sb-muted mb-2 uppercase tracking-wider">
                Promo artwork
              </label>
              <AnnouncementImageUpload
                value={form.imageUrl ?? ""}
                onChange={(url) => setForm({ ...form, imageUrl: url })}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-sb-muted mb-1.5 uppercase tracking-wider">Headline *</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClassName()} />
              </div>
              <div>
                <label className="block text-xs text-sb-muted mb-1.5 uppercase tracking-wider">Description</label>
                <input value={form.subtitle ?? ""} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className={inputClassName()} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-sb-muted mb-1.5 uppercase tracking-wider">Primary button</label>
                <input value={form.buttonText ?? ""} onChange={(e) => setForm({ ...form, buttonText: e.target.value })} className={inputClassName()} placeholder={JOIN_THE_CONTEST} />
              </div>
              <div>
                <label className="block text-xs text-sb-muted mb-1.5 uppercase tracking-wider">Primary destination</label>
                <input value={form.destinationHref ?? ""} onChange={(e) => setForm({ ...form, destinationHref: e.target.value })} className={inputClassName()} placeholder="/pickem/week" list="dest-presets" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-sb-muted mb-1.5 uppercase tracking-wider">Secondary button</label>
                <input value={form.secondaryButtonText ?? ""} onChange={(e) => setForm({ ...form, secondaryButtonText: e.target.value })} className={inputClassName()} placeholder="Learn More" />
              </div>
              <div>
                <label className="block text-xs text-sb-muted mb-1.5 uppercase tracking-wider">Secondary destination</label>
                <input value={form.secondaryDestinationHref ?? ""} onChange={(e) => setForm({ ...form, secondaryDestinationHref: e.target.value })} className={inputClassName()} list="dest-presets" />
              </div>
            </div>

            <datalist id="dest-presets">
              {BUTTON_DESTINATION_PRESETS.map((p) => (
                <option key={p.href} value={p.href}>{p.label}</option>
              ))}
            </datalist>

            <div>
              <label className="block text-xs text-sb-muted mb-2 uppercase tracking-wider">Display type</label>
              <div className="sb-admin-option-grid">
                {DISPLAY_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm({ ...form, displayType: type })}
                    className={`sb-admin-option-tile ${form.displayType === type ? "sb-admin-option-tile-active" : ""}`}
                  >
                    <p className="text-sm font-semibold text-white">{DISPLAY_TYPE_LABELS[type]}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-sb-muted mb-1.5 uppercase tracking-wider">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as AnnouncementCategory })} className={selectClassName()}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-sb-muted mb-1.5 uppercase tracking-wider">Audience</label>
                <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value as AnnouncementAudience })} className={selectClassName()}>
                  {AUDIENCES.map((a) => <option key={a} value={a}>{AUDIENCE_LABELS[a]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-sb-muted mb-1.5 uppercase tracking-wider">Frequency</label>
                <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value as AnnouncementFrequency })} className={selectClassName()}>
                  {FREQUENCIES.map((f) => <option key={f} value={f}>{FREQUENCY_LABELS[f]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-sb-muted mb-1.5 uppercase tracking-wider">Priority</label>
                <select value={form.priorityLevel ?? "normal"} onChange={(e) => setForm({ ...form, priorityLevel: e.target.value as AnnouncementPriorityLevel })} className={selectClassName()}>
                  {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LEVEL_LABELS[p]}</option>)}
                </select>
              </div>
            </div>

            {form.audience === "email_list" ? (
              <div>
                <label className="block text-xs text-sb-muted mb-1.5 uppercase tracking-wider">Email list</label>
                <textarea value={emailsInput} onChange={(e) => setEmailsInput(e.target.value)} className={`${inputClassName()} min-h-[88px]`} placeholder="player@email.com, one per line" />
              </div>
            ) : null}

            <div>
              <label className="block text-xs text-sb-muted mb-1.5 uppercase tracking-wider">Regions (optional)</label>
              <input value={regionsInput} onChange={(e) => setRegionsInput(e.target.value)} className={inputClassName()} placeholder="US, US-TX, CA" />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-sb-muted mb-1.5 uppercase tracking-wider">Animation</label>
                <select value={form.animationStyle ?? "scale"} onChange={(e) => setForm({ ...form, animationStyle: e.target.value as AnnouncementAnimationStyle })} className={selectClassName()}>
                  {ANIMATIONS.map((a) => <option key={a} value={a}>{ANIMATION_STYLE_LABELS[a]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-sb-muted mb-1.5 uppercase tracking-wider">Timezone</label>
                <select value={form.timezone ?? "America/New_York"} onChange={(e) => setForm({ ...form, timezone: e.target.value })} className={selectClassName()}>
                  {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-sb-muted mb-1.5 uppercase tracking-wider">End date</label>
                <input type="datetime-local" value={form.endsAt?.slice(0, 16) ?? ""} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} className={inputClassName()} />
              </div>
            </div>

            <div>
              <label className="inline-flex items-center gap-2 text-sm text-white mb-2">
                <input type="checkbox" checked={startImmediately} onChange={(e) => setStartImmediately(e.target.checked)} className="rounded border-white/20" />
                Start immediately
              </label>
              {!startImmediately ? (
                <input type="datetime-local" value={form.startsAt?.slice(0, 16) ?? ""} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} className={inputClassName()} />
              ) : null}
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="inline-flex items-center gap-2 text-sm text-white">
                <input type="checkbox" checked={form.dismissible ?? true} onChange={(e) => setForm({ ...form, dismissible: e.target.checked })} className="rounded border-white/20" />
                Dismissible
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-white">
                <input type="checkbox" checked={form.active ?? true} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="rounded border-white/20" />
                Active
              </label>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" disabled={saving}>{saving ? "Publishing…" : editingId ? "Update" : "Publish"}</Button>
              <Button type="button" variant="secondary" onClick={() => setTab("preview")}>Preview</Button>
              <Button type="button" variant="secondary" onClick={() => void handleSaveTemplate()}>Save as template</Button>
              {editingId ? <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button> : null}
            </div>
          </form>
        ) : null}
      </LandingGlassCard>

      <LandingGlassCard className="overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-sb-muted">Published announcements</h2>
          <button type="button" onClick={resetForm} className="text-xs text-sb-purple-light hover:text-white inline-flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> New
          </button>
        </div>
        {loading ? (
          <p className="p-6 text-sb-muted text-sm">Loading…</p>
        ) : announcements.length === 0 ? (
          <p className="p-6 text-sb-muted text-sm">No announcements yet.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {announcements.map((item) => {
              const status = scheduleStatus(item);
              return (
                <div key={item.id} className="px-5 py-4 flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 flex gap-3">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                    ) : null}
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="text-white font-medium">{item.title}</p>
                        <span className="text-[10px] uppercase px-2 py-0.5 rounded-full border border-white/20 text-sb-muted">{status.label}</span>
                        {item.source === "automated" ? (
                          <span className="text-[10px] uppercase px-2 py-0.5 rounded-full border border-sky-500/40 text-sky-300">Automated</span>
                        ) : null}
                      </div>
                      <p className="text-xs text-sb-muted">
                        {DISPLAY_TYPE_LABELS[item.displayType]} · {PRIORITY_LEVEL_LABELS[item.priorityLevel]} · {AUDIENCE_LABELS[item.audience]}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => handleEdit(item)} disabled={item.source === "automated"} className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white hover:bg-white/5 disabled:opacity-40">Edit</button>
                    {status.tone !== "live" && item.source !== "automated" ? (
                      <button type="button" onClick={() => void handleGoLiveNow(item)} className="text-xs px-3 py-1.5 rounded-lg border border-emerald-500/40 text-emerald-300">Go live</button>
                    ) : null}
                    <button type="button" onClick={() => { handleEdit(item); setTab("analytics"); }} className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white hover:bg-white/5">Analytics</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </LandingGlassCard>
    </div>
  );
}
