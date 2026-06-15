import { getOwnCompetitorCard } from "@/lib/competitorCard/profileApi";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return getOwnCompetitorCard(request, "stats");
}
