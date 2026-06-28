import { CommandCenterEngine } from "@/lib/platform/engines/commandCenter";
import { commandCenterJson } from "@/lib/platform/engines/commandCenter/apiFallback";
import { getDemoDashboardStats } from "@/lib/platform/engines/commandCenter/mockData";
import { requireCommandCenterAdmin } from "@/lib/platform/engines/commandCenter/apiAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error, role } = await requireCommandCenterAdmin("dashboard");
  if (error) return error;

  return commandCenterJson(
    "stats",
    () => CommandCenterEngine.getDashboardStats(),
    getDemoDashboardStats("Live stats failed — showing demo fallback."),
    "stats",
    { role }
  );
}
