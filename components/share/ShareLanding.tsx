import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";
import { OG_BRAND } from "@/lib/seo/og/design";

type ShareLandingProps = {
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export default function ShareLanding({
  title,
  description,
  ctaHref = "/home",
  ctaLabel = "Open SquareBoards",
}: ShareLandingProps) {
  return (
    <main className="min-h-screen bg-sb-bg text-white flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-lg w-full text-center space-y-6">
        <p className="text-sm uppercase tracking-[0.2em] text-sb-glow font-semibold">{BRAND_NAME}</p>
        <h1 className="text-3xl sm:text-4xl font-bold">{title}</h1>
        <p className="text-white/70 text-lg">{description}</p>
        <p className="text-white/45 text-sm">{OG_BRAND.tagline}</p>
        <Link
          href={ctaHref}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-sb-purple to-sb-glow px-8 py-3.5 font-semibold text-white shadow-lg shadow-sb-purple/30"
        >
          {ctaLabel}
        </Link>
      </div>
    </main>
  );
}
