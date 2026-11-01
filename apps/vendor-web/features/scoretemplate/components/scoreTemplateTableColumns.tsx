import { Fragment, type ReactElement } from "react";
import { Badge, type DataTableColumn } from "@pte/ui";
import type { SCORE_TEMPLATE_ITEM_HEADERS } from "../constants";
import type { PoolSlot } from "../poolAvailability";
import { SKILL_WEIGHT_REQUIRED_TOTAL } from "../skillWeightTotals";
import type { ScoreTemplateItem, ScoreTemplateItemDraft } from "../types";

/**
 * The item table has too many fields for one row, so it shows one of two views of the same
 * rows: the structure of the exam (counts and timing) or how the skills are weighted.
 */
export type ScoreTemplateTableView = "STRUCTURE" | "WEIGHTS";

/** An item with its position in the full list, which the editor callbacks address. */
export type ScoreTemplateTableRow = { item: ScoreTemplateItem; index: number };

type ItemHeaders = Record<keyof typeof SCORE_TEMPLATE_ITEM_HEADERS, string>;

// The spin buttons are dropped: they take about 15px of a field that is only 56 to 64px wide
// and clip the last digit of a value like 15.84. The arrow keys still step the value.
const INPUT_BASE_CLASS =
  "rounded-md border border-[var(--control-border)] bg-[var(--surface-card)] px-2 py-1 text-sm text-[var(--ink-primary)] outline-none focus:border-[var(--brand)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";
const WEIGHT_INPUT_CLASS = `w-16 ${INPUT_BASE_CLASS}`;
const PAIR_INPUT_CLASS = `w-14 ${INPUT_BASE_CLASS}`;
const WEIGHT_STEP = "0.01";

/** A SNAKE_CASE key with a line-break opportunity after each underscore. */
const WrappableKey = ({ value }: { value: string }): ReactElement => {
  const parts = value.split("_");
  return (
    <>
      {parts.map((part, index) => (
        // The parts are positional pieces of one string, never reordered.
        <Fragment key={`${index}-${part}`}>
          {part}
          {index < parts.length - 1 && (
            <>
              _<wbr />
            </>
          )}
        </Fragment>
      ))}
    </>
  );
};

export function fieldValue(item: ScoreTemplateItem, field: keyof ScoreTemplateItemDraft): string {
  const value = item[field as keyof ScoreTemplateItem];
  return value === null || value === undefined ? "" : String(value);
}

export interface ScoreTemplateColumnOptions {
  view: ScoreTemplateTableView;
  /** The skill tabs already group the rows, so the section only needs to be shown under "All". */
  showSection: boolean;
  headers: ItemHeaders;
  poolCopy: { ok: string; short: string };
  getSectionLabel: (section: string) => string;
  /** Approved-question coverage per task type; the column is left out when omitted. */
  pool?: ReadonlyMap<string, PoolSlot>;
  /**
   * Skill weight columns that do not total 100 (field name to current total); each shows
   * "total / 100" beside its header. A column that is fine shows nothing extra.
   */
  weightMismatches?: ReadonlyMap<string, number>;
  /** Present only in the DRAFT editor: the numeric cells then become inputs. */
  onChange?: (index: number, field: keyof ScoreTemplateItemDraft, value: string) => void;
}

/** Columns of the item table for one view. Every column is unsortable: the order is the template's. */
export function buildScoreTemplateColumns({
  view,
  showSection,
  headers,
  poolCopy,
  getSectionLabel,
  pool,
  weightMismatches,
  onChange,
}: ScoreTemplateColumnOptions): DataTableColumn<ScoreTemplateTableRow>[] {
  const numberInput = (
    row: ScoreTemplateTableRow,
    field: keyof ScoreTemplateItemDraft,
    label: string,
    className: string,
    step?: string,
  ): ReactElement | null =>
    onChange ? (
      <input
        type="number"
        step={step}
        aria-label={label}
        className={className}
        value={fieldValue(row.item, field)}
        onChange={(event) => onChange(row.index, field, event.target.value)}
      />
    ) : null;

  /** Two related values in one cell: a pair of inputs in the editor, plain text otherwise. */
  const pairColumn = (
    key: string,
    header: string,
    first: { field: keyof ScoreTemplateItemDraft; label: string },
    second: { field: keyof ScoreTemplateItemDraft; label: string },
    separator: string,
  ): DataTableColumn<ScoreTemplateTableRow> => ({
    key,
    header,
    sortable: false,
    cell: (row) =>
      onChange ? (
        <div className="flex items-center gap-1.5">
          {numberInput(row, first.field, first.label, PAIR_INPUT_CLASS)}
          <span aria-hidden="true">{separator}</span>
          {numberInput(row, second.field, second.label, PAIR_INPUT_CLASS)}
        </div>
      ) : (
        `${fieldValue(row.item, first.field)} ${separator} ${fieldValue(row.item, second.field)}`
      ),
  });

  const weightColumn = (
    field: keyof ScoreTemplateItemDraft,
    header: string,
  ): DataTableColumn<ScoreTemplateTableRow> => {
    const mismatch = weightMismatches?.get(field);
    return {
      key: field,
      label: header,
      header:
        mismatch === undefined ? (
          header
        ) : (
          <>
            {header}{" "}
            <span className="whitespace-nowrap font-semibold text-[color-mix(in_srgb,var(--blush-action),#ff0000_40%)]">
              {`${mismatch} / ${SKILL_WEIGHT_REQUIRED_TOTAL}`}
            </span>
          </>
        ),
      sortable: false,
      cell: (row) =>
        numberInput(row, field, header, WEIGHT_INPUT_CLASS, WEIGHT_STEP) ?? fieldValue(row.item, field),
    };
  };

  const poolColumn: DataTableColumn<ScoreTemplateTableRow> | null = pool
    ? {
        key: "pool",
        header: headers.POOL,
        sortable: false,
        cell: (row) => {
          const slot = pool.get(row.item.taskTypeKey || row.item.taskType || "");
          if (!slot) return null;
          const title = slot.ready
            ? poolCopy.ok
            : poolCopy.short
                .replace("{available}", String(slot.available))
                .replace("{required}", String(slot.required));
          return (
            <span title={title}>
              <Badge variant={slot.ready ? "success" : "danger"}>
                {`${slot.available}/${slot.required}`}
              </Badge>
            </span>
          );
        },
      }
    : null;

  // The section is a muted second line of the task type cell rather than a column of its own:
  // a column is worth about a hundred pixels, which is what makes a narrow table scroll.
  const leadingColumns: DataTableColumn<ScoreTemplateTableRow>[] = [
    {
      key: "taskType",
      header: headers.TASK_TYPE,
      sortable: false,
      cell: (row) => (
        <div className="min-w-0">
          {/* A long key wraps after an underscore first; `anywhere` only lets it break inside a
              word when even that does not fit, so it never forces the column wide. */}
          <span className="block font-mono text-xs [overflow-wrap:anywhere]">
            <WrappableKey value={row.item.taskTypeKey || row.item.taskType || "—"} />
          </span>
          {showSection && (
            <span className="block text-xs text-[var(--ink-muted)]">
              {getSectionLabel(row.item.section)}
            </span>
          )}
        </div>
      ),
    },
  ];

  if (view === "WEIGHTS") {
    return [
      ...leadingColumns,
      {
        key: "overallWeight",
        header: headers.OVERALL_WEIGHT,
        sortable: false,
        cell: (row) => fieldValue(row.item, "overallWeight"),
      },
      weightColumn("speakingWeight", headers.SPEAKING_WEIGHT),
      weightColumn("writingWeight", headers.WRITING_WEIGHT),
      weightColumn("readingWeight", headers.READING_WEIGHT),
      weightColumn("listeningWeight", headers.LISTENING_WEIGHT),
    ];
  }

  return [
    ...leadingColumns,
    pairColumn(
      "questionCount",
      headers.QUESTION_COUNT,
      { field: "minCount", label: headers.MIN_COUNT },
      { field: "maxCount", label: headers.MAX_COUNT },
      "–",
    ),
    ...(poolColumn ? [poolColumn] : []),
    pairColumn(
      "timing",
      headers.TIME_SECONDS,
      { field: "prepSeconds", label: headers.PREP_SECONDS },
      { field: "responseSeconds", label: headers.RESPONSE_SECONDS },
      "/",
    ),
  ];
}
