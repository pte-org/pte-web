"use client";

import { useCallback, useMemo } from "react";
import type { ScoreTemplateResponse } from "@pte/api-client";
import { useLocale } from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import type { AudienceStepProps } from "../components/create-exam/AudienceStep";
import type { ExamDetailsStepProps } from "../components/create-exam/ExamDetailsStep";
import type { ReviewStepProps } from "../components/create-exam/ReviewStep";
import type { SchedulePolicyStepProps } from "../components/create-exam/SchedulePolicyStep";
import {
  CREATE_EXAM_WIZARD_ERRORS,
  CREATE_EXAM_WIZARD_TEXT as DEFAULT_CREATE_EXAM_WIZARD_TEXT,
  EXAM_SKILL_OPTIONS,
  REUSE_POLICY_OPTIONS,
} from "../constants";
import type { CreateExamWorkflowInput, ExamSkill } from "../types";
import {
  createEmptyExamWorkflow,
  getTemplateSkills,
  type CreateExamStep,
} from "../utils/createExamWizard";
import { useCreateExamAudience } from "./useCreateExamAudience";
import { useCreateExamWizardForm } from "./useCreateExamWizardForm";

type WizardText = typeof DEFAULT_CREATE_EXAM_WIZARD_TEXT;

export interface UseCreateExamWizardViewModelOptions {
  open: boolean;
  activeTemplate?: ScoreTemplateResponse;
  templateError?: unknown;
  error?: unknown;
}

export interface UseCreateExamWizardViewModelResult {
  step: CreateExamStep;
  effectiveForm: CreateExamWorkflowInput;
  wizardText: WizardText;
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
  const templateSkills = useMemo<ExamSkill[]>(
    () => getTemplateSkills(activeTemplate?.items),
    [activeTemplate?.items],
  );
  const initialForm = useMemo(
    () => createEmptyExamWorkflow(activeTemplate?.publicId),
    [activeTemplate?.publicId],
  );
  const wizardText = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(DEFAULT_CREATE_EXAM_WIZARD_TEXT).map(([key, value]) => [
          key,
          typeof value === "string" ? t(`tenant.createExam.${key}`, value) : value,
        ]),
      ) as WizardText,
    [t],
  );
  const localizedSkillOptions = useMemo(
    () =>
      EXAM_SKILL_OPTIONS.map((option) => ({
        ...option,
        label: t(`tenant.createExam.skill.${option.value}`, option.label),
      })),
    [t],
  );
  const localizedReusePolicyOptions = useMemo(
    () =>
      REUSE_POLICY_OPTIONS.map((option) => ({
        ...option,
        label:
          option.value === "ALLOW"
            ? wizardText.REUSE_ALLOW
            : option.value === "EXCLUDE_STARTED_IN_SERIES"
              ? wizardText.REUSE_STARTED
              : option.value === "EXCLUDE_ASSIGNED_IN_SERIES"
                ? wizardText.REUSE_ASSIGNED
                : wizardText.REUSE_OVERLAP,
      })),
    [wizardText],
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

  const wizardForm = useCreateExamWizardForm({
    initialForm,
    activeTemplatePublicId: activeTemplate?.publicId,
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
  const submitMessage = error ? errorMessage(error) : undefined;

  const fieldStepProps: SchedulePolicyStepProps = {
    form,
    errors,
    wizardText,
    onUpdate: update,
    localizeError,
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
    localizedReusePolicyOptions,
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
