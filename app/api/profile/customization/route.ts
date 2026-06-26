import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
import { NextResponse } from "next/server";
import { patchCompetitorCustomization } from "@/lib/competitorCard/profileApi";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  try {
    return await patchCompetitorCustomization(request);
  } catch (err) {
    console.error("[api/profile/customization]", err);
    const message = safeApiErrorMessage(err, "save");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
