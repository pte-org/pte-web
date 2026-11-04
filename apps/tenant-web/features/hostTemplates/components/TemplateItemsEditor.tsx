"use client";

import type { ReactElement, ReactNode } from "react";
import type { ScoreTemplateItemRequest } from "@pte/api-client";
import { DataTable, SectionedTableCard } from "@pte/ui";
import { SKILLS } from "../constants";
import { useEditorText, useSkillLabels } from "../hooks/useTemplateText";
import type { PoolSlot } from "../utils/pool";
import {
  buildTemplateColumns,
  removeRowButton,
  type TemplateTableView,
} from "./templateItemColumns";

interface TemplateItemsEditorProps {
  /** Shown under the skill rail, such as the template's details. */
  sidePanel?: ReactNode;
  items: readonly ScoreTemplateItemRequest[];
  editable: boolean;
  onRemove: (taskTypeKey: string) => void;
  onWeightChange: (taskTypeKey: string, skill: (typeof SKILLS)[number], value: number) => void;
  /** Cells the host may not change; omitted means every cell follows `editable`. */
  isWeightEditable?: (taskTypeKey: string, skill: (typeof SKILLS)[number]) => boolean;
  /** Published-question coverage per task type; the column is hidden when omitted. */
  pool?: ReadonlyMap<string, PoolSlot>;
}

const ALL_TAB = "ALL";
const SECTION_ORDER = ["SPEAKING", "WRITING", "READING", "LISTENING"] as const;

/**
 * Task types of a template in the common sectioned table (the same frame the admin's template screen uses):
 * a skill rail on the left and the selected skill's rows on the right, with a switch between the exam
 * structure (counts, stock) and the weights of every skill.
 */
export const TemplateItemsEditor = ({
  sidePanel,
  items,
  editable,
  onRemove,
  onWeightChange,
  isWeightEditable,
  pool,
}: TemplateItemsEditorProps): ReactElement => {
  const text = useEditorText();
  const labels = useSkillLabels();
  const rowsOf = (tab: string): ScoreTemplateItemRequest[] =>
    items.filter((item) => tab === ALL_TAB || item.section === tab);

  return (
    <SectionedTableCard<TemplateTableView>
      id="host-template-sections"
      sections={SECTION_ORDER.map((section) => ({ id: section, label: labels[section] }))}
      allTabId={ALL_TAB}
      allLabel={text.ALL_SECTIONS}
      countOf={(section) => rowsOf(section ?? ALL_TAB).length}
      views={[
        { id: "STRUCTURE", label: text.VIEW_STRUCTURE },
        { id: "WEIGHTS", label: text.VIEW_WEIGHTS },
      ]}
      defaultView="STRUCTURE"
      viewAriaLabel={text.VIEW_LABEL}
      sidePanel={() => sidePanel}
    >
      {({ activeTab, showSection, view, viewTabs }) => (
        <DataTable
          showSearch={false}
          density="compact"
          toolbar={viewTabs}
          columns={buildTemplateColumns({
            view,
            showSection,
            editable,
            headers: {
              task: text.COL_TASK,
              count: text.COL_COUNT,
              pool: text.COL_POOL,
              prep: text.COL_PREP,
              response: text.COL_RESPONSE,
            },
            skillLabels: labels,
            sectionLabel: (section) => labels[section as keyof typeof labels] ?? section,
            pool,
            poolCopy: { ok: text.POOL_OK, short: text.POOL_SHORT },
            weightLockedText: text.WEIGHT_LOCKED,
            isWeightLocked: (key, skill) => editable && isWeightEditable?.(key, skill) === false,
            onWeightChange,
            removeLabel: text.REMOVE,
            onRemove,
          })}
          rows={rowsOf(activeTab)}
          getRowKey={(item) => item.taskTypeKey}
          emptyTitle={text.NO_TASKS}
          clientSidePagination={!editable}
          rowActions={
            editable
              ? (item) => removeRowButton({ removeLabel: text.REMOVE, onRemove }, item)
              : undefined
          }
          rowActionsHeader={<span className="sr-only">{text.REMOVE}</span>}
        />
      )}
    </SectionedTableCard>
  );
};
