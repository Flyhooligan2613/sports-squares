import { NextResponse } from "next/server";
import { getAuthorizedAdminUser } from "@/lib/auth/adminAuth";
import { SquarePassEngine } from "@/lib/platform/engines/squarePass";
import type { CreateCampaignInput } from "@/lib/platform/engines/squarePass";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await getAuthorizedAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const campaign = await SquarePassEngine.getCampaign(id);
  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found." }, { status: 404 });
  }

  const codes = await SquarePassEngine.listCodes(id);
  return NextResponse.json({ campaign, codes });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await getAuthorizedAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as Partial<CreateCampaignInput> & { active?: boolean };
  const campaign = await SquarePassEngine.updateCampaign(id, body);
  return NextResponse.json({ campaign });
}
