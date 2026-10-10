import type { ReactElement } from "react";
import type { SubscriptionResponse } from "@pte/api-client";
import { Alert, Input, Select } from "@pte/ui";
import { CREATE_EXAM_WIZARD_TEXT, EXAM_SKILL_OPTIONS } from "../../constants";
import type { CreateExamWorkflowInput, ExamSkill } from "../../types";
import type { CreateExamWorkflowErrors } from "../../utils/validateCreateExamWorkflow";

type WizardText = typeof CREATE_EXAM_WIZARD_TEXT;
type SkillOption = (typeof EXAM_SKILL_OPTIONS)[number];
type UpdateExamField = <K extends keyof CreateExamWorkflowInput>(
  field: K,
  value: CreateExamWorkflowInput[K],
) => void;

export interface ExamDetailsStepProps {
  form: CreateExamWorkflowInput;
  errors: CreateExamWorkflowErrors;
  wizardText: WizardText;
  localizedSkillOptions: SkillOption[];
  templateSkills: readonly ExamSkill[];
  activeSubscriptions: readonly SubscriptionResponse[];
  subscriptionsLoading: boolean;
  planNameById: ReadonlyMap<string, string>;
  templateMessage?: string;
  onUpdate: UpdateExamField;
  localizeError: (message?: string) => string | undefined;
}

export function ExamDetailsStep({
  form,
  errors,
  wizardText,
  localizedSkillOptions,
  templateSkills,
  activeSubscriptions,
  subscriptionsLoading,
  planNameById,
  templateMessage,
  onUpdate,
  localizeError,
}: ExamDetailsStepProps): ReactElement {
  return (
    <>
      <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-secondary)]">
        {wizardText.STEP_DETAILS}
      </div>
      <Input
        label={wizardText.NAME_LABEL}
        placeholder={wizardText.NAME_PLACEHOLDER}
        value={form.name}
        error={localizeError(errors.name)}
        onChange={(event) => onUpdate("name", event.target.value)}
      />
      {templateMessage && <Alert tone="error">{templateMessage}</Alert>}
      <Select
        label={wizardText.SUBSCRIPTION_LABEL}
        placeholder={
          !subscriptionsLoading && activeSubscriptions.length === 0
            ? wizardText.NO_ACTIVE_SUBSCRIPTIONS
            : wizardText.SUBSCRIPTION_PLACEHOLDER
        }
        value={form.subscriptionPublicId}
        error={localizeError(errors.subscriptionPublicId)}
        disabled={subscriptionsLoading || activeSubscriptions.length === 0}
        onChange={(event) => onUpdate("subscriptionPublicId", event.target.value)}
        options={activeSubscriptions.map((subscription) => ({
          label: `${planNameById.get(subscription.planId) ?? wizardText.PLAN_FALLBACK} — ${subscription.licenseKey}`,
          value: subscription.publicId,
        }))}
      />
      <Input
        type="number"
        min={1}
        step={1}
        label={wizardText.CAPACITY_LABEL}
        value={form.capacity}
        error={localizeError(errors.capacity)}
        onChange={(event) => onUpdate("capacity", event.target.value)}
      />
      <div className="rounded-xl border border-[var(--shell-border)] bg-[var(--surface-subtle)] p-5">
        <div className="text-sm font-medium text-[var(--ink-primary)]">
          {wizardText.FULL_TEMPLATE_SCOPE}
        </div>
        <p className="mt-1 text-sm text-[var(--ink-secondary)]">
          {templateSkills
            .map((skill) => localizedSkillOptions.find((option) => option.value === skill)?.label)
            .filter(Boolean)
            .join(", ") || wizardText.EMPTY_VALUE}
        </p>
      </div>
    </>
  );
}
