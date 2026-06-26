import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
import { NextResponse } from "next/server";
import { dbClaimSquaresWithInvite } from "@/lib/database/services/claims";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Square claiming is not configured." },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as {
      poolId?: string;
      squareIds?: number[];
      playerId?: string;
      inviteToken?: string;
    };

    const poolId = body.poolId?.trim();
    const playerId = body.playerId?.trim();
    const inviteToken = body.inviteToken?.trim();
    const squareIds = Array.isArray(body.squareIds)
      ? body.squareIds.map((id) => Number(id)).filter((id) => Number.isInteger(id))
      : [];

    if (!poolId || !playerId || !inviteToken) {
      return NextResponse.json(
        { error: "Pool, player, and invite token are required." },
        { status: 400 }
      );
    }

    const result = await dbClaimSquaresWithInvite(
      poolId,
      squareIds,
      playerId,
      inviteToken
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, pool: result.pool });
  } catch (err) {
    return NextResponse.json(
      {
        error: safeApiErrorMessage(err, "save"),
      },
      { status: 500 }
    );
  }
}
