import { NextRequest } from "next/server";
import { CommandCenterEngine } from "@/lib/platform/engines/commandCenter";
import { commandCenterJson } from "@/lib/platform/engines/commandCenter/apiFallback";
import { getDemoActivityFeed } from "@/lib/platform/engines/commandCenter/mockData";
import { requireCommandCenterAdmin } from "@/lib/platform/engines/commandCenter/apiAuth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { error } = await requireCommandCenterAdmin("dashboard");
  if (error) return error;

  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "50");
  const since = request.nextUrl.searchParams.get("since") ?? undefined;

  return commandCenterJson(
    "activity",
    () =>
      CommandCenterEngine.getActivityFeed({
        limit: Math.min(100, Math.max(1, limit)),
        since,
      }),
    getDemoActivityFeed(),
    "items"
  );
}
