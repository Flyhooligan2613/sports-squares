import Link from "next/link";
import Footer from "@/components/Footer";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = {
  title: `Terms of Service | ${BRAND_NAME}`,
};

export default function TermsPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14">
        <Link
          href="/"
          className="text-slate-500 hover:text-slate-300 text-sm mb-8 inline-block"
        >
          &larr; Back to home
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-6">
          Terms of Service
        </h1>
        <div className="prose prose-invert prose-sm max-w-none space-y-4 text-slate-400 leading-relaxed">
          <p>
            {BRAND_NAME} provides online tools to create and manage sports
            squares pools. By using this service, you agree to use it in
            compliance with applicable laws and regulations in your jurisdiction.
          </p>
          <p>
            Pool organizers are responsible for pool rules, payouts, and
            participant communications. {BRAND_NAME} facilitates pool
            management and payment processing but does not guarantee game
            outcomes or financial settlements between participants.
          </p>
          <p>
            You must not use the platform for unlawful gambling where prohibited.
            You are responsible for ensuring your pools comply with local rules.
          </p>
          <p>
            We may update these terms. Continued use of the service constitutes
            acceptance of updated terms.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
