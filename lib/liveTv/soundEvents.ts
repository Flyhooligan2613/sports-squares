import type { LiveTvSoundEvent } from "@/lib/liveTv/types";

export type LiveTvEventHandler = (event: LiveTvSoundEvent, payload?: unknown) => void;

const listeners = new Set<LiveTvEventHandler>();

/** Sound-ready event bus — wire audio in one place later. */
export function subscribeLiveTvSound(handler: LiveTvEventHandler): () => void {
  listeners.add(handler);
  return () => listeners.delete(handler);
}

export function emitLiveTvSound(event: LiveTvSoundEvent, payload?: unknown): void {
  listeners.forEach((handler) => handler(event, payload));
}
