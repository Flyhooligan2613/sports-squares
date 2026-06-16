import { NextResponse } from "next/server";
import { getGenesisAuthorizedEmail } from "@/lib/platform/engines/genesis/apiAuth";
import { GenesisEngine } from "@/lib/platform/engines/genesis";

export const dynamic = "force-dynamic";

export async function GET() {
  const email = await getGenesisAuthorizedEmail();
  if (email instanceof NextResponse) return email;

  const progress = await GenesisEngine.getProgress(email);
  return NextResponse.json(progress ?? { initialized: false });
}
