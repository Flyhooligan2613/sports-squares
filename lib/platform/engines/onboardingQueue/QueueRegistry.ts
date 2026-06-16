import type { OnboardingModule, OnboardingModuleId } from "./types";

class QueueRegistryImpl {
  private modules = new Map<OnboardingModuleId, OnboardingModule>();

  add(module: OnboardingModule): void {
    this.modules.set(module.id, module);
  }

  get(id: OnboardingModuleId): OnboardingModule | undefined {
    return this.modules.get(id);
  }

  list(): OnboardingModule[] {
    return Array.from(this.modules.values()).sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.priority - b.priority;
    });
  }

  clear(): void {
    this.modules.clear();
  }
}

export const QueueRegistry = new QueueRegistryImpl();

/** Fluent registration — `Queue.add(module)`. */
export const Queue = QueueRegistry;
