import Link from "next/link";
import Footer from "@/components/Footer";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = {
  title: `Support | ${BRAND_NAME}`,
};

export default function SupportPage() {
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
          Support
        </h1>
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6">
            <h2 className="text-slate-200 font-semibold mb-2">
              Pool organizers
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Sign in to the admin dashboard to manage pools, resend invite
              links, and review player payments.
            </p>
            <Link
              href="/admin"
              className="inline-block mt-4 text-sm text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Go to Admin &rarr;
            </Link>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6">
            <h2 className="text-slate-200 font-semibold mb-2">Players</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Use the invite link from your pool organizer or purchase
              confirmation to access your squares. If you completed checkout,
              your personal access link is shown on the purchase confirmation
              page.
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6">
            <h2 className="text-slate-200 font-semibold mb-2">
              Common issues
            </h2>
            <ul className="text-slate-400 text-sm space-y-2 list-disc pl-5">
              <li>Invalid invite link — contact your pool organizer for a new link.</li>
              <li>Payment completed but no email — use the access link on the confirmation page.</li>
              <li>Cannot claim squares — ensure you opened your personal invite link first.</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
