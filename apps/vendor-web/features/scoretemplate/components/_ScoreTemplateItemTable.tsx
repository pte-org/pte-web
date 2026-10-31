"use client";

import { useState, type ReactElement, type ReactNode } from "react";
import {
  Button,
  DashboardCard,
  DataTable,
  Tabs,
  cn,
  type DataTableColumn,
  type TabItem,
} from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import {
  EXAM_TEMPLATE_SECTIONS,
  SCORE_TEMPLATE_ALL_TAB,
  SCORE_TEMPLATE_ITEM_HEADERS as RAW_SCORE_TEMPLATE_ITEM_HEADERS,
  SCORE_TEMPLATE_ROW_TEXT as RAW_SCORE_TEMPLATE_ROW_TEXT,
  SCORE_TEMPLATE_SECTION_LABELS as RAW_SECTION_LABELS,
  SCORE_TEMPLATE_TEXT as RAW_SCORE_TEMPLATE_TEXT,
} from "../constants";
import type {
  ScoreTemplateItem,
  ScoreTemplateItemDraft,
  ScoreTemplateItemResponse,
} from "../types";

const TABS_ID = "score-template-section-tabs";
const INPUT_BASE_CLASS =
  "rounded-md border border-[var(--control-border)] bg-[var(--surface-card)] px-2 py-1 text-sm text-[var(--ink-primary)] outline-none focus:border-[var(--brand)]";
const INPUT_CLASS = `w-20 ${INPUT_BASE_CLASS}`;
const PAIR_INPUT_CLASS = `w-16 ${INPUT_BASE_CLASS}`;

type ReadOnlyProps = {
  editable: false;
  items: ScoreTemplateItemResponse[];
};

type EditableProps = {
  editable: true;
  items: ScoreTemplateItemDraft[];
  onChange: (index: number, field: keyof ScoreTemplateItemDraft, value: string) => void;
  onRemove: (index: number) => void;
  /** Task type keys of the rows shown, in the order the admin just dragged them into. */
  onReorder: (orderedTaskTypeKeys: string[]) => void;
  /** Rendered at the right of the table's toolbar; receives the current tab ("ALL" or a skill). */
  renderToolbarAction?: (activeTab: string) => ReactNode;
  /** Rendered in the empty state of a tab that has no rows yet, e.g. a button to add the first one. */
  renderEmptyAction?: (activeTab: string) => ReactNode;
};

type ScoreTemplateItemTableProps = (ReadOnlyProps | EditableProps) & {
  /** Shown under the skill tab rail, in the same side column (e.g. the template's details). */
  sidePanel?: ReactNode;
};
/** An item with its position in the full list, which the editor callbacks address. */
type ScoreTemplateTableRow = { item: ScoreTemplateItem; index: number };

function fieldValue(item: ScoreTemplateItem, field: keyof ScoreTemplateItemDraft): string {
  const value = item[field as keyof ScoreTemplateItem];
  return value === null || value === undefined ? "" : String(value);
}

/**
 * Task types of a score template: a vertical skill tab rail on the left and, on the right,
 * the selected skill's rows in the common DataTable ("All" lists every skill). Shared by the
 * read-only detail view and the DRAFT editor, where the numeric cells become inputs.
 */
export const ScoreTemplateItemTable = (props: ScoreTemplateItemTableProps): ReactElement => {
  const [activeTab, setActiveTab] = useState<string>(SCORE_TEMPLATE_ALL_TAB);
  const H = useAdminCopy(RAW_SCORE_TEMPLATE_ITEM_HEADERS);
  const T = useAdminCopy(RAW_SCORE_TEMPLATE_TEXT);
  const ROW = useAdminCopy(RAW_SCORE_TEMPLATE_ROW_TEXT);
  const sectionLabels = useAdminCopy(RAW_SECTION_LABELS);
  const allSectionsLabel = useAdminCopy("All sections");
  const emptyTitle = useAdminCopy("No score template items");
  const getSectionLabel = (section: string): string =>
    sectionLabels[section as keyof typeof sectionLabels] ?? section;

  const allRows: ScoreTemplateTableRow[] = props.items.map((item, index) => ({ item, index }));
  const rows = allRows.filter(
    (row) => activeTab === SCORE_TEMPLATE_ALL_TAB || row.item.section === activeTab,
  );
  const tabItems: TabItem[] = [
    { id: SCORE_TEMPLATE_ALL_TAB, label: allSectionsLabel, count: allRows.length },
    ...EXAM_TEMPLATE_SECTIONS.map((section) => ({
      id: section,
      label: getSectionLabel(section),
      count: allRows.filter((row) => row.item.section === section).length,
    })),
  ];

  const numberInput = (
    row: ScoreTemplateTableRow,
    field: keyof ScoreTemplateItemDraft,
    label: string,
    inputClassName: string,
    step?: string,
  ): ReactElement | null =>
    props.editable ? (
      <input
        type="number"
        step={step}
        aria-label={label}
        className={inputClassName}
        value={fieldValue(row.item, field)}
        onChange={(event) => props.onChange(row.index, field, event.target.value)}
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
      props.editable ? (
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
  ): DataTableColumn<ScoreTemplateTableRow> => ({
    key: field,
    header,
    sortable: false,
    cell: (row) => numberInput(row, field, header, INPUT_CLASS, "0.01") ?? fieldValue(row.item, field),
  });

  const columns: DataTableColumn<ScoreTemplateTableRow>[] = [
    // The skill tabs already group the rows, so the section only needs a column under "All".
    ...(activeTab === SCORE_TEMPLATE_ALL_TAB
      ? [
          {
            key: "section",
            header: H.SECTION,
            sortable: false,
            cell: (row: ScoreTemplateTableRow) => getSectionLabel(row.item.section),
          },
        ]
      : []),
    {
      key: "taskType",
      header: H.TASK_TYPE,
      sortable: false,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs">
            {row.item.taskTypeKey || row.item.taskType || "—"}
          </span>
          {props.editable && (
            <Button variant="ghost" size="sm" onClick={() => props.onRemove(row.index)}>
              {T.REMOVE_TYPE}
            </Button>
          )}
        </div>
      ),
    },
    pairColumn(
      "questionCount",
      H.QUESTION_COUNT,
      { field: "minCount", label: H.MIN_COUNT },
      { field: "maxCount", label: H.MAX_COUNT },
      "–",
    ),
    pairColumn(
      "timing",
      H.TIME_SECONDS,
      { field: "prepSeconds", label: H.PREP_SECONDS },
      { field: "responseSeconds", label: H.RESPONSE_SECONDS },
      "/",
    ),
    {
      key: "overallWeight",
      header: H.OVERALL_WEIGHT,
      sortable: false,
      cell: (row) => fieldValue(row.item, "overallWeight"),
    },
    weightColumn("speakingWeight", H.SPEAKING_WEIGHT),
    weightColumn("writingWeight", H.WRITING_WEIGHT),
    weightColumn("readingWeight", H.READING_WEIGHT),
    weightColumn("listeningWeight", H.LISTENING_WEIGHT),
  ];

  return (
    <DashboardCard
      className={cn(
        "grid gap-6 lg:items-start",
        // A side panel needs room for its fields; without one the rail shrinks to its labels.
        props.sidePanel
          ? "lg:grid-cols-[15rem_minmax(0,1fr)]"
          : "lg:grid-cols-[auto_minmax(0,1fr)]",
      )}
    >
      <div className="flex flex-col gap-4 lg:sticky lg:top-4">
        <Tabs
          id={TABS_ID}
          orientation="vertical"
          items={tabItems}
          value={activeTab}
          onChange={setActiveTab}
        />
        {props.sidePanel}
      </div>
      <div
        role="tabpanel"
        id={`${TABS_ID}-panel-${activeTab}`}
        aria-labelledby={`${TABS_ID}-tab-${activeTab}`}
        className="min-w-0"
      >
        {/* key resets the table's own page and sort state when the skill tab changes.
            The editor drags rows, so it shows every row (a drop must see the whole
            order) and keys rows by task type: an index key would change on every move. */}
        <DataTable
          key={activeTab}
          showSearch={false}
          columns={columns}
          rows={rows}
          getRowKey={(row) => row.item.taskTypeKey}
          emptyTitle={emptyTitle}
          tableClassName="min-w-[820px]"
          clientSidePagination={!props.editable}
          toolbarActions={props.editable ? props.renderToolbarAction?.(activeTab) : undefined}
          emptyAction={props.editable ? props.renderEmptyAction?.(activeTab) : undefined}
          onReorderRows={props.editable ? props.onReorder : undefined}
          reorderHandleLabel={ROW.DRAG_HANDLE}
        />
      </div>
    </DashboardCard>
  );
};
