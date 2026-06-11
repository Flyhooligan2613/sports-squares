import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata = {
  title: "Offline | Sports Squares",
};

export default function OfflinePage() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-sm">
        <Logo href="/" variant="icon" className="justify-center mb-6" />
        <h1 className="text-xl font-bold text-slate-100 mb-2">You&apos;re offline</h1>
        <p className="text-slate-500 text-sm mb-6">
          Sports Squares needs a connection for live scores and checkout. Reconnect
          and try again.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
        >
          Retry
        </Link>
      </div>
    </main>
  );
}
