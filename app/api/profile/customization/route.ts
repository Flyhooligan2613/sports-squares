import { NextResponse } from "next/server";
import { patchCompetitorCustomization } from "@/lib/competitorCard/profileApi";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  try {
    return await patchCompetitorCustomization(request);
  } catch (err) {
    console.error("[api/profile/customization]", err);
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
