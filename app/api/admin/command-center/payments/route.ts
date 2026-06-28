import { NextRequest } from "next/server";
import { CommandCenterEngine } from "@/lib/platform/engines/commandCenter";
import { commandCenterJson } from "@/lib/platform/engines/commandCenter/apiFallback";
import { getDemoPaymentSummary } from "@/lib/platform/engines/commandCenter/mockData";
import { requireCommandCenterAdmin } from "@/lib/platform/engines/commandCenter/apiAuth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { error } = await requireCommandCenterAdmin("payments");
  if (error) return error;

  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "25");

  return commandCenterJson(
    "payments",
    () =>
      CommandCenterEngine.getPaymentCenterSummary(Math.min(50, Math.max(1, limit))),
    getDemoPaymentSummary(),
    "summary"
  );
}
