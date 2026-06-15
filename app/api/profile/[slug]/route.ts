import { NextResponse } from "next/server";
import { getPublicCompetitorCard } from "@/lib/competitorCard/profileApi";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { slug: string };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    return await getPublicCompetitorCard(request, params.slug);
  } catch (err) {
    console.error("[api/profile/[slug]]", err);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}
