"use client";

import { useState, type ReactElement } from "react";
import type { QuestionGenerationImageKind } from "@pte/api-client";
import { Button, Checkbox, Input, Select, Textarea } from "@pte/ui";
import { taskTypeLabel } from "../utils/taskTypeLabel";
import { DESCRIBE_IMAGE_TASK, GENERATION_IMAGE_KINDS } from "../constants";
import { TASK_ROW_GRID, type GenerationCefrLevel } from "../dialogConstants";
import { isSplitRow } from "../utils/generationCefr";
import { GenerationDialogCefrCell, GenerationDialogLevelSplit } from "./_GenerationDialogCefrCell";
import type { DialogMessages } from "../messages/dialog.en";
import type { SelectionRow } from "../utils/generationSelection";

interface TaskTypeRowProps {
  taskType: string;
  row: SelectionRow | undefined;
  messages: DialogMessages;
  onToggle: () => void;
  onChange: (patch: Partial<Omit<SelectionRow, "taskType" | "section">>) => void;
  onSplitChange: (split: boolean) => void;
  onLevelChange: (level: GenerationCefrLevel, value: number) => void;
}

/** One line per task type: tick, then count / CEFR / picture kind inline; own topics open on demand. */
export const GenerationDialogTaskTypeRow = ({ taskType, row, messages, onToggle, onChange, onSplitChange, onLevelChange }: TaskTypeRowProps): ReactElement => {
  const [isTopicsOpen, setTopicsOpen] = useState(false);
  const id = `generation-type-${taskType}`;
  const isDescribeImage = taskType === DESCRIBE_IMAGE_TASK;
  return (
    <div className={row ? "bg-[var(--surface-subtle)]" : undefined}>
      <div className={`${TASK_ROW_GRID} items-center px-3 py-2`}>
        <Checkbox id={id} label={taskTypeLabel(taskType)} checked={row !== undefined} onChange={onToggle} />
        {row ? (
          <>
            <Input
              id={`${id}-count`}
              type="number"
              min={1}
              // A split row's count is the sum of its levels, edited on the line below.
              readOnly={isSplitRow(row)}
              aria-label={messages.countLabel}
              value={Number.isFinite(row.count) ? row.count : ""}
              onChange={(event) => onChange({ count: Number.parseInt(event.target.value, 10) })}
            />
            <GenerationDialogCefrCell id={id} row={row} messages={messages}
              onCefrChange={(cefrLevel) => onChange({ cefrLevel })} onSplitChange={onSplitChange} />
            {isDescribeImage ? (
              <Select
                id={`${id}-image`}
                aria-label={messages.imageKindLabel}
                value={row.imageKind}
                options={GENERATION_IMAGE_KINDS.map((kind) => ({ value: kind, label: messages[`imageKind${kind}`] }))}
                // The options are exactly the image kinds, so the chosen value is one of them.
                onChange={(event) => onChange({ imageKind: event.target.value as QuestionGenerationImageKind })}
              />
            ) : (
              <span />
            )}
            <Button variant="ghost" size="sm" onClick={() => setTopicsOpen((open) => !open)}>
              {isTopicsOpen ? messages.topicsHide : messages.topicsShow}
            </Button>
          </>
        ) : null}
      </div>
      {row ? <GenerationDialogLevelSplit id={id} row={row} messages={messages} onLevelChange={onLevelChange} /> : null}
      {row && isTopicsOpen ? (
        <div className="px-3 pb-3">
          <Textarea
            id={`${id}-topics`}
            aria-label={messages.topicsLabel}
            placeholder={messages.topicsLabel}
            rows={2}
            value={row.topicText}
            onChange={(event) => onChange({ topicText: event.target.value })}
          />
        </div>
      ) : null}
    </div>
  );
};
