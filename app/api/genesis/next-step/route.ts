import { NextResponse } from "next/server";
import { getGenesisAuthorizedEmail } from "@/lib/platform/engines/genesis/apiAuth";
import { GenesisEngine } from "@/lib/platform/engines/genesis";
import type { GenesisScreenContext } from "@/lib/platform/engines/genesis";

export const dynamic = "force-dynamic";

const VALID_CONTEXTS = new Set<GenesisScreenContext>([
  "profile",
  "my_games",
  "contest_center",
  "trophy_room",
  "community",
  "achievements",
  "dashboard",
]);

export async function GET(request: Request) {
  const email = await getGenesisAuthorizedEmail();
  if (email instanceof NextResponse) return email;

  const context = (new URL(request.url).searchParams.get("context") ??
    "dashboard") as GenesisScreenContext;

  if (!VALID_CONTEXTS.has(context)) {
    return NextResponse.json({ error: "Invalid context." }, { status: 400 });
  }

  const nextStep = await GenesisEngine.getNextStep(email, context);
  return NextResponse.json({ context, nextStep });
}
