"use client";

import type { ReactElement } from "react";
import { Alert, Button, cn } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import type { ScoreTemplateItemDraft } from "@/features/scoretemplate/types";
import {
  EXAM_STUDIO_TEXT,
  SECONDS_PER_MINUTE,
  STUDIO_MAX_COUNT_LIMIT,
  STUDIO_PREP_OPTIONS_SECONDS,
  STUDIO_RESPONSE_OPTIONS_SECONDS,
} from "../constants";
import {
  withMaxCount,
  withSeconds,
  withTaskType,
} from "../editTemplateItems";
import type { StudioTile } from "../types";

interface TemplateSectionProps {
  tile: StudioTile;
  editable: boolean;
  isSaving: boolean;
  onEdit: (change: (items: ScoreTemplateItemDraft[]) => ScoreTemplateItemDraft[]) => void;
}

const formatSeconds = (seconds: number): string =>
  seconds >= SECONDS_PER_MINUTE
    ? `${Math.floor(seconds / SECONDS_PER_MINUTE)}:${String(seconds % SECONDS_PER_MINUTE).padStart(2, "0")}`
    : `${seconds}s`;

const fill = (message: string, values: Record<string, number>): string =>
  Object.entries(values).reduce(
    (result, [name, value]) => result.replace(`{${name}}`, String(value)),
    message,
  );

interface SecondsChoiceProps {
  label: string;
  options: readonly number[];
  current: number;
  disabled: boolean;
  onPick: (seconds: number) => void;
}

const SecondsChoice = ({ label, options, current, disabled, onPick }: SecondsChoiceProps): ReactElement => (
  <div className="space-y-2">
    <p className="text-xs font-medium text-[var(--ink-secondary)]">{label}</p>
    <div className="flex flex-wrap gap-2">
      {options.map((seconds) => (
        <button
          key={seconds}
          type="button"
          disabled={disabled}
          aria-pressed={seconds === current}
          onClick={() => onPick(seconds)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs transition disabled:cursor-not-allowed disabled:opacity-60",
            seconds === current
              ? "border-[var(--brand)] bg-[var(--brand)] text-white"
              : "border-[var(--control-border)] bg-[var(--surface-card)] text-[var(--ink-secondary)]",
          )}
        >
          {formatSeconds(seconds)}
        </button>
      ))}
    </div>
  </div>
);

export const TemplateSection = ({ tile, editable, isSaving, onEdit }: TemplateSectionProps): ReactElement => {
  const text = useAdminCopy(EXAM_STUDIO_TEXT);
  const { item, key } = tile;
  const locked = !editable || isSaving;

  if (item === null) {
    return (
      <div className="space-y-3">
        <Alert tone="info">{text.IN_TEMPLATE_OFF}</Alert>
        <Button disabled={locked} onClick={() => onEdit((items) => withTaskType(items, tile.type))}>
          {text.ADD_TO_TEMPLATE}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-xs font-medium text-[var(--ink-secondary)]">{text.QUESTION_COUNT}</p>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            aria-label={text.DECREASE}
            disabled={locked || item.maxCount <= 1}
            onClick={() => onEdit((items) => withMaxCount(items, key, item.maxCount - 1))}
          >
            −
          </Button>
          <span className="w-8 text-center text-lg font-semibold text-[var(--ink-primary)]">{item.maxCount}</span>
          <Button
            variant="secondary"
            size="sm"
            aria-label={text.INCREASE}
            disabled={locked || item.maxCount >= STUDIO_MAX_COUNT_LIMIT}
            onClick={() => onEdit((items) => withMaxCount(items, key, item.maxCount + 1))}
          >
            +
          </Button>
          <span className="text-xs text-[var(--ink-muted)]">{fill(text.MIN_COUNT_NOTE, { count: item.minCount })}</span>
        </div>
        <Alert tone={tile.state === "ready" ? "success" : "warning"}>
          {tile.state === "ready"
            ? fill(text.POOL_ENOUGH, { available: tile.available })
            : fill(text.POOL_SHORT, { available: tile.available, missing: tile.required - tile.available })}
        </Alert>
      </div>
      {item.prepSeconds > 0 && (
        <SecondsChoice
          label={text.PREP_TIME}
          options={STUDIO_PREP_OPTIONS_SECONDS}
          current={item.prepSeconds}
          disabled={locked}
          onPick={(seconds) => onEdit((items) => withSeconds(items, key, "prepSeconds", seconds))}
        />
      )}
      <SecondsChoice
        label={text.RESPONSE_TIME}
        options={STUDIO_RESPONSE_OPTIONS_SECONDS}
        current={item.responseSeconds}
        disabled={locked}
        onPick={(seconds) => onEdit((items) => withSeconds(items, key, "responseSeconds", seconds))}
      />
    </div>
  );
};
