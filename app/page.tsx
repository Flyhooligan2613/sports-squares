import Link from "next/link";
import PoolList from "@/components/PoolList";

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)]">
      <section className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-16 pb-12 flex flex-col items-center text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-100 leading-tight mb-4">
          Sports squares,{" "}
          <span className="text-indigo-400">simplified.</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-md mb-10">
          Create a pool, share the invite code, and let everyone claim their
          squares &mdash; no spreadsheets needed.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/admin"
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
          >
            Create a Pool
          </Link>
          <Link
            href="/pool/demo-pool"
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold transition-colors"
          >
            View Demo Pool
          </Link>
        </div>
      </section>

      <PoolList />
    </main>
  );
}
