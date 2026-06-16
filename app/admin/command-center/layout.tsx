import { getAuthorizedAdminUser } from "@/lib/auth/adminAuth";
import {
  navItemsForRole,
  resolveCommandCenterRole,
} from "@/lib/platform/engines/commandCenter";
import CommandCenterShell from "@/components/admin/commandCenter/CommandCenterShell";
import { redirect } from "next/navigation";

export default async function CommandCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAuthorizedAdminUser();
  if (!admin) redirect("/admin/login");

  const role = resolveCommandCenterRole(admin.email);
  const navItems = navItemsForRole(role);

  return (
    <CommandCenterShell role={role} navItems={navItems}>
      {children}
    </CommandCenterShell>
  );
}
