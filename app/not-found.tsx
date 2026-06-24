import Link from "next/link";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = {
  title: `Page Not Found | ${BRAND_NAME}`,
};

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-md w-full">
          <Card variant="glass" className="p-8 sm:p-10">
            <Logo href="/" variant="icon" className="justify-center mb-6" />
            <p className="text-xs uppercase tracking-[0.2em] text-sb-muted mb-2">404</p>
            <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
            <p className="text-sb-muted text-sm mb-8 leading-relaxed">
              This page may have moved or no longer exists. Head back to the contest floor or
              reach out if you need help.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button href="/" variant="primary">
                Back to home
              </Button>
              <Button href="/support" variant="secondary">
                Support Center
              </Button>
            </div>
            <p className="text-xs text-sb-muted mt-6">
              Policies and legal documents live in the{" "}
              <Link href="/trust" className="text-sb-glow hover:text-white transition-colors">
                Trust Center
              </Link>
              .
            </p>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
