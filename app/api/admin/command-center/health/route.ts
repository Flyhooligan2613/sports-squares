import { CommandCenterEngine } from "@/lib/platform/engines/commandCenter";
import { commandCenterJson } from "@/lib/platform/engines/commandCenter/apiFallback";
import { getDemoSystemHealth } from "@/lib/platform/engines/commandCenter/mockData";
import { requireCommandCenterAdmin } from "@/lib/platform/engines/commandCenter/apiAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireCommandCenterAdmin("health");
  if (error) return error;

  return commandCenterJson(
    "health",
    () => CommandCenterEngine.getSystemHealth(),
    getDemoSystemHealth(),
    "health"
  );
}
