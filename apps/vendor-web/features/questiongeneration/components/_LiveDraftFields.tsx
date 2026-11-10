"use client";

import type { ReactElement } from "react";
import { cn } from "@pte/ui";
import { draftFields, humanizeKey, optionLetter, type DraftField } from "../utils/draftFields";
import { WritingCursor } from "./_LiveLaneCard";

interface LiveDraftFieldsProps {
  draft: unknown;
  labels: Record<string, string>;
  /** The key of the field the model writes now; it gets the caret. */
  writingKey: string | null;
}

const FieldValue = ({ field, labels }: { field: DraftField; labels: Record<string, string> }): ReactElement => {
  const { value } = field;
  if (value.kind === "text") return <p className="whitespace-pre-wrap text-sm leading-relaxed">{value.text}</p>;
  if (value.kind === "list") {
    return (
      <ul className="space-y-1 text-sm">
        {value.items.map((item, index) => {
          const correct = value.correct.includes(index);
          return (
            <li key={index} className={cn("flex gap-2 rounded-md px-2 py-1", correct && "bg-emerald-500/10")}>
              <span className="font-semibold text-[var(--ink-muted)]">{optionLetter(index)}</span>
              <span>{item}</span>
              {correct && <span className="ml-auto text-emerald-600">✓</span>}
            </li>
          );
        })}
      </ul>
    );
  }
  return (
    <ul className="space-y-1 text-sm">
      {value.records.map((record, index) => (
        <li key={index} className="rounded-md bg-[var(--surface-subtle)] px-2 py-1">
          {record.map((part) => (
            <span key={part.key} className="mr-3 inline-block">
              <span className="text-[var(--ink-muted)]">{labels[part.key] ?? humanizeKey(part.key)}: </span>
              {part.text}
            </span>
          ))}
        </li>
      ))}
    </ul>
  );
};

/** The writer's draft as labelled fields, filling in as the text arrives. */
export const LiveDraftFields = ({ draft, labels, writingKey }: LiveDraftFieldsProps): ReactElement => (
  <div className="space-y-3">
    {draftFields(draft).map((field) => (
      <div key={field.key}>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
          {labels[field.key] ?? humanizeKey(field.key)}
        </p>
        <FieldValue field={field} labels={labels} />
        {field.key === writingKey && <WritingCursor lane="GENERATOR" />}
      </div>
    ))}
  </div>
);
