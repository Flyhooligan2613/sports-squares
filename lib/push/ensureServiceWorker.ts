const SW_URL = "/sw.js";
const DEFAULT_TIMEOUT_MS = 12_000;

function timeoutPromise<T>(ms: number, message: string): Promise<T> {
  return new Promise((_, reject) => {
    window.setTimeout(() => reject(new Error(message)), ms);
  });
}

/**
 * Ensures the push service worker is registered and active.
 * `navigator.serviceWorker.ready` alone can hang forever if registration never succeeded.
 */
export async function ensurePushServiceWorker(
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<ServiceWorkerRegistration> {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service workers are not supported on this device.");
  }

  let registration = await navigator.serviceWorker.getRegistration("/");

  if (!registration) {
    registration = await Promise.race([
      navigator.serviceWorker.register(SW_URL, { scope: "/" }),
      timeoutPromise<ServiceWorkerRegistration>(
        timeoutMs,
        "Could not register notifications service. Try refreshing the page."
      ),
    ]);
  }

  if (registration.active) {
    return registration;
  }

  const readyRegistration = await Promise.race([
    navigator.serviceWorker.ready,
    timeoutPromise<ServiceWorkerRegistration>(
      timeoutMs,
      "Notifications service is taking too long to start. Refresh and try again."
    ),
  ]);

  return readyRegistration;
}
