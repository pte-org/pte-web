"use client";

import type { ReactElement } from "react";
import { ActionMenu, Badge, ClipboardIcon, ClockIcon } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import {
  SCORE_TEMPLATE_ITEM_HEADERS as RAW_SCORE_TEMPLATE_ITEM_HEADERS,
  SCORE_TEMPLATE_ROW_TEXT as RAW_SCORE_TEMPLATE_ROW_TEXT,
  SCORE_TEMPLATE_SKILL_WEIGHT_FIELDS,
  SCORE_TEMPLATE_TEXT as RAW_SCORE_TEMPLATE_TEXT,
} from "../constants";
import type { ScoreTemplateItem, ScoreTemplateItemDraft } from "../types";

const COUNT_INPUT_CLASS =
  "w-14 rounded-md border border-[var(--control-border)] bg-[var(--surface-card)] px-2 py-1 text-sm text-[var(--ink-primary)] outline-none focus:border-[var(--brand)]";
const META_CELL_CLASS = "flex items-center gap-1.5 whitespace-nowrap text-sm text-[var(--ink-muted)]";
const MIN_COUNT_VALUE = 0;
const EMPTY_VALUE = "—";

export interface ScoreTemplateItemCellsProps {
  item: ScoreTemplateItem;
  skillLabels: Record<string, string>;
  /** Present only in the DRAFT editor; without it the cells are read-only. */
  onChange?: (field: keyof ScoreTemplateItemDraft, value: string) => void;
  onEditDetails?: () => void;
  onRemove?: () => void;
}

export function itemFieldValue(item: ScoreTemplateItem, field: keyof ScoreTemplateItemDraft): string {
  const value = item[field as keyof ScoreTemplateItem];
  return value === null || value === undefined ? "" : String(value);
}

/**
 * The cells of one task-type row, in the order of `SCORE_TEMPLATE_ROW_COLUMNS`:
 * title, timing, overall weight, skill weights, question count and (editor only) the
 * actions menu. One line per row, like the reference task list.
 */
export const ScoreTemplateItemCells = ({
  item,
  skillLabels,
  onChange,
  onEditDetails,
  onRemove,
}: ScoreTemplateItemCellsProps): ReactElement => {
  const H = useAdminCopy(RAW_SCORE_TEMPLATE_ITEM_HEADERS);
  const ROW = useAdminCopy(RAW_SCORE_TEMPLATE_ROW_TEXT);
  const T = useAdminCopy(RAW_SCORE_TEMPLATE_TEXT);
  const skillWeights = SCORE_TEMPLATE_SKILL_WEIGHT_FIELDS.map(({ section, field }) => ({
    section,
    value: itemFieldValue(item, field),
  })).filter(({ value }) => Number(value) !== 0);

  return (
    <>
      <p className="truncate text-base font-medium text-[var(--ink-primary)]">
        {item.taskTypeKey || item.taskType || EMPTY_VALUE}
      </p>
      <div className={META_CELL_CLASS} title={`${ROW.PREP} / ${ROW.RESPONSE}`}>
        <ClockIcon className="h-4 w-4 shrink-0" />
        <span>{`${itemFieldValue(item, "prepSeconds")}s · ${itemFieldValue(item, "responseSeconds")}s`}</span>
      </div>
      <div title={H.OVERALL_WEIGHT}>
        <Badge variant="info">{`${itemFieldValue(item, "overallWeight")}%`}</Badge>
      </div>
      <div className="flex flex-wrap gap-1.5" title={ROW.SKILL_WEIGHTS_HINT}>
        {skillWeights.length === 0 ? (
          <span className="text-sm text-[var(--ink-muted)]">{ROW.NO_SKILL_WEIGHT}</span>
        ) : (
          skillWeights.map(({ section, value }) => (
            <span
              key={section}
              className="rounded-full bg-[var(--surface-subtle)] px-2 py-0.5 text-xs text-[var(--ink-secondary)]"
            >
              {`${skillLabels[section] ?? section} ${value}`}
            </span>
          ))
        )}
      </div>
      {onChange ? (
        <div className={META_CELL_CLASS}>
          <input
            type="number"
            min={MIN_COUNT_VALUE}
            aria-label={H.MIN_COUNT}
            className={COUNT_INPUT_CLASS}
            value={itemFieldValue(item, "minCount")}
            onChange={(event) => onChange("minCount", event.target.value)}
          />
          <span aria-hidden="true">–</span>
          <input
            type="number"
            min={MIN_COUNT_VALUE}
            aria-label={H.MAX_COUNT}
            className={COUNT_INPUT_CLASS}
            value={itemFieldValue(item, "maxCount")}
            onChange={(event) => onChange("maxCount", event.target.value)}
          />
          <span>{ROW.QUESTIONS_SUFFIX}</span>
        </div>
      ) : (
        <div className={META_CELL_CLASS}>
          <ClipboardIcon className="h-4 w-4 shrink-0" />
          <span>
            {`${itemFieldValue(item, "minCount")} – ${itemFieldValue(item, "maxCount")} ${ROW.QUESTIONS_SUFFIX}`}
          </span>
        </div>
      )}
      {onChange && (
        <ActionMenu
          label={ROW.ACTIONS_LABEL}
          items={[
            { label: ROW.EDIT_DETAILS, onSelect: onEditDetails },
            { label: T.REMOVE_TYPE, onSelect: onRemove, danger: true },
          ]}
        />
      )}
    </>
  );
};
