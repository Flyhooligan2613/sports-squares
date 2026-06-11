import Link from "next/link";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/80 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8">
          <div>
            <Logo href="/" className="mb-3" />
            <p className="text-slate-500 text-sm max-w-xs">
              Buy sports squares online — secure checkout, live scoring, and
              instant access to your board.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <Link
              href="/terms"
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/support"
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              Support
            </Link>
          </nav>
        </div>
        <p className="text-slate-600 text-xs mt-8 pt-6 border-t border-slate-800/80">
          &copy; {new Date().getFullYear()} Sports Squares. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
