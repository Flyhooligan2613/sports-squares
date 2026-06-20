import type { Metadata } from "next";
import { contestSharePage } from "@/lib/seo/og/sharePages";

export const revalidate = 3600;

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return (await contestSharePage(params.id)).metadata;
}

export default async function ContestSharePage({ params }: Props) {
  return (await contestSharePage(params.id)).landing;
}
