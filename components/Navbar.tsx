import Link from "next/link";
import Logo from "@/components/Logo";

export default function Navbar() {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        <Logo href="/" />
        <Link
          href="/admin/login"
          className="text-sm text-slate-400 hover:text-slate-200 px-3 py-2 min-h-[44px] inline-flex items-center rounded-lg hover:bg-slate-800/80 transition-colors"
        >
          Host Login
        </Link>
      </div>
    </header>
  );
}
