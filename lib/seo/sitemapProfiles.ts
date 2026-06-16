import { TABLES } from "@/lib/database/config";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

/** Public profile slugs for sitemap generation. */
export async function getPublicProfileSlugs(): Promise<string[]> {
  if (!isSupabaseAdminConfigured()) return [];

  const supabase = getSupabaseAdmin();
  const slugs: string[] = [];
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from(TABLES.playerProfiles)
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
