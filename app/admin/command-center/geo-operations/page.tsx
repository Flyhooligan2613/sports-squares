import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { getAuthorizedAdminUser } from "@/lib/auth/adminAuth";
import {
  canAccessSection,
  resolveCommandCenterRole,
} from "@/lib/platform/engines/commandCenter";

const GeoOperationsCenter = dynamic(
  () => import("@/components/operations/geo-operations/GeoOperationsCenter"),
  {
    loading: () => (
      <div className="animate-pulse space-y-4 py-8" aria-busy="true" aria-label="Loading geo operations">
        <div className="h-8 w-64 rounded-lg bg-white/5" />
        <div className="h-48 rounded-xl bg-white/5" />
        <div className="h-96 rounded-xl bg-white/5" />
      </div>
    ),
  },
);

export const metadata: Metadata = {
  title: "Geo Operations",
};

export default async function GeoOperationsPage() {
  const admin = await getAuthorizedAdminUser();
  if (!admin) redirect("/admin/login");

  const role = resolveCommandCenterRole(admin.email);
  if (!canAccessSection(role, "geo-operations")) {
    redirect("/admin/command-center");
  }

  const showFounderInsights = role === "executive" || role === "operations";

  return (
    <GeoOperationsCenter embedded showFounderInsights={showFounderInsights} />
  );
}
