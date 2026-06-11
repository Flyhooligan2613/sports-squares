import Link from "next/link";
import Logo from "@/components/Logo";

export default function Navbar() {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        <Logo href="/" />
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/admin"
            className="text-sm text-slate-400 hover:text-slate-200 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Admin
          </Link>
          <Link
            href="/create"
            className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-3 sm:px-4 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            Create Pool
          </Link>
        </div>
      </div>
    </header>
  );
}
