"use client";

import { useEffect, useRef } from "react";
import { useLocale, useToast } from "@pte/ui";
import { getExamMutationErrorMessage } from "../utils/examMutationError";

export const useExamMutationErrorToast = (error: unknown): void => {
  const { t } = useLocale();
  const { showToast } = useToast();
  const lastError = useRef<unknown>(null);

  useEffect(() => {
    if (!error) {
      lastError.current = null;
      return;
    }
    if (lastError.current === error) return;

    lastError.current = error;
    showToast(getExamMutationErrorMessage(error, t), { tone: "error" });
  }, [error, showToast, t]);
};
