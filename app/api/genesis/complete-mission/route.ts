import { NextResponse } from "next/server";
import { getGenesisAuthorizedEmail } from "@/lib/platform/engines/genesis/apiAuth";
import { GenesisEngine } from "@/lib/platform/engines/genesis";
import { GENESIS_MISSION_MAP } from "@/lib/platform/engines/genesis/config";
import type { GenesisMissionId } from "@/lib/platform/engines/genesis";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const email = await getGenesisAuthorizedEmail();
  if (email instanceof NextResponse) return email;

  const body = (await request.json()) as { missionId?: string };
  const missionId = body.missionId as GenesisMissionId | undefined;

  if (!missionId || !(missionId in GENESIS_MISSION_MAP)) {
    return NextResponse.json({ error: "Invalid mission." }, { status: 400 });
  }

  const result = await GenesisEngine.trackPageVisit(email, missionId).catch(async () =>
    GenesisEngine.completeMission(email, missionId)
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Could not complete mission." }, { status: 400 });
  }

  const progress = await GenesisEngine.getProgress(email);
  return NextResponse.json({ ...result, progress });
}
