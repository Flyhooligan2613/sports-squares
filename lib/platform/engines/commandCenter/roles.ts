import {
  DEFAULT_COMMAND_CENTER_ROLE,
  parseCommandCenterRoleMap,
} from "./config";
import type { CommandCenterRole } from "./types";

const roleMap = parseCommandCenterRoleMap();

export function resolveCommandCenterRole(
  email: string | undefined | null
): CommandCenterRole {
  if (!email) return DEFAULT_COMMAND_CENTER_ROLE;
  return roleMap[email.toLowerCase().trim()] ?? DEFAULT_COMMAND_CENTER_ROLE;
}

export function formatCommandCenterRole(role: CommandCenterRole): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}
