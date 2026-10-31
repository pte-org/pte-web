"use client";

import type { ReactElement } from "react";
import { SortableList } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import {
  SCORE_TEMPLATE_ROW_COLUMNS,
  SCORE_TEMPLATE_ROW_TEXT as RAW_SCORE_TEMPLATE_ROW_TEXT,
} from "../constants";
import type { ScoreTemplateItem, ScoreTemplateItemDraft } from "../types";
import { ScoreTemplateItemCells } from "./_ScoreTemplateItemCells";

/** An item with its position in the full item list, which the editor callbacks address. */
export interface ScoreTemplateRow {
  item: ScoreTemplateItem;
  index: number;
}

export interface ScoreTemplateRowEditing {
  onChange: (index: number, field: keyof ScoreTemplateItemDraft, value: string) => void;
  onEditDetails: (taskTypeKey: string) => void;
  onRemove: (index: number) => void;
  onReorder: (section: string, orderedTaskTypeKeys: string[]) => void;
}

interface ScoreTemplateSectionListProps {
  section: string;
  label: string;
  rows: ScoreTemplateRow[];
  skillLabels: Record<string, string>;
  /** Present only in the DRAFT editor; without it the list is read-only. */
  editing?: ScoreTemplateRowEditing;
}

/** One section as a titled group card holding its task types; draggable only in the editor. */
export const ScoreTemplateSectionList = ({
  section,
  label,
  rows,
  skillLabels,
  editing,
}: ScoreTemplateSectionListProps): ReactElement => {
  const ROW = useAdminCopy(RAW_SCORE_TEMPLATE_ROW_TEXT);

  return (
    <section className="rounded-2xl border border-[var(--shell-border)] bg-[var(--surface-subtle)] p-5">
      <div className="flex items-center gap-2.5">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--brand)]" aria-hidden="true" />
        <h2 className="text-base font-bold text-[var(--ink-primary)]">{label}</h2>
        <span className="flex size-5 items-center justify-center rounded-full bg-[var(--surface-card)] p-1 text-xs font-medium text-[var(--ink-secondary)]">
          {rows.length}
        </span>
      </div>
      <SortableList
        className="mt-5"
        items={rows}
        getId={(row) => row.item.taskTypeKey}
        renderCells={(row) => (
          <ScoreTemplateItemCells
            item={row.item}
            skillLabels={skillLabels}
            onChange={
              editing
                ? (field, value) => editing.onChange(row.index, field, value)
                : undefined
            }
            onEditDetails={editing ? () => editing.onEditDetails(row.item.taskTypeKey) : undefined}
            onRemove={editing ? () => editing.onRemove(row.index) : undefined}
          />
        )}
        onReorder={editing ? (orderedKeys) => editing.onReorder(section, orderedKeys) : undefined}
        dragHandleLabel={ROW.DRAG_HANDLE}
        columnsClassName={
          editing ? SCORE_TEMPLATE_ROW_COLUMNS.EDITABLE : SCORE_TEMPLATE_ROW_COLUMNS.READ_ONLY
        }
        ariaLabel={label}
        emptyContent={
          <p className="mt-5 rounded-xl border border-dashed border-[var(--shell-border)] px-4 py-6 text-center text-sm text-[var(--ink-muted)]">
            {ROW.SECTION_EMPTY}
          </p>
        }
      />
    </section>
  );
};
