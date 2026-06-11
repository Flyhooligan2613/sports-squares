import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import {
  getLaunchReadinessChecks,
  isLaunchReady,
} from "@/lib/launch/status";

export const dynamic = "force-dynamic";

export default function LaunchReadinessPage() {
  const checks = getLaunchReadinessChecks();
  const ready = isLaunchReady();

  return (
    <AdminShell>
      <div className="max-w-2xl">
        <Link
          href="/admin"
          className="text-slate-500 hover:text-slate-300 text-xs mb-4 inline-block"
        >
          &larr; Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-100 mb-2">
          Launch Readiness
        </h1>
        <p className="text-slate-500 text-sm mb-8">
          Deployment checklist for production release. All items should show
          green before public launch.
        </p>

        <div
          className={[
            "rounded-xl border px-4 py-3 mb-8 text-sm font-medium",
            ready
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-amber-500/10 border-amber-500/30 text-amber-300",
          ].join(" ")}
        >
          {ready
            ? "All checks passed — ready for public launch."
            : "Some checks need attention before launch."}
        </div>

        <ul className="space-y-3">
          {checks.map((check) => (
            <li
              key={check.id}
              className="flex gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5"
            >
              <span
                className={[
                  "shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                  check.ok
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "bg-red-500/10 text-red-400 border border-red-500/30",
                ].join(" ")}
                aria-hidden
              >
                {check.ok ? "✓" : "!"}
              </span>
              <div className="min-w-0">
                <p className="text-slate-100 font-semibold">{check.label}</p>
                <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                  {check.detail}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </AdminShell>
  );
}
