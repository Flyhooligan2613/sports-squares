import { NextResponse } from "next/server";
import { resolveInviteToken } from "@/lib/invites/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Invite resolution is not configured." },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token")?.trim();

  if (!token) {
    return NextResponse.json({ error: "Invite token is required." }, { status: 400 });
  }

  try {
    const invite = await resolveInviteToken(token);
    if (!invite) {
      return NextResponse.json({ error: "Invalid invite link." }, { status: 404 });
    }

    return NextResponse.json({
      poolId: invite.poolId,
      poolName: invite.poolName,
      homeTeam: invite.homeTeam,
      awayTeam: invite.awayTeam,
      poolStatus: invite.poolStatus,
      player: {
        id: invite.player.id,
        name: invite.player.name,
        initials: invite.player.initials,
        color: invite.player.color,
        creditsPurchased: invite.player.creditsPurchased,
        creditsUsed: invite.player.creditsUsed,
        creditsRemaining: invite.player.creditsRemaining,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to resolve invite link.",
      },
      { status: 500 }
    );
  }
}
