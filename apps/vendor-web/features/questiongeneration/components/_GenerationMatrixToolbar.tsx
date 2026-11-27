"use client";

import { useState, type ReactElement } from "react";
import type { QuestionGenerationPreset } from "@pte/api-client";
import { Alert, Button, cn, TableNumberInput } from "@pte/ui";
import {
  GENERATION_CELL_MAX,
  GENERATION_FILL_EACH_COUNT,
  GENERATION_SECTIONS,
} from "../dialogConstants";
import type { GenerationSelectionState } from "../hooks/useGenerationSelection";
import type { DialogMessages } from "../messages/dialog.en";
import { formatMessage } from "../messages/useDialogMessages";
import { isFillEachActive, type MatrixTaskType } from "../utils/generationMatrix";
import {
  isPresetActive,
  type GenerationSelection,
  type PresetKind,
} from "../utils/generationSelection";
import type { CefrShare } from "../utils/generationMix";

interface MatrixToolbarProps {
  taskTypes: readonly MatrixTaskType[];
  presets: readonly QuestionGenerationPreset[];
  /** The active template's CEFR mix, which the "full exam" preset spreads its questions over. */
  shares: readonly CefrShare[];
  supported: ReadonlySet<string>;
  cap: number;
  last: GenerationSelection | null;
  state: GenerationSelectionState;
  messages: DialogMessages;
}

/** A whole count from 1 to the cell maximum, or null (empty, zero, negative, too large). */
function parsePerType(text: string): number | null {
  const value = Number(text);
  return text.trim() !== "" && Number.isInteger(value) && value >= 1 && value <= GENERATION_CELL_MAX
    ? value
    : null;
}

/** Shortcuts that fill the matrix in one click; every one of them can be undone. */
export const GenerationMatrixToolbar = ({
  taskTypes,
  presets,
  shares,
  supported,
  cap,
  last,
  state,
  messages,
}: MatrixToolbarProps): ReactElement => {
  const presetKinds: PresetKind[] =
    presets.length === 0
      ? []
      : [
          "FULL",
          ...GENERATION_SECTIONS.filter((section) =>
            presets.some((preset) => preset.section === section),
          ),
        ];
  // Typed freely (it can be cleared); applied only when the button is clicked, never while typing.
  const [perTypeText, setPerTypeText] = useState(String(GENERATION_FILL_EACH_COUNT));
  const perType = parsePerType(perTypeText);
  const fillEachActive = perType !== null && isFillEachActive(state.selection, taskTypes, perType);
  const presetLabel = (kind: PresetKind): string =>
    kind === "FULL" ? messages.presetFull : messages[`preset${kind}`];
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-[var(--ink-muted)]">{messages.matrixStartFrom}</span>
        <Button
          size="sm"
          variant="secondary"
          disabled={!last}
          onClick={() => last && state.restore(last)}
        >
          {messages.matrixSameAsLast}
        </Button>
        <span className="flex items-center gap-1">
          <Button
            size="sm"
            variant={fillEachActive ? "primary" : "secondary"}
            aria-pressed={fillEachActive}
            disabled={perType === null}
            onClick={() => {
              // Like the presets: a second click on the active shortcut takes it back off.
              if (fillEachActive) state.clear();
              else if (perType !== null) state.fillEach(taskTypes, perType, cap);
            }}
          >
            {formatMessage(messages.matrixFillEach, { count: perType ?? perTypeText })}
          </Button>
          <TableNumberInput
            width="sm"
            min={1}
            max={GENERATION_CELL_MAX}
            aria-label={messages.matrixFillEachCount}
            aria-invalid={perType === null || undefined}
            className={cn("text-center", perType === null && "border-[var(--blush-action)]")}
            value={perTypeText}
            onChange={(event) => setPerTypeText(event.target.value)}
          />
        </span>
        {presetKinds.map((kind) => {
          const active = isPresetActive(state.selection, presets, kind, supported);
          return (
            <Button
              key={kind}
              size="sm"
              variant={active ? "primary" : "secondary"}
              aria-pressed={active}
              onClick={() => state.preset(kind, presets, cap, supported, shares)}
            >
              {presetLabel(kind)}
            </Button>
          );
        })}
        <span className="ml-auto flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            disabled={state.selection.rows.length === 0}
            onClick={state.clear}
          >
            {messages.matrixClear}
          </Button>
          <Button size="sm" variant="ghost" disabled={!state.canUndo} onClick={state.undo}>
            {messages.matrixUndo}
          </Button>
        </span>
      </div>
      {state.overCapTotal !== null ? (
        <Alert tone="warning">
          {formatMessage(messages.presetOverCap, { total: state.overCapTotal, cap })}
        </Alert>
      ) : null}
    </div>
  );
};
