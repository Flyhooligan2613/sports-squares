import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import {
  buildCompetitorCard,
  buildCompetitorCardBySlug,
  extractCompetitorCardSection,
} from "@/lib/competitorCard/buildCompetitorCard";
import type { CompetitorCardSection } from "@/lib/competitorCard/types";
import { ensurePlayerProfile } from "@/lib/database/services/playerProfiles";
import { getPlayerLegacy } from "@/lib/database/services/playerLegacy";
import { updateEcosystemProfile } from "@/lib/platform/ecosystem/account";
import { normalizeEmail } from "@/lib/player/statsCore";

const VALID_SECTIONS = new Set<CompetitorCardSection>([
  "full",
  "stats",
  "legacy",
  "trophies",
  "rivalries",
  "achievements",
]);

function parseSection(url: string): CompetitorCardSection {
  const section = new URL(url).searchParams.get("section") ?? "full";
  return VALID_SECTIONS.has(section as CompetitorCardSection)
    ? (section as CompetitorCardSection)
    : "full";
}

export async function getOwnCompetitorCard(
  request: Request,
  sectionOverride?: CompetitorCardSection
) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const legacy = await getPlayerLegacy(user.email);
  if (!legacy) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const slug = await ensurePlayerProfile(user.email, legacy.publicLabel);
  if (!slug) {
    return NextResponse.json({ error: "Profile unavailable" }, { status: 503 });
  }

  const card = await buildCompetitorCard({
    email: user.email,
    slug,
    mode: "own",
    viewerEmail: user.email,
  });

  if (!card) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const section = sectionOverride ?? parseSection(request.url);
  const payload = extractCompetitorCardSection(card, section);
  return NextResponse.json(section === "full" ? card : { section, ...payload });
}

export async function getPublicCompetitorCard(request: Request, slug: string) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const card = await buildCompetitorCardBySlug(slug, user?.email, "public");
  if (!card) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const section = parseSection(request.url);
  const payload = extractCompetitorCardSection(card, section);
  return NextResponse.json(section === "full" ? card : { section, ...payload });
}

export async function patchOwnCompetitorProfile(request: Request) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    bio?: string;
    favoriteTeam?: string | null;
  };

  const patch: Record<string, string | null> = {};
  if (body.bio !== undefined) {
    patch.profile_bio = body.bio.trim().slice(0, 120);
  }
  if (body.favoriteTeam !== undefined) {
    patch.favorite_team = body.favoriteTeam?.trim() || null;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
  }

  await updateEcosystemProfile(normalizeEmail(user.email), patch);
  return NextResponse.json({ ok: true });
}

export async function patchCompetitorCustomization(request: Request) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    profileFrameId?: string | null;
    favoriteTeam?: string | null;
  };

  const patch: Record<string, string | null> = {};
  if (body.profileFrameId !== undefined) {
    patch.profile_frame_id = body.profileFrameId;
  }
  if (body.favoriteTeam !== undefined) {
    patch.favorite_team = body.favoriteTeam?.trim() || null;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
  }

  await updateEcosystemProfile(normalizeEmail(user.email), patch);
  return NextResponse.json({ ok: true });
}

/** Showcase persistence scaffold — accepts featured IDs; full DB column in Phase 2. */
export async function patchCompetitorShowcase(request: Request) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    featuredAchievementIds?: string[];
  };

  return NextResponse.json({
    ok: true,
    scaffolded: true,
    featuredAchievementIds: body.featuredAchievementIds?.slice(0, 6) ?? [],
  });
}
