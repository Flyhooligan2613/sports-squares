"use client";

import { usePathname } from "next/navigation";
import AdminAuthGuard from "./AdminAuthGuard";
import AdminShell from "./AdminShell";

export default function AdminAuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const isCommandCenter = pathname.startsWith("/admin/command-center");

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <AdminAuthGuard>
      {isCommandCenter ? children : <AdminShell>{children}</AdminShell>}
    </AdminAuthGuard>
  );
}
