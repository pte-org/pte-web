"use client";

import { useState, type ReactElement } from "react";
import { Button, DataTable, Select, Tabs, type DataTableColumn, type TabItem } from "@pte/ui";
import type { QuestionTypeResponse } from "@pte/api-client";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import {
  SCORE_TEMPLATE_ITEM_HEADERS as RAW_SCORE_TEMPLATE_ITEM_HEADERS,
  SCORE_TEMPLATE_TEXT as RAW_SCORE_TEMPLATE_TEXT,
} from "../constants";
import type { ScoreTemplateItemDraft, ScoreTemplateItemResponse } from "../types";

const INPUT_CLASS =
  "w-20 rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-blue-500";

const RAW_SECTION_OPTIONS = [
  { value: "SPEAKING", label: "Speaking" },
  { value: "WRITING", label: "Writing" },
  { value: "READING", label: "Reading" },
  { value: "LISTENING", label: "Listening" },
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
type ScoreTemplateItemRowsProps = ScoreTemplateItemTableProps & { section: string };
type ScoreTemplateItem = ScoreTemplateItemDraft | ScoreTemplateItemResponse;
type ScoreTemplateTableRow = { item: ScoreTemplateItem; index: number };

function fieldValue(item: ScoreTemplateItem, field: keyof ScoreTemplateItemDraft): string {
  const value = item[field as keyof ScoreTemplateItem];
  return value === null || value === undefined ? "" : String(value);
}

const ALL_SECTIONS_TAB = "ALL";

/** Rows of the shared table, narrowed to one section while keeping each row's
 * index in the full item list so the editable callbacks still target the right item. */
const ScoreTemplateItemRows = (props: ScoreTemplateItemRowsProps): ReactElement => {
  const SCORE_TEMPLATE_ITEM_HEADERS = useAdminCopy(RAW_SCORE_TEMPLATE_ITEM_HEADERS);
  const SCORE_TEMPLATE_TEXT = useAdminCopy(RAW_SCORE_TEMPLATE_TEXT);
  const SECTION_OPTIONS = useAdminCopy(RAW_SECTION_OPTIONS);
  const sectionLabels = useAdminCopy({
    SPEAKING: "Speaking",
    WRITING: "Writing",
    READING: "Reading",
    LISTENING: "Listening",
  });
  const getSectionLabel = (section: string): string =>
    sectionLabels[section as keyof typeof sectionLabels] ?? section;
  const emptyTitle = useAdminCopy("No score template items");
  const numericFields: { field: keyof ScoreTemplateItemDraft; header: string }[] = [
    { field: "minCount", header: SCORE_TEMPLATE_ITEM_HEADERS.MIN_COUNT },
    { field: "maxCount", header: SCORE_TEMPLATE_ITEM_HEADERS.MAX_COUNT },
    { field: "prepSeconds", header: SCORE_TEMPLATE_ITEM_HEADERS.PREP_SECONDS },
    { field: "responseSeconds", header: SCORE_TEMPLATE_ITEM_HEADERS.RESPONSE_SECONDS },
    { field: "speakingWeight", header: SCORE_TEMPLATE_ITEM_HEADERS.SPEAKING_WEIGHT },
    { field: "writingWeight", header: SCORE_TEMPLATE_ITEM_HEADERS.WRITING_WEIGHT },
    { field: "readingWeight", header: SCORE_TEMPLATE_ITEM_HEADERS.READING_WEIGHT },
    { field: "listeningWeight", header: SCORE_TEMPLATE_ITEM_HEADERS.LISTENING_WEIGHT },
  ];
  const rows: ScoreTemplateTableRow[] = props.items
    .map((item, index) => ({ item, index }))
    .filter((row) => props.section === ALL_SECTIONS_TAB || row.item.section === props.section);
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
      filterAccessor: (row) => row.item.section,
      cell: (row) => {
        if (!props.editable) return getSectionLabel(row.item.section);
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
          return (
            <span className="font-mono text-xs">{item.taskTypeKey ?? item.taskType ?? "—"}</span>
          );
        }

        const item = row.item as ScoreTemplateItemDraft;
        return (
          <div className="flex items-center gap-2">
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
    ...numericFields.slice(0, 4).map(({ field, header }) => ({
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
    ...numericFields.slice(4).map(({ field, header }) => ({
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
      showSearch={false}
      columns={columns}
      rows={rows}
      getRowKey={(row) => `${row.item.taskTypeKey}-${row.index}`}
      emptyTitle={emptyTitle}
      tableClassName="min-w-[1100px]"
    />
  );
};

/** Shared table for the read-only detail view and the DRAFT editor. Both use
 * the common DataTable shell and responsive rules, with the common Tabs to split
 * the items by skill; only the editable cell controls differ. */
export const ScoreTemplateItemTable = (props: ScoreTemplateItemTableProps): ReactElement => {
  const [activeSection, setActiveSection] = useState(ALL_SECTIONS_TAB);
  const sectionOptions = useAdminCopy(RAW_SECTION_OPTIONS);
  const allSectionsLabel = useAdminCopy("All sections");
  const tabItems: TabItem[] = [
    { id: ALL_SECTIONS_TAB, label: allSectionsLabel, count: props.items.length },
    ...sectionOptions.map((option) => ({
      id: option.value,
      label: option.label,
      count: props.items.filter((item) => item.section === option.value).length,
    })),
  ];

  return (
    <div className="space-y-4">
      <Tabs
        id="score-template-section-tabs"
        items={tabItems}
        value={activeSection}
        onChange={setActiveSection}
        variant="default"
      />
      {/* key resets the table's own page/sort state when the skill tab changes */}
      <ScoreTemplateItemRows key={activeSection} {...props} section={activeSection} />
    </div>
  );
};
