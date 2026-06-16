import { NextResponse } from "next/server";
import { getAuthorizedAdminUser } from "@/lib/auth/adminAuth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { TABLES } from "@/lib/database/config";
import { sendInviteEmail } from "@/lib/email/resend";
import { buildInvitePath } from "@/lib/invites";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { getAppUrl } from "@/lib/platform/engines/payment";
import { generateInviteToken } from "@/lib/utils";
import type { PlayerRow } from "@/lib/database/types";

export async function POST(request: Request) {
  const admin = await getAuthorizedAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Server database is not configured." },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as {
      poolId?: string;
      playerId?: string;
    };

    const poolId = body.poolId?.trim();
    const playerId = body.playerId?.trim();

    if (!poolId || !playerId) {
      return NextResponse.json(
        { error: "poolId and playerId are required." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: player, error: playerError } = await supabase
      .from(TABLES.players)
      .select("*")
      .eq("pool_id", poolId)
      .eq("id", playerId)
      .maybeSingle();

    if (playerError || !player) {
      return NextResponse.json({ error: "Player not found." }, { status: 404 });
    }

    const row = player as PlayerRow;
    if (!row.email) {
      return NextResponse.json(
        { error: "Player does not have an email address." },
        { status: 400 }
      );
    }

    let inviteToken = row.invite_token;
    if (!inviteToken) {
      inviteToken = generateInviteToken();
      await supabase
        .from(TABLES.players)
        .update({ invite_token: inviteToken })
        .eq("id", playerId)
        .eq("pool_id", poolId);
    }

    const { data: pool, error: poolError } = await supabase
      .from(TABLES.pools)
      .select("name")
      .eq("id", poolId)
      .maybeSingle();

    if (poolError || !pool) {
      return NextResponse.json({ error: "Pool not found." }, { status: 404 });
    }

    const inviteUrl = `${getAppUrl()}${buildInvitePath(inviteToken)}`;
    const emailResult = await sendInviteEmail({
      to: row.email,
      poolName: pool.name,
      creditsPurchased: row.credits_allocated,
      inviteUrl,
    });

    const update = emailResult.ok
      ? {
          invite_delivery_status: "sent" as const,
          invite_sent_at: new Date().toISOString(),
          invite_delivery_error: null,
        }
      : {
          invite_delivery_status: "failed" as const,
          invite_delivery_error: emailResult.error,
        };

    await supabase
      .from(TABLES.players)
      .update(update)
      .eq("id", playerId)
      .eq("pool_id", poolId);

    if (!emailResult.ok) {
      return NextResponse.json({ error: emailResult.error }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      inviteUrl,
      inviteDeliveryStatus: "sent",
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to send invite.",
      },
      { status: 500 }
    );
  }
}
