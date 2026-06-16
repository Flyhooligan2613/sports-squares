import { NextResponse, type NextRequest } from "next/server";
import { isLinkPreviewCrawler } from "@/lib/seo/crawlers";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  if (isLinkPreviewCrawler(request.headers.get("user-agent"))) {
    return NextResponse.next({ request });
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.json|offline|test-supabase|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
