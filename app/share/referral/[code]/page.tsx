import type { Metadata } from "next";
import { referralSharePage } from "@/lib/seo/og/sharePages";

export const revalidate = 3600;

type Props = { params: { code: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return (await referralSharePage(params.code)).metadata;
}

export default async function ReferralSharePage({ params }: Props) {
  return (await referralSharePage(params.code)).landing;
}
