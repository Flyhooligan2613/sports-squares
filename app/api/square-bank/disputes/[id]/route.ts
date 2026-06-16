import { NextRequest, NextResponse } from "next/server";
import { getAuthorizedAdminUser } from "@/lib/auth/adminAuth";
import { SquareBankEngine } from "@/lib/platform/engines/squareBank";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await getAuthorizedAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const dispute = await SquareBankEngine.getDispute(id);
    if (!dispute) {
      return NextResponse.json({ error: "Dispute not found." }, { status: 404 });
    }

    const detail = dispute.ledgerEntryId
      ? await SquareBankEngine.getTransactionDetail(dispute.ledgerEntryId)
      : null;

    return NextResponse.json({ dispute, transactionDetail: detail });
  } catch (err) {
    console.error("[square-bank/disputes/id]", err);
    return NextResponse.json({ error: "Failed to load dispute." }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await getAuthorizedAdminUser();
  if (!admin?.email) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = (await request.json()) as { resolutionNotes?: string; status?: "resolved" | "closed" };
    if (!body.resolutionNotes?.trim()) {
      return NextResponse.json({ error: "resolutionNotes is required." }, { status: 400 });
    }

    const dispute = await SquareBankEngine.resolveDispute({
      disputeId: id,
      adminEmail: admin.email,
      resolutionNotes: body.resolutionNotes.trim(),
      status: body.status,
    });

    if (!dispute) {
      return NextResponse.json({ error: "Dispute not found." }, { status: 404 });
    }

    return NextResponse.json({ dispute });
  } catch (err) {
    console.error("[square-bank/disputes/id PATCH]", err);
    return NextResponse.json({ error: "Failed to resolve dispute." }, { status: 500 });
  }
}
