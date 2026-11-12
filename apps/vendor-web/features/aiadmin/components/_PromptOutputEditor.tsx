"use client";

import type { ReactElement } from "react";
import { useLocale } from "@pte/ui";
import type { FieldRow } from "../promptText";
import type { PromptEditCopy } from "../promptEditConstants";
import { fieldLabel } from "../promptLabels";
import { AutoGrowTextarea } from "./_AutoGrowTextarea";

interface PromptOutputEditorProps {
  text: string;
  rows: readonly FieldRow[];
  copy: PromptEditCopy;
  readOnly: boolean;
  onRowsChange: (rows: FieldRow[]) => void;
}

const VALUE_MIN_ROWS = 1;

/**
 * The reply the AI gives: one labelled box per field. The code that reads the reply looks for the exact field names,
 * so the fields themselves stay as they are; only the example value in each box can be changed.
 */
export const PromptOutputEditor = ({ text, rows, copy, readOnly, onRowsChange }: PromptOutputEditorProps): ReactElement => {
  const { locale } = useLocale();
  return (
    <div className="space-y-3">
      {text.trim() !== "" && <AutoGrowTextarea aria-label={copy.OUTPUT_TEXT} value={text} disabled readOnly />}
      {rows.map((row, index) => (
        <AutoGrowTextarea
          key={row.id}
          label={fieldLabel(row.name, locale)}
          minRows={VALUE_MIN_ROWS}
          value={row.value}
          disabled={readOnly}
          onChange={(event) =>
            onRowsChange(rows.map((item, at) => (at === index ? { ...item, value: event.target.value } : item)))}
        />
      ))}
    </div>
  );
};
