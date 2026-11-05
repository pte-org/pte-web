"use client";

import type { ReactElement } from "react";
import { Badge } from "@pte/ui";
import { uncalibratedAzureLabel } from "../explanationView";
import { useScoreExplanationText } from "../hooks/useScoreExplanationText";
import type { RubricParametersResponse, TaskTypeParametersResponse } from "../types";
import { ExplanationSection } from "./_ExplanationSection";

interface RubricParametersPanelProps {
  /** Null when the pinned version is not ACTIVE or RETIRED (the API never exposes a draft). */
  parameters: RubricParametersResponse | null;
}

interface TaskTypeParametersProps {
  parameters: TaskTypeParametersResponse;
}

const TaskTypeParameters = ({ parameters }: TaskTypeParametersProps): ReactElement => {
  const { messages: M, format } = useScoreExplanationText();
  const notice = uncalibratedAzureLabel(parameters, M.azureUncalibrated);
  const gates = Object.entries(parameters.gateEnabled);

  return (
    <li className="space-y-2 rounded-lg border border-[var(--shell-border)] p-4">
      <div className="font-mono text-xs font-semibold text-[var(--ink-primary)]">
        {parameters.taskType}
      </div>
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-[var(--ink-secondary)]">{M.traitWeights}</dt>
          <dd className="font-mono text-xs">
            {Object.entries(parameters.traitWeights)
              .map(([trait, weight]) => `${trait} ${weight}`)
              .join(" · ")}
          </dd>
        </div>
        {gates.length > 0 && (
          <div>
            <dt className="text-xs text-[var(--ink-secondary)]">{M.gates}</dt>
            <dd className="font-mono text-xs">
              {gates.map(([trait, on]) => `${trait} ${on ? M.gateOn : M.gateOff}`).join(" · ")}
            </dd>
          </div>
        )}
        {parameters.formBands && (
          <div>
            <dt className="text-xs text-[var(--ink-secondary)]">{M.formBands}</dt>
            <dd className="text-xs">
              {parameters.formBands
                .map((band) =>
                  format("formBandRange", { min: band.minWords, max: band.maxWords, band: band.band }),
                )
                .join(" · ")}
            </dd>
          </div>
        )}
        {parameters.azureMappingVersion && (
          <div>
            <dt className="text-xs text-[var(--ink-secondary)]">
              {format("azureMapping", { version: parameters.azureMappingVersion })}
            </dt>
            <dd>{notice && <Badge variant="warning">{notice}</Badge>}</dd>
          </div>
        )}
      </dl>
    </li>
  );
};

/** Parameters of the rubric version pinned on the exam template, for the task types of this attempt. */
export const RubricParametersPanel = ({ parameters }: RubricParametersPanelProps): ReactElement => {
  const { messages: M, format } = useScoreExplanationText();

  if (!parameters) {
    return (
      <ExplanationSection title={M.parametersTitle}>
        <p className="text-sm text-[var(--ink-secondary)]">{M.parametersMissing}</p>
      </ExplanationSection>
    );
  }

  return (
    <ExplanationSection
      title={M.parametersTitle}
      hint={format("parametersHint", {
        versionNo: parameters.versionNo,
        status: parameters.status,
        catalogVersion: parameters.catalogVersion,
      })}
    >
      <ul className="grid gap-3 lg:grid-cols-2">
        {parameters.taskTypes.map((taskType) => (
          <TaskTypeParameters key={taskType.taskType} parameters={taskType} />
        ))}
      </ul>
    </ExplanationSection>
  );
};
