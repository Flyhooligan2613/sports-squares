import { NextResponse } from "next/server";

/** Block Connect Sample demo routes outside explicit local/dev enablement. */
export function connectSampleDisabledResponse(): NextResponse | null {
  if (
    process.env.NODE_ENV === "production" ||
    process.env.CONNECT_SAMPLE_ENABLED !== "true"
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return null;
}
