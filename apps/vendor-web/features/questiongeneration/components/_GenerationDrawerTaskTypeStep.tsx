"use client";

import { FormField, RadioCard } from "@pte/ui";
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
      <div className="grid grid-cols-1 gap-3">
        {taskTypes.length > 0 ? (
          taskTypes.map((taskType) => (
            <RadioCard
              key={taskType.taskType}
              name="taskType"
              label={taskType.taskType}
              hint={`${taskType.needsAudio ? "🔊 " : ""}${taskType.needsImage ? "🖼️ " : ""}`}
              checked={value === taskType.taskType}
              onChange={() => onChange(taskType.taskType)}
            />
          ))
        ) : (
          <p className="text-sm text-gray-500">{generationMessages.taskTypesLoadError}</p>
        )}
      </div>
    </FormField>
  );
};
