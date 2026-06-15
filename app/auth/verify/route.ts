import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash =
    searchParams.get("token_hash")?.trim() ??
    searchParams.get("token")?.trim() ??
    null;
  const type = (searchParams.get("type")?.trim() ?? "email") as
    | "email"
    | "magiclink";
  const next = searchParams.get("next") ?? "/my-games?welcome=1";

  const loginUrl = new URL("/my-games/login", request.url);
  loginUrl.searchParams.set("error", "sign_in_failed");

  if (!tokenHash) {
    return NextResponse.redirect(loginUrl);
  }

  const cookieStore = await cookies();
  let response = NextResponse.redirect(new URL(next, request.url));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const attempts: Array<{ token_hash: string; type: "email" | "magiclink" }> = [
    { token_hash: tokenHash, type },
    { token_hash: tokenHash, type: "email" },
    { token_hash: tokenHash, type: "magiclink" },
  ];

  let verified = false;
  for (const params of attempts) {
    const { error } = await supabase.auth.verifyOtp(params);
    if (!error) {
      verified = true;
      break;
    }
    console.error("[auth/verify]", params.type, error.message);
  }

  if (!verified) {
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
