"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isAuthorizedAdminEmail } from "@/lib/auth/config";

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    function evaluate(email: string | undefined | null) {
      if (!mounted) return;
      setIsAdmin(isAuthorizedAdminEmail(email));
      setLoading(false);
    }

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        evaluate(session?.user?.email);
      })
      .catch(() => {
        if (mounted) {
          setIsAdmin(false);
          setLoading(false);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      evaluate(session?.user?.email);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { isAdmin, loading };
}
