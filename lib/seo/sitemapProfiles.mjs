/**
 * Profile slug discovery for next-sitemap postbuild.
 * Uses Supabase REST API when service role is available; otherwise returns an empty list.
 */

export async function getPublicProfileSlugs() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !key) {
    console.warn("[sitemap] Supabase admin not configured — skipping profile URLs.");
    return [];
  }

  const slugs = [];
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const endpoint = new URL(`${url}/rest/v1/player_profiles`);
    endpoint.searchParams.set("select", "slug");
    endpoint.searchParams.set("offset", String(from));
    endpoint.searchParams.set("limit", String(pageSize));

    let response;
    try {
      response = await fetch(endpoint, {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "network error";
      console.warn("[sitemap] Could not load profile slugs:", message);
      return slugs;
    }

    if (!response.ok) {
      console.warn("[sitemap] Could not load profile slugs:", response.statusText);
      return slugs;
    }

    const data = await response.json();
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
