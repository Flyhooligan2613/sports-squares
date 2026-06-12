import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("token")?.trim();
  const email = searchParams.get("email")?.trim().toLowerCase();
  const next = searchParams.get("next") ?? "/my-games";

  const loginUrl = new URL("/my-games/login", origin);
  loginUrl.searchParams.set("error", "sign_in_failed");

  if (!token || !email) {
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "magiclink",
  });

  if (error) {
    console.error("[auth/verify]", error.message);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL(next, origin));
}
