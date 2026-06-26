import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
import { NextResponse } from "next/server";
import { patchCompetitorShowcase } from "@/lib/competitorCard/profileApi";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  try {
    return await patchCompetitorShowcase(request);
  } catch (err) {
    console.error("[api/profile/showcase]", err);
    const message = safeApiErrorMessage(err, "save");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
