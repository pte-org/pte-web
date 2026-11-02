"use client";

import type { ReactElement } from "react";
import type { QuestionTypeResponse } from "@pte/api-client";
import { DashboardCard, GripVerticalIcon } from "@pte/ui";
import { sectionTone } from "../../../lib/chipTones";
import { taskTypeKeyOf } from "../addTaskType";
import { PALETTE_DROP_ATTRIBUTE, TASK_TYPE_DRAG_TYPE } from "../constants";
import { PaletteGroup } from "./_PaletteGroup";

interface TaskTypePaletteProps {
  title: string;
  /** What to say when there is nothing left to add. */
  emptyText: string;
  hint: string;
  addLabel: string;
  types: QuestionTypeResponse[];
  /** Groups the list by section, for the tab that mixes sections. */
  grouped: boolean;
  sectionLabel: (section: string) => string;
  onAdd: (type: QuestionTypeResponse) => void;
}

/** Keeps the list within the screen, scrolling on its own under the sticky tab rail. */
const LIST_MAX_HEIGHT = "max-h-[calc(100vh-22rem)] min-h-40";

const groupBySection = (types: QuestionTypeResponse[]): [string, QuestionTypeResponse[]][] => {
  const groups = new Map<string, QuestionTypeResponse[]>();
  for (const type of types) groups.set(type.section, [...(groups.get(type.section) ?? []), type]);
  return [...groups.entries()];
};

/**
 * The task types the template does not hold yet. Each one is dragged into the table on the right,
 * or added with its + button, which is also the way to do it from the keyboard.
 */
export const TaskTypePalette = ({
  title,
  emptyText,
  hint,
  addLabel,
  types,
  grouped,
  sectionLabel,
  onAdd,
}: TaskTypePaletteProps): ReactElement => {
  const renderRows = (rows: QuestionTypeResponse[]): ReactElement => (
    <ul className="space-y-1">
      {rows.map((type) => (
        <li
          key={taskTypeKeyOf(type)}
          draggable
          onDragStart={(event) => {
            event.dataTransfer.setData(TASK_TYPE_DRAG_TYPE, taskTypeKeyOf(type));
            event.dataTransfer.effectAllowed = "copy";
          }}
          className="flex cursor-grab items-center gap-1.5 rounded-lg border border-[var(--shell-border)] bg-[var(--surface-card)] py-1.5 pl-1 pr-1.5 active:cursor-grabbing"
        >
          <GripVerticalIcon className="h-4 w-4 shrink-0 text-[var(--ink-muted)]" />
          <span className="min-w-0 flex-1 text-sm text-[var(--ink-primary)]">
            {type.displayName}
          </span>
          <button
            type="button"
            aria-label={`${addLabel}: ${type.displayName}`}
            onClick={() => onAdd(type)}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[var(--ink-secondary)] transition-colors hover:bg-[var(--surface-subtle)] hover:text-[var(--ink-primary)]"
          >
            +
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <DashboardCard
      className="border p-3 transition-colors data-[drag-over=true]:border-[var(--brand)] data-[drag-over=true]:bg-[var(--action-tint)]"
      {...{ [PALETTE_DROP_ATTRIBUTE]: "" }}
    >
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-[var(--ink-primary)]">{title}</h3>
        {types.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[var(--shell-border)] px-3 py-4 text-center text-xs text-[var(--ink-muted)]">
            {emptyText}
          </p>
        ) : (
          <>
            <p className="text-xs text-[var(--ink-muted)]">{hint}</p>
            <div className={`${LIST_MAX_HEIGHT} space-y-2 overflow-y-auto pr-1`}>
              {grouped
                ? groupBySection(types).map(([section, rows]) => (
                    <PaletteGroup
                      key={section}
                      title={sectionLabel(section)}
                      tone={sectionTone(section)}
                      count={rows.length}
                    >
                      {renderRows(rows)}
                    </PaletteGroup>
                  ))
                : renderRows(types)}
            </div>
          </>
        )}
      </section>
    </DashboardCard>
  );
};
