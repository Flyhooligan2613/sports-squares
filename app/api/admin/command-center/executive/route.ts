import { CommandCenterEngine } from "@/lib/platform/engines/commandCenter";
import { commandCenterJson } from "@/lib/platform/engines/commandCenter/apiFallback";
import { getDemoExecutiveSummary } from "@/lib/platform/engines/commandCenter/mockData";
import { requireCommandCenterAdmin } from "@/lib/platform/engines/commandCenter/apiAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error, role } = await requireCommandCenterAdmin("executive");
  if (error) return error;

  return commandCenterJson(
    "executive",
    () => CommandCenterEngine.getExecutiveSummary(),
    getDemoExecutiveSummary(),
    "summary",
    { role }
  );
}
