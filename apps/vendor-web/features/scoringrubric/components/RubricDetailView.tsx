"use client";

import { useState, type ReactElement } from "react";
import { Badge, ErrorState, LoadingState } from "@pte/ui";
import { useScoreTemplates } from "@/features/scoretemplate/api";
import { useRubricTaskType, useRubricVersions } from "../api";
import { useScoringRubricText } from "../hooks/useScoringRubricText";
import { findTemplateWeights, resolveSelectedTemplate } from "../rubricView";
import { AzureBandMapping } from "./_AzureBandMapping";
import { FormBandTable } from "./_FormBandTable";
import { GateList } from "./_GateList";
import { ObjectiveRuleCard } from "./_ObjectiveRuleCard";
import { SkillWeightPanel } from "./_SkillWeightPanel";
import { TemplatePicker } from "./_TemplatePicker";
import { TraitTable } from "./_TraitTable";

interface RubricDetailViewProps {
  taskType: string;
}

/**
 * Rubric of one task type as it applies to the chosen exam template's pinned rubric version (ACTIVE version when
 * no template is chosen). Everything shown is read from the rubric API and the template; nothing is recomputed.
 */
export const RubricDetailView = ({ taskType }: RubricDetailViewProps): ReactElement => {
  const { messages: M, format, codeLabel } = useScoringRubricText();
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const templatesQuery = useScoreTemplates();
  const versionsQuery = useRubricVersions();
  const templates = templatesQuery.data ?? [];
  const selected = resolveSelectedTemplate(templates, selectedId);
  const rubricQuery = useRubricTaskType(
    taskType,
    selected?.rubricVersionPublicId ?? null,
    !templatesQuery.isLoading,
  );
  const rubric = rubricQuery.data;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-mono text-xl font-semibold text-[var(--ink-primary)]">{taskType}</h1>
        {rubric && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--ink-secondary)]">
            {rubric.skills.map((skill) => (
              <Badge key={skill} variant="info">
                {codeLabel("skill", skill)}
              </Badge>
            ))}
            <span>
              {format("detailMeta", {
                pages: rubric.pearsonPages,
                versionNo: rubric.versionNo,
                catalogVersion: rubric.catalogVersion,
              })}
            </span>
          </div>
        )}
      </div>

      <TemplatePicker
        templates={templates}
        selected={selected}
        versions={versionsQuery.data ?? []}
        templatesFailed={templatesQuery.isError}
        onSelect={setSelectedId}
      />

      {(templatesQuery.isLoading || rubricQuery.isLoading) && <LoadingState rows={6} />}
      {rubricQuery.isError && <ErrorState title={M.detailError} />}

      {rubric && (
        <>
          <TraitTable traits={rubric.traits} />
          <GateList gates={rubric.gates} traits={rubric.traits} />
          {rubric.formBands && <FormBandTable bands={rubric.formBands} />}
          {rubric.objectiveRule && <ObjectiveRuleCard rule={rubric.objectiveRule} />}
          {rubric.azureMapping && <AzureBandMapping mapping={rubric.azureMapping} />}
          <SkillWeightPanel
            weights={selected ? findTemplateWeights(selected, taskType) : undefined}
          />
        </>
      )}
    </div>
  );
};
