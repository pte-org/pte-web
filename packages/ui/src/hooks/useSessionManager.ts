"use client";

import { useCallback, useEffect, useState } from "react";
import {
  sessionStorage,
  type AptisSession,
  type SessionRole,
} from "./sessionStorage";

export interface SessionManager {
  session: AptisSession | null;
  isReady: boolean;
  saveSession: (session: AptisSession) => void;
  clearSession: () => void;
  hasRole: (role: SessionRole | SessionRole[]) => boolean;
}

export function useSessionManager(): SessionManager {
  const [session, setSession] = useState<AptisSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setSession(sessionStorage.retrieve());
    setIsReady(true);
  }, []);

  const saveSession = useCallback((next: AptisSession) => {
    sessionStorage.save(next);
    setSession(next);
  }, []);

  const clearSession = useCallback(() => {
    sessionStorage.clear();
    setSession(null);
  }, []);

  const hasRole = useCallback(
    (role: SessionRole | SessionRole[]) => {
      if (!session) return false;
      return Array.isArray(role)
        ? role.includes(session.role)
        : session.role === role;
    },
    [session],
  );

  return { session, isReady, saveSession, clearSession, hasRole };
}
