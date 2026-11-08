"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Drawer,
  FormActions,
  Button,
  useToast,
  InfoPanel,
  Alert,
} from "@pte/ui";
import {
  useCreateQuestionGenerationJob,
  useQuestionGenerationQuota,
  useQuestionGenerationTaskTypes,
} from "../api";
import type { GenerationFormState, GenerationTaskType } from "../types";
import { generationMessages } from "../messages/en";
import { _GenerationDrawerSkillStep } from "./_GenerationDrawerSkillStep";
import { _GenerationDrawerTaskTypeStep } from "./_GenerationDrawerTaskTypeStep";
import { _GenerationDrawerCefrStep } from "./_GenerationDrawerCefrStep";
import { _GenerationDrawerPoolStep } from "./_GenerationDrawerPoolStep";
import { _GenerationDrawerTopicStep } from "./_GenerationDrawerTopicStep";
import { _GenerationDrawerCountStep } from "./_GenerationDrawerCountStep";

interface GenerationDrawerProps {
  open: boolean;
  onClose: () => void;
  onJobCreated?: (jobId: string) => void;
}

/**
 * Form component for creating AI-generated questions
 * Guides users through 6 steps: skill, task type, CEFR, pool, topic, count
 * Validates input before submission and shows quota warnings
 */
export const GenerationDrawer = ({
  open,
  onClose,
  onJobCreated,
}: GenerationDrawerProps) => {
  const [formState, setFormState] = useState<GenerationFormState>({
    count: 5,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const { mutate: createJob, isPending } = useCreateQuestionGenerationJob();
  const { data: quota } = useQuestionGenerationQuota();
  const { data: taskTypesData = [] } = useQuestionGenerationTaskTypes();
  const { showToast } = useToast();

  // Filter task types by selected skill
  const filteredTaskTypes: GenerationTaskType[] = useMemo(() => {
    const skill = formState.skill;
    if (!skill) return [];
    return taskTypesData
      .filter((tt) => tt.section === skill)
      .map((tt) => ({
        ...tt,
        displayName: tt.taskType,
        section: skill,
      }));
  }, [formState.skill, taskTypesData]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formState.skill) {
      newErrors.skill = generationMessages.skillRequired;
    }
    if (!formState.taskType) {
      newErrors.taskType = generationMessages.taskTypeRequired;
    }
    if (!formState.cefrLevel) {
      newErrors.cefrLevel = generationMessages.cefrLevelRequired;
    }
    if (!formState.pool) {
      newErrors.pool = generationMessages.poolRequired;
    }
    if (formState.count < 1 || formState.count > 10) {
      newErrors.count = generationMessages.countInvalid;
    }
    if (formState.topicHint && formState.topicHint.length > 200) {
      newErrors.topicHint = generationMessages.topicTooLong;
    }

    // Check quota
    const remaining = quota ? quota.dailyLimit - quota.usedToday : 0;
    if (quota && formState.count > remaining) {
      newErrors.quota = generationMessages.quotaExceeded;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formState, quota]);

  const handleSubmit = useCallback(() => {
    if (!validateForm()) {
      return;
    }

    createJob(
      {
        taskType: formState.taskType!,
        cefrLevel: formState.cefrLevel!,
        pool: formState.pool!,
        topicHint: formState.topicHint?.trim() || null,
        count: formState.count,
      },
      {
        onSuccess: (job) => {
          showToast(generationMessages.startingGenerationMessage);
          onJobCreated?.(job.publicId);
          onClose();
          // Reset form
          setFormState({ count: 5 });
          setErrors({});
          setTouched({});
        },
      },
    );
  }, [createJob, formState, validateForm, onJobCreated, onClose, showToast]);

  const remaining = quota ? quota.dailyLimit - quota.usedToday : 0;
  const showQuotaWarning = remaining > 0 && remaining < formState.count;
  const quotaExceeded = remaining <= 0;

  const handleFieldChange = <K extends keyof GenerationFormState>(
    field: K,
    value: GenerationFormState[K],
  ): void => {
    setFormState((prev) => {
      const newState = { ...prev, [field]: value };
      // Clear taskType when skill changes
      if (field === "skill") {
        newState.taskType = undefined;
      }
      return newState;
    });
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={generationMessages.drawerTitle}
    >
      <div className="space-y-6 p-6">
        {/* Step 1: Skill Selection */}
        <_GenerationDrawerSkillStep
          value={formState.skill}
          onChange={(value) => handleFieldChange("skill", value)}
          error={errors.skill}
        />

        {/* Step 2: Task Type Selection */}
        <_GenerationDrawerTaskTypeStep
          skill={formState.skill}
          value={formState.taskType}
          onChange={(value) => handleFieldChange("taskType", value)}
          taskTypes={filteredTaskTypes}
          error={errors.taskType}
        />

        {/* Step 3: CEFR Level Selection */}
        <_GenerationDrawerCefrStep
          value={formState.cefrLevel}
          onChange={(value) => handleFieldChange("cefrLevel", value)}
          error={errors.cefrLevel}
        />

        {/* Step 4: Pool Selection */}
        <_GenerationDrawerPoolStep
          value={formState.pool}
          onChange={(value) => handleFieldChange("pool", value)}
          error={errors.pool}
        />

        {/* Step 5: Topic Input */}
        <_GenerationDrawerTopicStep
          value={formState.topicHint}
          onChange={(value) => handleFieldChange("topicHint", value)}
          error={errors.topicHint}
        />

        {/* Step 6: Count Selection */}
        <_GenerationDrawerCountStep
          value={formState.count}
          onChange={(value) => handleFieldChange("count", value)}
          error={errors.count}
        />

        {/* Info Panel */}
        <InfoPanel
          title="Generation Info"
          rows={[
            {
              label: "Estimated Time",
              value: generationMessages.estimatedTimePerQuestion,
            },
            ...(quota
              ? [
                  {
                    label: generationMessages.quotaLabel,
                    value: `${remaining} / ${quota.dailyLimit}`,
                  },
                ]
              : []),
          ]}
        />

        {/* Quota Warnings */}
        {quotaExceeded && (
          <Alert tone="error">
            {generationMessages.quotaExceeded}
          </Alert>
        )}
        {showQuotaWarning && !quotaExceeded && (
          <Alert tone="warning">
            You can generate {remaining} more question(s) today. Adjust count or try
            again tomorrow.
          </Alert>
        )}

        {/* Form Actions */}
        <FormActions>
          <Button
            onClick={onClose}
            disabled={isPending}
            variant="secondary"
          >
            {generationMessages.cancelButton}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || quotaExceeded}
            isLoading={isPending}
          >
            {generationMessages.startButton}
          </Button>
        </FormActions>
      </div>
    </Drawer>
  );
};
