"use client";

import type { ReactElement, ReactNode } from "react";
import Link from "next/link";
import { Badge, DataTable, EyeIcon, TabRailCard, type DataTableColumn, type TabItem, useRememberedState } from "@pte/ui";
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

interface RubricTaskTypeTableProps {
  taskTypes: readonly TaskTypeRubricResponse[];
  /** Shown under the skill tabs, in the left column. */
  sidePanel?: ReactNode;
  /** The version the rows belong to; a row opens that version's rubric. */
  versionId?: string;
  /** At the left of the table toolbar, e.g. which version this is. */
  toolbar?: ReactNode;
  /** Buttons at the right end of the table toolbar. */
  toolbarActions?: ReactNode;
}

/**
 * Task types of the active rubric: a vertical skill tab rail ("All" plus one tab per skill, each with its count) on
 * the left and one table on the right. A task type counts toward every skill it feeds, so it is listed under each of
 * them (e.g. Repeat Sentence under Speaking and Listening); its Skills column says which.
 */
export const RubricTaskTypeTable = ({ taskTypes, sidePanel, versionId, toolbar, toolbarActions }: RubricTaskTypeTableProps): ReactElement => {
  const { messages: M, codeLabel } = useScoringRubricText();
  const [activeTab, setActiveTab] = useRememberedState<string>("skill", RUBRIC_SKILL_FILTER_ALL);
  const inSkill = (tab: string) => (rubric: TaskTypeRubricResponse) =>
    tab === RUBRIC_SKILL_FILTER_ALL || (rubric.skills as readonly string[]).includes(tab);

  const tabs: TabItem[] = [
    { id: RUBRIC_SKILL_FILTER_ALL, label: M.skillAll, count: taskTypes.length },
    ...RUBRIC_SKILLS.map((skill) => ({
      id: skill,
      label: codeLabel("skill", skill),
      count: taskTypes.filter(inSkill(skill)).length,
    })),
  ];

  const columns: DataTableColumn<TaskTypeRubricResponse>[] = [
    {
      key: "taskType",
      header: M.columnTaskType,
      sortable: false,
      cell: (rubric) => <span className="font-mono text-xs font-medium">{rubric.taskType}</span>,
    },
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
    {
      key: "actions",
      header: M.columnActions,
      sortable: false,
      cell: (rubric) => (
        <Link
          href={scoringRubricDetailHref(rubric.taskType, versionId)}
          className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-sm text-[var(--ink-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--action)]"
          aria-label={`${M.viewDetail}: ${rubric.taskType}`}
          title={M.viewDetail}
        >
          <EyeIcon className="h-4 w-4" />
          {M.actionView}
        </Link>
      ),
    },
  ];

  return (
    <TabRailCard id={TABS_ID} items={tabs} value={activeTab} onChange={setActiveTab} sidePanel={sidePanel}>
      <DataTable
        showSearch={false}
        toolbar={toolbar}
        toolbarActions={toolbarActions}
        columns={columns}
        rows={taskTypes.filter(inSkill(activeTab))}
        getRowKey={(rubric) => rubric.taskType}
        emptyTitle={M.empty}
        density="compact"
        clientSidePagination
      />
    </TabRailCard>
  );
};
