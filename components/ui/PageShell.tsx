import Link from "next/link";
import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";

interface PageShellProps {
  children: ReactNode;
  title: string;
  showLogo?: boolean;
  showFooter?: boolean;
  hideTitle?: boolean;
  maxWidth?: "md" | "lg" | "xl";
}

const WIDTHS = {
  md: "max-w-3xl",
  lg: "max-w-4xl",
  xl: "max-w-5xl",
};

export default function PageShell({
  children,
  title,
  showLogo = true,
  showFooter = true,
  hideTitle = false,
  maxWidth = "md",
}: PageShellProps) {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      <main
        className={`flex-1 ${WIDTHS[maxWidth]} mx-auto w-full px-4 sm:px-6 py-12 sm:py-16 sb-page-enter`}
      >
        {showLogo && <Logo href="/" className="mb-8" />}
        {hideTitle ? null : (
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-8">
            {title}
          </h1>
        )}
        <div className={hideTitle ? "" : "sb-prose"}>{children}</div>
        <Link
          href="/"
          className="inline-flex items-center gap-1 mt-10 text-sb-glow hover:text-white text-sm font-medium transition-colors"
        >
          ← Back to home
        </Link>
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
