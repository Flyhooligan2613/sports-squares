import type { Metadata } from "next";
import { levelUpSharePage } from "@/lib/seo/og/sharePages";

export const revalidate = 3600;

type Props = { params: { username: string; tierSlug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return (await levelUpSharePage(params.username, params.tierSlug)).metadata;
}

export default async function LevelUpSharePage({ params }: Props) {
  return (await levelUpSharePage(params.username, params.tierSlug)).landing;
}
