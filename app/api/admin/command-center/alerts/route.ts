import { NextRequest, NextResponse } from "next/server";
import { CommandCenterEngine } from "@/lib/platform/engines/commandCenter";
import { requireCommandCenterAdmin } from "@/lib/platform/engines/commandCenter/apiAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireCommandCenterAdmin("alerts");
  if (error) return error;

  try {
    const alerts = await CommandCenterEngine.listAlerts();
    return NextResponse.json({ alerts });
  } catch (err) {
    console.error("[command-center/alerts]", err);
    return NextResponse.json({ error: "Failed to load alerts." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const { error } = await requireCommandCenterAdmin("alerts");
  if (error) return error;

  try {
    const body = (await request.json()) as {
      id?: string;
      enabled?: boolean;
      thresholdConfig?: Record<string, unknown>;
    };

    if (!body.id) {
      return NextResponse.json({ error: "Alert id required." }, { status: 400 });
    }

    const alert = await CommandCenterEngine.updateAlert({
      id: body.id,
      enabled: body.enabled,
      thresholdConfig: body.thresholdConfig,
    });

    if (!alert) {
      return NextResponse.json({ error: "Alert not found." }, { status: 404 });
    }

    return NextResponse.json({ alert });
  } catch (err) {
    console.error("[command-center/alerts PATCH]", err);
    return NextResponse.json({ error: "Failed to update alert." }, { status: 500 });
  }
}
