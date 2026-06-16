import { NextResponse } from "next/server";
import { getAuthorizedAdminUser } from "@/lib/auth/adminAuth";
import { SquarePassEngine } from "@/lib/platform/engines/squarePass";
import type { CreateCampaignInput } from "@/lib/platform/engines/squarePass";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAuthorizedAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const campaigns = await SquarePassEngine.listCampaigns();
    return NextResponse.json({ campaigns });
  } catch (err) {
    console.error("[admin/square-pass/campaigns]", err);
    return NextResponse.json({ error: "Failed to load campaigns." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await getAuthorizedAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as CreateCampaignInput;
    if (!body.slug?.trim() || !body.name?.trim() || !body.campaignType) {
      return NextResponse.json({ error: "slug, name, and campaignType are required." }, { status: 400 });
    }

    const campaign = await SquarePassEngine.createCampaign(body);
    return NextResponse.json({ campaign });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create campaign.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
