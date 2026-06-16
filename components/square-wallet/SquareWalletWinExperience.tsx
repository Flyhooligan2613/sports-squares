"use client";

import { useEffect, useState } from "react";
import WinningsCelebrationModal from "./WinningsCelebrationModal";
import PostWinOptionsModal, { type PostWinOption } from "./PostWinOptionsModal";

const DEFAULT_OPTIONS: PostWinOption[] = [
  { id: "keep_competing", label: "Keep Competing", href: "/contest-center" },
  { id: "view_rewards", label: "View Rewards", href: "/my-games/rewards" },
  { id: "save_wallet", label: "Save in SquareWallet", href: "/my-games/wallet" },
  { id: "withdraw_later", label: "Withdraw Later", href: "/my-games/wallet?tab=withdraw" },
];

export default function SquareWalletWinExperience() {
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [amountCents, setAmountCents] = useState(0);
  const [contestName, setContestName] = useState("");
  const [ledgerId, setLedgerId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/square-wallet/dashboard", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return;
        const data = (await res.json()) as {
          dashboard?: { pendingWin?: { amountCents: number; contestName: string; ledgerId: string } | null };
        };
        if (data.dashboard?.pendingWin) {
          setAmountCents(data.dashboard.pendingWin.amountCents);
          setContestName(data.dashboard.pendingWin.contestName);
          setLedgerId(data.dashboard.pendingWin.ledgerId);
          setCelebrationOpen(true);
        }
      })
      .catch(() => undefined);
  }, []);

  async function dismiss() {
    if (ledgerId) {
      await fetch("/api/square-wallet/celebrate-win", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ledgerId }),
      }).catch(() => undefined);
    }
    setOptionsOpen(false);
  }

  if (!ledgerId && !celebrationOpen) return null;

  return (
    <>
      <WinningsCelebrationModal
        open={celebrationOpen}
        amountCents={amountCents}
        contestName={contestName}
        onContinue={() => {
          setCelebrationOpen(false);
          setOptionsOpen(true);
        }}
      />
      <PostWinOptionsModal
        open={optionsOpen}
        amountCents={amountCents}
        contestName={contestName}
        options={DEFAULT_OPTIONS}
        onClose={() => void dismiss()}
      />
    </>
  );
}
