"use client";

import { useCallback, type FormEvent, type ReactElement } from "react";
import type { ScoreTemplateResponse } from "@pte/api-client";
import { Alert, Modal, Stepper } from "@pte/ui";
import { useCreateExamWizardViewModel } from "../hooks/useCreateExamWizardViewModel";
import type { CreateExamWorkflowInput } from "../types";
import { CREATE_EXAM_STEP_IDS, type CreateExamStep } from "../utils/createExamWizard";
import { AudienceStep } from "./create-exam/AudienceStep";
import { ExamDetailsStep } from "./create-exam/ExamDetailsStep";
import { ReviewStep } from "./create-exam/ReviewStep";
import { SchedulePolicyStep } from "./create-exam/SchedulePolicyStep";

interface CreateExamWizardProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CreateExamWorkflowInput) => void;
  activeTemplate?: ScoreTemplateResponse;
  templateError?: unknown;
  error?: unknown;
  isSubmitting?: boolean;
}

const FORM_ID = "create-exam-workflow-form";

export const CreateExamWizard = ({
  open,
  onClose,
  onSubmit,
  activeTemplate,
  templateError,
  error,
  isSubmitting = false,
}: CreateExamWizardProps): ReactElement => {
  const {
    step,
    effectiveForm,
    wizardText,
    stepLabels,
    submitMessage,
    detailsStepProps,
    scheduleStepProps,
    audienceStepProps,
    reviewStepProps,
    validate,
    goToNextStep,
    goToPreviousStep,
  } = useCreateExamWizardViewModel({ open, activeTemplate, templateError, error });
  const stepContent: Record<CreateExamStep, ReactElement> = {
    1: <ExamDetailsStep {...detailsStepProps} />,
    2: <SchedulePolicyStep {...scheduleStepProps} />,
    3: <AudienceStep {...audienceStepProps} />,
    4: <ReviewStep {...reviewStepProps} />,
  };

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>): void => {
      event.preventDefault();
      if (step !== 4) return;
      if (validate()) onSubmit(effectiveForm);
    },
    [effectiveForm, onSubmit, step, validate],
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={wizardText.TITLE}
      size="full"
      stickyFooter
      footer={
        <>
          <button
            type="button"
            onClick={step === 1 ? onClose : goToPreviousStep}
            className="rounded-lg border border-[var(--shell-border)] px-4 py-2 text-sm font-medium text-[var(--ink-primary)] transition-colors hover:bg-[var(--surface-subtle)]"
          >
            {step === 1 ? wizardText.CANCEL : wizardText.BACK}
          </button>
          {step < 4 ? (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                goToNextStep();
              }}
              className="rounded-lg bg-action px-4 py-2 text-sm font-semibold text-[var(--action-foreground)] transition-colors hover:bg-action-hover"
            >
              {step === 3 ? wizardText.REVIEW_AND_CREATE : wizardText.NEXT}
            </button>
          ) : (
            <button
              type="submit"
              form={FORM_ID}
              disabled={isSubmitting}
              className="rounded-lg bg-action px-4 py-2 text-sm font-semibold text-[var(--action-foreground)] transition-colors hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? wizardText.SUBMITTING : wizardText.SUBMIT}
            </button>
          )}
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Stepper steps={stepLabels} currentStep={CREATE_EXAM_STEP_IDS[step - 1]} />
        {submitMessage && <Alert tone="error">{submitMessage}</Alert>}
        {stepContent[step]}
      </form>
    </Modal>
  );
};
