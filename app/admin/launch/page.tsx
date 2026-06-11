import Link from "next/link";
import { AlertCircle, Check, ArrowLeft } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import PageHeader from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import Alert from "@/components/ui/Alert";
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
          className="inline-flex items-center gap-1 text-sb-muted hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>

        <PageHeader
          title="Launch Readiness"
          subtitle="Deployment checklist for production release. All items should pass before public launch."
          className="mb-6"
        />

        <Alert variant={ready ? "success" : "warning"} className="mb-8">
          {ready
            ? "All checks passed — ready for public launch."
            : "Some checks need attention before launch."}
        </Alert>

        <ul className="space-y-4">
          {checks.map((check) => (
            <li key={check.id}>
              <Card variant="glass" className="p-4 sm:p-5 flex gap-4">
                <span
                  className={[
                    "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border",
                    check.ok
                      ? "bg-sb-success/10 text-sb-success border-sb-success/25"
                      : "bg-red-500/10 text-red-400 border-red-500/25",
                  ].join(" ")}
                  aria-hidden
                >
                  {check.ok ? (
                    <Check className="w-5 h-5" strokeWidth={2.5} />
                  ) : (
                    <AlertCircle className="w-5 h-5" strokeWidth={2} />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-white font-semibold">{check.label}</p>
                  <p className="text-sb-muted text-sm mt-1 leading-relaxed">
                    {check.detail}
                  </p>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </AdminShell>
  );
}
