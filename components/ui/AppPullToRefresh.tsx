"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import PullToRefresh from "@/components/ui/PullToRefresh";

export default function AppPullToRefresh({ children }: { children: ReactNode }) {
  const router = useRouter();

  async function handleRefresh(): Promise<void> {
    window.dispatchEvent(new CustomEvent("sb:pull-refresh"));
    router.refresh();
  }

  return <PullToRefresh onRefresh={handleRefresh}>{children}</PullToRefresh>;
}
