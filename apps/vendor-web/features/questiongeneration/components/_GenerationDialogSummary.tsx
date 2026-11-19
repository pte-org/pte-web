"use client";

import type { ReactElement } from "react";
import type { QuestionGenerationQuotaResponse } from "@pte/api-client";
import { InfoPanel, type InfoPanelRow } from "@pte/ui";
import type { DialogMessages } from "../messages/dialog.en";
import { formatMessage } from "../messages/useDialogMessages";
import { quotaRemaining, type SubmitMode } from "../utils/generationSelection";

const SECONDS_PER_MINUTE = 60;

interface SummaryProps {
  typeCount: number;
  total: number;
  etaSeconds: number;
  mode: SubmitMode;
  quota: QuestionGenerationQuotaResponse | undefined;
  messages: DialogMessages;
}

/** Totals, the sequential ETA and, only while a daily limit applies, what is left today. */
export const GenerationDialogSummary = ({ typeCount, total, etaSeconds, mode, quota, messages }: SummaryProps): ReactElement => {
  const remaining = quotaRemaining(quota);
  const rows: InfoPanelRow[] = [
    { label: messages.summaryTypes, value: typeCount },
    { label: messages.summaryTotal, value: total },
    {
      label: messages.summaryEta,
      value: formatMessage(messages.summaryEtaValue, { minutes: Math.max(1, Math.ceil(etaSeconds / SECONDS_PER_MINUTE)) }),
    },
    { label: messages.summaryMode, value: mode === "single" ? messages.summaryModeSingle : messages.summaryModeBatch },
  ];
  if (remaining !== null) {
    const scope = quota?.scope ? ` (${messages[`summaryScope${quota.scope}`]})` : "";
    rows.push({ label: messages.summaryRemaining, value: `${remaining}${scope}` });
  }
  return <InfoPanel title={messages.summaryTotal} rows={rows} forceOpen />;
};
