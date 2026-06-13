import { normalizeEmail } from "@/lib/player/statsCore";
import {
  registerTrustedDevice,
  upsertAuthProfile,
} from "@/lib/auth/security/db";
import { detectDeviceInfo } from "@/lib/auth/security/deviceClient";
import { notifySecurityEvent } from "@/lib/auth/security/notify";

export async function completePlayerSignIn(input: {
  email: string;
  authUserId?: string | null;
  deviceKey: string;
  userAgent: string;
  rememberMe?: boolean;
}) {
  const email = normalizeEmail(input.email);
  const device = detectDeviceInfo(input.userAgent, input.deviceKey);

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
  });

  if (isNew) {
    await notifySecurityEvent({
      email,
      eventType: "new_device_login",
      metadata: {
        device: device.deviceName,
        platform: device.platform,
      },
    });
  }

  return { device, isNewDevice: isNew };
}
