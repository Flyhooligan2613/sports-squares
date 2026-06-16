import { NextResponse } from "next/server";
import { getGenesisAuthorizedEmail } from "@/lib/platform/engines/genesis/apiAuth";
import { GenesisEngine } from "@/lib/platform/engines/genesis";

export const dynamic = "force-dynamic";

export async function GET() {
  const email = await getGenesisAuthorizedEmail();
  if (email instanceof NextResponse) return email;

  const career = await GenesisEngine.getCareerProgress(email);
  const rookieSeason = await GenesisEngine.getRookieSeason(email);
  const motivation = GenesisEngine.getDailyMotivation(email);

  return NextResponse.json({ career, rookieSeason, motivation });
}
