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

interface PlayerShellAvatarContextValue {
  avatarEmoji: string | undefined;
  setAvatarEmoji: (emoji: string | undefined) => void;
}

const PlayerShellAvatarContext = createContext<PlayerShellAvatarContextValue | null>(null);

export function PlayerShellAvatarProvider({
  initialAvatarEmoji,
  children,
}: {
  initialAvatarEmoji?: string;
  children: ReactNode;
}) {
  const [avatarEmoji, setAvatarEmojiState] = useState<string | undefined>(initialAvatarEmoji);

  useEffect(() => {
    setAvatarEmojiState(initialAvatarEmoji);
  }, [initialAvatarEmoji]);

  const setAvatarEmoji = useCallback((emoji: string | undefined) => {
    setAvatarEmojiState(emoji);
  }, []);

  const value = useMemo(
    () => ({ avatarEmoji, setAvatarEmoji }),
    [avatarEmoji, setAvatarEmoji]
  );

  return (
    <PlayerShellAvatarContext.Provider value={value}>
      {children}
    </PlayerShellAvatarContext.Provider>
  );
}

export function usePlayerShellAvatar() {
  const ctx = useContext(PlayerShellAvatarContext);
  if (!ctx) {
    throw new Error("usePlayerShellAvatar must be used within PlayerShellAvatarProvider");
  }
  return ctx;
}

export function usePlayerShellAvatarSafe() {
  return useContext(PlayerShellAvatarContext);
}

/** Keeps header avatar in sync when a page loads richer profile data (e.g. Home). */
export function PlayerShellAvatarSync({ avatarEmoji }: { avatarEmoji?: string | null }) {
  const ctx = usePlayerShellAvatarSafe();

  useEffect(() => {
    if (!ctx || !avatarEmoji?.trim()) return;
    ctx.setAvatarEmoji(avatarEmoji.trim());
  }, [avatarEmoji, ctx]);

  return null;
}
