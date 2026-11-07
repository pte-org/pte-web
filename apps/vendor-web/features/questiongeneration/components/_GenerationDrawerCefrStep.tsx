"use client";

import { FormField } from "@pte/ui";
import { generationMessages } from "../messages/en";
import type { GenerationFormState } from "../types";

interface CefrStepProps {
  value: GenerationFormState["cefrLevel"] | undefined;
  onChange: (level: GenerationFormState["cefrLevel"]) => void;
  error?: string;
}

const CEFR_LEVELS = ["B1", "B2", "C1", "C2"] as const;

export const _GenerationDrawerCefrStep = ({
  value,
  onChange,
  error,
}: CefrStepProps) => {
  return (
    <FormField label={generationMessages.cefrLevelLabel} error={error}>
      <div className="flex flex-wrap gap-2">
        {CEFR_LEVELS.map((level) => (
          <button
            key={level}
            onClick={() => onChange(level)}
            type="button"
            className={`px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
              value === level
                ? "border-blue-600 bg-blue-50 text-blue-900"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >
            {level === "B1"
              ? generationMessages.cefrB1
              : level === "B2"
                ? generationMessages.cefrB2
                : level === "C1"
                  ? generationMessages.cefrC1
                  : generationMessages.cefrC2}
          </button>
        ))}
      </div>
    </FormField>
  );
};
