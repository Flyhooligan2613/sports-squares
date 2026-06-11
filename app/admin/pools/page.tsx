"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, ExternalLink, Pencil, Trophy } from "lucide-react";
import PoolStatusBadge from "@/components/PoolStatusBadge";
import ActivityCard, {
  ActivityCardButton,
} from "@/components/ui/ActivityCard";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { poolStore } from "@/lib/poolStore";
import { BRAND_NAME } from "@/lib/brand";
import type { Pool } from "@/lib/types";

export default function AdminPoolsPage() {
  const router = useRouter();
  const [pools, setPools] = useState<Pool[]>([]);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const loadPools = useCallback(() => {
    poolStore.listPools().then(setPools);
  }, []);

  useEffect(() => {
    loadPools();
  }, [loadPools]);

  async function handleDuplicate(poolId: string) {
    setDuplicatingId(poolId);
    const duplicated = await poolStore.duplicatePool(poolId);
    setDuplicatingId(null);

    if (duplicated) {
      router.push(`/admin/pool/${duplicated.id}`);
      return;
    }

    loadPools();
  }

  return (
    <div className="max-w-5xl space-y-8">
      <PageHeader
        title="Pools"
        subtitle={`Manage all ${BRAND_NAME} pools.`}
        action={
          <Button href="/create" variant="primary" size="sm">
            Create Pool
          </Button>
        }
      />

      {pools.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No pools found"
          description="Create a pool to start selling squares and managing players."
          actionLabel="Create Pool"
          actionHref="/create"
        />
      ) : (
        <div className="space-y-4">
          {pools.map((pool) => (
            <ActivityCard
              key={pool.id}
              title={pool.name}
              subtitle={`${pool.awayTeam} vs ${pool.homeTeam}`}
              badge={<PoolStatusBadge status={pool.status} />}
              meta={
                <p className="text-sb-muted text-xs">
                  {pool.participants.length} players · Code{" "}
                  <span className="font-mono text-sb-secondary">
                    {pool.inviteCode}
                  </span>
                </p>
              }
              actions={
                <>
                  <ActivityCardButton href={`/pool/${pool.id}`}>
                    <span className="inline-flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      View
                    </span>
                  </ActivityCardButton>
                  <ActivityCardButton
                    href={`/admin/pool/${pool.id}`}
                    variant="primary"
                  >
                    <span className="inline-flex items-center gap-1">
                      <Pencil className="w-3 h-3" />
                      Edit
                    </span>
                  </ActivityCardButton>
                  <ActivityCardButton
                    onClick={() => handleDuplicate(pool.id)}
                    disabled={duplicatingId === pool.id}
                  >
                    <span className="inline-flex items-center gap-1">
                      <Copy className="w-3 h-3" />
                      {duplicatingId === pool.id ? "Copying..." : "Duplicate"}
                    </span>
                  </ActivityCardButton>
                </>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
