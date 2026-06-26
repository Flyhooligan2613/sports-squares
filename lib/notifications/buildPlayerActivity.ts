import { getPlayerLegacy } from "@/lib/database/services/playerLegacy";
import { ensureEcosystemAccount } from "@/lib/platform/ecosystem/account";
import { getPlayerWinHighlights } from "@/lib/huddle/winHighlights";
import { getHuddlePlayerSummaries } from "@/lib/huddle/profiles";
import { SquareWalletEngine } from "@/lib/platform/engines/payment/wallet";
import { normalizeEmail } from "@/lib/player/statsCore";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/database/config";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { PoolRow } from "@/lib/database/types";

export type PlayerActivityKind =
  | "joined_platform"
  | "joined_contest"
  | "won"
  | "achievement"
  | "tier_up"
  | "verification"
  | "reward"
  | "deposit"
  | "withdrawal";

export interface PlayerActivityItem {
  id: string;
  kind: PlayerActivityKind;
  label: string;
  title: string;
  detail: string;
  at: string;
  href?: string;
  emoji: string;
  accent?: string;
}

export async function buildPlayerActivityTimeline(
  email: string,
  limit = 50
): Promise<PlayerActivityItem[]> {
  if (!isSupabaseAdminConfigured()) return [];

  const normalized = normalizeEmail(email);
  const items: PlayerActivityItem[] = [];

  const [legacy, account, wins, summaryMap] = await Promise.all([
    getPlayerLegacy(normalized).catch(() => null),
    ensureEcosystemAccount(normalized).catch(() => null),
    getPlayerWinHighlights(normalized, 30).catch(() => []),
    getHuddlePlayerSummaries([normalized]).catch(() => new Map()),
  ]);

  const summary = summaryMap.get(normalized);
  const memberSince = legacy?.memberSince ?? account?.memberSince ?? new Date().toISOString();

  items.push({
    id: "joined-platform",
    kind: "joined_platform",
    label: "Joined",
    title: "Joined SquareBoards",
    detail: "Started the competitive journey",
    at: memberSince,
    emoji: "🎮",
    href: "/my-games/profile",
  });

  if (summary?.isVerified) {
    items.push({
      id: "verified",
      kind: "verification",
      label: "Verified",
      title: "Verified Competitor",
      detail: "Identity verified on the platform",
      at: memberSince,
      emoji: "✓",
      accent: "text-sky-300",
      href: "/my-games/security",
    });
  }

  if (account?.tierSlug && account.tierSlug !== "rookie") {
    const tierLabel =
      account.tierSlug.charAt(0).toUpperCase() + account.tierSlug.slice(1).replace(/_/g, " ");
    items.push({
      id: `tier-${account.tierSlug}`,
      kind: "tier_up",
      label: "Tier up",
      title: `${tierLabel} tier unlocked`,
      detail: "Your reputation is rising on the platform",
      at: memberSince,
      emoji: "⬆️",
      accent: "text-purple-300",
      href: "/my-games/rewards/tier",
    });
  }

  for (const achievement of legacy?.achievements.filter((a) => a.unlocked) ?? []) {
    items.push({
      id: `achievement-${achievement.id}`,
      kind: "achievement",
      label: "Achievement",
      title: achievement.title,
      detail: achievement.description,
      at: memberSince,
      emoji: achievement.emoji,
      accent: "text-amber-300",
      href: "/my-games/rewards/achievements",
    });
  }

  for (const win of wins) {
    items.push({
      id: `win-${win.id}`,
      kind: "won",
      label: "Won",
      title: `${win.awayTeam} vs ${win.homeTeam}`,
      detail: [
        win.periodLabel,
        win.winningSquare != null ? `Square #${win.winningSquare}` : null,
        win.amount > 0 ? `$${win.amount.toFixed(0)}` : null,
      ]
        .filter(Boolean)
        .join(" · "),
      at: win.wonAt,
      emoji: "🏆",
      accent: "text-emerald-300",
      href: "/my-games/winnings",
    });
  }

  const supabase = getSupabaseAdmin();
  const { data: playerRows } = await supabase
    .from(TABLES.players)
    .select("pool_id, created_at")
    .ilike("email", normalized)
    .order("created_at", { ascending: false })
    .limit(20);

  if (playerRows?.length) {
    const poolIds = Array.from(new Set(playerRows.map((r) => r.pool_id)));
    const { data: poolRows } = await supabase
      .from(TABLES.pools)
      .select("id, home_team, away_team, invite_code, created_at")
      .in("id", poolIds);

    const poolMap = new Map(
      (poolRows as PoolRow[]).map((p) => [p.id, p])
    );

    for (const row of playerRows) {
      const pool = poolMap.get(row.pool_id);
      if (!pool) continue;
      items.push({
        id: `joined-${row.pool_id}`,
        kind: "joined_contest",
        label: "Joined contest",
        title: `${pool.away_team} vs ${pool.home_team}`,
        detail: "Entered a live competition board",
        at: row.created_at,
        emoji: "📋",
        href: pool.invite_code ? `/board/${pool.invite_code}` : "/my-games",
      });
    }
  }

  try {
    const { entries } = await SquareWalletEngine.listTransactions({
      email: normalized,
      limit: 25,
      offset: 0,
    });

    for (const entry of entries) {
      const type = entry.entryType;
      const amountLabel = `$${(entry.amountCents / 100).toFixed(2)}`;
      if (type === "deposit") {
        items.push({
          id: `wallet-deposit-${entry.id}`,
          kind: "deposit",
          label: "Deposit",
          title: "Funds added to SquareWallet™",
          detail: entry.description ?? `${amountLabel} deposited`,
          at: entry.createdAt,
          emoji: "💳",
          accent: "text-sky-300",
          href: "/my-games/wallet",
        });
      } else if (
        type === "withdrawal_request" ||
        type === "withdrawal_complete"
      ) {
        items.push({
          id: `wallet-withdraw-${entry.id}`,
          kind: "withdrawal",
          label: "Withdrawal",
          title: "Withdrawal processed",
          detail: entry.description ?? amountLabel,
          at: entry.createdAt,
          emoji: "↗️",
          accent: "text-slate-300",
          href: "/my-games/wallet",
        });
      } else if (
        type === "reward_credit" ||
        type === "bonus_credit" ||
        type === "promotional_credit" ||
        type === "referral_credit"
      ) {
        items.push({
          id: `wallet-reward-${entry.id}`,
          kind: "reward",
          label: "Reward",
          title: "Platform reward credited",
          detail: entry.description ?? amountLabel,
          at: entry.createdAt,
          emoji: "🎁",
          accent: "text-amber-300",
          href: "/my-games/rewards",
        });
      }
    }
  } catch {
    // Wallet history optional when ledger unavailable
  }

  return items
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, limit);
}
