import { NextResponse } from "next/server";
import { getGenesisAuthorizedEmail } from "@/lib/platform/engines/genesis/apiAuth";
import { GenesisEngine } from "@/lib/platform/engines/genesis";

export const dynamic = "force-dynamic";

export async function POST() {
  const email = await getGenesisAuthorizedEmail();
  if (email instanceof NextResponse) return email;

  const payload = await GenesisEngine.celebrateFirstWin(email);
  return NextResponse.json(payload);
}
