"use client";

import { FormField } from "@pte/ui";
import { generationMessages } from "../messages/en";
import type { GenerationFormState } from "../types";

interface SkillStepProps {
  value: GenerationFormState["skill"] | undefined;
  onChange: (skill: GenerationFormState["skill"]) => void;
  error?: string;
}

const SKILLS = ["SPEAKING", "WRITING", "READING", "LISTENING"] as const;

export const _GenerationDrawerSkillStep = ({
  value,
  onChange,
  error,
}: SkillStepProps) => {
  return (
    <FormField label={generationMessages.skillLabel} error={error}>
      <div className="grid grid-cols-2 gap-3">
        {SKILLS.map((skill) => (
          <button
            key={skill}
            onClick={() => onChange(skill)}
            type="button"
            className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
              value === skill
                ? "border-blue-600 bg-blue-50 text-blue-900"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >
            {skill === "SPEAKING"
              ? generationMessages.skillSpeaking
              : skill === "WRITING"
                ? generationMessages.skillWriting
                : skill === "READING"
                  ? generationMessages.skillReading
                  : generationMessages.skillListening}
          </button>
        ))}
      </div>
    </FormField>
  );
};
