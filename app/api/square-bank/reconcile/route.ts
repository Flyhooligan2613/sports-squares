import { NextRequest, NextResponse } from "next/server";
import { getAuthorizedAdminUser } from "@/lib/auth/adminAuth";
import { SquareBankEngine } from "@/lib/platform/engines/squareBank";
import type { SquareBankReconciliationPeriod } from "@/lib/platform/engines/squareBank";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await getAuthorizedAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const period = (request.nextUrl.searchParams.get("period") ?? "daily") as SquareBankReconciliationPeriod;
  const valid: SquareBankReconciliationPeriod[] = ["daily", "weekly", "monthly"];
  const resolved = valid.includes(period) ? period : "daily";

  try {
    const result = await SquareBankEngine.runReconciliation(resolved);
    return NextResponse.json({ result });
  } catch (err) {
    console.error("[square-bank/reconcile]", err);
    return NextResponse.json({ error: "Reconciliation failed." }, { status: 500 });
  }
}
