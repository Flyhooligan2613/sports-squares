import type { Metadata } from "next";
import { trophySharePage } from "@/lib/seo/og/sharePages";

export const revalidate = 3600;

type Props = { params: { username: string; trophyId: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return (await trophySharePage(params.username, params.trophyId)).metadata;
}

export default async function TrophySharePage({ params }: Props) {
  return (await trophySharePage(params.username, params.trophyId)).landing;
}
