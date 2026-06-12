import PageHeader from "@/components/ui/PageHeader";
import AnnouncementManager from "@/components/admin/AnnouncementManager";

export default function AdminAnnouncementsPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Announcement Manager"
        subtitle="Manual announcements plus automated NFL calendar communications — popups, banners, tickers, and event notices."
      />
      <AnnouncementManager />
    </div>
  );
}
