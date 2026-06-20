import type { Metadata } from "next";
import { leaderboardSharePage } from "@/lib/seo/og/sharePages";

export const revalidate = 3600;

type Props = { params: { period: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return (await leaderboardSharePage(params.period)).metadata;
}

export default async function LeaderboardSharePage({ params }: Props) {
  return (await leaderboardSharePage(params.period)).landing;
}
