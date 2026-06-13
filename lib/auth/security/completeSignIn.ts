import { normalizeEmail } from "@/lib/player/statsCore";
import {
  registerTrustedDevice,
  upsertAuthProfile,
} from "@/lib/auth/security/db";
import { detectDeviceInfo } from "@/lib/auth/security/deviceClient";
import { notifySecurityEvent } from "@/lib/auth/security/notify";
import { parseBrowserName } from "@/lib/auth/security/securityCenter";

export async function completePlayerSignIn(input: {
  email: string;
  authUserId?: string | null;
  deviceKey: string;
  userAgent: string;
  rememberMe?: boolean;
  lastLocation?: string | null;
  lastIp?: string | null;
}) {
  const email = normalizeEmail(input.email);
  const device = detectDeviceInfo(input.userAgent, input.deviceKey);
  const browserName = parseBrowserName(input.userAgent);

  await upsertAuthProfile({
    email,
    authUserId: input.authUserId ?? null,
    emailVerified: true,
    rememberMe: input.rememberMe ?? true,
  });

  const { isNew } = await registerTrustedDevice({
    email,
    deviceKey: device.deviceKey,
    deviceName: device.deviceName,
    platform: device.platform,
    userAgent: device.userAgent,
    browserName,
    lastLocation: input.lastLocation ?? null,
    lastIp: input.lastIp ?? null,
  });

  if (isNew) {
    await notifySecurityEvent({
      email,
      eventType: "new_device_login",
      metadata: {
        device: device.deviceName,
        platform: device.platform,
        browser: browserName,
        location: input.lastLocation ?? undefined,
      },
    });
  }

  return { device, isNewDevice: isNew };
}
