import { CommandCenterEngine } from "@/lib/platform/engines/commandCenter";
import { commandCenterJson } from "@/lib/platform/engines/commandCenter/apiFallback";
import { getDemoContestSummary } from "@/lib/platform/engines/commandCenter/mockData";
import { requireCommandCenterAdmin } from "@/lib/platform/engines/commandCenter/apiAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireCommandCenterAdmin("contests");
  if (error) return error;

  return commandCenterJson(
    "contests",
    () => CommandCenterEngine.getContestOperationsSummary(),
    getDemoContestSummary(),
    "summary"
  );
}
