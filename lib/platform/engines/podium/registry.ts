import type {
  PodiumContestAdapter,
  PodiumContestKind,
} from "@/lib/platform/engines/podium/types";

const adapterRegistry = new Map<PodiumContestKind, PodiumContestAdapter>();

export function registerPodiumAdapter(adapter: PodiumContestAdapter): void {
  adapterRegistry.set(adapter.kind, adapter);
}

export function getPodiumAdapter(kind: PodiumContestKind): PodiumContestAdapter {
  const adapter = adapterRegistry.get(kind);
  if (!adapter) {
    throw new Error(
      `PodiumEngine™: no adapter registered for contest kind "${kind}". Register via registerPodiumAdapter().`
    );
  }
  return adapter;
}

export function listPodiumAdapters(): PodiumContestKind[] {
  return Array.from(adapterRegistry.keys());
}
