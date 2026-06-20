import type { Metadata } from "next";
import { storySharePage } from "@/lib/seo/og/sharePages";

export const revalidate = 3600;

type Props = { params: { username: string; storyId: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return (await storySharePage(params.username, params.storyId)).metadata;
}

export default async function StorySharePage({ params }: Props) {
  return (await storySharePage(params.username, params.storyId)).landing;
}
