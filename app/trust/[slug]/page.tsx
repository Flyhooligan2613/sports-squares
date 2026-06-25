import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TrustPolicyContent from "@/components/trust/TrustPolicyContent";
import TrustSectionLayout from "@/components/trust/TrustSectionLayout";
import { BRAND_NAME } from "@/lib/brand";
import { getTrustPolicyContent } from "@/lib/trust/content";
import {
  getMerchantDocumentBySlug,
  getMerchantDocumentSlugs,
} from "@/lib/trust/merchantDocuments";
import { TRUST_CENTER_META } from "@/lib/trust/trustCenterMeta";
import {
  getTrustSectionBySlug,
  getTrustSectionSlugs,
} from "@/lib/trust/trustCenterSections";

interface TrustSectionPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return [...getTrustSectionSlugs(), ...getMerchantDocumentSlugs()].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: TrustSectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const section = getTrustSectionBySlug(slug);
  const merchantSection = getMerchantDocumentBySlug(slug);
  const title = section?.title ?? merchantSection?.title;

  if (!title) {
    return { title: `Not Found | ${BRAND_NAME}` };
  }

  return {
    title: `${title} | ${TRUST_CENTER_META.title}`,
    description: section?.description ?? merchantSection?.description,
  };
}

export default async function TrustSectionPage({ params }: TrustSectionPageProps) {
  const { slug } = await params;
  const section = getTrustSectionBySlug(slug);
  const merchantSection = getMerchantDocumentBySlug(slug);
  const policy = getTrustPolicyContent(slug);
  const title = section?.title ?? merchantSection?.title;
  const lucideIcon = section?.lucideIcon ?? merchantSection?.lucideIcon;

  if (!title || !policy) {
    notFound();
  }

  return (
    <TrustSectionLayout title={title} lucideIcon={lucideIcon}>
      <TrustPolicyContent document={policy} />
    </TrustSectionLayout>
  );
}
