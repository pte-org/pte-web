"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { DataTable, EyeIcon, type DataTableColumn } from "@pte/ui";
import type { PromptSummary } from "@pte/api-client";
import { promptDetailHref, type PromptCopy } from "../promptConstants";
import { tagLabel } from "../utils/promptPresentation";
import { engineTone } from "../utils/promptTone";

interface PromptTableProps {
  entries: readonly PromptSummary[];
  copy: PromptCopy;
}

/** The prompts of one category; each row opens the prompt with the eye button. */
export const PromptTable = ({ entries, copy }: PromptTableProps): ReactElement => {
  const columns: DataTableColumn<PromptSummary>[] = [
    {
      key: "key",
      header: copy.COLUMN_PROMPT,
      sortable: false,
      cell: (entry) => <span className="text-sm font-medium">{entry.key}</span>,
    },
    {
      key: "tags",
      header: copy.COLUMN_HANDLED_BY,
      sortable: false,
      cell: (entry) => (
        <span className="flex flex-wrap gap-1">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${engineTone(tag).chip}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${engineTone(tag).dot}`} aria-hidden="true" />
              {tagLabel(copy, tag)}
            </span>
          ))}
        </span>
      ),
    },
    {
      key: "actions",
      header: copy.COLUMN_ACTIONS,
      sortable: false,
      cell: (entry) => (
        <Link
          href={promptDetailHref(entry.category, entry.key)}
          className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-sm text-[var(--ink-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--action)]"
          aria-label={`${copy.ACTION_VIEW}: ${entry.key}`}
          title={copy.ACTION_VIEW}
        >
          <EyeIcon className="h-4 w-4" />
          {copy.ACTION_VIEW}
        </Link>
      ),
    },
  ];

  return (
    <DataTable
      showSearch={false}
      columns={columns}
      rows={[...entries]}
      getRowKey={(entry) => `${entry.category}:${entry.key}`}
      emptyTitle={copy.EMPTY}
      density="compact"
      clientSidePagination
    />
  );
};
