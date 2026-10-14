"use client";

import { useEffect, useRef } from "react";
import { useLocale, useToast } from "@pte/ui";
import { EXAM_EDITOR_TEXT } from "../constants";
import type { ExamSession } from "../types";

const WARNING_WINDOW_MS = 10 * 60 * 1000;

export const useExamEditTimingWarning = (session: ExamSession): void => {
  const { t } = useLocale();
  const { showToast } = useToast();
  const warned = useRef(false);

  useEffect(() => {
    if (session.status !== "SCHEDULED") return;
    const check = (): void => {
      const remaining = new Date(session.opensAt).getTime() - Date.now();
      if (!warned.current && remaining > 0 && remaining <= WARNING_WINDOW_MS) {
        warned.current = true;
        showToast(t("tenant.examDetails.startSoonToast", EXAM_EDITOR_TEXT.START_SOON_TOAST), {
          tone: "warning",
        });
      }
    };
    check();
    const timer = window.setInterval(check, 15_000);
    return () => window.clearInterval(timer);
  }, [session.opensAt, session.status, showToast, t]);
};
