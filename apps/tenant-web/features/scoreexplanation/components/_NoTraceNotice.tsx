"use client";

import type { ReactElement } from "react";
import { Alert } from "@pte/ui";
import { useScoreExplanationText } from "../hooks/useScoreExplanationText";

/** A report published before traces were kept: its scores are shown, never recalculated. */
export const NoTraceNotice = (): ReactElement => {
  const { messages: M } = useScoreExplanationText();
  return (
    <Alert tone="info" title={M.noTraceTitle}>
      {M.noTrace}
    </Alert>
  );
};
