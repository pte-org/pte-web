"use client";

import { useMemo, useState, type ReactElement, type ReactNode } from "react";
import { Checkbox, DataTable, TableSearchControl, useLocale, useRememberedState } from "@pte/ui";
import { RUBRIC_SKILL_FILTER_ALL } from "../constants";
import { useScoringRubricText } from "../hooks/useScoringRubricText";
import { hasEnabledGate } from "../rubricView";
import type { TaskTypeRubricResponse } from "../types";
import { useQuestionTypes } from "@/features/questiontemplate/api";
import { taskTypeLabel, useRubricTaskTypeColumns } from "./_rubricTaskTypeColumns";
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
  const { locale } = useLocale();
  const [activeTab, setActiveTab] = useRememberedState<string>("rubric-skill", RUBRIC_SKILL_FILTER_ALL);
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyGated, setOnlyGated] = useState(false);
  const { data: dbQuestionTypes = [] } = useQuestionTypes(false);
  const columns = useRubricTaskTypeColumns(versionId);

  const taskTypeMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of dbQuestionTypes) {
      if (item.code && item.displayName) {
        map.set(item.code.toUpperCase(), item.displayName);
      }
    }
    return map;
  }, [dbQuestionTypes]);

  const getTaskTypeLabel = (code: string): string =>
    taskTypeMap.get(code.toUpperCase()) ?? taskTypeLabel(code);

  const filteredRows = useMemo(() => {
    return taskTypes.filter((r) => {
      if (activeTab !== RUBRIC_SKILL_FILTER_ALL && !(r.skills as readonly string[]).includes(activeTab)) {
        return false;
      }
      if (onlyGated && !hasEnabledGate(r)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const codeMatch = r.taskType.toLowerCase().includes(q);
        const nameMatch = getTaskTypeLabel(r.taskType).toLowerCase().includes(q);
        if (!codeMatch && !nameMatch) return false;
      }
      return true;
    });
  }, [taskTypes, activeTab, onlyGated, searchQuery, taskTypeMap]);

  const effectiveActions =
    toolbarActions ?? (sidePanel ? <div className="shrink-0">{sidePanel}</div> : undefined);

  return (
    <div className="flex flex-col gap-5">
      {/* Page Header: Title + Status Badge on left, CTA buttons on right */}
      {(toolbar || effectiveActions) && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">{toolbar}</div>
          {effectiveActions && <div className="flex items-center gap-2.5">{effectiveActions}</div>}
        </div>
      )}

      {/* Horizontal Section Filter Pills */}
      <RubricSkillTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        taskTypes={taskTypes}
      />

      {/* Main Table with Filters */}
      <DataTable
        showSearch={false}
        filters={
          <div className="flex flex-row items-center gap-4">
            <div className="w-72 sm:w-80 shrink-0">
              <TableSearchControl
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={locale === "vi" ? "Tìm theo tên hoặc mã dạng bài..." : "Search task types..."}
                ariaLabel={locale === "vi" ? "Tìm theo tên hoặc mã dạng bài" : "Search task types"}
              />
            </div>
            <Checkbox
              checked={onlyGated}
              label={locale === "vi" ? "Chỉ hiện dạng bài có chặn điểm 0" : "Only task types with gate rule"}
              onChange={(event) => setOnlyGated(event.target.checked)}
            />
          </div>
        }
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
