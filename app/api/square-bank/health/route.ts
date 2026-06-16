import { NextResponse } from "next/server";
import { getAuthorizedAdminUser } from "@/lib/auth/adminAuth";
import { SquareBankEngine } from "@/lib/platform/engines/squareBank";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAuthorizedAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const metrics = await SquareBankEngine.getHealthMetrics();
    return NextResponse.json({ metrics });
  } catch (err) {
    console.error("[square-bank/health]", err);
    return NextResponse.json({ error: "Failed to load financial health." }, { status: 500 });
  }
}
