"use client";

import Link from "next/link";
import type { HuddlePlayerSummary } from "@/lib/huddle/types";
import { publicProfilePath } from "@/lib/player/slug";
import AliveEmptyState from "@/components/alive/AliveEmptyState";

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

interface FollowListModalProps {
  title: string;
  users: HuddlePlayerSummary[];
  emptyContext?: "no_followers" | "generic";
  onClose: () => void;
}

export default function FollowListModal({
  title,
  users,
  emptyContext = "generic",
  onClose,
}: FollowListModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[70vh] overflow-hidden rounded-2xl border border-white/10 bg-sb-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="font-semibold text-white">{title}</h3>
          <button
            type="button"
            className="text-sb-muted hover:text-white min-h-[44px] min-w-[44px]"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {users.length === 0 ? (
          <div className="p-4">
            <AliveEmptyState
              context={emptyContext === "no_followers" ? "no_followers" : "generic"}
              title={
                emptyContext === "no_followers"
                  ? "No followers yet"
                  : "No one here yet"
              }
              emoji="👥"
            />
          </div>
        ) : (
          <ul className="overflow-y-auto max-h-[60vh] divide-y divide-white/5" role="list">
            {users.map((user) => (
              <li key={user.email}>
                <Link
                  href={publicProfilePath(user.slug)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors min-h-[56px]"
                  onClick={onClose}
                >
                  <span className="text-2xl" aria-hidden>
                    {user.avatarEmoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white truncate">{user.username}</p>
                    <p className="text-xs text-sb-muted">
                      {user.tierName} · {formatCount(user.followerCount)} followers
                    </p>
                  </div>
                  {user.isVerified ? (
                    <span className="text-sky-400 text-xs" aria-label="Verified">
                      ✓
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
