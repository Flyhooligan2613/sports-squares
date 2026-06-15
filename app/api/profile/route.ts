import { NextResponse } from "next/server";
import {
  getOwnCompetitorCard,
  patchOwnCompetitorProfile,
} from "@/lib/competitorCard/profileApi";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    return await getOwnCompetitorCard(request);
  } catch (err) {
    console.error("[api/profile]", err);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    return await patchOwnCompetitorProfile(request);
  } catch (err) {
    console.error("[api/profile PATCH]", err);
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
