import { NextResponse } from "next/server";
import { getVapidPublicKey, isPushConfigured } from "@/lib/push/config";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isPushConfigured()) {
    return NextResponse.json({ configured: false, publicKey: null });
  }

  return NextResponse.json({
    configured: true,
    publicKey: getVapidPublicKey(),
  });
}
