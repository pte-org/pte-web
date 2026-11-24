"use client";

import type { ReactElement, ReactNode } from "react";
import { DataTable, useRememberedState } from "@pte/ui";
import { RUBRIC_SKILL_FILTER_ALL } from "../constants";
import { useScoringRubricText } from "../hooks/useScoringRubricText";
import type { TaskTypeRubricResponse } from "../types";
import { useRubricTaskTypeColumns } from "./_rubricTaskTypeColumns";
import { RubricSkillTabs } from "./_RubricSkillTabs";

export interface RubricTaskTypeTableProps {
  taskTypes: readonly TaskTypeRubricResponse[];
  /** Shown alongside header actions if toolbarActions is not provided. */
  sidePanel?: ReactNode;
  /** The version the rows belong to; a row opens that version's rubric. */
  versionId?: string;
  /** At the left of the page header, e.g. title and status badge. */
  toolbar?: ReactNode;
  /** Buttons at the right of the page header, e.g. Simulator CTA and Edit button. */
  toolbarActions?: ReactNode;
}

/**
 * Task types of the scoring rubric:
 * Modern horizontal skill pills filter at the top and a streamlined DataTable below.
 * Displays human-friendly names, colored skill badges, and gate tooltips.
 */
export const RubricTaskTypeTable = ({
  taskTypes,
  sidePanel,
  versionId,
  toolbar,
  toolbarActions,
}: RubricTaskTypeTableProps): ReactElement => {
  const { messages: M } = useScoringRubricText();
  const [activeTab, setActiveTab] = useRememberedState<string>("rubric-skill", RUBRIC_SKILL_FILTER_ALL);
  const columns = useRubricTaskTypeColumns(versionId);

  const filteredRows =
    activeTab === RUBRIC_SKILL_FILTER_ALL
      ? [...taskTypes]
      : taskTypes.filter((r) => (r.skills as readonly string[]).includes(activeTab));

  const effectiveActions =
    toolbarActions ?? (sidePanel ? <div className="shrink-0">{sidePanel}</div> : undefined);

  return (
    <div className="flex flex-col gap-5">
      {(toolbar || effectiveActions) && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">{toolbar}</div>
          {effectiveActions && <div className="flex items-center gap-2.5">{effectiveActions}</div>}
        </div>
      )}

      <RubricSkillTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        taskTypes={taskTypes}
      />

      <DataTable
        showSearch={false}
        columns={columns}
        rows={filteredRows}
        getRowKey={(rubric) => rubric.taskType}
        emptyTitle={M.empty}
        density="compact"
        clientSidePagination
        initialPageSize={25}
      />
    </div>
  );
};
