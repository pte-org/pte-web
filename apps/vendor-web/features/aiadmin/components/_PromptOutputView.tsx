"use client";

import type { ReactElement } from "react";
import type { FieldRow } from "../promptText";
import { useLocale } from "@pte/ui";
import { fieldLabel as knownLabel } from "../promptLabels";
import { fieldLabel, fieldValueText } from "../utils/fieldDisplay";

interface PromptOutputViewProps {
  text: string;
  rows: readonly FieldRow[];
}

const BOX_CLASS =
  "w-full whitespace-pre-wrap break-words rounded-md border border-[var(--shell-border)] bg-[var(--surface-subtle)] px-3 py-2 text-sm leading-6 text-[var(--ink-primary)]";

/**
 * The reply the AI gives, shown for reading only: the code that reads the reply looks for these exact field names, so
 * they are not edited here. How the AI is told to answer is changed in the sections above it.
 */
export const PromptOutputView = ({ text, rows }: PromptOutputViewProps): ReactElement => {
  const { locale } = useLocale();
  const labelOf = (name: string): string => {
    const known = knownLabel(name, locale);
    return known === name ? fieldLabel(name) : known;
  };
  return (
  <div className="space-y-3">
    {text.trim() !== "" && <p className={BOX_CLASS}>{text}</p>}
    {rows.map((row) => (
      <label key={row.id} className="block space-y-1">
        <span className="text-xs font-medium text-[var(--ink-secondary)]">{labelOf(row.name)}</span>
        <div className={BOX_CLASS}>{fieldValueText(row.value)}</div>
      </label>
    ))}
  </div>
);
};
