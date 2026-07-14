"use client";

import { useCallback, useEffect, useState } from "react";
import { tokenStorage } from "./tokenStorage";

export interface TokenManager {
  token: string | null;
  /** False until the mount effect has read storage — guards against redirecting
   *  authenticated users before hydration. */
  isReady: boolean;
  saveToken: (token: string) => void;
  clearToken: () => void;
}

/**
 * React binding over {@link tokenStorage}. Starts as `null` on both server and
 * first client render (avoiding a hydration mismatch), then hydrates from
 * localStorage in an effect.
 */
export function useTokenManager(): TokenManager {
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setToken(tokenStorage.retrieve());
    setIsReady(true);
  }, []);

  const saveToken = useCallback((next: string) => {
    tokenStorage.save(next);
    setToken(next);
  }, []);

  const clearToken = useCallback(() => {
    tokenStorage.clear();
    setToken(null);
  }, []);

  return { token, isReady, saveToken, clearToken };
}
