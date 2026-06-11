"use client";

import { useMemo } from "react";
import {
  formatRecordedAt,
  formatWinnerScore,
  getNewestWinnerPeriod,
  hasPayoutData,
} from "@/lib/winnerHistoryUtils";
import type {
  PayoutStatus,
  ScoringPeriod,
  WinnerHistory,
  WinnerResult,
} from "@/lib/types";

interface WinnerHistorySectionProps {
  winnerHistory: WinnerHistory;
  scoringPeriods: ScoringPeriod[];
  awayTeam: string;
  homeTeam: string;
  activeQuarter?: ScoringPeriod;
  onSelectQuarter?: (quarter: ScoringPeriod) => void;
  showPayouts?: boolean;
  financialsEnabled?: boolean;
  adminMode?: boolean;
  onMarkPayoutStatus?: (
    quarter: ScoringPeriod,
    status: PayoutStatus
  ) => void;
}

export default function WinnerHistorySection({
  winnerHistory,
  scoringPeriods,
  awayTeam,
  homeTeam,
  activeQuarter,
  onSelectQuarter,
  showPayouts,
  financialsEnabled = false,
  adminMode = false,
  onMarkPayoutStatus,
}: WinnerHistorySectionProps) {
  const newestPeriod = useMemo(
    () => getNewestWinnerPeriod(winnerHistory, scoringPeriods),
    [winnerHistory, scoringPeriods]
  );

  const displayPayouts =
    showPayouts ?? financialsEnabled ?? hasPayoutData(winnerHistory);
  const pendingColSpan = displayPayouts ? 7 : 5;

  if (!scoringPeriods.length) return null;

  return (
    <section className="mt-8 space-y-4" aria-label="Winner history">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-bold text-slate-100">Winner History</h2>
        {newestPeriod && winnerHistory[newestPeriod] && (
          <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-400/90 bg-amber-500/10 border border-amber-500/25 rounded-full px-2.5 py-1">
            Latest: {newestPeriod}
          </span>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80">
              <Th>Quarter</Th>
              <Th>Score</Th>
              <Th>Winning Digits</Th>
              <Th>Square</Th>
              <Th>Winner</Th>
              {displayPayouts && <Th>Payout</Th>}
              {displayPayouts && <Th>Payout Status</Th>}
              <Th>Recorded</Th>
            </tr>
          </thead>
          <tbody>
            {scoringPeriods.map((period) => (
              <HistoryRow
                key={period}
                period={period}
                winner={winnerHistory[period]}
                awayTeam={awayTeam}
                homeTeam={homeTeam}
                isNewest={period === newestPeriod}
                isActive={period === activeQuarter}
                onSelect={onSelectQuarter}
                displayPayouts={displayPayouts}
                adminMode={adminMode}
                onMarkPayoutStatus={onMarkPayoutStatus}
                colSpan={pendingColSpan}
                variant="table"
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {scoringPeriods.map((period) => (
          <HistoryRow
            key={period}
            period={period}
            winner={winnerHistory[period]}
            awayTeam={awayTeam}
            homeTeam={homeTeam}
            isNewest={period === newestPeriod}
            isActive={period === activeQuarter}
            onSelect={onSelectQuarter}
            displayPayouts={displayPayouts}
            adminMode={adminMode}
            onMarkPayoutStatus={onMarkPayoutStatus}
            variant="card"
          />
        ))}
      </div>

      {displayPayouts && (
        <PayoutSummary
          winnerHistory={winnerHistory}
          scoringPeriods={scoringPeriods}
        />
      )}
    </section>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left text-[10px] uppercase tracking-wider font-semibold text-slate-500 px-4 py-3">
      {children}
    </th>
  );
}

function HistoryRow({
  period,
  winner,
  awayTeam,
  homeTeam,
  isNewest,
  isActive,
  onSelect,
  displayPayouts,
  adminMode,
  onMarkPayoutStatus,
  colSpan = 5,
  variant,
}: {
  period: ScoringPeriod;
  winner?: WinnerResult;
  awayTeam: string;
  homeTeam: string;
  isNewest: boolean;
  isActive?: boolean;
  onSelect?: (q: ScoringPeriod) => void;
  displayPayouts: boolean;
  adminMode?: boolean;
  onMarkPayoutStatus?: (
    quarter: ScoringPeriod,
    status: PayoutStatus
  ) => void;
  colSpan?: number;
  variant: "table" | "card";
}) {
  const pending = !winner;
  const recorded = formatRecordedAt(winner?.recordedAt);
  const clickable = Boolean(onSelect && winner);

  const rowClasses = [
    isNewest && !pending
      ? "bg-amber-500/10 ring-1 ring-inset ring-amber-500/30"
      : "",
    isActive && !pending ? "bg-indigo-500/5" : "",
    clickable ? "cursor-pointer hover:bg-slate-800/60" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const content = pending ? (
    <PendingContent period={period} variant={variant} colSpan={colSpan} />
  ) : (
    <WinnerContent
      period={period}
      winner={winner!}
      awayTeam={awayTeam}
      homeTeam={homeTeam}
      recorded={recorded}
      displayPayouts={displayPayouts}
      adminMode={adminMode}
      onMarkPayoutStatus={onMarkPayoutStatus}
      variant={variant}
      isNewest={isNewest}
    />
  );

  if (variant === "table") {
    return (
      <tr
        className={`border-b border-slate-800/80 last:border-0 transition-colors ${rowClasses}`}
        onClick={clickable ? () => onSelect!(period) : undefined}
      >
        {content}
      </tr>
    );
  }

  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-900 p-4 transition-colors ${rowClasses}`}
      onClick={clickable ? () => onSelect!(period) : undefined}
      role={clickable ? "button" : undefined}
    >
      {content}
    </div>
  );
}

function PendingContent({
  period,
  variant,
  colSpan,
}: {
  period: ScoringPeriod;
  variant: "table" | "card";
  colSpan: number;
}) {
  if (variant === "table") {
    return (
      <>
        <Td>
          <PeriodBadge period={period} pending />
        </Td>
        <Td muted colSpan={colSpan} pendingLabel />
      </>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <PeriodBadge period={period} pending />
      <span className="text-sm text-slate-500 italic">Pending</span>
    </div>
  );
}

function WinnerContent({
  period,
  winner,
  awayTeam,
  homeTeam,
  recorded,
  displayPayouts,
  adminMode,
  onMarkPayoutStatus,
  variant,
  isNewest,
}: {
  period: ScoringPeriod;
  winner: WinnerResult;
  awayTeam: string;
  homeTeam: string;
  recorded: string | null;
  displayPayouts: boolean;
  adminMode?: boolean;
  onMarkPayoutStatus?: (
    quarter: ScoringPeriod,
    status: PayoutStatus
  ) => void;
  variant: "table" | "card";
  isNewest: boolean;
}) {
  const score = formatWinnerScore(
    awayTeam,
    homeTeam,
    winner.awayScore,
    winner.homeScore
  );
  const digits = `${winner.awayDigit}-${winner.homeDigit}`;

  if (variant === "table") {
    return (
      <>
        <Td>
          <PeriodBadge period={period} isNewest={isNewest} />
        </Td>
        <Td mono>{score}</Td>
        <Td mono>{digits}</Td>
        <Td mono>#{winner.squareId}</Td>
        <Td>
          <WinnerIdentity winner={winner} />
        </Td>
        {displayPayouts && (
          <Td mono>{formatPayout(winner.payoutAmount)}</Td>
        )}
        {displayPayouts && (
          <Td>
            <PayoutStatusBadge
              status={winner.payoutStatus ?? "pending"}
              adminMode={adminMode}
              onMarkPaid={
                onMarkPayoutStatus
                  ? () => onMarkPayoutStatus(period, "paid")
                  : undefined
              }
              onMarkPending={
                onMarkPayoutStatus
                  ? () => onMarkPayoutStatus(period, "pending")
                  : undefined
              }
            />
          </Td>
        )}
        <Td muted>{recorded ?? "—"}</Td>
      </>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <PeriodBadge period={period} isNewest={isNewest} />
        {recorded && (
          <span className="text-[10px] text-slate-500">{recorded}</span>
        )}
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <MobileField label="Score" value={score} mono />
        <MobileField label="Digits" value={digits} mono />
        <MobileField label="Square" value={`#${winner.squareId}`} mono />
        {displayPayouts && (
          <MobileField
            label="Payout"
            value={formatPayout(winner.payoutAmount)}
            mono
          />
        )}
        {displayPayouts && (
          <div className="col-span-2">
            <dt className="text-slate-500 text-[10px] uppercase tracking-wider">
              Payout Status
            </dt>
            <dd className="mt-1">
              <PayoutStatusBadge
                status={winner.payoutStatus ?? "pending"}
                adminMode={adminMode}
                onMarkPaid={
                  onMarkPayoutStatus
                    ? () => onMarkPayoutStatus(period, "paid")
                    : undefined
                }
                onMarkPending={
                  onMarkPayoutStatus
                    ? () => onMarkPayoutStatus(period, "pending")
                    : undefined
                }
              />
            </dd>
          </div>
        )}
        <div className="col-span-2">
          <dt className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">
            Winner
          </dt>
          <dd>
            <WinnerIdentity winner={winner} />
          </dd>
        </div>
      </dl>
    </div>
  );
}

function Td({
  children,
  mono,
  muted,
  colSpan,
  pendingLabel,
}: {
  children?: React.ReactNode;
  mono?: boolean;
  muted?: boolean;
  colSpan?: number;
  pendingLabel?: boolean;
}) {
  if (pendingLabel) {
    return (
      <td
        colSpan={colSpan}
        className="px-4 py-3.5 text-sm text-slate-500 italic"
      >
        Pending
      </td>
    );
  }

  return (
    <td
      colSpan={colSpan}
      className={`px-4 py-3.5 ${mono ? "font-mono text-slate-200" : "text-slate-200"} ${muted ? "text-slate-500 text-xs" : ""}`}
    >
      {children}
    </td>
  );
}

function MobileField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-slate-500 text-[10px] uppercase tracking-wider">
        {label}
      </dt>
      <dd
        className={`mt-0.5 font-medium text-slate-200 ${mono ? "font-mono" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

function PeriodBadge({
  period,
  pending,
  isNewest,
}: {
  period: ScoringPeriod;
  pending?: boolean;
  isNewest?: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 rounded-lg text-xs font-bold",
        pending
          ? "bg-slate-800 text-slate-500"
          : isNewest
            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
            : "bg-slate-800 text-slate-300",
      ].join(" ")}
    >
      {period}
    </span>
  );
}

function WinnerIdentity({ winner }: { winner: WinnerResult }) {
  const initials = winner.ownerInitials ?? winner.ownerName.slice(0, 2).toUpperCase();
  const color = winner.ownerColor ?? "#6366f1";

  return (
    <div className="flex items-center gap-2 min-w-0">
      <span
        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
        style={{ backgroundColor: color }}
        aria-hidden
      >
        {initials}
      </span>
      <span className="truncate font-medium">{winner.ownerName}</span>
    </div>
  );
}

function PayoutStatusBadge({
  status,
  adminMode,
  onMarkPaid,
  onMarkPending,
}: {
  status: PayoutStatus;
  adminMode?: boolean;
  onMarkPaid?: () => void;
  onMarkPending?: () => void;
}) {
  const styles: Record<PayoutStatus, string> = {
    pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    paid: "bg-green-500/15 text-green-400 border-green-500/30",
    unpaid: "bg-red-500/15 text-red-400 border-red-500/30",
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span
        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${styles[status]}`}
      >
        {status}
      </span>
      {adminMode && onMarkPaid && status !== "paid" && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMarkPaid();
          }}
          className="text-[10px] text-green-400 hover:text-green-300"
        >
          Mark Paid
        </button>
      )}
      {adminMode && onMarkPending && status === "paid" && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMarkPending();
          }}
          className="text-[10px] text-amber-400 hover:text-amber-300"
        >
          Reset
        </button>
      )}
    </div>
  );
}

function formatPayout(amount?: number | null): string {
  if (amount == null || amount <= 0) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function PayoutSummary({
  winnerHistory,
  scoringPeriods,
}: {
  winnerHistory: WinnerHistory;
  scoringPeriods: ScoringPeriod[];
}) {
  const rows = scoringPeriods
    .map((period) => {
      const winner = winnerHistory[period];
      if (!winner?.payoutAmount) return null;
      return { period, winner };
    })
    .filter(Boolean) as { period: ScoringPeriod; winner: WinnerResult }[];

  if (rows.length === 0) return null;

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
      <h3 className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-3">
        Payout Summary
      </h3>
      <ul className="space-y-2">
        {rows.map(({ period, winner }) => (
          <li
            key={period}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="text-slate-400 font-medium w-12">{period}</span>
            <span className="text-slate-200 truncate flex-1">
              {winner.ownerName}
            </span>
            <div className="text-right shrink-0">
              <span className="font-mono text-amber-300 block">
                {formatPayout(winner.payoutAmount)}
              </span>
              <span className="text-[10px] text-slate-500 capitalize">
                {winner.payoutStatus ?? "pending"}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
