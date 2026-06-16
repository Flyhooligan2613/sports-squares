import { NextRequest, NextResponse } from "next/server";
import { CommandCenterEngine } from "@/lib/platform/engines/commandCenter";
import { requireCommandCenterAdmin } from "@/lib/platform/engines/commandCenter/apiAuth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { error } = await requireCommandCenterAdmin("payments");
  if (error) return error;

  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "25");

  try {
    const summary = await CommandCenterEngine.getPaymentCenterSummary(
      Math.min(50, Math.max(1, limit))
    );
    return NextResponse.json({ summary });
  } catch (err) {
    console.error("[command-center/payments]", err);
    return NextResponse.json({ error: "Failed to load payment center." }, { status: 500 });
  }
}
