"use client";

import { useState, type ReactElement, type ReactNode } from "react";
import { ActionMenu, DashboardCard, DataTable, Tabs, cn, type TabItem } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import {
  EXAM_TEMPLATE_SECTIONS,
  SCORE_TEMPLATE_ALL_TAB,
  SCORE_TEMPLATE_ITEM_HEADERS as RAW_SCORE_TEMPLATE_ITEM_HEADERS,
  SCORE_TEMPLATE_ROW_TEXT as RAW_SCORE_TEMPLATE_ROW_TEXT,
  SCORE_TEMPLATE_SECTION_LABELS as RAW_SECTION_LABELS,
  SCORE_TEMPLATE_TEXT as RAW_SCORE_TEMPLATE_TEXT,
} from "../constants";
import type { PoolSlot } from "../poolAvailability";
import type { ScoreTemplateItemDraft, ScoreTemplateItemResponse } from "../types";
import { SkillWeightTotals } from "./_SkillWeightTotals";
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
  const viewItems: TabItem[] = [
    { id: "STRUCTURE", label: ROW.VIEW_STRUCTURE },
    { id: "WEIGHTS", label: ROW.VIEW_WEIGHTS },
  ];

  const columns = buildScoreTemplateColumns({
    view,
    showSection: activeTab === SCORE_TEMPLATE_ALL_TAB,
    headers: H,
    poolCopy: { ok: T.POOL_OK, short: T.POOL_SHORT },
    getSectionLabel,
    pool: props.pool,
    onChange: props.editable ? props.onChange : undefined,
  });

  return (
    <DashboardCard
      className={cn(
        "grid gap-6 lg:items-start",
        // A side panel needs room for its fields; without one the rail shrinks to its labels.
        props.sidePanel
          ? "lg:grid-cols-[16rem_minmax(0,1fr)]"
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
        {/* The backend checks the whole template, so the totals ignore the selected tab. */}
        {props.editable && (
          <SkillWeightTotals items={props.items} getSkillLabel={getSectionLabel} />
        )}
        {props.sidePanel}
      </div>
      <div
        role="tabpanel"
        id={`${TABS_ID}-panel-${activeTab}`}
        aria-labelledby={`${TABS_ID}-tab-${activeTab}`}
        className="min-w-0"
      >
        {/* key resets the table's own page state when the skill tab changes.
            The editor drags rows, so it shows every row (a drop must see the whole
            order) and keys rows by task type: an index key would change on every move. */}
        <DataTable
          key={activeTab}
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
                  <ActionMenu
                    label={ROW.ACTIONS_LABEL}
                    items={[
                      { label: T.REMOVE_TYPE, danger: true, onSelect: () => props.onRemove(row.index) },
                    ]}
                  />
                )
              : undefined
          }
          rowActionsHeader={<span className="sr-only">{ROW.ACTIONS_LABEL}</span>}
          onReorderRows={props.editable ? props.onReorder : undefined}
          reorderHandleLabel={ROW.DRAG_HANDLE}
        />
      </div>
    </DashboardCard>
  );
};
