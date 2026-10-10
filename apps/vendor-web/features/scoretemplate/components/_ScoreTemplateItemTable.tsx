"use client";

import type { ReactElement } from "react";
import { Button, DataTable, Select, type DataTableColumn } from "@pte/ui";
import type { QuestionTypeResponse } from "@pte/api-client";
import { SCORE_TEMPLATE_ITEM_HEADERS, SCORE_TEMPLATE_TEXT } from "../constants";
import type { ScoreTemplateItemDraft, ScoreTemplateItemResponse } from "../types";

const INPUT_CLASS =
  "w-20 rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-blue-500";

const SECTION_OPTIONS = [
  { value: "SPEAKING", label: "SPEAKING" },
  { value: "WRITING", label: "WRITING" },
  { value: "READING", label: "READING" },
  { value: "LISTENING", label: "LISTENING" },
];

type ReadOnlyProps = {
  editable: false;
  items: ScoreTemplateItemResponse[];
};

type EditableProps = {
  editable: true;
  items: ScoreTemplateItemDraft[];
  questionTypes: QuestionTypeResponse[];
  onChange: (index: number, field: keyof ScoreTemplateItemDraft, value: string) => void;
  onSectionChange: (index: number, section: string) => void;
  onRemove: (index: number) => void;
};

type ScoreTemplateItemTableProps = ReadOnlyProps | EditableProps;
type ScoreTemplateItem = ScoreTemplateItemDraft | ScoreTemplateItemResponse;
type ScoreTemplateTableRow = { item: ScoreTemplateItem; index: number };

// overallWeight is deliberately not here — it is backend-derived and stays a
// read-only cell in the editor. The other numeric fields are editable drafts.
const NUMERIC_FIELDS: { field: keyof ScoreTemplateItemDraft; header: string }[] = [
  { field: "minCount", header: SCORE_TEMPLATE_ITEM_HEADERS.MIN_COUNT },
  { field: "maxCount", header: SCORE_TEMPLATE_ITEM_HEADERS.MAX_COUNT },
  { field: "prepSeconds", header: SCORE_TEMPLATE_ITEM_HEADERS.PREP_SECONDS },
  { field: "responseSeconds", header: SCORE_TEMPLATE_ITEM_HEADERS.RESPONSE_SECONDS },
  { field: "speakingWeight", header: SCORE_TEMPLATE_ITEM_HEADERS.SPEAKING_WEIGHT },
  { field: "writingWeight", header: SCORE_TEMPLATE_ITEM_HEADERS.WRITING_WEIGHT },
  { field: "readingWeight", header: SCORE_TEMPLATE_ITEM_HEADERS.READING_WEIGHT },
  { field: "listeningWeight", header: SCORE_TEMPLATE_ITEM_HEADERS.LISTENING_WEIGHT },
];

function fieldValue(item: ScoreTemplateItem, field: keyof ScoreTemplateItemDraft): string {
  const value = item[field as keyof ScoreTemplateItem];
  return value === null || value === undefined ? "" : String(value);
}

/** Shared table for the read-only detail view and the DRAFT editor. Both use
 * the common DataTable shell, search, per-column filters and responsive rules;
 * only the editable cell controls differ. */
export const ScoreTemplateItemTable = (props: ScoreTemplateItemTableProps): ReactElement => {
  const rows: ScoreTemplateTableRow[] = props.items.map((item, index) => ({ item, index }));
  const columns: DataTableColumn<ScoreTemplateTableRow>[] = [
    {
      key: "sequence",
      header: SCORE_TEMPLATE_ITEM_HEADERS.SEQUENCE,
      filterAccessor: (row) => row.item.sequence,
      cell: (row) => row.item.sequence,
    },
    {
      key: "section",
      header: SCORE_TEMPLATE_ITEM_HEADERS.SECTION,
      filterOptions: [{ value: "", label: "All sections" }, ...SECTION_OPTIONS],
      filterAccessor: (row) => row.item.section,
      cell: (row) => {
        if (!props.editable) return row.item.section;
        const item = row.item as ScoreTemplateItemDraft;
        return (
          <Select
            value={item.section}
            onChange={(event) => props.onSectionChange(row.index, event.target.value)}
            placeholder={SCORE_TEMPLATE_TEXT.ADD_SECTION_PLACEHOLDER}
            options={SECTION_OPTIONS}
          />
        );
      },
    },
    {
      key: "taskType",
      header: SCORE_TEMPLATE_ITEM_HEADERS.TASK_TYPE,
      filterAccessor: (row) => row.item.taskTypeKey || row.item.taskType || "",
      cell: (row) => {
        if (!props.editable) {
          const item = row.item as ScoreTemplateItemResponse;
          return <span className="font-mono text-xs">{item.taskTypeKey ?? item.taskType ?? "—"}</span>;
        }

        const item = row.item as ScoreTemplateItemDraft;
        return (
          <div className="flex flex-col items-start gap-1">
            <Select
              value={item.taskTypeKey}
              disabled={!item.section}
              onChange={(event) => props.onChange(row.index, "taskTypeKey", event.target.value)}
              placeholder={SCORE_TEMPLATE_TEXT.ADD_TYPE_PLACEHOLDER}
              options={[
                ...props.questionTypes
                  .filter((type) => type.active && type.section === item.section)
                  .map((type) => ({
                    value: type.taskTypeKey ?? type.code,
                    label: type.taskTypeKey ?? type.code,
                  })),
                ...(item.taskTypeKey &&
                !props.questionTypes.some(
                  (type) => (type.taskTypeKey ?? type.code) === item.taskTypeKey,
                )
                  ? [{ value: item.taskTypeKey, label: item.taskTypeKey }]
                  : []),
              ]}
            />
            <Button variant="ghost" size="sm" onClick={() => props.onRemove(row.index)}>
              {SCORE_TEMPLATE_TEXT.REMOVE_TYPE}
            </Button>
          </div>
        );
      },
    },
    ...NUMERIC_FIELDS.slice(0, 4).map(({ field, header }) => ({
      key: field,
      header,
      filterAccessor: (row: ScoreTemplateTableRow) => fieldValue(row.item, field),
      cell: (row: ScoreTemplateTableRow) =>
        props.editable ? (
          <input
            type="number"
            className={INPUT_CLASS}
            value={fieldValue(row.item, field)}
            onChange={(event) => props.onChange(row.index, field, event.target.value)}
          />
        ) : (
          fieldValue(row.item, field)
        ),
    })),
    {
      key: "overallWeight",
      header: SCORE_TEMPLATE_ITEM_HEADERS.OVERALL_WEIGHT,
      filterAccessor: (row) => fieldValue(row.item, "overallWeight"),
      cell: (row) => fieldValue(row.item, "overallWeight"),
    },
    ...NUMERIC_FIELDS.slice(4).map(({ field, header }) => ({
      key: field,
      header,
      filterAccessor: (row: ScoreTemplateTableRow) => fieldValue(row.item, field),
      cell: (row: ScoreTemplateTableRow) =>
        props.editable ? (
          <input
            type="number"
            step="0.01"
            className={INPUT_CLASS}
            value={fieldValue(row.item, field)}
            onChange={(event) => props.onChange(row.index, field, event.target.value)}
          />
        ) : (
          fieldValue(row.item, field)
        ),
    })),
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowKey={(row) => `${row.item.taskTypeKey}-${row.index}`}
      emptyTitle="No score template items"
      tableClassName="min-w-[1100px]"
    />
  );
};
