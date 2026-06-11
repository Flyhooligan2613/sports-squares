"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isAuthorizedAdminEmail } from "@/lib/auth/config";

export default function AdminAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<"loading" | "authorized" | "denied">(
    "loading"
  );

  useEffect(() => {
    if (pathname === "/admin/login") {
      setStatus("authorized");
      return;
    }

    let mounted = true;
    const supabase = createClient();

    async function evaluateSession(email: string | undefined | null) {
      if (!mounted) return;

      if (!email) {
        setStatus("denied");
        router.replace("/admin/login");
        return;
      }

      if (!isAuthorizedAdminEmail(email)) {
        await supabase.auth.signOut();
        setStatus("denied");
        router.replace("/admin/login?error=unauthorized");
        return;
      }

      setStatus("authorized");
    }

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        evaluateSession(session?.user?.email);
      })
      .catch(() => {
        if (mounted) {
          setStatus("denied");
          router.replace("/admin/login");
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      evaluateSession(session?.user?.email);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (status === "loading") {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Checking session...</p>
        </div>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <p className="text-slate-500 text-sm">Redirecting to login...</p>
      </div>
    );
  }

  return <>{children}</>;
}
