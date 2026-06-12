"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { getPlayerSessionUser } from "@/lib/auth/playerAuthClient";
import { loadReadNotificationIds } from "@/lib/notifications/readState";
import type { PlayerNotification } from "@/lib/player/dashboardTypes";

interface NavDrawerContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  userEmail: string | null;
  activeBoards: number;
  unreadMessages: number;
  unreadNotifications: number;
  refreshUserContext: () => Promise<void>;
}

const NavDrawerContext = createContext<NavDrawerContextValue | null>(null);

export function NavDrawerProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [activeBoards, setActiveBoards] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const close = useCallback(() => setIsOpen(false), []);
  const open = useCallback(() => setIsOpen(true), []);
  const toggle = useCallback(() => setIsOpen((value) => !value), []);

  const refreshUserContext = useCallback(async () => {
    const user = await getPlayerSessionUser();
    const email = user?.email?.toLowerCase() ?? null;
    setUserEmail(email);

    if (!email) {
      setActiveBoards(0);
      setUnreadMessages(0);
      setUnreadNotifications(0);
      return;
    }

    const readIds = loadReadNotificationIds(email);

    const [dashboardRes, unreadRes, notificationsRes] = await Promise.all([
      fetch("/api/player/dashboard", { cache: "no-store" }).catch(() => null),
      fetch("/api/support/unread-count", { cache: "no-store" }).catch(() => null),
      fetch("/api/notifications", { cache: "no-store" }).catch(() => null),
    ]);

    if (dashboardRes?.ok) {
      const data = (await dashboardRes.json()) as { stats?: { activeBoards?: number } };
      setActiveBoards(data.stats?.activeBoards ?? 0);
    } else {
      setActiveBoards(0);
    }

    if (unreadRes?.ok) {
      const data = (await unreadRes.json()) as { count?: number };
      setUnreadMessages(data.count ?? 0);
    } else {
      setUnreadMessages(0);
    }

    if (notificationsRes?.ok) {
      const data = (await notificationsRes.json()) as {
        notifications?: PlayerNotification[];
      };
      const items = data.notifications ?? [];
      const unread = items.filter((item) => !readIds.includes(item.id)).length;
      setUnreadNotifications(unread);
    } else {
      setUnreadNotifications(0);
    }
  }, []);

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      void refreshUserContext();
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, refreshUserContext]);

  useEffect(() => {
    void refreshUserContext();
  }, [refreshUserContext]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    if (isOpen) {
      window.addEventListener("keydown", onKeyDown);
    }
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  const value = useMemo(
    () => ({
      isOpen,
      open,
      close,
      toggle,
      userEmail,
      activeBoards,
      unreadMessages,
      unreadNotifications,
      refreshUserContext,
    }),
    [isOpen, open, close, toggle, userEmail, activeBoards, unreadMessages, unreadNotifications, refreshUserContext]
  );

  return (
    <NavDrawerContext.Provider value={value}>{children}</NavDrawerContext.Provider>
  );
}

export function useNavDrawer() {
  const context = useContext(NavDrawerContext);
  if (!context) {
    throw new Error("useNavDrawer must be used within NavDrawerProvider");
  }
  return context;
}

export function useNavDrawerSafe() {
  return useContext(NavDrawerContext);
}
