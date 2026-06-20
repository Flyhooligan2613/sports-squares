import { BRAND_NAME } from "@/lib/brand";
import { SITE_DESCRIPTION, SITE_TAGLINE, SITE_URL } from "@/lib/seo/site";

export default function SiteJsonLd() {
  const payload = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: BRAND_NAME,
    applicationCategory: "GameApplication",
    operatingSystem: "Web, iOS, Android",
    url: SITE_URL,
    description: `${SITE_DESCRIPTION}. ${SITE_TAGLINE}`,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
