"use client";

import { useState, type ReactElement, type ReactNode } from "react";
import {
  Button,
  DataTable,
  GripVerticalIcon,
  TrashIcon,
  DropZone,
  TabRailCard,
  Tabs,
  type TabItem,
} from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import {
  SCORE_TEMPLATE_ALL_TAB,
  PALETTE_DROP_ATTRIBUTE,
  TASK_TYPE_DRAG_TYPE,
  SCORE_TEMPLATE_ITEM_HEADERS as RAW_SCORE_TEMPLATE_ITEM_HEADERS,
  SCORE_TEMPLATE_ROW_TEXT as RAW_SCORE_TEMPLATE_ROW_TEXT,
  SCORE_TEMPLATE_SECTION_LABELS as RAW_SECTION_LABELS,
  SCORE_TEMPLATE_TEXT as RAW_SCORE_TEMPLATE_TEXT,
} from "../constants";
import { useSectionTabItems } from "../useSectionTabItems";
import type { PoolSlot } from "../poolAvailability";
import { computeSkillWeightTotals } from "../skillWeightTotals";
import type { ScoreTemplateItemDraft, ScoreTemplateItemResponse } from "../types";
import {
  buildScoreTemplateColumns,
  type ScoreTemplateTableRow,
  type ScoreTemplateTableView,
} from "./scoreTemplateTableColumns";

const TABS_ID = "score-template-section-tabs";
const VIEW_TABS_ID = "score-template-view-tabs";

type PoolProps = {
  /** Approved-question coverage per task type; the column is hidden when omitted. */
  pool?: ReadonlyMap<string, PoolSlot>;
};

type ReadOnlyProps = PoolProps & {
  editable: false;
  items: ScoreTemplateItemResponse[];
};

type EditableProps = PoolProps & {
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
  /** Rendered in the side column under the tab rail; receives the current tab, so it can follow the filter. */
  renderPalette?: (activeTab: string) => ReactNode;
  /** Receives what an item dragged from the palette carries when it is dropped on the rows. */
  onDropTaskType?: (payload: string) => void;
};

type ScoreTemplateItemTableProps = (ReadOnlyProps | EditableProps) & {
  /** Shown under the skill tab rail, in the same side column (e.g. the template's details). */
  sidePanel?: ReactNode;
  /** The view the table opens on; defaults to the exam structure (counts and timing). */
  initialView?: ScoreTemplateTableView;
};

/**
 * Task types of a score template: a vertical skill tab rail on the left and, on the right,
 * the selected skill's rows in the common DataTable ("All" lists every skill). A switch above
 * the table picks which fields the rows show (structure or weights), so a row never needs
 * more columns than fit. Shared by the read-only detail view and the DRAFT editor, where the
 * numeric cells become inputs and each row gets a menu to remove it.
 */
export const ScoreTemplateItemTable = (props: ScoreTemplateItemTableProps): ReactElement => {
  const [activeTab, setActiveTab] = useState<string>(SCORE_TEMPLATE_ALL_TAB);
  const [view, setView] = useState<ScoreTemplateTableView>(props.initialView ?? "STRUCTURE");
  const H = useAdminCopy(RAW_SCORE_TEMPLATE_ITEM_HEADERS);
  const T = useAdminCopy(RAW_SCORE_TEMPLATE_TEXT);
  const ROW = useAdminCopy(RAW_SCORE_TEMPLATE_ROW_TEXT);
  const sectionLabels = useAdminCopy(RAW_SECTION_LABELS);
  const emptyTitle = useAdminCopy("No score template items");
  const getSectionLabel = (section: string): string =>
    sectionLabels[section as keyof typeof sectionLabels] ?? section;

  const allRows: ScoreTemplateTableRow[] = props.items.map((item, index) => ({ item, index }));
  const rows = allRows.filter(
    (row) => activeTab === SCORE_TEMPLATE_ALL_TAB || row.item.section === activeTab,
  );
  const tabItems = useSectionTabItems((section) =>
    section === null
      ? allRows.length
      : allRows.filter((row) => row.item.section === section).length,
  );
  const viewItems: TabItem[] = [
    { id: "STRUCTURE", label: ROW.VIEW_STRUCTURE },
    { id: "WEIGHTS", label: ROW.VIEW_WEIGHTS },
  ];

  // Totals cover every row, not just the tab's: the backend checks the whole template.
  const weightMismatches = props.editable
    ? new Map(
        computeSkillWeightTotals(props.items)
          .filter((entry) => !entry.isValid)
          .map((entry) => [`${entry.skill.toLowerCase()}Weight`, entry.total]),
      )
    : undefined;

  const columns = buildScoreTemplateColumns({
    view,
    showSection: activeTab === SCORE_TEMPLATE_ALL_TAB,
    headers: H,
    poolCopy: { ok: T.POOL_OK, short: T.POOL_SHORT },
    getSectionLabel,
    pool: props.pool,
    weightMismatches,
    onChange: props.editable ? props.onChange : undefined,
  });

  const palette = props.editable ? props.renderPalette?.(activeTab) : undefined;
  const sidePanel = palette ? (
    <>
      {palette}
      {props.sidePanel}
    </>
  ) : (
    props.sidePanel
  );
  // Only the editor takes dragged-in task types; the read-only page shows the rows as they are.
  const dropHandler = props.editable ? props.onDropTaskType : undefined;
  const table = (
    <DataTable
      showSearch={false}
      toolbar={
        <Tabs
          id={VIEW_TABS_ID}
          items={viewItems}
          value={view}
          onChange={(value) => setView(value === "WEIGHTS" ? "WEIGHTS" : "STRUCTURE")}
          variant="minimal"
          ariaLabel={ROW.VIEW_LABEL}
        />
      }
      columns={columns}
      rows={rows}
      getRowKey={(row) => row.item.taskTypeKey}
      emptyTitle={emptyTitle}
      density="compact"
      clientSidePagination={!props.editable}
      toolbarActions={props.editable ? props.renderToolbarAction?.(activeTab) : undefined}
      emptyAction={props.editable ? props.renderEmptyAction?.(activeTab) : undefined}
      rowActions={
        props.editable
          ? (row) => (
              <Button
                variant="danger"
                appearance="ghost"
                size="sm"
                iconOnly
                aria-label={T.REMOVE_TYPE}
                onClick={() => props.onRemove(row.index)}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            )
          : undefined
      }
      rowActionsHeader={<span className="sr-only">{ROW.ACTIONS_LABEL}</span>}
      onReorderRows={props.editable ? props.onReorder : undefined}
      rowDropOut={
        props.editable
          ? {
              targetSelector: `[${PALETTE_DROP_ATTRIBUTE}]`,
              onDrop: (key) => {
                const row = allRows.find((candidate) => candidate.item.taskTypeKey === key);
                if (row) props.onRemove(row.index);
              },
              renderPreview: (key) => (
                <div className="flex cursor-grabbing items-center gap-2 rounded-lg border border-[var(--brand)] bg-[var(--surface-card)] px-3 py-2 font-mono text-xs shadow-lg">
                  <GripVerticalIcon className="h-4 w-4 text-[var(--ink-muted)]" />
                  {key}
                </div>
              ),
            }
          : undefined
      }
      reorderHandleLabel={ROW.DRAG_HANDLE}
    />
  );

  return (
    <TabRailCard
      id={TABS_ID}
      items={tabItems}
      value={activeTab}
      onChange={setActiveTab}
      sidePanel={sidePanel}
    >
      {/* The editor drags rows, so it shows every row (a drop must see the whole order) and keys
            rows by task type: an index key would change on every move. The table is not re-keyed per
            tab: remounting replays its fade-in and flickers; it returns to page 1 on its own. */}
      {dropHandler ? (
        <DropZone accept={TASK_TYPE_DRAG_TYPE} onDropPayload={dropHandler}>
          {table}
        </DropZone>
      ) : (
        table
      )}
    </TabRailCard>
  );
};
