"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import type { ScoreTemplateResponse } from "@pte/api-client";
import { useLocale, useToast } from "@pte/ui";
import { useSubscriptionsQuery } from "@/features/commercialization/api";
import { errorMessage } from "@/features/examoperations/errorMessage";
import type { AudienceStepProps } from "../components/create-exam/AudienceStep";
import type { ExamDetailsStepProps } from "../components/create-exam/ExamDetailsStep";
import type { ReviewStepProps } from "../components/create-exam/ReviewStep";
import type { SchedulePolicyStepProps } from "../components/create-exam/SchedulePolicyStep";
import { CREATE_EXAM_WIZARD_ERRORS, EXAM_SKILL_OPTIONS } from "../constants";
import type { CreateExamWorkflowInput, ExamSkill } from "../types";
import { composePreflightMessage, ExamPreflightBlockedError } from "../utils/examPreflight";
import {
  createEmptyExamWorkflow,
  getTemplateSkills,
  type CreateExamStep,
} from "../utils/createExamWizard";
import { useCreateExamAudience } from "./useCreateExamAudience";
import { useCreateExamWizardForm } from "./useCreateExamWizardForm";
import { useCreateExamWizardText, type CreateExamWizardText } from "./useCreateExamWizardText";

export interface UseCreateExamWizardViewModelOptions {
  open: boolean;
  activeTemplate?: ScoreTemplateResponse;
  templateError?: unknown;
  error?: unknown;
}

export interface UseCreateExamWizardViewModelResult {
  step: CreateExamStep;
  effectiveForm: CreateExamWorkflowInput;
  wizardText: CreateExamWizardText;
  stepLabels: { id: string; label: string }[];
  submitMessage?: string;
  detailsStepProps: ExamDetailsStepProps;
  scheduleStepProps: SchedulePolicyStepProps;
  audienceStepProps: AudienceStepProps;
  reviewStepProps: ReviewStepProps;
  validate: () => boolean;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

export function useCreateExamWizardViewModel({
  open,
  activeTemplate,
  templateError,
  error,
}: UseCreateExamWizardViewModelOptions): UseCreateExamWizardViewModelResult {
  const { t } = useLocale();
  const { showToast } = useToast();
  const { data: subscriptions } = useSubscriptionsQuery();
  const templateSkills = useMemo<ExamSkill[]>(
    () => getTemplateSkills(activeTemplate?.items),
    [activeTemplate?.items],
  );
  const initialForm = useMemo(
    () => createEmptyExamWorkflow(activeTemplate?.publicId),
    [activeTemplate?.publicId],
  );
  const wizardText = useCreateExamWizardText();
  const localizedSkillOptions = useMemo(
    () =>
      EXAM_SKILL_OPTIONS.map((option) => ({
        ...option,
        label: t(`tenant.createExam.skill.${option.value}`, option.label),
      })),
    [t],
  );
  const localizeError = useCallback(
    (message?: string): string | undefined => {
      if (!message) return message;
      const entry = Object.entries(CREATE_EXAM_WIZARD_ERRORS).find(
        ([, value]) => value === message,
      );
      return entry ? t(`tenant.createExam.error.${entry[0]}`, message) : message;
    },
    [t],
  );

  const onValidationError = useCallback(
    (message: string): void => {
      showToast(localizeError(message) ?? message, { tone: "error" });
    },
    [localizeError, showToast],
  );
  const wizardForm = useCreateExamWizardForm({
    initialForm,
    activeTemplatePublicId: activeTemplate?.publicId,
    subscriptions,
    onValidationError,
  });
  const {
    form,
    effectiveForm,
    step,
    errors,
    sources,
    update,
    onSourcesChange,
    validate,
    goToNextStep,
    goToPreviousStep,
  } = wizardForm;
  const audience = useCreateExamAudience({
    open,
    sources,
    onSourcesChange,
  });
  const templateMessage = templateError
    ? errorMessage(templateError, wizardText.NO_TEMPLATE)
    : undefined;
  const summary = !error
    ? undefined
    : error instanceof ExamPreflightBlockedError
      ? composePreflightMessage(
          wizardText.PREFLIGHT_BLOCKED,
          error.issues,
          (issue) =>
            t(
              `tenant.createExam.preflight.${issue}`,
              wizardText.PREFLIGHT_ISSUE_MESSAGES[issue] ?? "",
            ) || undefined,
        )
      : errorMessage(error);
  const submitMessage =
    error instanceof ExamPreflightBlockedError
      ? [
          summary,
          ...error.shortages.map((slot) =>
            wizardText.PREFLIGHT_SHORTAGE_DETAILS.replace("{taskType}", slot.taskType)
              .replace("{required}", String(slot.required))
              .replace("{available}", String(slot.available)),
          ),
        ]
          .filter(Boolean)
          .join(" ")
      : summary;
  const lastReportedError = useRef<unknown>(null);
  useEffect(() => {
    if (!open || !error) {
      lastReportedError.current = null;
      return;
    }
    if (lastReportedError.current === error || !submitMessage) return;
    lastReportedError.current = error;
    showToast(submitMessage, { tone: "error" });
  }, [open, error, submitMessage, showToast]);

  const fieldStepProps: SchedulePolicyStepProps = {
    form,
    errors,
    wizardText,
    onUpdate: update,
    localizeError,
    onValidateField: wizardForm.validateField,
  };
  const detailsStepProps: ExamDetailsStepProps = {
    ...fieldStepProps,
    localizedSkillOptions,
    templateSkills,
    activeSubscriptions: audience.activeSubscriptions,
    subscriptionsLoading: audience.subscriptionsLoading,
    planNameById: audience.planNameById,
    templateMessage,
  };
  const audienceStepProps: AudienceStepProps = {
    errors,
    wizardText,
    search: audience.search,
    programFilter: audience.programFilter,
    classFilter: audience.classFilter,
    programOptions: audience.programOptions,
    classOptions: audience.classOptions,
    students: audience.students,
    selectedIds: audience.selectedIds,
    selectedInFilterCount: audience.selectedInFilterCount,
    loading: audience.loading,
    onSearchChange: audience.onSearchChange,
    onProgramFilterChange: audience.onProgramFilterChange,
    onClassFilterChange: audience.onClassFilterChange,
    toggleStudent: audience.toggleStudent,
    toggleAllFiltered: audience.toggleAllFiltered,
    clearSelection: audience.clearSelection,
    localizeError,
  };
  const reviewStepProps: ReviewStepProps = {
    form: effectiveForm,
    activeTemplate,
    wizardText,
    localizedSkillOptions,
    templateSkills,
    audienceCount: sources.length,
  };

  return {
    step,
    effectiveForm,
    wizardText,
    stepLabels: [
      { id: "details", label: wizardText.STEP_DETAILS },
      { id: "schedule", label: wizardText.STEP_SCHEDULE_POLICY },
      { id: "audience", label: wizardText.STEP_AUDIENCE },
      { id: "review", label: wizardText.STEP_REVIEW },
    ],
    submitMessage,
    detailsStepProps,
    scheduleStepProps: fieldStepProps,
    audienceStepProps,
    reviewStepProps,
    validate,
    goToNextStep,
    goToPreviousStep,
  };
}
