import PageHeader from "@/components/ui/PageHeader";
import AnnouncementManager from "@/components/admin/AnnouncementManager";

export default function AdminAnnouncementsPage() {
  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        title="Announcement Studio"
        subtitle="Upload promo artwork, preview on every device, schedule campaigns, and track performance — premium announcements built into SquareBoards."
      />
      <AnnouncementManager />
    </div>
  );
}
