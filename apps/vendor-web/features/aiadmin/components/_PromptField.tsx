"use client";

import type { ReactElement } from "react";
import { useLocale } from "@pte/ui";
import type { PromptCopy } from "../promptConstants";
import { placeholderLabel } from "../promptLabels";
import { splitLabeled } from "../utils/promptPresentation";

/** Looks like an input; read only until prompt editing (saved versions) is added. */
export const FIELD_BOX_CLASS =
  "w-full rounded-md border border-[var(--shell-border)] bg-[var(--surface-subtle)] px-3 py-2 text-sm leading-6 text-[var(--ink-primary)]";

interface PromptFieldProps {
  entry: string;
  copy: PromptCopy;
}

/** A value box that shows what a system-filled token stands for, with the token beside it. */
const ValueBox = ({ value, copy }: { value: string; copy: PromptCopy }): ReactElement => {
  const { locale } = useLocale();
  const meaning = placeholderLabel(value, locale);
  if (!meaning) return <div className={FIELD_BOX_CLASS}>{value}</div>;
  return (
    <div className={`${FIELD_BOX_CLASS} border-dashed border-indigo-400/60 bg-indigo-500/5`}>
      <span className="text-indigo-700 dark:text-indigo-300" title={copy.FILLED_BY_SYSTEM}>{meaning}</span>
    </div>
  );
};

/**
 * One entry of a prompt as a form field: "Label: value" becomes a label above a box, anything else a box on its own.
 * A bare token (e.g. {cefr}) is explained as a value the system fills in.
 */
export const PromptField = ({ entry, copy }: PromptFieldProps): ReactElement => {
  const labeled = splitLabeled(entry);
  if (!labeled) return <ValueBox value={entry} copy={copy} />;
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-[var(--ink-secondary)]">{labeled.label}</span>
      <ValueBox value={labeled.value} copy={copy} />
    </label>
  );
};
