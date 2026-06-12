import { NextResponse } from "next/server";
import { getActionCenterData } from "@/lib/database/services/actionCenter";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await getActionCenterData();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[action-center]", err);
    return NextResponse.json(
      { error: "Failed to load action center data." },
      { status: 500 }
    );
  }
}
