"use client";

import { FormField, Textarea } from "@pte/ui";
import { GENERATION_TOPIC_MAX_LENGTH, GENERATION_TOPIC_MIN_ROWS } from "../constants";
import { generationMessages } from "../messages/en";
import type { GenerationFormState } from "../types";

interface TopicStepProps {
  value: GenerationFormState["topicHint"] | undefined;
  onChange: (topic: GenerationFormState["topicHint"]) => void;
  error?: string;
}

const TOPIC_SUGGESTIONS = ["Technology", "Environment", "Education", "Health", "Business"];

export const _GenerationDrawerTopicStep = ({
  value,
  onChange,
  error,
}: TopicStepProps) => {
  return (
    <FormField label={generationMessages.topicLabel} error={error}>
      <div className="space-y-2">
        <Textarea
          aria-label={generationMessages.topicLabel}
          placeholder={generationMessages.topicPlaceholder}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          maxLength={GENERATION_TOPIC_MAX_LENGTH}
          rows={GENERATION_TOPIC_MIN_ROWS}
          className="w-full"
        />
        <p className="text-xs text-gray-500">{generationMessages.topicHint}</p>
        <div className="flex flex-wrap gap-2">
          {TOPIC_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => onChange(suggestion)}
              type="button"
              className="px-2 py-1 text-xs rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition-all"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </FormField>
  );
};
