"use client";

import { useState, type ReactElement } from "react";
import type { QuestionGenerationImageKind } from "@pte/api-client";
import { Button, Checkbox, Input, Select, Textarea } from "@pte/ui";
import { taskTypeLabel } from "../utils/taskTypeLabel";
import { DESCRIBE_IMAGE_TASK, GENERATION_IMAGE_KINDS } from "../constants";
import { GENERATION_CEFR_LEVELS, TASK_ROW_GRID } from "../dialogConstants";
import type { DialogMessages } from "../messages/dialog.en";
import type { SelectionRow } from "../utils/generationSelection";

interface TaskTypeRowProps {
  taskType: string;
  row: SelectionRow | undefined;
  messages: DialogMessages;
  onToggle: () => void;
  onChange: (patch: Partial<Omit<SelectionRow, "taskType" | "section">>) => void;
}

/** One line per task type: tick, then count / CEFR / picture kind inline; own topics open on demand. */
export const GenerationDialogTaskTypeRow = ({ taskType, row, messages, onToggle, onChange }: TaskTypeRowProps): ReactElement => {
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
              aria-label={messages.countLabel}
              value={Number.isFinite(row.count) ? row.count : ""}
              onChange={(event) => onChange({ count: Number.parseInt(event.target.value, 10) })}
            />
            <Select
              id={`${id}-cefr`}
              aria-label={messages.cefrLabel}
              value={row.cefrLevel}
              options={GENERATION_CEFR_LEVELS.map((level) => ({ value: level, label: level }))}
              onChange={(event) => onChange({ cefrLevel: event.target.value })}
            />
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
