"use client";

import { useCallback, useMemo } from "react";
import { resolveExamLockdownMode, type ScoreTemplateResponse } from "@pte/api-client";
import { useLocale } from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import type { AudienceStepProps } from "../components/create-exam/AudienceStep";
import type { ExamDetailsStepProps } from "../components/create-exam/ExamDetailsStep";
import type { ReviewStepProps } from "../components/create-exam/ReviewStep";
import type { SchedulePolicyStepProps } from "../components/create-exam/SchedulePolicyStep";
import {
  AUDIENCE_SOURCE_OPTIONS,
  CREATE_EXAM_WIZARD_ERRORS,
  CREATE_EXAM_WIZARD_TEXT as DEFAULT_CREATE_EXAM_WIZARD_TEXT,
  EXAM_MODE_OPTIONS,
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
    () => createEmptyExamWorkflow(activeTemplate?.publicId, templateSkills),
    [activeTemplate?.publicId, templateSkills],
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
  const localizedModeOptions = useMemo(
    () =>
      EXAM_MODE_OPTIONS.map((option) => ({
        ...option,
        label: option.value === "PRACTICE" ? wizardText.MODE_PRACTICE : wizardText.MODE_REAL,
      })),
    [wizardText],
  );
  const localizedSkillOptions = useMemo(
    () =>
      EXAM_SKILL_OPTIONS.map((option) => ({
        ...option,
        label: t(`tenant.createExam.skill.${option.value}`, option.label),
      })),
    [t],
  );
  const localizedSourceTypeOptions = useMemo(
    () =>
      AUDIENCE_SOURCE_OPTIONS.map((option) => ({
        ...option,
        label: t(`tenant.createExam.source.${option.value}`, option.label),
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
    templateSkills,
  });
  const {
    form,
    effectiveForm,
    step,
    errors,
    sources,
    update,
    changeExamMode,
    onSourcesChange,
    setFieldError,
    validate,
    goToNextStep,
    goToPreviousStep,
  } = wizardForm;
  const onSourcesError = useCallback(
    (message?: string): void => setFieldError("sources", message),
    [setFieldError],
  );
  const audience = useCreateExamAudience({
    open,
    sources,
    onSourcesChange,
    onSourcesError,
  });
  const sourceTypeLabels = useMemo(
    () => new Map(localizedSourceTypeOptions.map((option) => [option.value, option.label])),
    [localizedSourceTypeOptions],
  );
  const templateMessage = templateError
    ? errorMessage(templateError, wizardText.NO_TEMPLATE)
    : undefined;
  const submitMessage = error ? errorMessage(error) : undefined;
  const effectiveLockdownMode = useMemo(
    () => resolveExamLockdownMode(effectiveForm.examMode, effectiveForm.practiceAntiCheatEnabled),
    [effectiveForm.examMode, effectiveForm.practiceAntiCheatEnabled],
  );
  const localizedPolicyLabel = useMemo(() => {
    if (effectiveLockdownMode === null || effectiveLockdownMode === undefined) {
      return wizardText.POLICY_LEGACY;
    }
    if (effectiveForm.examMode === "PRACTICE" && effectiveLockdownMode === "NONE") {
      return wizardText.POLICY_PRACTICE_UNRESTRICTED;
    }
    if (effectiveForm.examMode === "PRACTICE" && effectiveLockdownMode === "STANDARD") {
      return wizardText.POLICY_PRACTICE_CONTROLLED;
    }
    if (effectiveForm.examMode === "OFFICIAL_EXAM" && effectiveLockdownMode === "STRICT") {
      return wizardText.POLICY_OFFICIAL_STRICT;
    }
    return wizardText.POLICY_UNAVAILABLE;
  }, [effectiveForm.examMode, effectiveLockdownMode, wizardText]);

  const fieldStepProps: SchedulePolicyStepProps = {
    form,
    errors,
    wizardText,
    onUpdate: update,
    localizeError,
  };
  const detailsStepProps: ExamDetailsStepProps = {
    ...fieldStepProps,
    localizedModeOptions,
    localizedSkillOptions,
    templateSkills,
    activeSubscriptions: audience.activeSubscriptions,
    subscriptionsLoading: audience.subscriptionsLoading,
    planNameById: audience.planNameById,
    templateMessage,
    onChangeExamMode: changeExamMode,
  };
  const audienceStepProps: AudienceStepProps = {
    sources,
    errors,
    wizardText,
    localizedSourceTypeOptions,
    sourceType: audience.sourceType,
    sourcePublicId: audience.sourcePublicId,
    sourceSearch: audience.sourceSearch,
    sourceOptions: audience.sourceOptions,
    sourceLabels: audience.sourceLabels,
    sourceTypeLabels,
    sourceLoading: audience.sourceLoading,
    onSourceTypeChange: audience.onSourceTypeChange,
    onSourcePublicIdChange: audience.onSourcePublicIdChange,
    onSourceSearchChange: audience.onSourceSearchChange,
    addSource: audience.addSource,
    removeSource: audience.removeSource,
    localizeError,
  };
  const reviewStepProps: ReviewStepProps = {
    form: effectiveForm,
    activeTemplate,
    wizardText,
    localizedModeOptions,
    localizedSkillOptions,
    localizedReusePolicyOptions,
    localizedPolicyLabel,
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
