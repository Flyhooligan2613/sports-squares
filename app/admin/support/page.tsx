import PageHeader from "@/components/ui/PageHeader";
import AdminSupportInbox from "@/components/admin/AdminSupportInbox";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { SUPPORT_CATEGORIES } from "@/lib/platform/core/supportCategories";

export default function AdminSupportPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Support Tickets"
        subtitle="Technical assistance only — no financial overrides."
      />

      <LandingGlassCard className="p-4">
        <p className="text-xs text-sb-muted mb-2 uppercase tracking-wider">Categories</p>
        <div className="flex flex-wrap gap-2">
          {SUPPORT_CATEGORIES.map((cat) => (
            <span
              key={cat.id}
              className="text-xs px-2.5 py-1 rounded-full border border-white/10 text-white/80"
            >
              {cat.label}
            </span>
          ))}
        </div>
      </LandingGlassCard>

      <AdminSupportInbox />
    </div>
  );
}
