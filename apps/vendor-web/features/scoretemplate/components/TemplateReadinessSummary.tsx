"use client";

import type { ReactElement } from "react";
import type { QuestionTypeResponse, ScoreTemplateFeasibilityResponse } from "@pte/api-client";
import { CollapsibleSection } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { SCORE_TEMPLATE_ERROR_MESSAGES, SCORE_TEMPLATE_TEXT } from "../constants";
import { isTaskTypeRuntimeReady } from "../taskTypeReadiness";
import type { ScoreTemplateItemDraft } from "../types";

interface TemplateReadinessSummaryProps {
  items: readonly ScoreTemplateItemDraft[];
  questionTypes: readonly QuestionTypeResponse[];
  feasibility?: ScoreTemplateFeasibilityResponse;
  loading: boolean;
  failed: boolean;
}

/**
 * Blockers that need an explanation get a list. A plain question shortage is already shown per row (the
 * Available / needed column), so on its own it collapses to a single line instead of a list.
 */
export function TemplateReadinessSummary({
  items,
  questionTypes,
  feasibility,
  loading,
  failed,
}: TemplateReadinessSummaryProps): ReactElement | null {
  const text = useAdminCopy(SCORE_TEMPLATE_TEXT);
  const errors = useAdminCopy(SCORE_TEMPLATE_ERROR_MESSAGES);
  const keys = items.map((item) => item.taskTypeKey);
  const uniqueKeys = [...new Set(keys)];
  const duplicates = uniqueKeys.filter(
    (key) => keys.filter((candidate) => candidate === key).length > 1,
  );
  const unavailable = uniqueKeys.filter((key) => {
    const type = questionTypes.find(
      (candidate) => (candidate.taskTypeKey ?? candidate.code) === key,
    );
    return !type?.active || !isTaskTypeRuntimeReady(type);
  });
  const blockedSlots = [
    ...new Map(
      (feasibility?.slots ?? [])
        .filter((slot) => !slot.ready)
        .map((slot) => [`${slot.taskType}-${slot.reason}`, slot]),
    ).values(),
  ];
  const shortSlots = blockedSlots.filter((slot) => slot.reason === "INSUFFICIENT_POOL");
  const otherSlots = blockedSlots.filter((slot) => slot.reason !== "INSUFFICIENT_POOL");
  if (
    items.length > 0 &&
    duplicates.length === 0 &&
    unavailable.length === 0 &&
    !loading &&
    !failed &&
    feasibility?.ready
  )
    return null;

  const poolSummary = text.READINESS_POOL_SUMMARY.replace("{count}", String(shortSlots.length));
  const onlyShortage =
    items.length > 0 &&
    duplicates.length === 0 &&
    unavailable.length === 0 &&
    !loading &&
    !failed &&
    otherSlots.length === 0 &&
    shortSlots.length > 0;
  if (onlyShortage) {
    return <p className="text-sm text-red-700">{poolSummary}</p>;
  }

  return (
    <CollapsibleSection title={text.READINESS_TITLE} subtitle={text.READINESS_SAVED_NOTICE}>
      <ul className="list-disc space-y-2 pl-5 text-sm text-[var(--ink-secondary)]">
        {items.length === 0 && <li>{text.READINESS_EMPTY}</li>}
        {duplicates.length > 0 && (
          <li>
            {text.READINESS_DUPLICATE}: {duplicates.join(", ")}
          </li>
        )}
        {unavailable.length > 0 && (
          <li>
            {text.READINESS_RUNTIME}: {unavailable.join(", ")}
          </li>
        )}
        {loading && <li>{text.READINESS_LOADING}</li>}
        {failed && <li>{text.READINESS_CHECK_ERROR}</li>}
        {!failed && !loading && shortSlots.length > 0 && <li>{poolSummary}</li>}
        {!failed &&
          !loading &&
          otherSlots.map((slot, index) => (
            <li key={`${slot.taskType}-${index}`}>
              {slot.taskType}: {errors[slot.reason ?? ""] ?? text.READINESS_UNKNOWN}
            </li>
          ))}
        {!failed && !loading && !feasibility?.ready && blockedSlots.length === 0 && (
          <li>{text.READINESS_UNKNOWN}</li>
        )}
      </ul>
    </CollapsibleSection>
  );
}
