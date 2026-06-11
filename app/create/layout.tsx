import AdminAuthGuard from "@/components/admin/AdminAuthGuard";

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminAuthGuard>{children}</AdminAuthGuard>;
}
