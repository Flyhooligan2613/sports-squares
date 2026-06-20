import type { Metadata } from "next";
import { seasonSharePage } from "@/lib/seo/og/sharePages";

export const revalidate = 3600;

type Props = { params: { username: string; seasonKey: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return (await seasonSharePage(params.username, params.seasonKey)).metadata;
}

export default async function SeasonSharePage({ params }: Props) {
  return (await seasonSharePage(params.username, params.seasonKey)).landing;
}
