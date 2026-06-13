import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail, displayNameFromEmail } from "@/lib/player/statsCore";
import { ensureEcosystemAccount } from "@/lib/platform/ecosystem/account";
import { DEFAULT_AVATAR } from "@/lib/platform/ecosystem/avatars";

export interface PlayerPublicIdentity {
  email: string;
  username: string | null;
  displayName: string;
  legacyName: string;
  profileBio: string | null;
  avatarEmoji: string;
  playerId: string | null;
  usernameCustomized: boolean;
  publicLabel: string;
}

export function resolvePlayerDisplayName(input: {
  username?: string | null;
  displayName?: string | null;
  email?: string;
  playerId?: string | null;
}): string {
  if (input.username?.trim()) return input.username.trim();
  if (input.playerId?.trim()) return input.playerId.trim();
  if (input.displayName?.trim()) return input.displayName.trim();
  if (input.email) return displayNameFromEmail(input.email);
  return "Player";
}

/** First-name style label from purchase records or profile — not the public username. */
export function resolveLegacyDisplayName(input: {
  playerRecordName?: string | null;
  displayName?: string | null;
  email?: string;
}): string {
  const fromPlayer = input.playerRecordName?.trim();
  if (fromPlayer) {
    return fromPlayer.split(/\s+/)[0] ?? fromPlayer;
  }
  const fromProfile = input.displayName?.trim();
  if (fromProfile) {
    return fromProfile.split(/\s+/)[0] ?? fromProfile;
  }
  if (input.email) {
    return displayNameFromEmail(input.email).split(/\s+/)[0] ?? displayNameFromEmail(input.email);
  }
  return "Player";
}

export async function getPlayerPublicIdentity(email: string): Promise<PlayerPublicIdentity> {
  const normalized = normalizeEmail(email);
  const account = await ensureEcosystemAccount(normalized).catch(() => null);
  const supabase = getSupabaseAdmin();

  const { data: profile } = await supabase
    .from("player_profiles")
    .select("username, display_name, profile_bio, avatar_emoji, player_id, username_customized")
    .eq("email", normalized)
    .maybeSingle();

  const username = (profile?.username as string | null) ?? account?.username ?? null;
  const displayName =
    (profile?.display_name as string) ?? account?.displayName ?? displayNameFromEmail(normalized);
  const playerId = (profile?.player_id as string | null) ?? account?.playerId ?? null;

  return {
    email: normalized,
    username,
    displayName,
    legacyName: resolveLegacyDisplayName({ displayName, email: normalized }),
    profileBio: ((profile?.profile_bio as string) ?? "").trim() || null,
    avatarEmoji: (profile?.avatar_emoji as string) ?? DEFAULT_AVATAR,
    playerId,
    usernameCustomized: Boolean(profile?.username_customized),
    publicLabel: resolvePlayerDisplayName({ username, displayName, email: normalized, playerId }),
  };
}

export async function getPlayerPublicIdentityMap(
  emails: string[]
): Promise<Map<string, PlayerPublicIdentity>> {
  const unique = Array.from(new Set(emails.map(normalizeEmail).filter(Boolean)));
  const map = new Map<string, PlayerPublicIdentity>();
  if (!unique.length) return map;

  const supabase = getSupabaseAdmin();
  const { data: rows } = await supabase
    .from("player_profiles")
    .select("email, username, display_name, profile_bio, avatar_emoji, player_id, username_customized")
    .in("email", unique);

  for (const email of unique) {
    const row = (rows ?? []).find((r) => normalizeEmail(r.email as string) === email);
    const username = (row?.username as string | null) ?? null;
    const displayName = (row?.display_name as string) ?? displayNameFromEmail(email);
    const playerId = (row?.player_id as string | null) ?? null;
    map.set(email, {
      email,
      username,
      displayName,
      legacyName: resolveLegacyDisplayName({ displayName, email }),
      profileBio: ((row?.profile_bio as string) ?? "").trim() || null,
      avatarEmoji: (row?.avatar_emoji as string) ?? DEFAULT_AVATAR,
      playerId,
      usernameCustomized: Boolean(row?.username_customized),
      publicLabel: resolvePlayerDisplayName({ username, displayName, email, playerId }),
    });
  }

  return map;
}
