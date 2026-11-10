"use client";

import { useEffect, useRef } from "react";
import { useToast, type ToastTone } from "@pte/ui";

/** Notify once per continuous failure, including background polling retries. */
export function useFeedbackToast(message: string | null, tone: ToastTone = "error"): void {
  const { showToast } = useToast();
  const notified = useRef<string | null>(null);

  useEffect(() => {
    if (message && notified.current !== message) showToast(message, { tone });
    notified.current = message;
  }, [message, showToast, tone]);
}
