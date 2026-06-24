import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TrustPolicyContent from "@/components/trust/TrustPolicyContent";
import TrustSectionLayout from "@/components/trust/TrustSectionLayout";
import { BRAND_NAME } from "@/lib/brand";
import { getTrustPolicyContent } from "@/lib/trust/content";
import { TRUST_CENTER_META } from "@/lib/trust/trustCenterMeta";
import {
  getTrustSectionBySlug,
  getTrustSectionSlugs,
} from "@/lib/trust/trustCenterSections";

interface TrustSectionPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getTrustSectionSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: TrustSectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const section = getTrustSectionBySlug(slug);
  if (!section) {
    return { title: `Not Found | ${BRAND_NAME}` };
  }
  return {
    title: `${section.title} | ${TRUST_CENTER_META.title}`,
    description: section.description,
  };
}

export default async function TrustSectionPage({ params }: TrustSectionPageProps) {
  const { slug } = await params;
  const section = getTrustSectionBySlug(slug);
  const policy = getTrustPolicyContent(slug);

  if (!section || !policy) {
    notFound();
  }

  return (
    <TrustSectionLayout title={section.title} icon={section.icon}>
      <TrustPolicyContent document={policy} />
    </TrustSectionLayout>
  );
}
