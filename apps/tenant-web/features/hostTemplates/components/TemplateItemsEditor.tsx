"use client";

import type { ReactElement } from "react";
import type { ScoreTemplateItemRequest } from "@pte/api-client";
import { DataTable, Tabs, useRememberedState, type TabItem } from "@pte/ui";
import { sectionTone } from "@/lib/chipTones";
import { SKILLS } from "../constants";
import { useEditorText, useSkillLabels } from "../hooks/useTemplateText";
import type { CountField } from "../utils/counts";
import type { PoolSlot } from "../utils/pool";
import { formatQuestionRange, questionRange } from "../utils/templateDisplay";
import { AddTaskTypeMenu, type AddableTaskType } from "./AddTaskTypeMenu";
import { buildTemplateColumns, removeRowButton, type TemplateTableView } from "./templateItemColumns";

interface TemplateItemsEditorProps {
  items: readonly ScoreTemplateItemRequest[];
  editable: boolean;
  onRemove: (taskTypeKey: string) => void;
  /** Called with the keys of every row in their new order, after a row is dragged to a new place. */
  onReorder?: (orderedKeys: string[]) => void;
  /** What can be added back from the default template; omitted when this template cannot take more. */
  addable?: readonly AddableTaskType[];
  onAdd?: (taskTypeKey: string) => void;
  onWeightChange: (taskTypeKey: string, skill: (typeof SKILLS)[number], value: number) => void;
  /** Called when the host changes the minimum or maximum number of questions of a task type. */
  onCountChange: (taskTypeKey: string, field: CountField, value: number) => void;
  /** Cells the host may not change; omitted means every cell follows `editable`. */
  isWeightEditable?: (taskTypeKey: string, skill: (typeof SKILLS)[number]) => boolean;
  /** Published-question coverage per task type; the column is hidden when omitted. */
  pool?: ReadonlyMap<string, PoolSlot>;
}

const TABLE_ID = "host-template-sections";
const ALL_TAB = "ALL";
const SECTION_ORDER = ["SPEAKING", "WRITING", "READING", "LISTENING"] as const;
const VIEWS: readonly TemplateTableView[] = ["STRUCTURE", "WEIGHTS"];

/** The dot in front of a skill's tab, in the colour that skill has on every other screen. */
const DOT_CLASS: Record<string, string> = {
  sky: "bg-[var(--sky-action)]",
  mint: "bg-[var(--mint-action)]",
  cream: "bg-[var(--cream-action)]",
  blush: "bg-[var(--blush-action)]",
};

/**
 * The task types of a template: a row of skill tabs ("All" plus one per skill, each with its count) over the
 * selected skill's table, which switches between the exam structure (counts, stock) and the weights of every skill.
 */
export const TemplateItemsEditor = ({
  items,
  editable,
  onRemove,
  onReorder,
  addable = [],
  onAdd,
  onWeightChange,
  onCountChange,
  isWeightEditable,
  pool,
}: TemplateItemsEditorProps): ReactElement => {
  const text = useEditorText();
  const labels = useSkillLabels();
  const [activeTab, setActiveTab] = useRememberedState<string>(`${TABLE_ID}:tab`, ALL_TAB);
  const [view, setView] = useRememberedState<TemplateTableView>(`${TABLE_ID}:view`, "STRUCTURE");
  const rowsOf = (tab: string): ScoreTemplateItemRequest[] =>
    items.filter((item) => tab === ALL_TAB || item.section === tab);
  const rows = rowsOf(activeTab);
  const sectionLabel = (section: string): string => labels[section as keyof typeof labels] ?? section;

  const skillTabs: TabItem[] = [
    { id: ALL_TAB, label: text.ALL_SECTIONS, count: items.length },
    ...SECTION_ORDER.map((section) => ({
      id: section,
      label: labels[section],
      count: rowsOf(section).length,
      icon: (
        <span
          aria-hidden="true"
          className={`h-2 w-2 shrink-0 rounded-full ${DOT_CLASS[sectionTone(section)] ?? "bg-[var(--ink-muted)]"}`}
        />
      ),
    })),
  ];
  const viewTabs = (
    <Tabs
      id={`${TABLE_ID}-views`}
      items={VIEWS.map((id) => ({
        id,
        label: id === "STRUCTURE" ? text.VIEW_STRUCTURE : text.VIEW_WEIGHTS,
      }))}
      value={view}
      onChange={(value) => setView(VIEWS.find((id) => id === value) ?? "STRUCTURE")}
      variant="segmented"
      ariaLabel={text.VIEW_LABEL}
    />
  );
  const addableHere = addable.filter((entry) => activeTab === ALL_TAB || entry.section === activeTab);

  return (
    <div className="flex flex-col gap-3">
      <Tabs
        id={`${TABLE_ID}-skills`}
        items={skillTabs}
        value={activeTab}
        onChange={setActiveTab}
        variant="minimal"
        ariaLabel={text.ALL_SECTIONS}
      />
      <DataTable
        showSearch={false}
        density="compact"
        toolbar={viewTabs}
        toolbarActions={
          <>
            <span className="text-sm text-[var(--ink-secondary)]">
              {(activeTab === ALL_TAB ? text.TOTAL_QUESTIONS : text.SECTION_QUESTIONS)
                .replace("{label}", sectionLabel(activeTab))
                .replace("{range}", formatQuestionRange(questionRange(rows)))}
            </span>
            {editable && onAdd && (
              <AddTaskTypeMenu
                entries={addableHere}
                label={text.ADD_TYPE}
                menuLabel={text.ADD_TYPE_MENU}
                emptyHint={text.ADD_TYPE_NONE}
                sectionLabel={sectionLabel}
                sectionTone={sectionTone}
                onAdd={onAdd}
              />
            )}
          </>
        }
        columns={buildTemplateColumns({
          view,
          showSection: activeTab === ALL_TAB,
          editable,
          headers: {
            task: text.COL_TASK,
            count: text.COL_COUNT,
            pool: text.COL_POOL,
            prep: text.COL_PREP,
            response: text.COL_RESPONSE,
          },
          skillLabels: labels,
          sectionLabel,
          pool,
          poolCopy: { ok: text.POOL_OK, short: text.POOL_SHORT },
          timeUnits: { second: text.SECONDS_SHORT, minute: text.MINUTES_SHORT },
          weightLockedText: text.WEIGHT_LOCKED,
          isWeightLocked: (key, skill) => editable && isWeightEditable?.(key, skill) === false,
          onWeightChange,
          countLabels: { minCount: text.COUNT_MIN, maxCount: text.COUNT_MAX },
          countInvalidText: text.COUNT_INVALID,
          onCountChange,
          removeLabel: text.REMOVE,
          onRemove,
        })}
        rows={rows}
        getRowKey={(item) => item.taskTypeKey}
        emptyTitle={text.NO_TASKS}
        clientSidePagination={!editable}
        rowActions={
          editable ? (item) => removeRowButton({ removeLabel: text.REMOVE, onRemove }, item) : undefined
        }
        rowActionsHeader={<span className="sr-only">{text.REMOVE}</span>}
        onReorderRows={editable ? onReorder : undefined}
        reorderHandleLabel={text.DRAG_HANDLE}
      />
    </div>
  );
};
