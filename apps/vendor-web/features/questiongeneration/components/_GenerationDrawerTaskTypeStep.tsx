"use client";

import { FormField, Select } from "@pte/ui";
import { generationMessages } from "../messages/en";
import type { GenerationFormState, GenerationTaskType } from "../types";

interface TaskTypeStepProps {
  skill: GenerationFormState["skill"] | undefined;
  value: GenerationFormState["taskType"] | undefined;
  onChange: (taskType: GenerationFormState["taskType"]) => void;
  taskTypes: GenerationTaskType[];
  error?: string;
}

export const _GenerationDrawerTaskTypeStep = ({
  skill,
  value,
  onChange,
  taskTypes,
  error,
}: TaskTypeStepProps) => {
  if (!skill) return null;

  return (
    <FormField label={generationMessages.taskTypeLabel} error={error}>
      {taskTypes.length > 0 ? (
        <Select
          name="taskType"
          aria-label={generationMessages.taskTypeLabel}
          options={taskTypes.map((taskType) => ({ label: taskType.taskType, value: taskType.taskType }))}
          placeholder={generationMessages.taskTypePlaceholder}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value as GenerationFormState["taskType"])}
        />
      ) : (
        <p className="text-sm text-gray-500">{generationMessages.taskTypesLoadError}</p>
      )}
    </FormField>
  );
};
