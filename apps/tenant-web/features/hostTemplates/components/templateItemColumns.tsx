import type { ReactNode } from "react";
import type { ScoreTemplateItemRequest } from "@pte/api-client";
import { Button, Chip, TrashIcon, type DataTableColumn } from "@pte/ui";
import { sectionTone } from "@/lib/chipTones";
import { SKILLS } from "../constants";
import type { PoolSlot } from "../utils/pool";
import { WEIGHT_FIELD } from "../utils/weights";

export type TemplateTableView = "STRUCTURE" | "WEIGHTS";
type Skill = (typeof SKILLS)[number];

const WEIGHT_INPUT_CLASS =
  "w-20 rounded border border-[var(--control-border)] bg-[var(--surface-card)] px-2 py-1 text-sm text-[var(--ink-primary)] outline-none focus:border-[var(--action)] disabled:bg-transparent disabled:border-transparent";

/** Number columns stay narrow so the leading task type column takes the slack instead of spreading them apart. */
const STRUCTURE_COLUMN_CLASS = "w-44";
const WEIGHT_COLUMN_CLASS = "w-32";

const compactColumns = <TRow,>(
  columns: DataTableColumn<TRow>[],
  widthClass: string,
): DataTableColumn<TRow>[] =>
  columns.map((column, index) =>
    index === 0 ? column : { ...column, headerClassName: widthClass, cellClassName: widthClass },
  );

interface ColumnOptions {
  view: TemplateTableView;
  /** Name each row's section as a chip, which the "All" tab needs and a single skill's tab does not. */
  showSection: boolean;
  editable: boolean;
  headers: { task: string; count: string; pool: string; prep: string; response: string };
  skillLabels: Record<Skill, string>;
  sectionLabel: (section: string) => string;
  pool?: ReadonlyMap<string, PoolSlot>;
  poolCopy: { ok: string; short: string };
  weightLockedText: string;
  isWeightLocked: (taskTypeKey: string, skill: Skill) => boolean;
  onWeightChange: (taskTypeKey: string, skill: Skill, value: number) => void;
  removeLabel: string;
  onRemove: (taskTypeKey: string) => void;
}

const poolChip = (slot: PoolSlot | undefined, copy: { ok: string; short: string }): ReactNode => {
  if (!slot) return null;
  const title = slot.ready
    ? copy.ok
    : copy.short
        .replace("{available}", String(slot.available))
        .replace("{required}", String(slot.required));
  return (
    <span title={title}>
      <Chip tone={slot.ready ? "mint" : "blush"} size="sm">
        {slot.available}/{slot.required}
      </Chip>
    </span>
  );
};

/** Columns of the template table: the exam structure (counts, stock) or the weights of every skill. */
export const buildTemplateColumns = (
  options: ColumnOptions,
): DataTableColumn<ScoreTemplateItemRequest>[] => {
  const task: DataTableColumn<ScoreTemplateItemRequest> = {
    key: "task",
    label: options.headers.task,
    header: options.headers.task,
    cell: (item) => (
      <div className="min-w-0">
        <span className="block font-mono text-xs [overflow-wrap:anywhere]">{item.taskTypeKey}</span>
        {options.showSection && (
          <Chip tone={sectionTone(item.section)} size="sm">
            {options.sectionLabel(item.section)}
          </Chip>
        )}
      </div>
    ),
  };
  if (options.view === "WEIGHTS") {
    const weights = SKILLS.map((skill): DataTableColumn<ScoreTemplateItemRequest> => ({
      key: skill,
      label: options.skillLabels[skill],
      header: options.skillLabels[skill],
      cell: (item) => {
        const locked = options.isWeightLocked(item.taskTypeKey, skill);
        return (
          // The tooltip sits on a wrapper: a disabled input does not reliably show its own title.
          <span title={locked ? options.weightLockedText : undefined}>
            <input
              type="number"
              min={0}
              max={100}
              step="0.01"
              disabled={!options.editable || locked}
              aria-label={`${item.taskTypeKey} ${options.skillLabels[skill]}`}
              className={WEIGHT_INPUT_CLASS}
              value={item[WEIGHT_FIELD[skill]]}
              onChange={(event) => {
                const parsed = Number(event.target.value);
                options.onWeightChange(
                  item.taskTypeKey,
                  skill,
                  Number.isFinite(parsed) && parsed >= 0 ? parsed : 0,
                );
              }}
            />
          </span>
        );
      },
    }));
    return compactColumns([task, ...weights], WEIGHT_COLUMN_CLASS);
  }
  const structure: DataTableColumn<ScoreTemplateItemRequest>[] = [
    task,
    {
      key: "count",
      label: options.headers.count,
      header: options.headers.count,
      cell: (item) =>
        item.minCount === item.maxCount ? item.maxCount : `${item.minCount}–${item.maxCount}`,
    },
    {
      key: "prepSeconds",
      label: options.headers.prep,
      header: options.headers.prep,
      cell: (item) => item.prepSeconds,
    },
    {
      key: "responseSeconds",
      label: options.headers.response,
      header: options.headers.response,
      cell: (item) => item.responseSeconds,
    },
  ];
  if (options.pool) {
    const pool = options.pool;
    structure.push({
      key: "pool",
      label: options.headers.pool,
      header: options.headers.pool,
      cell: (item) => poolChip(pool.get(item.taskTypeKey), options.poolCopy),
    });
  }
  return compactColumns(structure, STRUCTURE_COLUMN_CLASS);
};

/** The trash button at the end of a row; hosts remove a task type in one click. */
export const removeRowButton = (
  options: Pick<ColumnOptions, "removeLabel" | "onRemove">,
  item: ScoreTemplateItemRequest,
): ReactNode => (
  <Button
    variant="danger"
    appearance="ghost"
    size="sm"
    iconOnly
    aria-label={options.removeLabel}
    onClick={() => options.onRemove(item.taskTypeKey)}
  >
    <TrashIcon className="h-4 w-4" />
  </Button>
);
