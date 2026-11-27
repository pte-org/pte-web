import type { ReactElement } from "react";
import { DateTimeInput, Input } from "@pte/ui";
import { CREATE_EXAM_WIZARD_ERRORS, CREATE_EXAM_WIZARD_TEXT } from "../../constants";
import type { CreateExamWorkflowInput } from "../../types";
import {
  closeAfterOpenChange,
  closesBeforeOpens,
  formatExamWindow,
  localTimeZoneLabel,
} from "../../utils/suggestedExamWindow";
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
  onValidateField: (field: keyof CreateExamWorkflowErrors) => void;
}

function windowSummary(form: CreateExamWorkflowInput, wizardText: WizardText): string | null {
  const duration = formatExamWindow(form.opensAt, form.closesAt, {
    day: wizardText.WINDOW_UNIT_DAY,
    hour: wizardText.WINDOW_UNIT_HOUR,
    minute: wizardText.WINDOW_UNIT_MINUTE,
  });
  if (!duration) return null;
  return wizardText.WINDOW_SUMMARY.replace("{duration}", duration).replace("{zone}", localTimeZoneLabel());
}

export function SchedulePolicyStep({
  form,
  errors,
  wizardText,
  onUpdate,
  localizeError,
  onValidateField,
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
          onChange={(event) => {
            onUpdate("opensAt", event.target.value);
            // Moving the open past the close would otherwise leave the host to fix the close by hand.
            const nextClose = closeAfterOpenChange(event.target.value, form.closesAt);
            if (nextClose !== form.closesAt) onUpdate("closesAt", nextClose);
          }}
        />
        <DateTimeInput
          label={wizardText.CLOSES_AT_LABEL}
          value={form.closesAt}
          min={form.opensAt}
          error={
            localizeError(errors.closesAt) ??
            (closesBeforeOpens(form.opensAt, form.closesAt)
              ? localizeError(CREATE_EXAM_WIZARD_ERRORS.CLOSES_AFTER_OPENS)
              : undefined)
          }
          onChange={(event) => onUpdate("closesAt", event.target.value)}
        />
      </div>
      {windowSummary(form, wizardText) && (
        <p aria-live="polite" className="text-sm text-[var(--ink-secondary)]">
          {windowSummary(form, wizardText)}
        </p>
      )}
      {form.reusePolicy !== "ALLOW" && (
        <Input
          label={wizardText.SERIES_LABEL}
          placeholder={wizardText.SERIES_PLACEHOLDER}
          value={form.seriesKey}
          error={localizeError(errors.seriesKey)}
          onChange={(event) => onUpdate("seriesKey", event.target.value)}
          onBlur={() => onValidateField("seriesKey")}
        />
      )}
    </>
  );
}
