import { NextResponse } from "next/server";
import { getAuthorizedAdminUser } from "@/lib/auth/adminAuth";
import {
  canAccessSection,
  resolveCommandCenterRole,
  type CommandCenterSectionId,
} from "@/lib/platform/engines/commandCenter";

export async function requireCommandCenterAdmin(section?: CommandCenterSectionId) {
  const admin = await getAuthorizedAdminUser();
  if (!admin) {
    return {
      error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
      admin: null,
      role: null,
    };
  }

  const role = resolveCommandCenterRole(admin.email);
  if (section && !canAccessSection(role, section)) {
    return {
      error: NextResponse.json({ error: "Forbidden for your role." }, { status: 403 }),
      admin: null,
      role: null,
    };
  }

  return { error: null, admin, role };
}
