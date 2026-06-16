import { redirect } from "next/navigation";

interface PageProps {
  params: { slug: string };
}

/** Legacy `/player/[slug]` URLs redirect to canonical `/profile/[username]`. */
export default function LegacyPlayerProfileRedirect({ params }: PageProps) {
  redirect(`/profile/${encodeURIComponent(params.slug)}`);
}
