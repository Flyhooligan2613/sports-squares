/**
 * Profile slug discovery for next-sitemap postbuild.
 * Uses Supabase service role when available; otherwise returns an empty list.
 */
import { createClient } from "@supabase/supabase-js";

export async function getPublicProfileSlugs() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !key) {
    console.warn("[sitemap] Supabase admin not configured — skipping profile URLs.");
    return [];
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const slugs = [];
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("player_profiles")
      .select("slug")
      .range(from, from + pageSize - 1);

    if (error) {
      console.warn("[sitemap] Could not load profile slugs:", error.message);
      return slugs;
    }

    if (!data?.length) break;

    for (const row of data) {
      const slug = typeof row.slug === "string" ? row.slug.trim() : "";
      if (slug) slugs.push(slug);
    }

    if (data.length < pageSize) break;
    from += pageSize;
  }

  return slugs;
}
