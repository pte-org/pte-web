"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { Badge, DataTable, SectionedTableCard, type DataTableColumn } from "@pte/ui";
import {
  PER_WORD_MAX_SYMBOL,
  RUBRIC_SKILLS,
  RUBRIC_SKILL_FILTER_ALL,
  scoringRubricDetailHref,
} from "../constants";
import { useScoringRubricText } from "../hooks/useScoringRubricText";
import { formatRubricMaxTotal, hasEnabledGate } from "../rubricView";
import type { TaskTypeRubricResponse } from "../types";

const TABS_ID = "scoring-rubric-skill-tabs";

/** The rows show one of two views: how a task type is scored, or which skills and Score Guide pages it maps to. */
type RubricTableView = "RULES" | "SOURCES";

interface RubricTaskTypeTableProps {
  taskTypes: readonly TaskTypeRubricResponse[];
}

/**
 * Task types of the active rubric: a vertical skill tab rail ("All" plus one tab per skill, each with its count) on
 * the left and the selected skill's rows on the right. A task type counts toward every skill it feeds, so it is
 * listed under each of them (e.g. Repeat Sentence under Speaking and Listening).
 */
export const RubricTaskTypeTable = ({ taskTypes }: RubricTaskTypeTableProps): ReactElement => {
  const { messages: M, codeLabel } = useScoringRubricText();
  const inSkill = (tab: string) => (rubric: TaskTypeRubricResponse) =>
    tab === RUBRIC_SKILL_FILTER_ALL || (rubric.skills as readonly string[]).includes(tab);

  const taskTypeColumn: DataTableColumn<TaskTypeRubricResponse> = {
    key: "taskType",
    header: M.columnTaskType,
    sortable: false,
    cell: (rubric) => (
      <Link
        href={scoringRubricDetailHref(rubric.taskType)}
        className="font-mono text-xs font-medium text-[var(--action)] hover:underline"
        aria-label={`${M.viewDetail}: ${rubric.taskType}`}
      >
        {rubric.taskType}
      </Link>
    ),
  };

  const columnsFor = (view: RubricTableView): DataTableColumn<TaskTypeRubricResponse>[] =>
    view === "RULES"
      ? [
          taskTypeColumn,
          {
            key: "traits",
            header: M.columnTraits,
            sortable: false,
            cell: (rubric) => (rubric.traits.length > 0 ? rubric.traits.length : M.answerKey),
          },
          {
            key: "gate",
            header: M.columnGate,
            sortable: false,
            cell: (rubric) => (hasEnabledGate(rubric) ? <Badge variant="warning">{M.gateBadge}</Badge> : null),
          },
          {
            key: "maxTotal",
            header: M.columnMaxTotal,
            sortable: false,
            cell: (rubric) => formatRubricMaxTotal(rubric.traits, PER_WORD_MAX_SYMBOL) ?? M.answerKey,
          },
        ]
      : [
          taskTypeColumn,
          {
            key: "skills",
            header: M.columnSkills,
            sortable: false,
            cell: (rubric) => (
              <span className="flex flex-wrap gap-1">
                {rubric.skills.map((skill) => (
                  <Badge key={skill} variant="neutral">
                    {codeLabel("skill", skill)}
                  </Badge>
                ))}
              </span>
            ),
          },
        ];

  return (
    <SectionedTableCard<RubricTableView>
      id={TABS_ID}
      sections={RUBRIC_SKILLS.map((skill) => ({ id: skill, label: codeLabel("skill", skill) }))}
      allTabId={RUBRIC_SKILL_FILTER_ALL}
      allLabel={M.skillAll}
      countOf={(skill) => taskTypes.filter(inSkill(skill ?? RUBRIC_SKILL_FILTER_ALL)).length}
      views={[
        { id: "RULES", label: M.viewRules },
        { id: "SOURCES", label: M.viewSources },
      ]}
      defaultView="RULES"
      viewAriaLabel={M.viewLabel}
    >
      {({ activeTab, view, viewTabs }) => (
        <DataTable
          showSearch={false}
          toolbar={viewTabs}
          columns={columnsFor(view)}
          rows={taskTypes.filter(inSkill(activeTab))}
          getRowKey={(rubric) => rubric.taskType}
          emptyTitle={M.empty}
          density="compact"
          clientSidePagination
        />
      )}
    </SectionedTableCard>
  );
};
