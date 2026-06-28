import { CommandCenterEngine } from "@/lib/platform/engines/commandCenter";
import { commandCenterJson } from "@/lib/platform/engines/commandCenter/apiFallback";
import { getDemoFinancialHealth } from "@/lib/platform/engines/commandCenter/mockData";
import { requireCommandCenterAdmin } from "@/lib/platform/engines/commandCenter/apiAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireCommandCenterAdmin("finance");
  if (error) return error;

  return commandCenterJson(
    "finance",
    () => CommandCenterEngine.getFinancialHealthSummary(),
    getDemoFinancialHealth(),
    "summary"
  );
}
