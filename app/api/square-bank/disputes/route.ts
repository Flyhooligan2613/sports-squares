import { NextRequest, NextResponse } from "next/server";
import { getAuthorizedAdminUser } from "@/lib/auth/adminAuth";
import { SquareBankEngine } from "@/lib/platform/engines/squareBank";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAuthorizedAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "50");

  try {
    const disputes = await SquareBankEngine.listDisputes(Math.min(100, Math.max(1, limit)));
    return NextResponse.json({ disputes });
  } catch (err) {
    console.error("[square-bank/disputes]", err);
    return NextResponse.json({ error: "Failed to load disputes." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await getAuthorizedAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      ledgerEntryId?: string;
      playerEmail?: string;
      amountCents?: number;
      disputeType?: string;
      contestId?: string;
      paymentTransactionId?: string;
    };

    if (!body.playerEmail?.trim()) {
      return NextResponse.json({ error: "playerEmail is required." }, { status: 400 });
    }

    const dispute = await SquareBankEngine.openDispute({
      ledgerEntryId: body.ledgerEntryId,
      playerEmail: body.playerEmail.trim(),
      amountCents: Math.floor(body.amountCents ?? 0),
      disputeType: body.disputeType,
      contestId: body.contestId,
      paymentTransactionId: body.paymentTransactionId,
    });

    return NextResponse.json({ dispute });
  } catch (err) {
    console.error("[square-bank/disputes POST]", err);
    return NextResponse.json({ error: "Failed to open dispute." }, { status: 500 });
  }
}
