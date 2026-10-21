import Link from "next/link";
import type { ReactElement } from "react";
import { CREATE_EXAM_WIZARD_TEXT } from "../../constants";
import { fillTemplate } from "../../utils/fillTemplate";
import type { CreateExamWorkflowErrors } from "../../utils/validateCreateExamWorkflow";
import { AudienceStudentPicker, type AudienceStudentPickerProps } from "./AudienceStudentPicker";

type WizardText = typeof CREATE_EXAM_WIZARD_TEXT;

export interface AudienceStepProps extends AudienceStudentPickerProps {
  errors: CreateExamWorkflowErrors;
  wizardText: WizardText;
  clearSelection: () => void;
  localizeError: (message?: string) => string | undefined;
}

export function AudienceStep({
  errors,
  wizardText,
  clearSelection,
  localizeError,
  ...pickerProps
}: AudienceStepProps): ReactElement {
  const { selectedIds } = pickerProps;

  return (
    <>
      <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-secondary)]">
        {wizardText.STEP_AUDIENCE}
      </div>
      <div className="rounded-xl border border-[var(--shell-border)] bg-[var(--surface-subtle)] p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="text-sm font-semibold text-[var(--ink-primary)]">
            {wizardText.SOURCES_TITLE}
          </div>
          <Link
            href="/host/programs"
            className="text-xs font-medium text-[var(--brand-ink)] hover:underline"
          >
            {wizardText.MANAGE_CLASSES}
          </Link>
        </div>
        <AudienceStudentPicker wizardText={wizardText} {...pickerProps} />

        {errors.sources && (
          <p className="mt-2 text-sm text-[var(--blush-action)]">{localizeError(errors.sources)}</p>
        )}
        <div className="mt-3 flex items-center justify-between gap-3 text-sm">
          <span className="text-[var(--ink-primary)]">
            {selectedIds.size === 0
              ? wizardText.NO_SOURCES
              : fillTemplate(wizardText.SELECTED_TOTAL, { count: selectedIds.size })}
          </span>
          {selectedIds.size > 0 && (
            <button
              type="button"
              onClick={clearSelection}
              className="text-[var(--blush-action)] hover:underline"
            >
              {wizardText.CLEAR_SELECTION}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
