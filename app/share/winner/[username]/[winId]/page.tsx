import type { Metadata } from "next";
import { winnerSharePage } from "@/lib/seo/og/sharePages";

export const revalidate = 3600;

type Props = { params: { username: string; winId: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return (await winnerSharePage(params.username, params.winId)).metadata;
}

export default async function WinnerSharePage({ params }: Props) {
  return (await winnerSharePage(params.username, params.winId)).landing;
}
