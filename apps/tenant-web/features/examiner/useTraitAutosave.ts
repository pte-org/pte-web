"use client";
import { useEffect, useRef } from "react";
const AUTOSAVE_DELAY_MS = 350;
/** One attempt per changed payload; failures remain visible and can be retried using Save. */
export function useTraitAutosave(key: string | null, enabled: boolean, save?: () => void): void {
  const attempted = useRef<string | null>(null);
  const callback = useRef(save);
  useEffect(() => { callback.current = save; }, [save]);
  useEffect(() => {
    if (!enabled || !key || attempted.current === key) return;
    const timer = window.setTimeout(() => { attempted.current = key; callback.current?.(); }, AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [enabled, key]);
}
