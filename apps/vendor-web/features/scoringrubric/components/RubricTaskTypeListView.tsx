"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { RUBRIC_EDIT_CONFIG, RUBRIC_EDIT_TEXT } from "../versionConstants";
import { EmptyState, ErrorState, LoadingState, Select, type SelectOption } from "@pte/ui";
import { useRubricTaskTypes } from "../api";
import { RUBRIC_SKILLS, RUBRIC_SKILL_FILTER_ALL } from "../constants";
import { useScoringRubricText } from "../hooks/useScoringRubricText";
import { countDistinctTaskTypes, groupTaskTypesBySkill } from "../rubricView";
import type { RubricSkillFilter } from "../types";
import { RubricTaskTypeTable } from "./_RubricTaskTypeTable";

const isSkillFilter = (value: string): value is RubricSkillFilter =>
  value === RUBRIC_SKILL_FILTER_ALL || (RUBRIC_SKILLS as readonly string[]).includes(value);

/** The standard task types of the ACTIVE rubric version, grouped by the skills they count toward. */
export const RubricTaskTypeListView = (): ReactElement => {
  const { locale, messages: M, format, codeLabel } = useScoringRubricText();
  const [filter, setFilter] = useState<RubricSkillFilter>(RUBRIC_SKILL_FILTER_ALL);
  const { data, isLoading, isError } = useRubricTaskTypes();

  if (isLoading) return <LoadingState rows={6} />;
  if (isError) return <ErrorState title={M.loadError} />;
  const taskTypes = data ?? [];
  if (taskTypes.length === 0) return <EmptyState title={M.empty} />;

  const options: SelectOption[] = [
    { value: RUBRIC_SKILL_FILTER_ALL, label: M.skillAll },
    ...RUBRIC_SKILLS.map((skill) => ({ value: skill, label: codeLabel("skill", skill) })),
  ];
  const [first] = taskTypes;

  return (
    <div className="space-y-6">
      <Link href={RUBRIC_EDIT_CONFIG.basePath}>{RUBRIC_EDIT_TEXT[locale === "vi" ? "vi" : "en"].title}</Link>
      <div className="space-y-1">
        <p className="text-sm text-[var(--ink-primary)]">
          {format("listIntro", { count: countDistinctTaskTypes(taskTypes) })}
        </p>
        <p className="text-xs text-[var(--ink-secondary)]">
          {format("versionSummary", {
            versionNo: first.versionNo,
            catalogVersion: first.catalogVersion,
          })}
        </p>
      </div>
      <Select
        id="scoring-rubric-skill-filter"
        label={M.skillFilterLabel}
        options={options}
        value={filter}
        onChange={(event) => {
          if (isSkillFilter(event.target.value)) setFilter(event.target.value);
        }}
        className="max-w-xs"
        size="sm"
      />
      {groupTaskTypesBySkill(taskTypes, filter).map((group) => (
        <RubricTaskTypeTable key={group.skill} group={group} />
      ))}
    </div>
  );
};
