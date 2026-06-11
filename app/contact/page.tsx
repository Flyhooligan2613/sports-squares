import Link from "next/link";
import { Mail } from "lucide-react";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = {
  title: `Contact | ${BRAND_NAME}`,
};

export default function ContactPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16">
        <Link href="/" className="text-slate-500 hover:text-slate-300 text-sm mb-8 inline-block">
          &larr; Back to home
        </Link>
        <h1 className="text-3xl font-bold text-slate-50 mb-6">Contact</h1>
        <div className="sb-card p-6 sm:p-8">
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Questions about your pool, purchase, or invite link? Reach out and
            we&apos;ll get back to you as soon as we can.
          </p>
          <a
            href="mailto:support@squareboards.pro"
            className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium text-sm"
          >
            <Mail className="w-4 h-4" />
            support@squareboards.pro
          </a>
        </div>
      </main>
    </div>
  );
}
