import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/database/config";
import { normalizeEmail } from "@/lib/player/statsCore";
import type {
  GenesisMissionId,
  GenesisMissionProgress,
  GenesisStarterAchievementId,
} from "@/lib/platform/engines/genesis/types";

export interface GenesisProfileRow {
  genesisInitializedAt: string | null;
  rookieSeasonStartedAt: string | null;
  rookieSeasonEndsAt: string | null;
  genesisAchievements: GenesisStarterAchievementId[];
  genesisCustomizationUnlocked: boolean;
  firstWinCelebratedAt: string | null;
  firstLossEncouragedAt: string | null;
  genesisMissionsCompleted: number;
  usernameCustomized: boolean;
  profileBio: string;
  avatarEmoji: string;
  profileFrameId: string | null;
  followingCount: number;
}

export async function fetchGenesisProfile(email: string): Promise<GenesisProfileRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLES.playerProfiles)
    .select(
      "genesis_initialized_at, rookie_season_started_at, rookie_season_ends_at, genesis_achievements, genesis_customization_unlocked, first_win_celebrated_at, first_loss_encouraged_at, genesis_missions_completed, username_customized, profile_bio, avatar_emoji, profile_frame_id, following_count"
    )
    .eq("email", normalizeEmail(email))
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as Record<string, unknown>;
  return {
    genesisInitializedAt: (row.genesis_initialized_at as string | null) ?? null,
    rookieSeasonStartedAt: (row.rookie_season_started_at as string | null) ?? null,
    rookieSeasonEndsAt: (row.rookie_season_ends_at as string | null) ?? null,
    genesisAchievements: (row.genesis_achievements as GenesisStarterAchievementId[]) ?? [],
    genesisCustomizationUnlocked: Boolean(row.genesis_customization_unlocked),
    firstWinCelebratedAt: (row.first_win_celebrated_at as string | null) ?? null,
    firstLossEncouragedAt: (row.first_loss_encouraged_at as string | null) ?? null,
    genesisMissionsCompleted: Number(row.genesis_missions_completed ?? 0),
    usernameCustomized: Boolean(row.username_customized),
    profileBio: String(row.profile_bio ?? ""),
    avatarEmoji: String(row.avatar_emoji ?? "🎮"),
    profileFrameId: (row.profile_frame_id as string | null) ?? null,
    followingCount: Number(row.following_count ?? 0),
  };
}

export async function fetchMissionProgress(email: string): Promise<GenesisMissionProgress[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("genesis_mission_progress")
    .select("mission_id, status, completed_at, xp_awarded, reward_metadata")
    .eq("email", normalizeEmail(email));

  if (error) throw error;

  return (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    return {
      missionId: r.mission_id as GenesisMissionId,
      status: r.status as GenesisMissionProgress["status"],
      completedAt: (r.completed_at as string | null) ?? null,
      xpAwarded: Number(r.xp_awarded ?? 0),
      rewardMetadata: (r.reward_metadata as Record<string, unknown>) ?? {},
    };
  });
}

export async function upsertMissionProgress(
  email: string,
  missionId: GenesisMissionId,
  patch: Partial<Pick<GenesisMissionProgress, "status" | "completedAt" | "xpAwarded" | "rewardMetadata">>
): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase.from("genesis_mission_progress").upsert(
    {
      email: normalizeEmail(email),
      mission_id: missionId,
      status: patch.status ?? "pending",
      completed_at: patch.completedAt ?? null,
      xp_awarded: patch.xpAwarded ?? 0,
      reward_metadata: patch.rewardMetadata ?? {},
    },
    { onConflict: "email,mission_id" }
  );
}

export async function patchGenesisProfile(
  email: string,
  patch: Record<string, unknown>
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from(TABLES.playerProfiles)
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("email", normalizeEmail(email));

  if (error) throw error;
}

export async function seedMissionRows(email: string, missionIds: GenesisMissionId[]): Promise<void> {
  const supabase = getSupabaseAdmin();
  const rows = missionIds.map((missionId) => ({
    email: normalizeEmail(email),
    mission_id: missionId,
    status: "pending",
  }));

  await supabase.from("genesis_mission_progress").upsert(rows, {
    onConflict: "email,mission_id",
    ignoreDuplicates: true,
  });
}
