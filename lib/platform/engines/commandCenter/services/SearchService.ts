import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { CommandCenterSearchResult } from "../types";

export async function searchCommandCenter(query: string, limit = 20): Promise<CommandCenterSearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  if (!isSupabaseAdminConfigured()) return [];

  const supabase = getSupabaseAdmin();
  const pattern = `%${q}%`;
  const results: CommandCenterSearchResult[] = [];

  const [poolsRes, playersRes, paymentsRes, auditRes, supportRes] = await Promise.all([
    supabase
      .from("pools")
      .select("id, name, home_team, away_team, status")
      .or(`name.ilike.${pattern},home_team.ilike.${pattern},away_team.ilike.${pattern}`)
      .limit(5),
    supabase
      .from("players")
      .select("id, name, email, pool_id")
      .or(`name.ilike.${pattern},email.ilike.${pattern}`)
      .limit(5),
    supabase
      .from("payment_transactions")
      .select("id, player_email, transaction_type, status, amount_cents")
      .or(`player_email.ilike.${pattern},id.ilike.${pattern}`)
      .limit(5),
    supabase
      .from("platform_audit_log")
      .select("id, event_type, summary, created_at")
      .or(`summary.ilike.${pattern},event_type.ilike.${pattern}`)
      .limit(5),
    supabase
      .from("support_threads")
      .select("id, subject, user_email, status")
      .or(`subject.ilike.${pattern},user_email.ilike.${pattern}`)
      .limit(5),
  ]);

  for (const pool of poolsRes.data ?? []) {
    results.push({
      type: "pool",
      id: pool.id as string,
      title: pool.name as string,
      subtitle: `${pool.away_team} vs ${pool.home_team} · ${pool.status}`,
      href: `/admin/pool/${pool.id}`,
    });
  }

  for (const player of playersRes.data ?? []) {
    results.push({
      type: "player",
      id: player.id as string,
      title: player.name as string,
      subtitle: (player.email as string | null) ?? "No email",
      href: player.email
        ? `/admin/security?email=${encodeURIComponent(player.email as string)}`
        : `/admin/pool/${player.pool_id}`,
    });
  }

  for (const tx of paymentsRes.data ?? []) {
    results.push({
      type: "payment",
      id: tx.id as string,
      title: `${tx.transaction_type} · ${tx.status}`,
      subtitle: `${tx.player_email} — $${((tx.amount_cents as number) / 100).toFixed(2)}`,
      href: "/admin/command-center/payments",
    });
  }

  for (const entry of auditRes.data ?? []) {
    results.push({
      type: "audit",
      id: entry.id as string,
      title: entry.event_type as string,
      subtitle: entry.summary as string,
      href: "/admin/command-center/audit",
    });
  }

  for (const thread of supportRes.data ?? []) {
    results.push({
      type: "support",
      id: thread.id as string,
      title: (thread.subject as string) || "Support thread",
      subtitle: `${thread.user_email ?? "unknown"} · ${thread.status}`,
      href: "/admin/support",
    });
  }

  return results.slice(0, limit);
}
