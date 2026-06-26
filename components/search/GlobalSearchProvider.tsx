"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { filterAppActions } from "@/lib/search/appActions";
import type { AppSearchAction, GlobalSearchItem, PlayerSearchResult } from "@/lib/search/types";
import { useNavDrawerSafe } from "@/components/nav/NavDrawerProvider";

interface GlobalSearchContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const GlobalSearchContext = createContext<GlobalSearchContextValue | null>(null);

const RECENT_KEY = "sb-global-search-recent";

function loadRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? parsed.slice(0, 6) : [];
  } catch {
    return [];
  }
}

function saveRecent(href: string) {
  try {
    const prev = loadRecent().filter((item) => item !== href);
    localStorage.setItem(RECENT_KEY, JSON.stringify([href, ...prev].slice(0, 6)));
  } catch {
    /* ignore */
  }
}

import { publicProfilePath } from "@/lib/player/slug";

function playerHref(slug: string) {
  return publicProfilePath(slug);
}

function buildItems(
  actions: AppSearchAction[],
  players: PlayerSearchResult[]
): GlobalSearchItem[] {
  const items: GlobalSearchItem[] = actions.map((action) => ({
    kind: "action",
    action,
  }));
  for (const player of players) {
    items.push({ kind: "player", player });
  }
  return items;
}

function GlobalSearchModal({
  open,
  onClose,
  isSignedIn,
}: {
  open: boolean;
  onClose: () => void;
  isSignedIn: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [players, setPlayers] = useState<PlayerSearchResult[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const requestId = useRef(0);

  const localActions = useMemo(
    () => filterAppActions(query, isSignedIn, 10),
    [query, isSignedIn]
  );

  const items = useMemo(
    () => buildItems(localActions, players),
    [localActions, players]
  );

  const navigate = useCallback(
    (item: GlobalSearchItem) => {
      const href =
        item.kind === "player" ? playerHref(item.player.slug) : item.action.href;
      saveRecent(href);
      onClose();
      router.push(href);
    },
    [onClose, router]
  );

  useEffect(() => {
    if (!open) {
      setQuery("");
      setPlayers([]);
      setActiveIndex(0);
      return;
    }
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, players.length, localActions.length]);

  useEffect(() => {
    if (!open) return;

    const q = query.trim();
    if (q.length < 2) {
      setPlayers([]);
      setLoadingPlayers(false);
      return;
    }

    const id = ++requestId.current;
    setLoadingPlayers(true);
    const timer = window.setTimeout(() => {
      void fetch(`/api/search?q=${encodeURIComponent(q)}`, { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { players?: PlayerSearchResult[] } | null) => {
          if (requestId.current !== id) return;
          setPlayers(data?.players ?? []);
        })
        .catch(() => {
          if (requestId.current !== id) return;
          setPlayers([]);
        })
        .finally(() => {
          if (requestId.current === id) setLoadingPlayers(false);
        });
    }, 180);

    return () => window.clearTimeout(timer);
  }, [open, query]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((idx) => (items.length ? (idx + 1) % items.length : 0));
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((idx) =>
          items.length ? (idx - 1 + items.length) % items.length : 0
        );
        return;
      }

      if (event.key === "Enter" && items[activeIndex]) {
        event.preventDefault();
        navigate(items[activeIndex]);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, items, activeIndex, navigate, onClose]);

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-search-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!open) return null;

  const showPlayerSection = query.trim().length >= 2;
  const actionItems = items.filter((item) => item.kind === "action");
  const playerItems = items.filter((item) => item.kind === "player");

  let rowIndex = -1;

  return (
    <div className="global-search-root" role="presentation">
      <button
        type="button"
        className="global-search-backdrop"
        aria-label="Close search"
        onClick={onClose}
      />
      <div
        className="global-search-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Search players and features"
      >
        <div className="global-search-input-wrap">
          <span className="global-search-input-icon" aria-hidden>
            🔍
          </span>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find players, games, wallet, huddle…"
            className="global-search-input"
            autoComplete="off"
            spellCheck={false}
            aria-label="Search"
          />
          <kbd className="global-search-kbd">esc</kbd>
        </div>

        <div ref={listRef} className="global-search-results">
          {actionItems.length > 0 && (
            <section className="global-search-section">
              <p className="global-search-section-title">Go to</p>
              {actionItems.map((item) => {
                rowIndex += 1;
                const idx = rowIndex;
                const action = item.action;
                return (
                  <button
                    key={action.id}
                    type="button"
                    data-search-index={idx}
                    className={[
                      "global-search-row",
                      idx === activeIndex ? "global-search-row-active" : "",
                    ].join(" ")}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => navigate(item)}
                  >
                    <span className="global-search-row-icon">{action.icon}</span>
                    <span className="global-search-row-body">
                      <span className="global-search-row-label">{action.label}</span>
                      {action.subtitle ? (
                        <span className="global-search-row-sub">{action.subtitle}</span>
                      ) : null}
                    </span>
                    <span className="global-search-row-meta">{action.group}</span>
                  </button>
                );
              })}
            </section>
          )}

          {showPlayerSection && (
            <section className="global-search-section">
              <p className="global-search-section-title">
                Players
                {loadingPlayers ? " · searching…" : ""}
              </p>
              {!loadingPlayers && playerItems.length === 0 ? (
                <p className="global-search-empty">No players match that name yet.</p>
              ) : null}
              {playerItems.map((item) => {
                rowIndex += 1;
                const idx = rowIndex;
                const player = item.player;
                const handle = player.username ? `@${player.username}` : player.slug;
                return (
                  <button
                    key={player.slug}
                    type="button"
                    data-search-index={idx}
                    className={[
                      "global-search-row",
                      idx === activeIndex ? "global-search-row-active" : "",
                    ].join(" ")}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => navigate(item)}
                  >
                    <span className="global-search-row-icon global-search-avatar">
                      {player.avatarEmoji}
                    </span>
                    <span className="global-search-row-body">
                      <span className="global-search-row-label">{player.displayName}</span>
                      <span className="global-search-row-sub">{handle}</span>
                    </span>
                    <span className="global-search-row-meta">
                      {player.followerCount.toLocaleString()} followers
                    </span>
                  </button>
                );
              })}
            </section>
          )}

          {!query.trim() && (
            <p className="global-search-hint">
              Tip: type <strong>@username</strong> to find players, or try{" "}
              <strong>pickem</strong>, <strong>huddle</strong>, <strong>wallet</strong>.
            </p>
          )}
        </div>

        <div className="global-search-footer">
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> navigate
          </span>
          <span>
            <kbd>↵</kbd> open
          </span>
          <span className="hidden sm:inline">
            <kbd>⌘</kbd> <kbd>K</kbd> anytime
          </span>
        </div>
      </div>
    </div>
  );
}

export function GlobalSearchProvider({ children }: { children: ReactNode }) {
  const nav = useNavDrawerSafe();
  const [isOpen, setIsOpen] = useState(false);

  const close = useCallback(() => setIsOpen(false), []);
  const open = useCallback(() => setIsOpen(true), []);
  const toggle = useCallback(() => setIsOpen((value) => !value), []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const mod = isMac ? event.metaKey : event.ctrlKey;
      if (mod && event.key.toLowerCase() === "k") {
        event.preventDefault();
        toggle();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  const value = useMemo(
    () => ({ isOpen, open, close, toggle }),
    [isOpen, open, close, toggle]
  );

  return (
    <GlobalSearchContext.Provider value={value}>
      {children}
      <GlobalSearchModal
        open={isOpen}
        onClose={close}
        isSignedIn={Boolean(nav?.userEmail)}
      />
    </GlobalSearchContext.Provider>
  );
}

export function useGlobalSearch() {
  const context = useContext(GlobalSearchContext);
  if (!context) {
    throw new Error("useGlobalSearch must be used within GlobalSearchProvider");
  }
  return context;
}

export function useGlobalSearchSafe() {
  return useContext(GlobalSearchContext);
}
