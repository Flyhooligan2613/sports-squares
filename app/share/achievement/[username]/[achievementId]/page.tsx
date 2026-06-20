import type { Metadata } from "next";
import { achievementSharePage } from "@/lib/seo/og/sharePages";

export const revalidate = 3600;

type Props = { params: { username: string; achievementId: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return (await achievementSharePage(params.username, params.achievementId)).metadata;
}

export default async function AchievementSharePage({ params }: Props) {
  return (await achievementSharePage(params.username, params.achievementId)).landing;
}
