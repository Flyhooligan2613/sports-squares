import { NextRequest } from "next/server";
import { CommandCenterEngine } from "@/lib/platform/engines/commandCenter";
import { commandCenterJson } from "@/lib/platform/engines/commandCenter/apiFallback";
import { getDemoAuditEntries } from "@/lib/platform/engines/commandCenter/mockData";
import { requireCommandCenterAdmin } from "@/lib/platform/engines/commandCenter/apiAuth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { error } = await requireCommandCenterAdmin("audit");
  if (error) return error;

  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "100");
  const eventType = request.nextUrl.searchParams.get("eventType") ?? undefined;

  return commandCenterJson(
    "audit",
    () =>
      CommandCenterEngine.getAuditLog({
        limit: Math.min(200, Math.max(1, limit)),
        eventType,
      }),
    getDemoAuditEntries(),
    "entries"
  );
}
