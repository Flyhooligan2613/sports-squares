"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/poolFinance";
import {
  buildInviteMessage,
  buildInviteUrl,
  buildMailtoLink,
  buildSmsLink,
} from "@/lib/invites";
import type {
  InviteDeliveryStatus,
  Participant,
  PaymentStatus,
  Pool,
} from "@/lib/types";
import { poolStore } from "@/lib/poolStore";

interface PlayersManagementProps {
  pool: Pool;
  onUpdate: (pool: Pool) => void;
  disabled?: boolean;
}

type PlayerDisplayStatus = "needs-allocation" | "full" | "active";

function getPlayerDisplayStatus(
  allocatedCredits: number,
  usedCredits: number,
  remainingCredits: number
): PlayerDisplayStatus {
  if (allocatedCredits === 0 && usedCredits > 0) {
    return "needs-allocation";
  }
  if (remainingCredits === 0 && allocatedCredits > 0) {
    return "full";
  }
  if (remainingCredits > 0) {
    return "active";
  }
  return "active";
}

function formatRemainingDisplay(remainingCredits: number): string {
  return remainingCredits < 0 ? "—" : String(remainingCredits);
}

const STATUS_CONFIG: Record<
  PlayerDisplayStatus,
  { label: string; className: string }
> = {
  "needs-allocation": {
    label: "Needs Allocation",
    className: "bg-sb-gold/15 text-sb-gold border-sb-gold/30",
  },
  active: {
    label: "Active",
    className: "bg-sb-success/15 text-sb-success border-sb-success/30",
  },
  full: {
    label: "Full",
    className: "bg-white/5 text-sb-muted border-white/10",
  },
};

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const config: Record<PaymentStatus, { label: string; className: string }> = {
    paid: {
      label: "Paid",
      className: "bg-green-500/15 text-green-400 border-green-500/30",
    },
    unpaid: {
      label: "Unpaid",
      className: "bg-red-500/15 text-red-400 border-red-500/30",
    },
    partial: {
      label: "Partial",
      className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    },
  };
  const c = config[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap ${c.className}`}
    >
      {c.label}
    </span>
  );
}

function DeliveryStatusBadge({
  status,
}: {
  status: InviteDeliveryStatus;
}) {
  const config: Record<
    InviteDeliveryStatus,
    { label: string; className: string }
  > = {
    pending: {
      label: "Pending",
      className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    },
    sent: {
      label: "Sent",
      className: "bg-green-500/15 text-green-400 border-green-500/30",
    },
    failed: {
      label: "Failed",
      className: "bg-red-500/15 text-red-400 border-red-500/30",
    },
    skipped: {
      label: "Skipped",
      className: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    },
  };
  const c = config[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap ${c.className}`}
    >
      {c.label}
    </span>
  );
}

function PlayerStatusBadge({ status }: { status: PlayerDisplayStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export default function PlayersManagement({
  pool,
  onUpdate,
  disabled = false,
}: PlayersManagementProps) {
  const [newName, setNewName] = useState("");
  const [newCredits, setNewCredits] = useState("5");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCredits, setEditCredits] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [error, setError] = useState("");
  const [copiedPlayerId, setCopiedPlayerId] = useState<string | null>(null);

  async function resolveInviteUrl(
    player: Participant
  ): Promise<string | null> {
    let token = player.inviteToken;
    if (!token) {
      token = await poolStore.ensurePlayerInviteToken(pool.id, player.id);
      if (token) {
        const refreshed = await poolStore.getPool(pool.id, {
          includeSensitive: true,
        });
        if (refreshed) onUpdate(refreshed);
      }
    }
    return token ? buildInviteUrl(token) : null;
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const credits = parseInt(newCredits, 10);
    if (!newName.trim() || Number.isNaN(credits) || credits < 0) {
      setError("Enter a valid name and credit amount.");
      return;
    }

    const updated = await poolStore.createPlayer(pool.id, newName, credits, {
      email: newEmail.trim() || undefined,
      phone: newPhone.trim() || undefined,
    });
    if (!updated) {
      setError("Could not create player. Name may already exist.");
      return;
    }

    onUpdate(updated);
    setNewName("");
    setNewCredits("5");
    setNewEmail("");
    setNewPhone("");
    setError("");
  }

  async function handleSavePlayer(playerId: string) {
    const credits = parseInt(editCredits, 10);
    if (Number.isNaN(credits) || credits < 0) {
      setError("Enter a valid credit amount.");
      return;
    }

    const player = pool.participants.find((p) => p.id === playerId);
    if (player && credits < player.creditsUsed) {
      setError(`Cannot set credits below squares owned (${player.creditsUsed}).`);
      return;
    }

    const updated = await poolStore.updatePlayer(pool.id, playerId, {
      creditsPurchased: credits,
      email: editEmail.trim() || null,
      phone: editPhone.trim() || null,
    });
    if (!updated) {
      setError("Could not update player.");
      return;
    }

    onUpdate(updated);
    setEditingId(null);
    setError("");
  }

  function startEdit(player: Participant) {
    setEditingId(player.id);
    setEditCredits(String(player.creditsPurchased));
    setEditEmail(player.email ?? "");
    setEditPhone(player.phone ?? "");
    setError("");
  }

  async function handleMarkPayment(
    playerId: string,
    status: "paid" | "unpaid"
  ) {
    const updated = await poolStore.updatePlayerPayment(pool.id, playerId, status);
    if (!updated) {
      setError("Could not update payment status.");
      return;
    }
    onUpdate(updated);
    setError("");
  }

  async function handleCopyInvite(player: Participant) {
    const inviteUrl = await resolveInviteUrl(player);
    if (!inviteUrl) {
      setError("Could not generate invite link.");
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedPlayerId(player.id);
      setTimeout(() => setCopiedPlayerId(null), 2000);
      setError("");
    } catch {
      setError("Could not copy invite link to clipboard.");
    }
  }

  async function handleSendText(player: Participant) {
    if (!player.phone?.trim()) return;

    const inviteUrl = await resolveInviteUrl(player);
    if (!inviteUrl) {
      setError("Could not generate invite link.");
      return;
    }

    const body = buildInviteMessage(pool.name, inviteUrl);
    window.location.href = buildSmsLink(player.phone, body);
    setError("");
  }

  async function handleSendEmail(player: Participant) {
    if (!player.email?.trim()) return;

    try {
      const response = await fetch("/api/invite/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poolId: pool.id, playerId: player.id }),
      });

      const payload = (await response.json()) as { error?: string };

      if (response.ok) {
        const refreshed = await poolStore.getPool(pool.id, {
          includeSensitive: true,
        });
        if (refreshed) onUpdate(refreshed);
        setError("");
        return;
      }

      const inviteUrl = await resolveInviteUrl(player);
      if (!inviteUrl) {
        setError(payload.error || "Could not send invite email.");
        return;
      }

      const subject = `Your invite to ${pool.name}`;
      const body = buildInviteMessage(pool.name, inviteUrl);
      window.location.href = buildMailtoLink(player.email, subject, body);
      setError("");
    } catch {
      setError("Could not send invite email.");
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
      <div>
        <h2 className="text-slate-200 font-semibold text-sm">
          Player Allocation
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          1 credit = 1 square. Track entry fees, contact info, and send invites.
        </p>
      </div>

      {!disabled && (
        <form onSubmit={handleCreate} className="space-y-2">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <input
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setError("");
              }}
              placeholder="Player name"
              className="bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none"
            />
            <input
              type="number"
              min={0}
              value={newCredits}
              onChange={(e) => {
                setNewCredits(e.target.value);
                setError("");
              }}
              placeholder="Credits"
              className="bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none"
            />
            <input
              type="email"
              value={newEmail}
              onChange={(e) => {
                setNewEmail(e.target.value);
                setError("");
              }}
              placeholder="Email (optional)"
              className="bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none"
            />
            <input
              type="tel"
              value={newPhone}
              onChange={(e) => {
                setNewPhone(e.target.value);
                setError("");
              }}
              placeholder="Phone (optional)"
              className="bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
          >
            Create Player
          </button>
        </form>
      )}

      {error && <p className="text-red-400 text-xs">{error}</p>}

      {pool.participants.length === 0 ? (
        <p className="text-slate-600 text-sm">No players yet. Create one above.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left">
                <th className="pb-2 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  Name
                </th>
                <th className="pb-2 text-xs uppercase tracking-wider text-slate-500 font-semibold text-center">
                  Allocated
                </th>
                <th className="pb-2 text-xs uppercase tracking-wider text-slate-500 font-semibold text-center">
                  Used
                </th>
                <th className="pb-2 text-xs uppercase tracking-wider text-slate-500 font-semibold text-center">
                  Remaining
                </th>
                <th className="pb-2 text-xs uppercase tracking-wider text-slate-500 font-semibold text-center">
                  Due
                </th>
                <th className="pb-2 text-xs uppercase tracking-wider text-slate-500 font-semibold text-center">
                  Paid
                </th>
                <th className="pb-2 text-xs uppercase tracking-wider text-slate-500 font-semibold text-center">
                  Payment
                </th>
                <th className="pb-2 text-xs uppercase tracking-wider text-slate-500 font-semibold text-center">
                  Delivery
                </th>
                <th className="pb-2 text-xs uppercase tracking-wider text-slate-500 font-semibold text-center">
                  Credits
                </th>
                {!disabled && (
                  <th className="pb-2 text-xs uppercase tracking-wider text-slate-500 font-semibold text-right">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {pool.participants.map((player) => {
                const allocated = player.creditsPurchased;
                const used = player.creditsUsed;
                const remaining = player.creditsRemaining;
                const displayStatus = getPlayerDisplayStatus(
                  allocated,
                  used,
                  remaining
                );
                const displayRemaining = formatRemainingDisplay(remaining);
                const hasPhone = Boolean(player.phone?.trim());
                const hasEmail = Boolean(player.email?.trim());

                return (
                  <tr key={player.id} className="hover:bg-slate-800/30 align-top">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                          style={{ backgroundColor: player.color ?? "#6366f1" }}
                        >
                          {player.initials}
                        </span>
                        <div className="min-w-0">
                          <span className="text-slate-200 font-medium block">
                            {player.name}
                          </span>
                          {(player.email || player.phone) && (
                            <span className="text-slate-500 text-[10px] block mt-0.5">
                              {[player.email, player.phone]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-center text-slate-300 font-mono">
                      {editingId === player.id ? (
                        <input
                          type="number"
                          min={player.creditsUsed}
                          value={editCredits}
                          onChange={(e) => setEditCredits(e.target.value)}
                          className="w-16 bg-slate-800 border border-indigo-500/50 rounded px-2 py-1 text-center text-sm text-slate-200 outline-none mx-auto"
                        />
                      ) : (
                        allocated
                      )}
                    </td>
                    <td className="py-3 text-center text-slate-400 font-mono">
                      {used}
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={
                          remaining > 0
                            ? "text-green-400 font-mono font-semibold"
                            : remaining < 0
                              ? "text-slate-500 font-mono"
                              : "text-slate-500 font-mono"
                        }
                      >
                        {displayRemaining}
                      </span>
                    </td>
                    <td className="py-3 text-center text-slate-300 font-mono text-xs">
                      {formatCurrency(player.amountDue ?? 0)}
                    </td>
                    <td className="py-3 text-center text-slate-300 font-mono text-xs">
                      {formatCurrency(player.amountPaid ?? 0)}
                    </td>
                    <td className="py-3 text-center">
                      <PaymentStatusBadge
                        status={player.paymentStatus ?? "unpaid"}
                      />
                    </td>
                    <td className="py-3 text-center">
                      <DeliveryStatusBadge
                        status={player.inviteDeliveryStatus ?? "skipped"}
                      />
                      {player.inviteDeliveryError && (
                        <p
                          className="text-[10px] text-red-400 mt-1 max-w-[120px] mx-auto truncate"
                          title={player.inviteDeliveryError}
                        >
                          {player.inviteDeliveryError}
                        </p>
                      )}
                    </td>
                    <td className="py-3 text-center">
                      <PlayerStatusBadge status={displayStatus} />
                    </td>
                    {!disabled && (
                      <td className="py-3 text-right">
                        {editingId === player.id ? (
                          <div className="flex flex-col items-end gap-2 min-w-[220px]">
                            <input
                              type="email"
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              placeholder="Email (optional)"
                              className="w-full bg-slate-800 border border-indigo-500/50 rounded px-2 py-1 text-sm text-slate-200 outline-none"
                            />
                            <input
                              type="tel"
                              value={editPhone}
                              onChange={(e) => setEditPhone(e.target.value)}
                              placeholder="Phone (optional)"
                              className="w-full bg-slate-800 border border-indigo-500/50 rounded px-2 py-1 text-sm text-slate-200 outline-none"
                            />
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleSavePlayer(player.id)}
                                className="text-xs text-green-400 hover:text-green-300 px-2 py-1"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-1 flex-wrap">
                            {player.paymentStatus !== "paid" ? (
                              <button
                                type="button"
                                onClick={() => handleMarkPayment(player.id, "paid")}
                                className="text-xs text-green-400 hover:text-green-300 px-2 py-1"
                              >
                                Mark Paid
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  handleMarkPayment(player.id, "unpaid")
                                }
                                className="text-xs text-red-400 hover:text-red-300 px-2 py-1"
                              >
                                Mark Unpaid
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleCopyInvite(player)}
                              className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 whitespace-nowrap"
                            >
                              {copiedPlayerId === player.id
                                ? "Copied!"
                                : "Copy Invite Link"}
                            </button>
                            {hasPhone && (
                              <button
                                type="button"
                                onClick={() => handleSendText(player)}
                                className="text-xs text-sky-400 hover:text-sky-300 px-2 py-1 whitespace-nowrap"
                              >
                                Send Text
                              </button>
                            )}
                            {hasEmail && (
                              <button
                                type="button"
                                onClick={() => handleSendEmail(player)}
                                className="text-xs text-violet-400 hover:text-violet-300 px-2 py-1 whitespace-nowrap"
                              >
                                Send Email
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => startEdit(player)}
                              className="text-xs text-indigo-400 hover:text-indigo-300 px-2 py-1 whitespace-nowrap"
                            >
                              Edit Player
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
