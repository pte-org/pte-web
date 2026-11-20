"use client";

import type { ReactElement } from "react";
import { Button, Input, Select } from "@pte/ui";
import { GENERATION_CEFR_LEVELS, type GenerationCefrLevel } from "../dialogConstants";
import type { DialogMessages } from "../messages/dialog.en";
import { isSplitRow } from "../utils/generationCefr";
import type { SelectionRow } from "../utils/generationSelection";

const CEFR_OPTIONS = GENERATION_CEFR_LEVELS.map((level) => ({ value: level, label: level }));

interface CefrCellProps {
  id: string;
  row: SelectionRow;
  messages: DialogMessages;
  onCefrChange: (cefrLevel: string) => void;
  onSplitChange: (split: boolean) => void;
}

/** The CEFR column: one level plus a quiet "Mixed levels" switch, or only "Single level" while split. */
export const GenerationDialogCefrCell = ({ id, row, messages, onCefrChange, onSplitChange }: CefrCellProps): ReactElement => {
  const split = isSplitRow(row);
  return (
    <div className="flex items-center gap-1">
      {split ? null : (
        <Select id={`${id}-cefr`} aria-label={messages.cefrLabel} value={row.cefrLevel} options={CEFR_OPTIONS}
          onChange={(event) => onCefrChange(event.target.value)} />
      )}
      <Button variant="ghost" size="sm" onClick={() => onSplitChange(!split)}>
        {split ? messages.singleLevel : messages.splitLevels}
      </Button>
    </div>
  );
};

interface LevelSplitProps {
  id: string;
  row: SelectionRow;
  messages: DialogMessages;
  onLevelChange: (level: GenerationCefrLevel, value: number) => void;
}

/** One quiet line under a split row: a small count per CEFR level. */
export const GenerationDialogLevelSplit = ({ id, row, messages, onLevelChange }: LevelSplitProps): ReactElement | null => {
  if (!isSplitRow(row)) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 pb-3 text-xs text-[var(--ink-muted)]">
      <span>{messages.splitLevelsHint}</span>
      {GENERATION_CEFR_LEVELS.map((level) => (
        <label key={level} htmlFor={`${id}-level-${level}`} className="flex items-center gap-1">
          <span>{level}</span>
          <span className="w-16">
            <Input id={`${id}-level-${level}`} type="number" min={0} value={row.levels[level]}
              onChange={(event) => onLevelChange(level, Number.parseInt(event.target.value, 10) || 0)} />
          </span>
        </label>
      ))}
    </div>
  );
};
