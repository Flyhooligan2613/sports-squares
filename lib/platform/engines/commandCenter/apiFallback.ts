import { NextResponse } from "next/server";
import { COMMAND_CENTER_API_TIMEOUT_MS } from "./config";
import { withTimeout } from "./withTimeout";

/** Run engine work with timeout; return JSON payload with demo fallback on failure. */
export async function commandCenterJson<T>(
  label: string,
  work: () => Promise<T>,
  fallback: T,
  payloadKey: string,
  extra?: Record<string, unknown>
) {
  try {
    const result = await withTimeout(work(), COMMAND_CENTER_API_TIMEOUT_MS, label);
    return NextResponse.json({ [payloadKey]: result, ...extra });
  } catch (err) {
    console.error(`[command-center/${label}]`, err);
    return NextResponse.json({ [payloadKey]: fallback, demo: true, ...extra });
  }
}
