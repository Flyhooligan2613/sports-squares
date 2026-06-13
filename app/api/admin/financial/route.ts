import { NextResponse } from "next/server";
import { getAuthorizedAdminUser } from "@/lib/auth/adminAuth";
import {
  getFinancialStatusOverview,
  listRecentPayouts,
} from "@/lib/platform/core/financialStatus";
import { getGrowthFundStats } from "@/lib/platform/core/growthFund";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAuthorizedAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({
      overview: null,
      recent: [],
      growthFund: {
        balanceCents: 0,
        lifetimeContributionsCents: 0,
        monthlyContributionsCents: 0,
      },
    });
  }

  try {
    const [overview, recent, growthFund] = await Promise.all([
      getFinancialStatusOverview(),
      listRecentPayouts(30),
      getGrowthFundStats(),
    ]);

    return NextResponse.json({ overview, recent, growthFund });
  } catch (err) {
    console.error("[admin/financial]", err);
    return NextResponse.json({
      overview: null,
      recent: [],
      growthFund: {
        balanceCents: 0,
        lifetimeContributionsCents: 0,
        monthlyContributionsCents: 0,
      },
      warning: "Some financial tables may be missing. Apply migration 023 if needed.",
    });
  }
}
