"use client";

import { useEffect, useRef } from "react";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import { useToast } from "@pte/ui";

export const useChatUsageErrorToast = (
  error: unknown,
  errorUpdatedAt: number,
  fallback: string,
): void => {
  const { showToast } = useToast();
  const lastError = useRef<unknown>(null);
  const lastErrorUpdatedAt = useRef<number | null>(null);

  useEffect(() => {
    if (!error) {
      lastError.current = null;
      lastErrorUpdatedAt.current = null;
      return;
    }
    // A render or Strict Mode effect replay must not announce the same failed request again.
    if (lastError.current === error && lastErrorUpdatedAt.current === errorUpdatedAt) return;
    lastError.current = error;
    lastErrorUpdatedAt.current = errorUpdatedAt;
    showToast(getUserFacingApiErrorMessage(error, fallback), { tone: "error" });
  }, [error, errorUpdatedAt, fallback, showToast]);
};
