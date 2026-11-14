"use client";

import type { ReactElement } from "react";
import type { QuestionGenerationCheckDetail, QuestionGenerationLiveCheck } from "@pte/api-client";
import { cn } from "@pte/ui";
import { DRAFT_FIELD_LABELS } from "../liveConstants";
import { CHECK_COPY, CHECK_STATUS, checkSummary, detailValue } from "../liveCheckCopy";
import { usePacedSteps } from "../hooks/usePacedSteps";
import { humanizeKey } from "../utils/draftFields";
import { PlanStatusIcon } from "./_PlanStatusIcon";

interface LiveChecksProps {
  checks: readonly QuestionGenerationLiveCheck[];
  /** The question shown; another one shows its checks as they stand, without replaying them. */
  itemIndex: number;
  locale: "vi" | "en";
  /** The fields of the draft the model has written so far, in order; the last one is being written. */
  writtenFields?: readonly string[];
}

interface CheckDetailsProps {
  details: readonly QuestionGenerationCheckDetail[];
  locale: "vi" | "en";
}

/** The lines under one check, like the entries of a table of contents: a name and what was found. */
const CheckDetails = ({ details, locale }: CheckDetailsProps): ReactElement => {
  const copy = CHECK_COPY[locale];
  const label = (key: string): string => copy.details[key] ?? DRAFT_FIELD_LABELS[locale][key] ?? humanizeKey(key);
  return (
    <ul className="mt-1 space-y-0.5 border-l border-dashed border-[var(--border-subtle)] pl-3 text-xs">
      {details.map((detail, position) => (
        <li key={`${detail.key}-${position}`} className="flex gap-2">
          <span className="shrink-0 text-[var(--ink-secondary)]">{label(detail.key)}</span>
          <span className="min-w-0 truncate text-[var(--ink-muted)]" title={detailValue(detail, copy)}>
            {detailValue(detail, copy)}
          </span>
        </li>
      ))}
    </ul>
  );
};

interface WritingFieldsProps {
  fields: readonly string[];
  locale: "vi" | "en";
}

/** While the model writes: each field it has started, the last one still being written. */
const WritingFields = ({ fields, locale }: WritingFieldsProps): ReactElement => {
  const copy = CHECK_COPY[locale];
  return (
    <ul className="mt-1 space-y-0.5 border-l border-dashed border-[var(--border-subtle)] pl-3 text-xs">
      {fields.map((key, position) => {
        const writing = position === fields.length - 1;
        return (
          <li key={key} className="flex items-center gap-2">
            <PlanStatusIcon status={writing ? "active" : "done"} size="sm" />
            <span className="text-[var(--ink-secondary)]">{DRAFT_FIELD_LABELS[locale][key] ?? humanizeKey(key)}</span>
            <span className="text-[var(--ink-muted)]">{writing ? copy.fieldWriting : copy.fieldDone}</span>
          </li>
        );
      })}
    </ul>
  );
};

/** The checks inside writing a draft, one per line, each staying a moment before the next is shown done. */

export const LiveChecks = ({ checks, itemIndex, locale, writtenFields = [] }: LiveChecksProps): ReactElement => {
  const copy = CHECK_COPY[locale];
  const paced = usePacedSteps(checks.map((check) => CHECK_STATUS[check.status]), itemIndex);
  if (checks.length === 0) return <p className="text-sm text-[var(--ink-muted)]">{copy.preparing}</p>;
  return (
    <ol className="space-y-2 text-sm">
      {checks.map((check, position) => {
        const status = paced[position] ?? "waiting";
        const revealed = status === CHECK_STATUS[check.status];
        // A check not revealed yet is shown running, so its result is not read before its turn.
        const shown = revealed ? check : { ...check, status: "RUNNING" as const };
        return (
          <li key={check.step} className="flex gap-2">
            <span className="mt-0.5"><PlanStatusIcon status={status} size="sm" /></span>
            <div className="min-w-0 flex-1">
              <span className="font-medium">{copy.steps[check.step]}</span>
              {status !== "waiting" && (
                <span className="ml-2 text-[var(--ink-muted)]">{checkSummary(shown, copy)}</span>
              )}
              {revealed && check.details && check.details.length > 0 && (
                <CheckDetails details={check.details} locale={locale} />
              )}
              {check.step === "WRITE" && status === "active" && writtenFields.length > 0 && (
                <WritingFields fields={writtenFields} locale={locale} />
              )}
              {status === "failed" && check.facts.issues && (
                <p className={cn("mt-1 whitespace-pre-line rounded-md bg-red-500/10 px-2 py-1",
                  "text-red-700 dark:text-red-200")}>{check.facts.issues}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};
