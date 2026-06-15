import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { publishPlatformEvent } from "@/lib/events/engine";
import type { PlatformEventHandler } from "@/lib/events/types";
import { earnTierCredits } from "@/lib/platform/ecosystem/credits";
import { normalizeEmail } from "@/lib/player/statsCore";
import {
  SURVIVOR_REWARD_CREDITS,
  survivorRewardSource,
} from "@/lib/survivor/rewards";

async function alreadyAwarded(email: string, source: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("player_credit_ledger")
    .select("*", { count: "exact", head: true })
    .eq("email", normalizeEmail(email))
    .eq("source", source);

  if (error) throw error;
  return (count ?? 0) > 0;
}

async function grantSurvivorCredits(input: {
  email: string;
  amount: number;
  kind: keyof typeof SURVIVOR_REWARD_CREDITS;
  idempotencyKey: string;
  summary: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  if (input.amount <= 0) return;

  const source = survivorRewardSource(input.kind, input.idempotencyKey);
  if (await alreadyAwarded(input.email, source)) return;

  const awarded = await earnTierCredits({
    email: input.email,
    amount: input.amount,
    source,
    gameType: "survivor",
    metadata: input.metadata,
  });

  if (awarded <= 0) return;

  await publishPlatformEvent({
    type: "reward.earned",
    priority: "normal",
    summary: input.summary,
    gameType: "survivor",
    entityType: "survivor_entry",
    entityId: String(input.metadata?.entryId ?? input.email),
    actorEmail: input.email,
    payload: {
      amount: awarded,
      kind: input.kind,
      ...input.metadata,
    },
    idempotencyKey: `reward:${source}`,
  }).catch(() => undefined);
}

/**
 * RewardCore™ subscriber — tier credits for Survivor participation milestones.
 */
export const survivorRewardsHandler: PlatformEventHandler = async (event) => {
  const email = event.actorEmail;
  if (!email) return;

  const payload = event.payload ?? {};
  const entryId = String(payload.entryId ?? event.entityId ?? email);
  const weekNumber = payload.weekNumber;

  try {
    if (event.type === "survivor.survived") {
      await grantSurvivorCredits({
        email,
        amount: SURVIVOR_REWARD_CREDITS.weekSurvived,
        kind: "weekSurvived",
        idempotencyKey: `${entryId}:${weekNumber ?? "week"}`,
        summary: `+${SURVIVOR_REWARD_CREDITS.weekSurvived} tier credits — survived the week`,
        metadata: { entryId, weekNumber },
      });
      return;
    }

    if (event.type === "survivor.shield_activated") {
      await grantSurvivorCredits({
        email,
        amount: SURVIVOR_REWARD_CREDITS.shieldSavedBonus,
        kind: "shieldSavedBonus",
        idempotencyKey: String(payload.pickId ?? `${entryId}:${weekNumber}`),
        summary: `+${SURVIVOR_REWARD_CREDITS.shieldSavedBonus} tier credits — Survivor Shield save`,
        metadata: { entryId, weekNumber, pickId: payload.pickId },
      });
      return;
    }

    if (event.type === "survivor.life_lost") {
      await grantSurvivorCredits({
        email,
        amount: SURVIVOR_REWARD_CREDITS.lifeLostConsolation,
        kind: "lifeLostConsolation",
        idempotencyKey: String(payload.pickId ?? `${entryId}:${weekNumber}`),
        summary: `+${SURVIVOR_REWARD_CREDITS.lifeLostConsolation} tier credits — still in Double Life`,
        metadata: {
          entryId,
          weekNumber,
          pickId: payload.pickId,
          livesRemaining: payload.livesRemaining,
        },
      });
      return;
    }

    if (event.type === "survivor.eliminated") {
      await grantSurvivorCredits({
        email,
        amount: SURVIVOR_REWARD_CREDITS.eliminatedConsolation,
        kind: "eliminatedConsolation",
        idempotencyKey: `${entryId}:eliminated`,
        summary: `+${SURVIVOR_REWARD_CREDITS.eliminatedConsolation} tier credits — stay in the game`,
        metadata: { entryId, weekNumber },
      });
      return;
    }

    if (event.type === "survivor.champion_crowned") {
      await grantSurvivorCredits({
        email,
        amount: SURVIVOR_REWARD_CREDITS.champion,
        kind: "champion",
        idempotencyKey: `${entryId}:champion`,
        summary: `+${SURVIVOR_REWARD_CREDITS.champion} tier credits — Survivor X™ champion`,
        metadata: { entryId, seasonYear: payload.seasonYear },
      });
    }
  } catch (err) {
    console.error("[SurvivorRewards]", event.type, err);
  }
};
