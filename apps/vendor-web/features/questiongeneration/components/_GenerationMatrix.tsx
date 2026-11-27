"use client";

import { useState, type ReactElement } from "react";
import { Alert, cn, DisclosureChevron } from "@pte/ui";
import {
  GENERATION_CEFR_LEVELS,
  GENERATION_SECTIONS,
  MATRIX_ROW_GRID,
  type GenerationSection,
} from "../dialogConstants";
import type { GenerationSelectionState } from "../hooks/useGenerationSelection";
import type { DialogMessages } from "../messages/dialog.en";
import { formatMessage } from "../messages/useDialogMessages";
import { rowTotal } from "../utils/generationCefr";
import type { MatrixTaskType } from "../utils/generationMatrix";
import { GenerationMatrixRow } from "./_GenerationMatrixRow";

interface GenerationMatrixProps {
  taskTypes: readonly MatrixTaskType[];
  state: GenerationSelectionState;
  messages: DialogMessages;
  /** The server paints AI pictures for Describe Image. */
  pictureEnabled: boolean;
}

const HEADER_CLASS = "text-xs font-medium uppercase text-[var(--ink-muted)]";

/** One skill: a header that folds the group and says how much of it is used, then its task types. */
const SectionGroup = ({
  section,
  types,
  state,
  messages,
  pictureEnabled,
}: { section: GenerationSection; types: readonly MatrixTaskType[] } & Omit<
  GenerationMatrixProps,
  "taskTypes"
>): ReactElement => {
  const [isOpen, setOpen] = useState(true);
  const rows = state.selection.rows.filter((row) => row.section === section);
  const summary = formatMessage(messages.matrixSectionSummary, {
    types: rows.length,
    all: types.length,
    items: rows.reduce((sum, row) => sum + rowTotal(row), 0),
  });
  return (
    <div className="border-t border-[var(--shell-border)] first:border-t-0">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setOpen((open) => !open)}
        className="flex w-full items-center gap-2 bg-[var(--surface-subtle)] px-3 py-2 text-left"
      >
        <DisclosureChevron expanded={isOpen} />
        <span className="text-sm font-semibold text-[var(--ink-primary)]">
          {messages[`skill${section}`]}
        </span>
        <span className="text-xs text-[var(--ink-muted)]">{summary}</span>
      </button>
      {isOpen
        ? types.map((type) => (
            <GenerationMatrixRow
              key={type.taskType}
              type={type}
              row={state.selection.rows.find((row) => row.taskType === type.taskType)}
              messages={messages}
              onCellChange={(level, value) => state.setCell(type, level, value)}
              onChange={(patch) => state.update(type.taskType, patch)}
              pictureEnabled={pictureEnabled}
            />
          ))
        : null}
    </div>
  );
};

/** Task types × CEFR levels: each cell is how many questions of that type to write at that level. */
export const GenerationMatrix = ({
  taskTypes,
  state,
  messages,
  pictureEnabled,
}: GenerationMatrixProps): ReactElement => {
  if (taskTypes.length === 0) return <Alert tone="warning">{messages.noTaskTypes}</Alert>;
  const sections = GENERATION_SECTIONS.filter((section) =>
    taskTypes.some((type) => type.section === section),
  );
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--shell-border)]">
      <div className={cn(MATRIX_ROW_GRID, "px-3 py-2", HEADER_CLASS)}>
        <span>{messages.taskTypeColumn}</span>
        {GENERATION_CEFR_LEVELS.map((level) => (
          <span key={level} className="text-center">
            {level}
          </span>
        ))}
        <span className="text-right">{messages.matrixTotalColumn}</span>
        <span />
      </div>
      {sections.map((section) => (
        <SectionGroup
          key={section}
          section={section}
          types={taskTypes.filter((type) => type.section === section)}
          state={state}
          messages={messages}
          pictureEnabled={pictureEnabled}
        />
      ))}
    </div>
  );
};
