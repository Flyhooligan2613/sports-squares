import { buildLiveActivityEvent } from "@/lib/liveActivity/buildEvent";
import type { LiveActivityEvent, LiveActivityInput } from "@/lib/liveActivity/types";

type Listener = () => void;

function insertByPriority(queue: LiveActivityEvent[], event: LiveActivityEvent): void {
  const idx = queue.findIndex((item) => item.priority < event.priority);
  if (idx === -1) {
    queue.push(event);
  } else {
    queue.splice(idx, 0, event);
  }
}

export class LiveActivityService {
  private queue: LiveActivityEvent[] = [];
  private personalizedPending: LiveActivityEvent[] = [];
  private lastShownId: string | null = null;
  private rotateIndex = 0;
  private listeners = new Set<Listener>();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  seed(events: LiveActivityEvent[]): void {
    for (const event of events) {
      insertByPriority(this.queue, event);
    }
    this.notify();
  }

  addLiveActivity(input: LiveActivityInput): LiveActivityEvent {
    const event = buildLiveActivityEvent(input);

    if (event.personalized) {
      this.personalizedPending.unshift(event);
    } else {
      insertByPriority(this.queue, event);
    }

    this.notify();
    return event;
  }

  ingestMany(events: LiveActivityEvent[]): void {
    for (const event of events) {
      if (this.queue.some((q) => q.id === event.id)) continue;
      insertByPriority(this.queue, event);
    }
    this.notify();
  }

  /** Returns next event without repeating the previous one when possible. */
  peekNext(): LiveActivityEvent | null {
    if (this.personalizedPending.length > 0) {
      return this.personalizedPending[0] ?? null;
    }

    if (this.queue.length === 0) return null;

    if (this.queue.length === 1) {
      return this.queue[0] ?? null;
    }

    for (let offset = 0; offset < this.queue.length; offset += 1) {
      const idx = (this.rotateIndex + offset) % this.queue.length;
      const candidate = this.queue[idx];
      if (candidate && candidate.id !== this.lastShownId) {
        return candidate;
      }
    }

    return this.queue[this.rotateIndex] ?? null;
  }

  advance(): LiveActivityEvent | null {
    const next = this.peekNext();
    if (!next) return null;

    if (this.personalizedPending[0]?.id === next.id) {
      this.personalizedPending.shift();
    } else {
      const idx = this.queue.findIndex((item) => item.id === next.id);
      if (idx >= 0) {
        this.rotateIndex = (idx + 1) % Math.max(this.queue.length, 1);
      }
    }

    this.lastShownId = next.id;
    return next;
  }

  getQueueSize(): number {
    return this.queue.length + this.personalizedPending.length;
  }
}

let singleton: LiveActivityService | null = null;

export function getLiveActivityService(): LiveActivityService {
  if (!singleton) {
    singleton = new LiveActivityService();
  }
  return singleton;
}

export function addLiveActivity(input: LiveActivityInput): LiveActivityEvent {
  return getLiveActivityService().addLiveActivity(input);
}

export function subscribeLiveActivity(listener: Listener): () => void {
  return getLiveActivityService().subscribe(listener);
}
