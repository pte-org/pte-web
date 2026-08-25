"use client";

import { useCallback, useEffect, useState } from "react";
import {
  sessionStorage,
  type PteSession,
  type SessionRole,
} from "./sessionStorage";

export interface SessionManager {
  session: PteSession | null;
  isReady: boolean;
  saveSession: (session: PteSession) => void;
  clearSession: () => void;
  hasRole: (role: SessionRole | SessionRole[]) => boolean;
}

export function useSessionManager(): SessionManager {
  const [session, setSession] = useState<PteSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setSession(sessionStorage.retrieve());
    setIsReady(true);
  }, []);

  const saveSession = useCallback((next: PteSession) => {
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
      const wanted = Array.isArray(role) ? role : [role];
      return session.roles.some((sessionRole) => wanted.includes(sessionRole));
    },
    [session],
  );

  return { session, isReady, saveSession, clearSession, hasRole };
}
