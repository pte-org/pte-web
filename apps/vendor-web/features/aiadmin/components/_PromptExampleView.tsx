"use client";

import type { ReactElement } from "react";
import { TableBody, TableCell, TableHead, TableHeader, TableRoot, TableRow, useLocale } from "@pte/ui";
import type { PromptCopy } from "../promptConstants";
import { fieldLabel } from "../promptLabels";
import { parseExample } from "../utils/promptExample";

interface PromptExampleViewProps {
  text: string;
  copy: PromptCopy;
}

const RAW_CLASS =
  "overflow-auto whitespace-pre-wrap rounded-md bg-[var(--surface-subtle)] p-4 font-mono text-xs text-[var(--ink-secondary)]";

/**
 * An example reply shown as a table of plain-named fields and sample values. Text that is not a JSON object is
 * shown as it is.
 */
export const PromptExampleView = ({ text, copy }: PromptExampleViewProps): ReactElement => {
  const { locale } = useLocale();
  const fields = parseExample(text);

  if (!fields) return <pre className={RAW_CLASS}>{text}</pre>;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-[var(--ink-primary)]">{copy.EXAMPLE_TITLE}</p>
      <div className="overflow-hidden rounded-xl border border-[var(--shell-border)]">
        <TableRoot>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">{copy.COLUMN_FIELD}</TableHead>
              <TableHead>{copy.COLUMN_EXAMPLE}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((row) => (
              <TableRow key={row.field}>
                <TableCell className="align-top">
                  <span className="font-medium text-[var(--ink-primary)]" title={row.field}>
                    {fieldLabel(row.field, locale)}
                  </span>
                </TableCell>
                <TableCell className="align-top text-sm text-[var(--ink-secondary)]">
                  {row.lines.length > 1 ? (
                    <ul className="list-disc space-y-1 pl-5">
                      {row.lines.map((line, index) => (
                        <li key={`${row.field}-${index}`}>{line}</li>
                      ))}
                    </ul>
                  ) : (
                    row.lines[0]
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableRoot>
      </div>
    </div>
  );
};
