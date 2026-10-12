import type { ReactElement } from "react";
import { DateTimeInput, Input } from "@pte/ui";
import { CREATE_EXAM_WIZARD_TEXT } from "../../constants";
import type { CreateExamWorkflowInput } from "../../types";
import type { CreateExamWorkflowErrors } from "../../utils/validateCreateExamWorkflow";

type WizardText = typeof CREATE_EXAM_WIZARD_TEXT;
type UpdateExamField = <K extends keyof CreateExamWorkflowInput>(
  field: K,
  value: CreateExamWorkflowInput[K],
) => void;

export interface SchedulePolicyStepProps {
  form: CreateExamWorkflowInput;
  errors: CreateExamWorkflowErrors;
  wizardText: WizardText;
  onUpdate: UpdateExamField;
  localizeError: (message?: string) => string | undefined;
}

export function SchedulePolicyStep({
  form,
  errors,
  wizardText,
  onUpdate,
  localizeError,
}: SchedulePolicyStepProps): ReactElement {
  return (
    <>
      <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-secondary)]">
        {wizardText.STEP_SCHEDULE_POLICY}
      </div>
      <div className="grid gap-4 rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-5 sm:grid-cols-2">
        <DateTimeInput
          label={wizardText.OPENS_AT_LABEL}
          value={form.opensAt}
          error={localizeError(errors.opensAt)}
          onChange={(event) => onUpdate("opensAt", event.target.value)}
        />
        <DateTimeInput
          label={wizardText.CLOSES_AT_LABEL}
          value={form.closesAt}
          error={localizeError(errors.closesAt)}
          onChange={(event) => onUpdate("closesAt", event.target.value)}
        />
        <Input
          type="number"
          min={0}
          max={9}
          step={1}
          label={wizardText.RETRIES_LABEL}
          value={form.maxRetriesPerStudent}
          error={localizeError(errors.maxRetriesPerStudent)}
          onChange={(event) => onUpdate("maxRetriesPerStudent", event.target.value)}
        />
      </div>
      {form.reusePolicy !== "ALLOW" && (
        <Input
          label={wizardText.SERIES_LABEL}
          placeholder={wizardText.SERIES_PLACEHOLDER}
          value={form.seriesKey}
          error={localizeError(errors.seriesKey)}
          onChange={(event) => onUpdate("seriesKey", event.target.value)}
        />
      )}
    </>
  );
}
