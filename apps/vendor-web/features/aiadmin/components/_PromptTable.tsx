"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { DataTable, EyeIcon, type DataTableColumn } from "@pte/ui";
import type { PromptSummary } from "@pte/api-client";
import { promptDetailHref, type PromptCopy } from "../promptConstants";
import { categoryLabel, tagLabel } from "../utils/promptPresentation";
import { categoryTone, engineTone } from "../utils/promptTone";

/** The largest category has 23 prompts; 20 a page keeps most categories on one page. */
const PAGE_SIZE = 20;

interface PromptTableProps {
  entries: readonly PromptSummary[];
  copy: PromptCopy;
  /** Adds a column naming each prompt's category, for a list that mixes categories (one name can exist in two). */
  showCategory?: boolean;
}

/** The prompts of one category; each row opens the prompt with the eye button. */
export const PromptTable = ({ entries, copy, showCategory = false }: PromptTableProps): ReactElement => {
  const columns: DataTableColumn<PromptSummary>[] = [
    {
      key: "key",
      header: copy.COLUMN_PROMPT,
      sortable: false,
      // Search matches the readable title as well as the code.
      filterAccessor: (entry) => `${entry.title} ${entry.key}`,
      cell: (entry) => (
        <span className="flex flex-col">
          {/* A title that only repeats the code (scoring entries) adds nothing, so it is shown once. */}
          {entry.title !== entry.key && <span className="text-sm font-medium">{entry.title}</span>}
          <span
            className={
              entry.title !== entry.key
                ? "font-mono text-xs text-[var(--ink-muted)]"
                : "text-sm font-medium"
            }
          >
            {entry.key}
          </span>
        </span>
      ),
    },
    ...(showCategory
      ? [
          {
            key: "category",
            header: copy.COLUMN_CATEGORY,
            sortable: false,
            filterAccessor: (entry: PromptSummary) => categoryLabel(copy, entry.category),
            cell: (entry: PromptSummary) => (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryTone(entry.category).chip}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${categoryTone(entry.category).dot}`} aria-hidden="true" />
                {categoryLabel(copy, entry.category)}
              </span>
            ),
          },
        ]
      : []),
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
      searchPlaceholder={copy.SEARCH_PLACEHOLDER}
      columns={columns}
      rows={[...entries]}
      getRowKey={(entry) => `${entry.category}:${entry.key}`}
      emptyTitle={copy.EMPTY}
      density="compact"
      clientSidePagination
      initialPageSize={PAGE_SIZE}
      frameless
    />
  );
};
