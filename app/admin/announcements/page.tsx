import PageHeader from "@/components/ui/PageHeader";
import AnnouncementManager from "@/components/admin/AnnouncementManager";

export default function AdminAnnouncementsPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Announcement Manager"
        subtitle="Platform communications — welcome popups, banners, tickers, and event notices. Not advertising."
      />
      <AnnouncementManager />
    </div>
  );
}
