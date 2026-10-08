import type { ReactElement } from "react";
import type { ScoreTemplateResponse } from "@pte/api-client";
import { CREATE_EXAM_WIZARD_TEXT } from "../../constants";
import type { CreateExamWorkflowInput, ExamSkill } from "../../types";

type WizardText = typeof CREATE_EXAM_WIZARD_TEXT;
type ModeOption = { value: CreateExamWorkflowInput["examMode"]; label: string };
type SkillOption = { value: ExamSkill; label: string };
type ReusePolicyOption = { value: CreateExamWorkflowInput["reusePolicy"]; label: string };

export interface ReviewStepProps {
  form: CreateExamWorkflowInput;
  activeTemplate?: ScoreTemplateResponse;
  wizardText: WizardText;
  localizedModeOptions: readonly ModeOption[];
  localizedSkillOptions: readonly SkillOption[];
  localizedReusePolicyOptions: readonly ReusePolicyOption[];
  localizedPolicyLabel: string;
  audienceCount: number;
}

export function ReviewStep({
  form,
  activeTemplate,
  wizardText,
  localizedModeOptions,
  localizedSkillOptions,
  localizedReusePolicyOptions,
  localizedPolicyLabel,
  audienceCount,
}: ReviewStepProps): ReactElement {
  return (
    <>
      <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-secondary)]">
        {wizardText.STEP_REVIEW}
      </div>
      <div className="rounded-xl border border-[var(--brand-soft)] bg-[var(--brand-tint)] p-5">
        <div className="mb-2 text-sm font-semibold text-[var(--brand-deep)]">
          {wizardText.REVIEW_TITLE}
        </div>
        <dl className="grid gap-4 text-sm text-[var(--ink-primary)] sm:grid-cols-2">
          <div>
            <dt className="font-medium">{wizardText.REVIEW_TEMPLATE}</dt>
            <dd>{activeTemplate?.name ?? wizardText.EMPTY_VALUE}</dd>
          </div>
          <div>
            <dt className="font-medium">{wizardText.REVIEW_MODE}</dt>
            <dd>{localizedModeOptions.find((option) => option.value === form.examMode)?.label}</dd>
          </div>
          <div>
            <dt className="font-medium">{wizardText.REVIEW_SECURITY_POLICY}</dt>
            <dd>{localizedPolicyLabel}</dd>
          </div>
          <div>
            <dt className="font-medium">{wizardText.REVIEW_SKILLS}</dt>
            <dd>
              {form.selectedSkills
                .map(
                  (skill) => localizedSkillOptions.find((option) => option.value === skill)?.label,
                )
                .filter(Boolean)
                .join(", ") || wizardText.EMPTY_VALUE}
            </dd>
          </div>
          <div>
            <dt className="font-medium">{wizardText.REVIEW_RETRIES}</dt>
            <dd>{form.maxRetriesPerStudent}</dd>
          </div>
          <div>
            <dt className="font-medium">{wizardText.REVIEW_AUDIENCE}</dt>
            <dd>{audienceCount}</dd>
          </div>
          <div>
            <dt className="font-medium">{wizardText.REVIEW_RULE}</dt>
            <dd>
              {
                localizedReusePolicyOptions.find((option) => option.value === form.reusePolicy)
                  ?.label
              }
            </dd>
          </div>
          <div>
            <dt className="font-medium">{wizardText.REVIEW_CAPACITY}</dt>
            <dd>{form.capacity || wizardText.EMPTY_VALUE}</dd>
          </div>
        </dl>
      </div>
    </>
  );
}
