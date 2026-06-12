import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedAdminEmail } from "@/lib/auth/config";
import { ADMIN_LOGIN, requiresAdminSession } from "@/lib/auth/routes";
import {
  MY_GAMES_HOME,
  PLAYER_LOGIN,
  redirectToPlayerLogin,
  requiresPlayerSession,
} from "@/lib/auth/playerRoutes";

async function resolveSessionUser(
  supabase: ReturnType<typeof createServerClient>
) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) return user;
  } catch {
    // Network/SSL issues — fall back to cookie session below.
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.user ?? null;
}

function redirectToLogin(request: NextRequest, unauthorized = false) {
  const loginUrl = new URL(ADMIN_LOGIN, request.url);
  if (unauthorized) {
    loginUrl.searchParams.set("error", "unauthorized");
  }
  return NextResponse.redirect(loginUrl);
}

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const pathname = request.nextUrl.pathname;

  const authCode = request.nextUrl.searchParams.get("code");
  if (authCode && pathname !== "/auth/callback") {
    const callback = new URL("/auth/callback", request.url);
    callback.searchParams.set("code", authCode);
    const next = request.nextUrl.searchParams.get("next") ?? "/my-games";
    callback.searchParams.set("next", next);
    return NextResponse.redirect(callback);
  }

  if (!url || !key) {
    if (requiresAdminSession(pathname)) {
      return redirectToLogin(request);
    }
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const user = await resolveSessionUser(supabase);

    if (pathname === ADMIN_LOGIN && user && isAuthorizedAdminEmail(user.email)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (pathname === PLAYER_LOGIN && user) {
      return NextResponse.redirect(new URL(MY_GAMES_HOME, request.url));
    }

    if (requiresPlayerSession(pathname)) {
      if (!user) {
        return NextResponse.redirect(redirectToPlayerLogin(request.url));
      }
    }

    if (requiresAdminSession(pathname)) {
      if (!user) {
        return redirectToLogin(request);
      }

      if (!isAuthorizedAdminEmail(user.email)) {
        await supabase.auth.signOut();
        return redirectToLogin(request, true);
      }
    }
  } catch {
    if (requiresAdminSession(pathname)) {
      return redirectToLogin(request);
    }
    if (requiresPlayerSession(pathname)) {
      return NextResponse.redirect(redirectToPlayerLogin(request.url));
    }
    return NextResponse.next({ request });
  }

  return supabaseResponse;
}
