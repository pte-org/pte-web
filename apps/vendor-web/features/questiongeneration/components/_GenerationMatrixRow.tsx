"use client";

import { useState, type ReactElement } from "react";
import type { QuestionGenerationImageKind } from "@pte/api-client";
import { ActionMenu, cn, Select, SlidersHorizontalIcon, TableNumberInput, Textarea } from "@pte/ui";
import { DESCRIBE_IMAGE_TASK, GENERATION_IMAGE_KINDS } from "../constants";
import {
  GENERATION_CELL_MAX,
  GENERATION_CEFR_LEVELS,
  MATRIX_EMPTY_CELL,
  MATRIX_EMPTY_TOTAL,
  MATRIX_ROW_GRID,
  type GenerationCefrLevel,
} from "../dialogConstants";
import type { DialogMessages } from "../messages/dialog.en";
import { formatMessage } from "../messages/useDialogMessages";
import { rowTotal } from "../utils/generationCefr";
import { cellValue, type MatrixTaskType } from "../utils/generationMatrix";
import type { SelectionRow } from "../utils/generationSelection";
import { taskTypeLabel } from "../utils/taskTypeLabel";

interface MatrixRowProps {
  type: MatrixTaskType;
  row: SelectionRow | undefined;
  messages: DialogMessages;
  onCellChange: (level: GenerationCefrLevel, value: number) => void;
  onChange: (patch: Partial<Pick<SelectionRow, "topicText" | "imageKind">>) => void;
  /** The server paints AI pictures; when not, a Describe Image row can only ask for charts. */
  pictureEnabled: boolean;
}

const parseCell = (raw: string): number => {
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) ? Math.min(Math.max(value, 0), GENERATION_CELL_MAX) : 0;
};

/** Own topics: an option a row rarely needs, kept out of the grid. */
const RowOptions = ({
  type,
  row,
  messages,
  onChange,
}: Pick<MatrixRowProps, "type" | "messages" | "onChange"> & { row: SelectionRow }): ReactElement => (
  <div className="px-3 pb-3">
    <Textarea
      id={`generation-matrix-${type.taskType}-topics`}
      label={messages.topicsLabel}
      rows={2}
      value={row.topicText}
      onChange={(event) => onChange({ topicText: event.target.value })}
    />
  </div>
);

/**
 * The picture kind of a Describe Image row, always in sight once the row has questions: it decides what the
 * questions look like. An AI picture can only be asked for while the server has them turned on.
 */
const ImageKindPicker = ({
  type,
  row,
  messages,
  pictureEnabled,
  onChange,
}: Pick<MatrixRowProps, "type" | "messages" | "pictureEnabled" | "onChange"> & {
  row: SelectionRow;
}): ReactElement => (
  <div className="w-full px-3 pb-3 md:w-72">
    <Select
      id={`generation-matrix-${type.taskType}-image`}
      label={messages.imageKindLabel}
      value={row.imageKind}
      helperText={pictureEnabled ? undefined : messages.imageKindPictureOff}
      options={GENERATION_IMAGE_KINDS.map((kind) => ({
        value: kind,
        label: messages[`imageKind${kind}`],
        disabled: kind === "PICTURE" && !pictureEnabled,
      }))}
      // The options are exactly the image kinds, so the chosen value is one of them.
      onChange={(event) => onChange({ imageKind: event.target.value as QuestionGenerationImageKind })}
    />
  </div>
);

/** One task type: a number per CEFR level, the row total and, once it has questions, its options menu. */
export const GenerationMatrixRow = ({
  type,
  row,
  messages,
  onCellChange,
  onChange,
  pictureEnabled,
}: MatrixRowProps): ReactElement => {
  const [isOptionsOpen, setOptionsOpen] = useState(false);
  const name = taskTypeLabel(type.taskType);
  const total = row ? rowTotal(row) : 0;
  return (
    <div className="border-t border-[var(--shell-border)]">
      <div className={cn(MATRIX_ROW_GRID, "px-3 py-1.5")}>
        <span
          className={cn(
            "truncate text-sm",
            total > 0 ? "font-medium text-[var(--ink-primary)]" : "text-[var(--ink-secondary)]",
          )}
        >
          {name}
        </span>
        {GENERATION_CEFR_LEVELS.map((level) => {
          const value = cellValue(row, level);
          return (
            <TableNumberInput
              key={level}
              width="sm"
              min={0}
              max={GENERATION_CELL_MAX}
              placeholder={MATRIX_EMPTY_CELL}
              aria-label={formatMessage(messages.matrixCellLabel, { taskType: name, level })}
              className={cn(
                "text-center",
                value > 0 && "border-[var(--brand)] bg-[var(--brand)]/10 font-semibold",
              )}
              value={value > 0 ? value : ""}
              onChange={(event) => onCellChange(level, parseCell(event.target.value))}
            />
          );
        })}
        <span className="text-right text-sm font-semibold tabular-nums">
          {total > 0 ? total : MATRIX_EMPTY_TOTAL}
        </span>
        {row ? (
          <ActionMenu
            label={messages.matrixRowOptions}
            items={[
              {
                label: messages.matrixRowOptions,
                icon: SlidersHorizontalIcon,
                onSelect: () => setOptionsOpen((open) => !open),
              },
            ]}
          />
        ) : (
          <span />
        )}
      </div>
      {row && type.taskType === DESCRIBE_IMAGE_TASK ? (
        <ImageKindPicker
          type={type}
          row={row}
          messages={messages}
          pictureEnabled={pictureEnabled}
          onChange={onChange}
        />
      ) : null}
      {row && isOptionsOpen ? (
        <RowOptions type={type} row={row} messages={messages} onChange={onChange} />
      ) : null}
    </div>
  );
};
