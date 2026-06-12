import { TABLES } from "@/lib/database/config";
import { getConnectAccountIdForEmail } from "@/lib/database/services/stripeConnect";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";

export type PayoutRecipientFailure =
  | "unclaimed"
  | "no_email"
  | "no_connect_account"
  | "not_configured";

export interface PayoutRecipient {
  email: string;
  connectAccountId: string;
}

export async function resolvePayoutRecipient(input: {
  poolId: string;
  winningSquare: number;
  winningPlayer: string;
}): Promise<
  | { ok: true; recipient: PayoutRecipient }
  | { ok: false; reason: PayoutRecipientFailure; message: string }
> {
  if (!isSupabaseAdminConfigured()) {
    return {
      ok: false,
      reason: "not_configured",
      message: "Database not configured.",
    };
  }

  const playerName = input.winningPlayer.trim();
  if (!playerName || playerName.toLowerCase() === "unclaimed") {
    return {
      ok: false,
      reason: "unclaimed",
      message: "Winning square is unclaimed — no payout recipient.",
    };
  }

  const email = await resolveWinnerEmail(input);
  if (!email) {
    return {
      ok: false,
      reason: "no_email",
      message: "Could not resolve winner email for Stripe Connect transfer.",
    };
  }

  const connectAccountId = await getConnectAccountIdForEmail(email);
  if (!connectAccountId) {
    return {
      ok: false,
      reason: "no_connect_account",
      message: "Winner has not completed Stripe payout setup.",
    };
  }

  return {
    ok: true,
    recipient: { email, connectAccountId },
  };
}

async function resolveWinnerEmail(input: {
  poolId: string;
  winningSquare: number;
  winningPlayer: string;
}): Promise<string | null> {
  const supabase = getSupabaseAdmin();

  const { data: square, error: squareError } = await supabase
    .from(TABLES.squares)
    .select("player_id")
    .eq("pool_id", input.poolId)
    .eq("square_number", input.winningSquare)
    .maybeSingle();

  if (squareError) throw squareError;

  if (square?.player_id) {
    const { data: player, error: playerError } = await supabase
      .from(TABLES.players)
      .select("email, name")
      .eq("id", square.player_id as string)
      .maybeSingle();

    if (playerError) throw playerError;
    const email = (player?.email as string | null)?.trim();
    if (email) return normalizeEmail(email);
  }

  const { data: players, error: playersError } = await supabase
    .from(TABLES.players)
    .select("email, name")
    .eq("pool_id", input.poolId);

  if (playersError) throw playersError;

  const targetName = input.winningPlayer.trim().toLowerCase();
  for (const row of players ?? []) {
    const name = (row.name as string | null)?.trim().toLowerCase();
    const email = (row.email as string | null)?.trim();
    if (name === targetName && email) {
      return normalizeEmail(email);
    }
  }

  for (const row of players ?? []) {
    const email = (row.email as string | null)?.trim();
    if (!email) continue;
    const name = (row.name as string | null)?.trim().toLowerCase();
    if (name && targetName.startsWith(name)) {
      return normalizeEmail(email);
    }
  }

  return null;
}
