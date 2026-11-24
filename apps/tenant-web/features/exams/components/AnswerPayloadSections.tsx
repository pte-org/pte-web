"use client";

import type { ReactElement } from "react";
import { Badge, cn } from "@pte/ui";
import type { AnswerOptionView } from "@pte/api-client";

interface ReviewLabels {
  selected: string;
  correct: string;
  incorrect: string;
  studentOrder: string;
  correctOrder: string;
  studentAnswer: string;
  correctAnswer: string;
  blank: string;
  leftEmpty: string;
  wordIndices: string;
  linkedToPrevious: string;
  notLinkedToPrevious: string;
  pairsSummary: string;
}

const SECTION_TITLE_CLASS = "text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]";

/** Same normalisation the scorer applies to a typed gap: trim, collapse spaces, ignore case. */
export function normalizeGapValue(value: string | null | undefined): string {
  return (value ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

function ParagraphList({
  title,
  paragraphs,
  marks,
  summary,
  labels,
}: {
  title: string;
  paragraphs: string[];
  /** Per position: whether it follows the paragraph before it correctly; omitted for the answer key. */
  marks?: (boolean | null)[];
  summary?: string;
  labels: ReviewLabels;
}): ReactElement {
  return (
    <div className="flex flex-col gap-2">
      <p className={SECTION_TITLE_CLASS}>{title}</p>
      {summary && <p className="text-sm text-[var(--ink-secondary)]">{summary}</p>}
      <ol className="flex flex-col gap-2">
        {paragraphs.map((text, index) => {
          const mark = marks?.[index];
          return (
            <li
              key={`${index}-${text}`}
              className={cn(
                "flex items-start justify-between gap-3 rounded-md border px-3 py-2 text-sm",
                mark === false
                  ? "border-[var(--danger-soft,#fecaca)] bg-[var(--surface-card)]"
                  : "border-[var(--shell-border)] bg-[var(--surface-card)]",
              )}
            >
              <span className="text-[var(--ink-primary)]">
                <span className="mr-2 font-semibold text-[var(--ink-secondary)]">{index + 1}.</span>
                {text}
              </span>
              {mark !== undefined && mark !== null && (
                <Badge variant={mark ? "success" : "danger"}>
                  {mark ? labels.linkedToPrevious : labels.notLinkedToPrevious}
                </Badge>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/**
 * Re-order paragraphs: the arrangement the student submitted next to the answer key.
 * Scoring is per adjacent pair: a paragraph earns a point when it directly follows the
 * paragraph that precedes it in the answer key (the first paragraph has no pair).
 */
export function ReorderReview({
  options,
  submittedOrder,
  labels,
}: {
  options: AnswerOptionView[];
  submittedOrder: number[];
  labels: ReviewLabels;
}): ReactElement {
  const byOrderIndex = new Map<number, string>();
  options.forEach((option) => {
    if (option.orderIndex !== null) byOrderIndex.set(option.orderIndex, option.text);
  });
  const correctIndexes = [...byOrderIndex.keys()].sort((a, b) => a - b);
  const studentParagraphs = submittedOrder.map((index) => byOrderIndex.get(index) ?? "");
  const rankOf = new Map(correctIndexes.map((index, rank) => [index, rank]));
  const marks = submittedOrder.map((index, position) =>
    position === 0 ? null : rankOf.get(index) === (rankOf.get(submittedOrder[position - 1]) ?? -2) + 1,
  );
  const correctPairs = marks.filter((mark) => mark === true).length;
  const summary = labels.pairsSummary
    .replace("{correct}", String(correctPairs))
    .replace("{total}", String(Math.max(submittedOrder.length - 1, 0)));

  return (
    <div className="flex flex-col gap-4">
      <ParagraphList
        title={labels.studentOrder}
        paragraphs={studentParagraphs}
        marks={marks}
        summary={summary}
        labels={labels}
      />
      <ParagraphList
        title={labels.correctOrder}
        paragraphs={correctIndexes.map((index) => byOrderIndex.get(index) ?? "")}
        labels={labels}
      />
    </div>
  );
}

/** Fill in the blanks (type in): what the student typed per blank and the key for it. */
export function TypeInReview({
  gapValues,
  correctGapValues,
  labels,
}: {
  gapValues: (string | null)[];
  correctGapValues: string[] | null;
  labels: ReviewLabels;
}): ReactElement {
  const rowCount = Math.max(gapValues.length, correctGapValues?.length ?? 0);
  return (
    <ul className="flex flex-col gap-2">
      {Array.from({ length: rowCount }, (_, index) => {
        const typed = gapValues[index] ?? null;
        const expected = correctGapValues?.[index] ?? null;
        const judged = expected !== null;
        const isCorrect = judged && normalizeGapValue(typed) === normalizeGapValue(expected);
        const isEmpty = typed === null || typed.trim() === "";
        return (
          <li
            key={index}
            className="flex flex-col gap-1 rounded-md border border-[var(--shell-border)] bg-[var(--surface-card)] px-3 py-2 text-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <span className={SECTION_TITLE_CLASS}>
                {labels.blank} {index + 1}
              </span>
              {judged && (
                <Badge variant={isCorrect ? "success" : "danger"}>
                  {isCorrect ? labels.correct : labels.incorrect}
                </Badge>
              )}
            </div>
            <p className="text-[var(--ink-primary)]">
              <span className="text-[var(--ink-secondary)]">{labels.studentAnswer}: </span>
              {isEmpty ? (
                <em className="text-[var(--ink-muted)]">{labels.leftEmpty}</em>
              ) : (
                <span className="font-medium">{typed}</span>
              )}
            </p>
            {judged && (
              <p className="text-[var(--ink-primary)]">
                <span className="text-[var(--ink-secondary)]">{labels.correctAnswer}: </span>
                <span className="font-medium">{expected}</span>
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Highlight-incorrect-words and similar tasks: the word positions the student picked. */
export function WordIndicesReview({
  wordIndices,
  labels,
}: {
  wordIndices: number[];
  labels: ReviewLabels;
}): ReactElement {
  return (
    <div className="flex flex-col gap-2">
      <p className={SECTION_TITLE_CLASS}>{labels.wordIndices}</p>
      <p className="flex flex-wrap gap-1.5">
        {wordIndices.map((index) => (
          <Badge key={index} variant="info">
            {index}
          </Badge>
        ))}
      </p>
    </div>
  );
}

export type { ReviewLabels };
