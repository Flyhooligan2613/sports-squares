import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy | Sports Squares",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <div className="space-y-4 text-slate-400 text-sm leading-relaxed">
          <p>
            Sports Squares collects information you provide when creating pools,
            purchasing squares, or contacting support — including name, email,
            and phone number when supplied.
          </p>
          <p>
            Payment information is processed securely by Stripe. We do not store
            full card numbers on our servers.
          </p>
          <p>
            We use Supabase for data storage, Resend for transactional email,
            and ESPN public APIs for live score data. Each provider processes
            data according to their own privacy policies.
          </p>
          <p>
            We use cookies and local storage for authentication and session
            management. You may contact us to request deletion of your data
            where applicable.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
